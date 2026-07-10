<?php

namespace App\Events;

use App\Models\LiveStreamMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LiveChatMessageUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public LiveStreamMessage $message) {}

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('presence.live.' . $this->message->live_stream_id),
        ];
    }

    public function broadcastWith(): array
    {
        $message = $this->message->loadMissing('user');

        return [
            'message' => [
                'id' => $message->id,
                'live_stream_id' => $message->live_stream_id,
                'message' => $message->message,
                'is_pinned' => (bool) $message->is_pinned,
                'pinned_at' => $message->pinned_at?->toIso8601String(),
                'is_deleted' => (bool) $message->is_deleted,
                'created_at' => $message->created_at?->toIso8601String(),
                'user' => $message->user
                    ? $message->user->only(['id', 'name', 'username', 'avatar'])
                    : null,
            ],
        ];
    }

    public function broadcastAs(): string
    {
        return 'live.chat.message.updated';
    }
}
