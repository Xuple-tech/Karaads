<?php

namespace App\Events;

use App\Models\LiveStream;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LiveStreamUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public LiveStream $stream) {}

    public function broadcastOn(): array
    {
        return [new Channel('live.global')];
    }

    public function broadcastWith(): array
    {
        $stream = $this->stream->loadMissing('user');

        return [
            'stream' => [
                'id' => $stream->id,
                'title' => $stream->title,
                'description' => $stream->description,
                'category' => $stream->settings['category'] ?? 'Live',
                'visibility' => $stream->visibility,
                'status' => $stream->status,
                'viewer_count' => (int) $stream->viewer_count,
                'peak_viewer_count' => (int) $stream->peak_viewer_count,
                'reaction_count' => (int) $stream->reaction_count,
                'share_count' => (int) $stream->share_count,
                'comments_count' => (int) ($stream->comments_count ?? 0),
                'started_at' => $stream->started_at?->toIso8601String(),
                'user' => $stream->user
                    ? $stream->user->only(['id', 'name', 'username', 'avatar'])
                    : null,
            ],
        ];
    }

    public function broadcastAs(): string
    {
        return 'live.stream.updated';
    }
}
