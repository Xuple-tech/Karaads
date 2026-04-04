<?php

namespace App\Services\Chat;

use App\Models\ChatMessage;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Collection;

class ChatConversationService
{
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
                'title' => $conversation->title ?: 'New chat',
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
            'title' => $title ?: 'New chat',
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
            'title' => $conversation->title ?: 'New chat',
            'created_at' => $conversation->created_at?->toIso8601String(),
            'updated_at' => $conversation->updated_at?->toIso8601String(),
            'messages' => $messages,
        ];
    }

    public function update(User $user, Conversation $conversation, array $attributes): Conversation
    {
        abort_unless($conversation->user_id === $user->id, 403);
        $conversation->update($attributes);

        return $conversation->fresh();
    }

    public function delete(User $user, Conversation $conversation): void
    {
        abort_unless($conversation->user_id === $user->id, 403);
        $conversation->delete();
    }

    public function serializeMessage(ChatMessage $message): array
    {
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
        ];
    }
}
