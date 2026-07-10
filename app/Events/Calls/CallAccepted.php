<?php

namespace App\Events\Calls;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallAccepted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public array $call, public string $fromUserId)
    {
    }

    public function broadcastOn(): array
    {
        $callId = (string) ($this->call['id'] ?? '');
        $initiatorId = (string) ($this->call['initiator_id'] ?? '');

        $channels = [new PrivateChannel('call.' . $callId)];
        if ($initiatorId !== '') {
            $channels[] = new PrivateChannel('App.Models.User.' . $initiatorId);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'CallAccepted';
    }

    public function broadcastWith(): array
    {
        return [
            'call_id' => (string) ($this->call['id'] ?? ''),
            'conversation_id' => (string) ($this->call['conversation_id'] ?? ''),
            'from_user_id' => $this->fromUserId,
            'mode' => (string) ($this->call['mode'] ?? 'video'),
            'participant_ids' => array_values($this->call['participant_ids'] ?? []),
            'participants' => array_values((array) ($this->call['participants'] ?? [])),
            'max_participants' => (int) ($this->call['max_participants'] ?? 0),
        ];
    }
}
