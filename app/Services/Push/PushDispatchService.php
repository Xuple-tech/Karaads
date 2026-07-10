<?php

namespace App\Services\Push;

use App\Jobs\SendExpoPushNotificationJob;
use App\Models\Conversation;
use App\Models\User;

class PushDispatchService
{
    /**
     * @param list<string> $recipientIds
     * @param array<string,mixed> $payload
     */
    public function dispatch(array $recipientIds, array $payload): void
    {
        if ($recipientIds === []) {
            return;
        }

        SendExpoPushNotificationJob::dispatch($recipientIds, $payload);
    }

    public function dispatchMessageNotification(
        Conversation $conversation,
        User $sender,
        string $messageId,
        string $messageBody,
    ): void {
        $recipientIds = $conversation->participants()
            ->where('users.id', '!=', (string) $sender->id)
            ->pluck('users.id')
            ->map(static fn(string $id): string => (string) $id)
            ->values()
            ->all();

        $this->dispatch($recipientIds, [
            'title' => $sender->name ?: 'New message',
            'body' => mb_substr(trim($messageBody) ?: 'You have a new message', 0, 140),
            'data' => [
                'type' => 'message',
                'conversationId' => (string) $conversation->id,
                'messageId' => $messageId,
                'actorId' => (string) $sender->id,
            ],
        ]);
    }

    public function dispatchIncomingCallNotification(
        string $recipientUserId,
        User $caller,
        string $callId,
        string $conversationId,
        string $mode = 'audio',
    ): void {
        $this->dispatch([$recipientUserId], [
            'title' => 'Incoming call',
            'body' => ($caller->name ?: 'Someone') . ' is calling you',
            'priority' => 'high',
            'data' => [
                'type' => 'incoming_call',
                'callId' => $callId,
                'conversationId' => $conversationId,
                'mode' => $mode,
                'actorId' => (string) $caller->id,
            ],
        ]);
    }
}
