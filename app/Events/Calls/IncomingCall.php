<?php

namespace App\Events\Calls;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class IncomingCall implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public array $call,
        public User $caller,
        public User $recipient,
    ) {
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('App.Models.User.' . $this->recipient->id)];
    }

    public function broadcastAs(): string
    {
        return 'IncomingCall';
    }

    public function broadcastWith(): array
    {
        return [
            'call_id' => (string) ($this->call['id'] ?? ''),
            'conversation_id' => (string) ($this->call['conversation_id'] ?? ''),
            'from_user_id' => (string) $this->caller->id,
            'mode' => (string) ($this->call['mode'] ?? 'video'),
            'participant_ids' => array_values($this->call['participant_ids'] ?? []),
            'participants' => array_values((array) ($this->call['participants'] ?? [])),
            'max_participants' => (int) ($this->call['max_participants'] ?? 0),
            'initiator_id' => (string) ($this->call['initiator_id'] ?? ''),
            'caller' => [
                'id' => (string) $this->caller->id,
                'name' => (string) $this->caller->name,
                'avatar' => $this->caller->avatar,
                'username' => $this->caller->username,
            ],
        ];
    }
}
