<?php

namespace App\Events;

use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LiveStreamSignalSent implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly string $streamId,
        public readonly array $signal,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('presence.live.' . $this->streamId),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'signal' => $this->signal,
        ];
    }

    public function broadcastAs(): string
    {
        return 'live.signal';
    }
}
