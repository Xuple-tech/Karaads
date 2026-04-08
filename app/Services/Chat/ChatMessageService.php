<?php

namespace App\Services\Chat;

use App\Contracts\ChatProvider;
use App\Models\ChatMessage;
use App\Models\ChatMessageAttachment;
use App\Models\ChatMessageSource;
use App\Models\ChatToolRun;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ChatMessageService
{
    public function __construct(
        private readonly ChatProvider $provider,
        private readonly ChatConversationService $conversationService,
        private readonly ChatMigrationService $migrationService,
        private readonly ChatMarkdownComposer $composer,
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
            function (string $eventName, array $data) use ($assistantMessage, &$body, $emit): void {
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
                        $attachment = ChatMessageAttachment::create([
                            'chat_message_id' => $assistantMessage->id,
                            'kind' => 'image',
                            'name' => $image['revised_prompt'] ?? 'Generated image',
                            'mime_type' => 'image/png',
                            'url' => $image['url'] ?? null,
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
                                'url' => $attachment->url,
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
                                'url' => $attachment->url,
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

        return $this->conversationService->create($user, Str::limit((string) $prompt, 60, ''));
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
        if (!in_array($toolName, ['generate_pdf_document', 'generate_word_document'], true) || !is_array($result)) {
            return null;
        }

        if (empty($result['url']) || empty($result['filename'])) {
            return null;
        }

        return ChatMessageAttachment::create([
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
                'generated_at' => $result['generated_at'] ?? null,
            ],
        ]);
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
        return ChatMessage::query()
            ->where('conversation_id', $conversation->id)
            ->orderBy('created_at')
            ->get()
            ->map(fn (ChatMessage $message) => [
                'role' => $message->role,
                'content' => $message->role === 'assistant'
                    ? ($message->content_text ?: $message->content_markdown ?: '')
                    : ($message->content_markdown ?: $message->content_text ?: ''),
            ])
            ->filter(fn (array $message) => $message['content'] !== '')
            ->values()
            ->all();
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
}
