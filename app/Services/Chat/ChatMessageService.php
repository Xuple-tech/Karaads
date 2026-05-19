<?php

namespace App\Services\Chat;

use App\Contracts\ChatProvider;
use App\Models\ChatMessage;
use App\Models\ChatMessageAttachment;
use App\Models\ChatMessageSource;
use App\Models\ChatToolRun;
use App\Models\Conversation;
use App\Models\User;
use App\Services\SubscriptionService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChatMessageService
{
    public function __construct(
        private readonly ChatProvider $provider,
        private readonly ChatConversationService $conversationService,
        private readonly ChatMigrationService $migrationService,
        private readonly ChatMarkdownComposer $composer,
        private readonly SubscriptionService $subscriptionService,
    ) {
    }

    public function queueSend(User $user, array $payload): array
    {
        $conversation = $this->resolveConversation($user, $payload['conversation_id'] ?? null, $payload['message'] ?? null);
        $this->migrationService->migrateConversationIfNeeded($conversation);

        $userMessage = $this->createUserMessage($conversation, $payload);
        $assistantMessage = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'reply_to_id' => $userMessage->id,
            'role' => 'assistant',
            'status' => 'streaming',
            'provider' => 'grok',
            'model' => $payload['model'] ?? 'grok-4-fast-non-reasoning',
            'type' => ($payload['type'] ?? 'text') === 'image' ? 'image' : 'text',
            'content_markdown' => '',
            'content_text' => '',
        ]);

        return [
            'conversation' => $conversation->fresh(),
            'user_message' => $userMessage,
            'assistant_message' => $assistantMessage->fresh(['attachments', 'toolRuns', 'sources']),
        ];
    }

    public function queueRegenerate(User $user, ChatMessage $assistantMessage): array
    {
        abort_unless($assistantMessage->role === 'assistant', 422);

        $conversation = Conversation::findOrFail($assistantMessage->conversation_id);
        abort_unless($conversation->user_id === $user->id, 403);

        $this->migrationService->migrateConversationIfNeeded($conversation);

        DB::transaction(function () use ($assistantMessage): void {
            $assistantMessage->attachments()->delete();
            $assistantMessage->sources()->delete();
            $assistantMessage->toolRuns()->delete();
            $assistantMessage->update([
                'status' => 'streaming',
                'content_markdown' => '',
                'content_text' => '',
                'error_message' => null,
            ]);
        });

        return [
            'conversation' => $conversation->fresh(),
            'user_message' => ChatMessage::query()->findOrFail($assistantMessage->reply_to_id)->fresh(['attachments']),
            'assistant_message' => $assistantMessage->fresh(['attachments', 'toolRuns', 'sources']),
            'replace' => true,
        ];
    }

    public function sendStreaming(User $user, array $payload, callable $emit): array
    {
        $prepared = $this->queueSend($user, $payload);
        /** @var Conversation $conversation */
        $conversation = $prepared['conversation'];
        /** @var ChatMessage $userMessage */
        $userMessage = $prepared['user_message'];
        /** @var ChatMessage $assistantMessage */
        $assistantMessage = $prepared['assistant_message'];

        $emit('message.created', [
            'message' => $this->conversationService->serializeMessage($assistantMessage->loadMissing('attachments')),
            'conversation_id' => $conversation->id,
        ]);

        $this->processAssistantMessage($assistantMessage, $emit);

        return $prepared;
    }

    public function regenerateStreaming(User $user, ChatMessage $assistantMessage, callable $emit): ChatMessage
    {
        $prepared = $this->queueRegenerate($user, $assistantMessage);
        /** @var Conversation $conversation */
        $conversation = $prepared['conversation'];
        /** @var ChatMessage $assistantMessage */
        $assistantMessage = $prepared['assistant_message'];

        $emit('message.created', [
            'message' => $this->conversationService->serializeMessage($assistantMessage->fresh(['attachments'])),
            'conversation_id' => $conversation->id,
            'replace' => true,
        ]);

        $this->processAssistantMessage($assistantMessage, $emit);

        return $assistantMessage->fresh(['attachments', 'toolRuns', 'sources']);
    }

    public function processAssistantMessage(ChatMessage $assistantMessage, callable $emit): ChatMessage
    {
        $assistantMessage->loadMissing('conversation.user', 'replyTo.attachments');
        $conversation = $assistantMessage->conversation;
        abort_unless($conversation instanceof Conversation, 404);

        $body = '';
        $payload = $this->buildAssistantPayload($assistantMessage);

        $this->provider->streamResponse(
            $this->buildProviderMessages($conversation),
            [],
            [
                'model' => $payload['model'] ?? 'grok-4-fast-non-reasoning',
                'files' => $payload['files'] ?? [],
                'message_id' => $assistantMessage->id,
                'user_name' => $conversation->user?->name,
                'auto_tools' => true,
            ],
            function (string $eventName, array $data) use ($assistantMessage, $conversation, &$body, $emit): void {
                if ($eventName === 'message.delta') {
                    $body .= (string) ($data['content'] ?? '');
                    $assistantMessage->updateQuietly([
                        'content_markdown' => $body,
                        'content_text' => $this->composer->toPlainText($body),
                    ]);
                }

                if ($eventName === 'tool.started') {
                    $toolRun = ChatToolRun::create([
                        'chat_message_id' => $assistantMessage->id,
                        'tool_name' => $data['tool_name'],
                        'status' => 'started',
                        'summary' => $data['message'] ?? null,
                        'arguments' => $data['arguments'] ?? null,
                    ]);
                    $data['tool_run_id'] = $toolRun->id;
                    $data['tool_run'] = $this->serializeToolRun($toolRun);
                }

                if ($eventName === 'tool.completed') {
                    $toolRun = $this->resolveToolRun($assistantMessage, (string) ($data['tool_name'] ?? 'tool'));
                    $toolRun->update([
                        'status' => 'completed',
                        'summary' => $data['summary'] ?? $toolRun->summary,
                        'result' => $data['result'] ?? null,
                        'error_message' => null,
                    ]);
                    $toolRun = $toolRun->fresh();

                    foreach (($data['references'] ?? []) as $index => $reference) {
                        ChatMessageSource::create([
                            'chat_message_id' => $assistantMessage->id,
                            'chat_tool_run_id' => $toolRun->id,
                            'position' => $index,
                            'title' => $reference['title'] ?? null,
                            'url' => $reference['url'] ?? null,
                            'snippet' => $reference['snippet'] ?? null,
                            'payload' => $reference,
                        ]);
                    }

                    foreach (($data['generated_images'] ?? []) as $image) {
                        $attachmentName = $image['filename'] ?? ('kwati-image-' . now()->format('Ymd-His') . '.png');

                        $attachment = ChatMessageAttachment::create([
                            'chat_message_id' => $assistantMessage->id,
                            'kind' => 'image',
                            'name' => $attachmentName,
                            'mime_type' => 'image/png',
                            'url' => $image['url'] ?? null,
                            'path' => $image['path'] ?? null,
                            'payload' => $image,
                        ]);

                        $emit('attachment.created', [
                            'message_id' => $assistantMessage->id,
                            'attachment' => [
                                'id' => $attachment->id,
                                'kind' => $attachment->kind,
                                'name' => $attachment->name,
                                'mime_type' => $attachment->mime_type,
                                'size' => $attachment->size,
                                'url' => $this->normalizeAttachmentUrl($attachment->url),
                                'download_url' => route('chat.file.download', ['file' => $attachment->id]),
                            ],
                        ]);
                    }

                    if ($attachment = $this->createDocumentAttachment($assistantMessage, $data['tool_name'] ?? null, $data['result'] ?? null)) {
                        $emit('attachment.created', [
                            'message_id' => $assistantMessage->id,
                            'attachment' => [
                                'id' => $attachment->id,
                                'kind' => $attachment->kind,
                                'name' => $attachment->name,
                                'mime_type' => $attachment->mime_type,
                                'size' => $attachment->size,
                                'url' => $this->normalizeAttachmentUrl($attachment->url),
                                'download_url' => route('chat.file.download', ['file' => $attachment->id]),
                            ],
                        ]);
                    }

                    $data['tool_run_id'] = $toolRun->id;
                    $data['tool_run'] = $this->serializeToolRun($toolRun);
                }

                if ($eventName === 'tool.failed') {
                    $toolRun = $this->resolveToolRun($assistantMessage, (string) ($data['tool_name'] ?? 'tool'));
                    $toolRun->update([
                        'status' => 'failed',
                        'error_message' => $data['error'] ?? 'Tool execution failed',
                    ]);
                    $toolRun = $toolRun->fresh();
                    $data['tool_run_id'] = $toolRun->id;
                    $data['tool_run'] = $this->serializeToolRun($toolRun);
                }

                if ($eventName === 'message.failed') {
                    $assistantMessage->updateQuietly([
                        'status' => 'failed',
                        'error_message' => $data['error'] ?? 'Streaming failed',
                    ]);
                }

                if ($eventName === 'message.completed') {
                    $assistantMessage->loadMissing('attachments', 'toolRuns', 'sources');
                    $finalMarkdown = $this->composer->buildFromMessage($assistantMessage->fresh(['attachments', 'toolRuns', 'sources']));
                    $assistantMessage->updateQuietly([
                        'status' => 'completed',
                        'content_markdown' => $finalMarkdown,
                        'content_text' => $this->composer->toPlainText($finalMarkdown),
                    ]);

                    $this->maybeAutoGenerateConversationTitle(
                        $conversation->fresh(),
                        $assistantMessage->fresh(['replyTo'])
                    );

                    if ($conversation->user) {
                        $tokensEstimate = (int) ceil(mb_strlen($assistantMessage->content_text ?: $finalMarkdown) / 4);
                        $this->subscriptionService->recordRequest(
                            $conversation->user,
                            $tokensEstimate,
                            [
                                'model' => $assistantMessage->model,
                                'message_type' => $assistantMessage->type,
                                'provider' => $assistantMessage->provider,
                                'stream' => true,
                            ]
                        );
                    }
                }

                $emit($eventName, array_merge($data, ['message_id' => $assistantMessage->id]));
            }
        );

        return $assistantMessage->fresh(['attachments', 'toolRuns', 'sources']);
    }

    private function resolveToolRun(ChatMessage $assistantMessage, string $toolName): ChatToolRun
    {
        $pendingRun = ChatToolRun::query()
            ->where('chat_message_id', $assistantMessage->id)
            ->where('tool_name', $toolName)
            ->where('status', 'started')
            ->latest('created_at')
            ->first();

        if ($pendingRun) {
            return $pendingRun;
        }

        return ChatToolRun::create([
            'chat_message_id' => $assistantMessage->id,
            'tool_name' => $toolName,
            'status' => 'started',
        ]);
    }

    private function normalizeAttachmentUrl(?string $url): ?string
    {
        if (!$url) {
            return $url;
        }

        $path = parse_url($url, PHP_URL_PATH);
        if (is_string($path) && Str::startsWith($path, '/storage/')) {
            return $path;
        }

        return $url;
    }

    private function serializeToolRun(ChatToolRun $toolRun): array
    {
        return [
            'id' => $toolRun->id,
            'tool_name' => $toolRun->tool_name,
            'status' => $toolRun->status,
            'summary' => $toolRun->summary,
            'arguments' => $toolRun->arguments,
            'result' => $toolRun->result,
            'error_message' => $toolRun->error_message,
            'created_at' => $toolRun->created_at?->toIso8601String(),
            'updated_at' => $toolRun->updated_at?->toIso8601String(),
        ];
    }

    private function resolveConversation(User $user, ?string $conversationId, ?string $prompt): Conversation
    {
        if ($conversationId) {
            $conversation = Conversation::findOrFail($conversationId);
            abort_unless($conversation->user_id === $user->id, 403);

            return $conversation;
        }

        return $this->conversationService->create($user);
    }

    private function createUserMessage(Conversation $conversation, array $payload): ChatMessage
    {
        $message = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'status' => 'completed',
            'provider' => null,
            'model' => null,
            'type' => ($payload['type'] ?? 'text') === 'image' ? 'image' : 'text',
            'content_markdown' => (string) ($payload['message'] ?? ''),
            'content_text' => (string) ($payload['message'] ?? ''),
        ]);

        foreach (($payload['files'] ?? []) as $file) {
            $this->storeMessageAttachment($message, $conversation, $file);
        }

        return $message->fresh(['attachments']);
    }

    private function storeMessageAttachment(ChatMessage $message, Conversation $conversation, array $file): void
    {
        $rawData = (string) ($file['data'] ?? '');

        if (!str_contains($rawData, ',')) {
            return;
        }

        [$meta, $base64] = explode(',', $rawData, 2);
        $content = base64_decode($base64, true);

        if ($content === false) {
            return;
        }

        $filename = (string) ($file['name'] ?? ('attachment-' . Str::uuid()));
        $mimeType = (string) ($file['type'] ?? 'application/octet-stream');
        $directory = 'chat-attachments/' . now()->format('Y/m/d') . '/' . $conversation->user_id;
        $path = $directory . '/' . Str::uuid() . '-' . $filename;

        Storage::disk('private')->put($path, $content);

        $attachment = ChatMessageAttachment::create([
            'chat_message_id' => $message->id,
            'kind' => $this->resolveAttachmentKind($mimeType),
            'name' => $filename,
            'mime_type' => $mimeType,
            'size' => strlen($content),
            'path' => $path,
        ]);

        $attachment->update([
            'url' => url('/api/chat/files/' . $attachment->id),
        ]);
    }

    private function createDocumentAttachment(ChatMessage $message, ?string $toolName, mixed $result): ?ChatMessageAttachment
    {
        if (!in_array($toolName, ['generate_pdf_document', 'generate_word_document', 'generate_powerpoint_presentation'], true) || !is_array($result)) {
            return null;
        }

        if (empty($result['url']) || empty($result['filename'])) {
            return null;
        }

        $attachment = ChatMessageAttachment::create([
            'chat_message_id' => $message->id,
            'kind' => 'file',
            'name' => $result['filename'],
            'mime_type' => $result['mime_type'] ?? null,
            'size' => $result['size'] ?? null,
            'url' => $result['url'],
            'path' => $result['path'] ?? null,
            'payload' => [
                'title' => $result['title'] ?? null,
                'format' => $result['format'] ?? null,
                'document_type' => $result['document_type'] ?? null,
                'design_style' => $result['design_style'] ?? null,
                'design_styles' => $result['design_styles'] ?? null,
                'design_description' => $result['design_description'] ?? null,
                'has_logo' => $result['has_logo'] ?? false,
                'generated_at' => $result['generated_at'] ?? null,
            ],
        ]);

        $attachment->update([
            'url' => url('/api/chat/files/' . $attachment->id),
        ]);

        return $attachment;
    }

    private function buildAssistantPayload(ChatMessage $assistantMessage): array
    {
        $userMessage = $assistantMessage->replyTo()->with('attachments')->firstOrFail();

        return [
            'conversation_id' => $assistantMessage->conversation_id,
            'message' => $userMessage->content_text ?: $userMessage->content_markdown,
            'model' => $assistantMessage->model,
            'type' => $assistantMessage->type,
            'files' => $this->buildProviderFilesFromMessage($userMessage),
            'assistant_message_id' => $assistantMessage->id,
        ];
    }

    private function buildProviderMessages(Conversation $conversation): array
    {
        $messages = ChatMessage::query()
            ->where('conversation_id', $conversation->id)
            ->with('toolRuns')
            ->orderBy('created_at')
            ->get()
            ->values();

        $latestUserMessage = $messages->last(fn (ChatMessage $message) => $message->role === 'user');
        $latestImageFollowUpContext = $latestUserMessage instanceof ChatMessage
            ? $this->resolveRelativeImagePromptContext($messages, $latestUserMessage)
            : null;

        return $messages
            ->map(fn (ChatMessage $message) => [
                'role' => $message->role,
                'content' => $this->buildProviderMessageContent(
                    $message,
                    $latestUserMessage?->id === $message->id ? $latestImageFollowUpContext : null
                ),
            ])
            ->filter(fn (array $message) => $message['content'] !== '')
            ->values()
            ->all();
    }

    private function buildProviderMessageContent(ChatMessage $message, ?array $relativeImageContext = null): string
    {
        $content = $message->role === 'assistant'
            ? ($message->content_text ?: $message->content_markdown ?: '')
            : ($message->content_markdown ?: $message->content_text ?: '');

        if ($message->role === 'user' && $relativeImageContext !== null) {
            return $this->augmentRelativeImagePrompt($content, $relativeImageContext);
        }

        if ($message->role !== 'assistant') {
            return $content;
        }

        $powerPointContext = $this->buildPowerPointToolContext($message);

        if ($powerPointContext === '') {
            return $content;
        }

        return trim($content."\n\n".$powerPointContext);
    }

    private function resolveRelativeImagePromptContext(Collection $messages, ChatMessage $latestUserMessage): ?array
    {
        $currentPrompt = trim((string) ($latestUserMessage->content_markdown ?: $latestUserMessage->content_text ?: ''));

        if (! $this->isRelativeImageFollowUpPrompt($currentPrompt)) {
            return null;
        }

        $latestUserIndex = $messages->search(fn (ChatMessage $message) => $message->id === $latestUserMessage->id);

        if (! is_int($latestUserIndex) || $latestUserIndex <= 0) {
            return null;
        }

        /** @var ChatMessage|null $previousAssistant */
        $previousAssistant = $messages
            ->slice(0, $latestUserIndex)
            ->reverse()
            ->first(function (ChatMessage $message): bool {
                return $message->role === 'assistant'
                    && $message->toolRuns->contains(
                        fn (ChatToolRun $toolRun): bool => $toolRun->tool_name === 'generate_image'
                            && $toolRun->status === 'completed'
                    );
            });

        if (! $previousAssistant instanceof ChatMessage) {
            return null;
        }

        /** @var ChatToolRun|null $imageToolRun */
        $imageToolRun = $previousAssistant->toolRuns
            ->reverse()
            ->first(fn (ChatToolRun $toolRun): bool => $toolRun->tool_name === 'generate_image' && $toolRun->status === 'completed');

        if (! $imageToolRun instanceof ChatToolRun) {
            return null;
        }

        $previousPrompt = trim((string) data_get($imageToolRun->arguments, 'user_prompt', data_get($imageToolRun->result, 'prompt', '')));

        if ($previousPrompt === '') {
            return null;
        }

        return [
            'previous_prompt' => $previousPrompt,
            'model' => data_get($imageToolRun->arguments, 'model'),
            'size' => data_get($imageToolRun->arguments, 'size'),
        ];
    }

    private function augmentRelativeImagePrompt(string $prompt, array $context): string
    {
        $prompt = trim($prompt);
        $previousPrompt = trim((string) ($context['previous_prompt'] ?? ''));

        if ($prompt === '' || $previousPrompt === '') {
            return $prompt;
        }

        $details = array_filter([
            isset($context['model']) ? 'Previous model: ' . $context['model'] : null,
            isset($context['size']) ? 'Previous size: ' . $context['size'] : null,
        ]);

        $detailsBlock = $details === [] ? '' : "\n".implode("\n", $details);

        return trim(
            $prompt
            . "\n\nReference for this follow-up image request:"
            . "\nPrevious successful image prompt: " . $previousPrompt
            . $detailsBlock
            . "\nIf the user is asking for another, similar, or same-style image, keep the main subject from the previous prompt and apply the new request as a variation."
        );
    }

    private function isRelativeImageFollowUpPrompt(string $prompt): bool
    {
        $normalized = Str::lower(trim($prompt));

        if ($normalized === '') {
            return false;
        }

        $explicitFollowUps = [
            'create another image',
            'generate another image',
            'make another image',
            'another image',
            'another one',
            'one more image',
            'same image',
            'same style',
            'same prompt',
            'like the last image',
            'like the previous image',
            'similar image',
            'another version',
        ];

        if (Str::contains($normalized, $explicitFollowUps)) {
            return true;
        }

        $hasRelativeWord = Str::contains($normalized, ['another', 'same', 'again', 'similar', 'more']);
        $hasImageWord = Str::contains($normalized, ['image', 'photo', 'picture', 'portrait', 'version']);

        return $hasRelativeWord && $hasImageWord;
    }

    private function buildPowerPointToolContext(ChatMessage $message): string
    {
        $contexts = $message->toolRuns
            ->filter(fn (ChatToolRun $toolRun) => $toolRun->tool_name === 'generate_powerpoint_presentation'
                && $toolRun->status === 'completed')
            ->map(function (ChatToolRun $toolRun): ?string {
                $arguments = $this->sanitizePowerPointToolArguments($toolRun->arguments ?? []);

                if ($arguments === []) {
                    return null;
                }

                $result = array_intersect_key($toolRun->result ?? [], array_flip([
                    'title',
                    'filename',
                    'format',
                    'mime_type',
                    'document_type',
                    'design_style',
                    'design_styles',
                    'design_description',
                    'has_logo',
                ]));

                $context = [
                    'tool' => 'generate_powerpoint_presentation',
                    'instruction' => 'If the user asks to add an uploaded logo to this PowerPoint later, call generate_powerpoint_presentation again using these same arguments and the new uploaded logo.',
                    'arguments' => $arguments,
                ];

                if ($result !== []) {
                    $context['result'] = $result;
                }

                return "Previous PowerPoint generation context:\n"
                    .json_encode($context, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
            })
            ->filter()
            ->values();

        if ($contexts->isEmpty()) {
            return '';
        }

        return $contexts->implode("\n\n");
    }

    private function sanitizePowerPointToolArguments(array $arguments): array
    {
        unset($arguments['logo_image'], $arguments['files']);

        return array_filter(
            $arguments,
            fn ($value) => ! ($value === null || $value === ''),
        );
    }

    private function buildProviderFilesFromMessage(ChatMessage $message): array
    {
        return $message->attachments
            ->map(function (ChatMessageAttachment $attachment): ?array {
                if (! $attachment->path || ! Storage::disk('private')->exists($attachment->path)) {
                    return null;
                }

                $content = Storage::disk('private')->get($attachment->path);

                return [
                    'name' => $attachment->name,
                    'type' => $attachment->mime_type ?? 'application/octet-stream',
                    'data' => 'data:'.($attachment->mime_type ?? 'application/octet-stream').';base64,'.base64_encode($content),
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    private function resolveAttachmentKind(?string $mimeType): string
    {
        if (!$mimeType) {
            return 'file';
        }

        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        }

        if (str_starts_with($mimeType, 'audio/')) {
            return 'audio';
        }

        if (str_starts_with($mimeType, 'video/')) {
            return 'video';
        }

        return 'file';
    }

    private function maybeAutoGenerateConversationTitle(Conversation $conversation, ChatMessage $assistantMessage): void
    {
        if (! $this->shouldAutoGenerateConversationTitle($conversation)) {
            return;
        }

        $assistantCount = ChatMessage::query()
            ->where('conversation_id', $conversation->id)
            ->where('role', 'assistant')
            ->count();

        if ($assistantCount !== 1) {
            return;
        }

        try {
            $title = trim($this->provider->generateTitle($this->buildConversationTitlePrompt($assistantMessage)));

            if ($title === '') {
                return;
            }

            $conversation->update([
                'title' => Str::limit($title, 255, ''),
                'ai_generated_title' => true,
                'title_generated_at' => now(),
            ]);
        } catch (\Throwable $throwable) {
            Log::warning('Conversation title generation failed', [
                'conversation_id' => $conversation->id,
                'message_id' => $assistantMessage->id,
                'error' => $throwable->getMessage(),
            ]);
        }
    }

    private function shouldAutoGenerateConversationTitle(Conversation $conversation): bool
    {
        return ChatConversationService::isDefaultTitle($conversation->title) || (bool) $conversation->ai_generated_title;
    }

    private function buildConversationTitlePrompt(ChatMessage $assistantMessage): string
    {
        $userPrompt = trim((string) ($assistantMessage->replyTo?->content_text ?? $assistantMessage->replyTo?->content_markdown ?? ''));
        $assistantReply = trim((string) ($assistantMessage->content_text ?? $assistantMessage->content_markdown ?? ''));

        return trim("User: {$userPrompt}\nAssistant: {$assistantReply}");
    }
}
