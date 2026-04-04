<?php

namespace App\Services\Chat;

use App\Models\Chat;
use App\Models\ChatFile;
use App\Models\ChatMessage;
use App\Models\ChatMessageAttachment;
use App\Models\ChatMessageSource;
use App\Models\ChatToolRun;
use App\Models\Conversation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ChatMigrationService
{
    public function __construct(
        private readonly ChatMarkdownComposer $composer,
    ) {
    }

    public function migrateConversationIfNeeded(Conversation $conversation): void
    {
        $legacyCount = Chat::where('conversation_id', $conversation->id)->count();

        if ($legacyCount === 0) {
            return;
        }

        $newCount = ChatMessage::where('conversation_id', $conversation->id)->count();

        if ($newCount >= $legacyCount) {
            return;
        }

        $legacyMessages = Chat::where('conversation_id', $conversation->id)
            ->with('files')
            ->orderBy('created_at')
            ->get();

        DB::transaction(function () use ($conversation, $legacyMessages): void {
            foreach ($legacyMessages as $legacy) {
                $message = ChatMessage::firstOrCreate(
                    ['legacy_chat_id' => $legacy->id],
                    [
                        'conversation_id' => $conversation->id,
                        'role' => $legacy->role,
                        'status' => 'completed',
                        'provider' => $legacy->metadata['provider'] ?? 'legacy',
                        'model' => $legacy->metadata['model'] ?? null,
                        'type' => $legacy->type ?? 'text',
                        'content_markdown' => $this->composer->normalize((string) ($legacy->message ?? '')),
                        'content_text' => $this->composer->toPlainText((string) ($legacy->message ?? '')),
                        'thinking' => $legacy->thinking,
                        'created_at' => $legacy->created_at,
                        'updated_at' => $legacy->updated_at,
                    ]
                );

                $this->migrateLegacyMetadata($message, $legacy->metadata ?? []);
                $this->migrateLegacyFiles($message, $legacy->files);

                $message->updateQuietly([
                    'content_markdown' => $this->composer->buildFromMessage($message->loadMissing('attachments', 'toolRuns', 'sources')),
                    'content_text' => $this->composer->toPlainText($message->content_markdown ?? ''),
                ]);
            }
        });
    }

    private function migrateLegacyMetadata(ChatMessage $message, array $metadata): void
    {
        $toolResults = $metadata['tool_results'] ?? [];

        foreach ($toolResults as $toolResult) {
            ChatToolRun::firstOrCreate(
                [
                    'chat_message_id' => $message->id,
                    'tool_name' => $toolResult['tool_name'] ?? 'unknown',
                    'summary' => is_string($toolResult['result'] ?? null) ? $toolResult['result'] : null,
                ],
                [
                    'status' => 'completed',
                    'result' => is_array($toolResult['result'] ?? null) ? $toolResult['result'] : ['content' => $toolResult['result'] ?? null],
                ]
            );
        }

        foreach (($metadata['references'] ?? []) as $index => $source) {
            ChatMessageSource::firstOrCreate(
                [
                    'chat_message_id' => $message->id,
                    'position' => $index,
                    'url' => $source['url'] ?? null,
                ],
                [
                    'title' => $source['title'] ?? null,
                    'snippet' => $source['snippet'] ?? $source['content'] ?? null,
                    'payload' => $source,
                ]
            );
        }

        if (!empty($metadata['image_url'])) {
            ChatMessageAttachment::firstOrCreate(
                [
                    'chat_message_id' => $message->id,
                    'url' => $metadata['image_url'],
                ],
                [
                    'kind' => 'image',
                    'name' => $metadata['image_filename'] ?? 'Generated image',
                    'mime_type' => 'image/png',
                    'payload' => [
                        'revised_prompt' => $metadata['revised_prompt'] ?? null,
                    ],
                ]
            );
        }
    }

    private function migrateLegacyFiles(ChatMessage $message, $files): void
    {
        foreach ($files as $file) {
            ChatMessageAttachment::firstOrCreate(
                [
                    'chat_message_id' => $message->id,
                    'legacy_chat_file_id' => $file->id,
                ],
                [
                    'kind' => $this->resolveKind($file->mime_type),
                    'name' => $file->filename,
                    'mime_type' => $file->mime_type,
                    'size' => $file->file_size,
                    'url' => $this->resolveLegacyFileUrl($file),
                    'path' => $file->filepath,
                    'payload' => $file->metadata,
                ]
            );
        }
    }

    private function resolveLegacyFileUrl(ChatFile $file): ?string
    {
        if ($file->filepath && Storage::disk('private')->exists($file->filepath)) {
            return url('/api/chat/files/' . $file->id);
        }

        return $file->url ?? null;
    }

    private function resolveKind(?string $mimeType): string
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
