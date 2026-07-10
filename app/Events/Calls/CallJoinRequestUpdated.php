<?php

namespace App\Events\Calls;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallJoinRequestUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @param array<string,mixed> $call
     * @param array<string,mixed> $requestPayload
     * @param array<int,array<string,mixed>> $pendingRequests
     */
    public function __construct(
        public array $call,
        public array $requestPayload,
        public array $pendingRequests = [],
        public ?string $decidedByUserId = null,
    ) {
    }

    public function broadcastOn(): array
    {
        $callId = (string) ($this->call['id'] ?? '');
        $requestedByUserId = (string) ($this->requestPayload['requested_by']['id'] ?? '');

        $channels = [new PrivateChannel('call.' . $callId)];
        if ($requestedByUserId !== '') {
            $channels[] = new PrivateChannel('App.Models.User.' . $requestedByUserId);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'CallJoinRequestUpdated';
    }

    public function broadcastWith(): array
    {
        return [
            'call_id' => (string) ($this->call['id'] ?? ''),
            'conversation_id' => (string) ($this->call['conversation_id'] ?? ''),
            'request' => $this->requestPayload,
            'pending_requests' => array_values($this->pendingRequests),
            'decided_by_user_id' => $this->decidedByUserId,
        ];
    }
}
