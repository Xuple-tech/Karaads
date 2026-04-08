<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RealtimeChannelEvent implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    /**
     * @param  list<string>  $channels
     * @param  array<string, mixed>  $payload
     */
    public function __construct(
        private readonly array $channels,
        private readonly array $payload,
    ) {
    }

    public function broadcastAs(): string
    {
        return 'realtime.event';
    }

    public function broadcastOn(): array
    {
        return array_map(
            fn (string $channel) => new PrivateChannel($channel),
            $this->channels,
        );
    }

    public function broadcastWith(): array
    {
        return $this->payload;
    }
}
