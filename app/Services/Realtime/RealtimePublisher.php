<?php

namespace App\Services\Realtime;

use App\Events\RealtimeChannelEvent;
use App\Models\Conversation;

class RealtimePublisher
{
    /**
     * @param  array<string, mixed>  $payload
     */
    public function toConversation(string $conversationId, array $payload): void
    {
        broadcast(new RealtimeChannelEvent([
            'conversation.'.$conversationId,
        ], $payload));
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function toUser(string $userId, array $payload): void
    {
        broadcast(new RealtimeChannelEvent([
            'user.'.$userId,
        ], $payload));
    }

    public function conversationUpdated(Conversation $conversation, ?string $lastMessage = null): void
    {
        if (! $conversation->user_id) {
            return;
        }

        $this->toUser($conversation->user_id, [
            'event' => 'conversation.updated',
            'conversation' => [
                'id' => $conversation->id,
                'title' => $conversation->title ?: 'New chat',
                'ai_generated_title' => $conversation->ai_generated_title,
                'title_generated_at' => $conversation->title_generated_at?->toIso8601String(),
                'created_at' => $conversation->created_at?->toIso8601String(),
                'updated_at' => $conversation->updated_at?->toIso8601String(),
                'last_message' => $lastMessage,
            ],
        ]);
    }
}
