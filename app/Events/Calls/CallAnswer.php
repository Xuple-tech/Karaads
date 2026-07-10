<?php

namespace App\Events\Calls;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallAnswer implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public array $call,
        public string $fromUserId,
        public string $toUserId,
        public string $answerSdp,
        public ?string $answerSignalId = null,
    ) {
    }

    public function broadcastOn(): array
    {
        $callId = (string) ($this->call['id'] ?? '');
        return [new PrivateChannel('call.' . $callId)];
    }

    public function broadcastAs(): string
    {
        return 'CallAnswer';
    }

    public function broadcastWith(): array
    {
        return [
            'call_id' => (string) ($this->call['id'] ?? ''),
            'conversation_id' => (string) ($this->call['conversation_id'] ?? ''),
            'from_user_id' => $this->fromUserId,
            'to_user_id' => $this->toUserId,
            'answer_signal_id' => $this->answerSignalId,
            'participant_ids' => array_values((array) ($this->call['participant_ids'] ?? [])),
            'participants' => array_values((array) ($this->call['participants'] ?? [])),
            'max_participants' => (int) ($this->call['max_participants'] ?? 0),
        ];
    }
}
