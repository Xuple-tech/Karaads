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

    public function sendStreaming(User $user, array $payload, callable $emit): array
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
            'model' => $payload['model'] ?? 'grok-4-fast-reasoning',
            'type' => ($payload['type'] ?? 'text') === 'image' ? 'image' : 'text',
            'content_markdown' => '',
            'content_text' => '',
        ]);

        $emit('message.created', [
            'message' => $this->conversationService->serializeMessage($assistantMessage->loadMissing('attachments')),
            'conversation_id' => $conversation->id,
        ]);

        $this->streamAssistantResponse($conversation, $assistantMessage, $payload, $emit);

        return [
            'conversation' => $conversation,
            'user_message' => $userMessage,
            'assistant_message' => $assistantMessage->fresh(['attachments', 'toolRuns', 'sources']),
        ];
    }

    public function regenerateStreaming(User $user, ChatMessage $assistantMessage, callable $emit): ChatMessage
    {
        abort_unless($assistantMessage->role === 'assistant', 422);
        $conversation = Conversation::findOrFail($assistantMessage->conversation_id);
        abort_unless($conversation->user_id === $user->id, 403);

        $this->migrationService->migrateConversationIfNeeded($conversation);

        $userMessage = ChatMessage::findOrFail($assistantMessage->reply_to_id);

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

        $emit('message.created', [
            'message' => $this->conversationService->serializeMessage($assistantMessage->fresh(['attachments'])),
            'conversation_id' => $conversation->id,
            'replace' => true,
        ]);

        $payload = [
            'conversation_id' => $conversation->id,
            'message' => $userMessage->content_text ?: $userMessage->content_markdown,
            'model' => $assistantMessage->model,
            'type' => $assistantMessage->type,
            'files' => [],
            'assistant_message_id' => $assistantMessage->id,
        ];

        $this->streamAssistantResponse($conversation, $assistantMessage, $payload, $emit);

        return $assistantMessage->fresh(['attachments', 'toolRuns', 'sources']);
    }

    private function streamAssistantResponse(Conversation $conversation, ChatMessage $assistantMessage, array $payload, callable $emit): void
    {
        $body = '';

        $this->provider->streamResponse(
            $this->buildProviderMessages($conversation),
            [],
            [
                'model' => $payload['model'] ?? 'grok-4-fast-reasoning',
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
                }

                if ($eventName === 'tool.completed') {
                    $toolRun = ChatToolRun::create([
                        'chat_message_id' => $assistantMessage->id,
                        'tool_name' => $data['tool_name'],
                        'status' => 'completed',
                        'summary' => $data['summary'] ?? null,
                        'result' => $data['result'] ?? null,
                    ]);

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
                }

                if ($eventName === 'tool.failed') {
                    ChatToolRun::create([
                        'chat_message_id' => $assistantMessage->id,
                        'tool_name' => $data['tool_name'],
                        'status' => 'failed',
                        'error_message' => $data['error'] ?? 'Tool execution failed',
                    ]);
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
