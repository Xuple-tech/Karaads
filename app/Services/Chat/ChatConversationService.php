<?php

namespace App\Services\Chat;

use App\Models\ChatMessage;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ChatConversationService
{
    public const DEFAULT_TITLE = 'New chat';

    public function __construct(
        private readonly ChatMigrationService $migrationService,
        private readonly ChatMarkdownComposer $composer,
    ) {
    }

    public function listForUser(User $user): Collection
    {
        $conversations = Conversation::query()
            ->where('user_id', $user->id)
            ->latest('updated_at')
            ->get();

        $conversations->each(fn (Conversation $conversation) => $this->migrationService->migrateConversationIfNeeded($conversation));

        return $conversations->map(function (Conversation $conversation) {
            $lastMessage = ChatMessage::where('conversation_id', $conversation->id)->latest('created_at')->first();

            return [
                'id' => $conversation->id,
                'title' => $conversation->title ?: self::DEFAULT_TITLE,
                'ai_generated_title' => $conversation->ai_generated_title,
                'title_generated_at' => $conversation->title_generated_at?->toIso8601String(),
                'created_at' => $conversation->created_at?->toIso8601String(),
                'updated_at' => $conversation->updated_at?->toIso8601String(),
                'messages_count' => ChatMessage::where('conversation_id', $conversation->id)->count(),
                'last_message' => $lastMessage?->content_text,
            ];
        });
    }

    public function create(User $user, ?string $title = null): Conversation
    {
        return Conversation::create([
            'user_id' => $user->id,
            'title' => $title ?: self::DEFAULT_TITLE,
            'context' => [],
        ]);
    }

    public function show(User $user, Conversation $conversation): array
    {
        abort_unless($conversation->user_id === $user->id, 403);

        $this->migrationService->migrateConversationIfNeeded($conversation);

        $conversation->load(['user']);

        $messages = ChatMessage::query()
            ->where('conversation_id', $conversation->id)
            ->with(['attachments', 'toolRuns', 'sources'])
            ->orderBy('created_at')
            ->get()
            ->map(fn (ChatMessage $message) => $this->serializeMessage($message));

        return [
            'id' => $conversation->id,
            'title' => $conversation->title ?: self::DEFAULT_TITLE,
            'ai_generated_title' => $conversation->ai_generated_title,
            'title_generated_at' => $conversation->title_generated_at?->toIso8601String(),
            'created_at' => $conversation->created_at?->toIso8601String(),
            'updated_at' => $conversation->updated_at?->toIso8601String(),
            'messages' => $messages,
        ];
    }

    public function update(User $user, Conversation $conversation, array $attributes): Conversation
    {
        abort_unless($conversation->user_id === $user->id, 403);

        if (array_key_exists('title', $attributes)) {
            $attributes['ai_generated_title'] = false;
        }

        $conversation->update($attributes);

        return $conversation->fresh();
    }

    public function delete(User $user, Conversation $conversation): void
    {
        abort_unless($conversation->user_id === $user->id, 403);
        $conversation->delete();
    }

    public function deleteAll(User $user): int
    {
        $conversations = Conversation::query()
            ->where('user_id', $user->id)
            ->get();

        $count = $conversations->count();

        $conversations->each->delete();

        return $count;
    }

    public function export(User $user, Conversation $conversation, string $format): array
    {
        abort_unless($conversation->user_id === $user->id, 403);

        $this->migrationService->migrateConversationIfNeeded($conversation);

        $conversation->loadMissing(['user']);

        $messages = ChatMessage::query()
            ->where('conversation_id', $conversation->id)
            ->with(['attachments', 'toolRuns', 'sources'])
            ->orderBy('created_at')
            ->get();

        $payload = [
            'id' => $conversation->id,
            'title' => $conversation->title ?: self::DEFAULT_TITLE,
            'ai_generated_title' => $conversation->ai_generated_title,
            'title_generated_at' => $conversation->title_generated_at?->toIso8601String(),
            'created_at' => $conversation->created_at?->toIso8601String(),
            'updated_at' => $conversation->updated_at?->toIso8601String(),
            'messages' => $messages->map(fn (ChatMessage $message) => $this->serializeMessage($message))->values()->all(),
        ];

        return match ($format) {
            'md' => [
                'content' => $this->buildMarkdownExport($payload),
                'mime_type' => 'text/markdown; charset=UTF-8',
                'filename' => $this->exportFilename($payload['title'], 'md'),
            ],
            'json' => [
                'content' => json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
                'mime_type' => 'application/json; charset=UTF-8',
                'filename' => $this->exportFilename($payload['title'], 'json'),
            ],
            default => abort(422, 'Unsupported export format'),
        };
    }

    public function serializeMessage(ChatMessage $message): array
    {
        $toolRuns = $message->toolRuns
            ->sortBy(fn ($toolRun) => $toolRun->created_at?->getTimestamp() ?? 0)
            ->values();

        return [
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'role' => $message->role,
            'status' => $message->status,
            'provider' => $message->provider,
            'model' => $message->model,
            'type' => $message->type,
            'content_markdown' => $message->content_markdown ?? '',
            'content_text' => $message->content_text ?? '',
            'created_at' => $message->created_at?->toIso8601String(),
            'attachments' => $message->attachments->map(fn ($attachment) => [
                'id' => $attachment->id,
                'kind' => $attachment->kind,
                'name' => $attachment->name,
                'mime_type' => $attachment->mime_type,
                'size' => $attachment->size,
                'url' => $attachment->url,
            ])->values(),
            'tool_runs' => $toolRuns->map(fn ($toolRun) => [
                'id' => $toolRun->id,
                'tool_name' => $toolRun->tool_name,
                'status' => $toolRun->status,
                'summary' => $toolRun->summary,
                'arguments' => $toolRun->arguments,
                'result' => $toolRun->result,
                'error_message' => $toolRun->error_message,
                'created_at' => $toolRun->created_at?->toIso8601String(),
                'updated_at' => $toolRun->updated_at?->toIso8601String(),
            ])->values(),
        ];
    }

    public static function isDefaultTitle(?string $title): bool
    {
        return trim((string) $title) === '' || strcasecmp(trim((string) $title), self::DEFAULT_TITLE) === 0;
    }

    private function exportFilename(string $title, string $extension): string
    {
        $base = Str::slug($title) ?: 'conversation';

        return "{$base}.{$extension}";
    }

    private function buildMarkdownExport(array $conversation): string
    {
        $lines = [
            '# ' . ($conversation['title'] ?: self::DEFAULT_TITLE),
            '',
            '- Conversation ID: `' . $conversation['id'] . '`',
            '- Created: ' . ($conversation['created_at'] ?? 'Unknown'),
            '- Updated: ' . ($conversation['updated_at'] ?? 'Unknown'),
            '',
            '---',
            '',
        ];

        foreach ($conversation['messages'] as $message) {
            $role = Str::headline((string) ($message['role'] ?? 'message'));
            $lines[] = '## ' . $role;
            $lines[] = '';
            $lines[] = trim((string) (($message['content_markdown'] ?: $message['content_text']) ?: '_No content_'));
            $lines[] = '';

            if (!empty($message['attachments'])) {
                $lines[] = 'Attachments:';
                foreach ($message['attachments'] as $attachment) {
                    $lines[] = '- ' . ($attachment['name'] ?? 'Attachment') . ' (' . ($attachment['mime_type'] ?? 'file') . ')';
                }
                $lines[] = '';
            }

            if (!empty($message['tool_runs'])) {
                $lines[] = 'Tool runs:';
                foreach ($message['tool_runs'] as $toolRun) {
                    $summary = $toolRun['summary'] ?: $toolRun['error_message'] ?: '';
                    $lines[] = '- `' . ($toolRun['tool_name'] ?? 'tool') . '` [' . ($toolRun['status'] ?? 'unknown') . ']' . ($summary !== '' ? ': ' . $summary : '');
                }
                $lines[] = '';
            }

            $lines[] = 'Timestamp: ' . ($message['created_at'] ?? 'Unknown');
            $lines[] = '';
            $lines[] = '---';
            $lines[] = '';
        }

        return trim(implode("\n", $lines)) . "\n";
    }
}
