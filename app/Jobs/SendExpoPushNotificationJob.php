<?php

namespace App\Jobs;

use App\Models\UserPushToken;
use App\Services\Push\ExpoPushService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class SendExpoPushNotificationJob implements ShouldQueue
{
    use Queueable;

    /**
     * @param list<string> $recipientUserIds
     * @param array<string,mixed> $payload
     */
    public function __construct(
        public array $recipientUserIds,
        public array $payload,
    ) {
    }

    public function handle(ExpoPushService $expoPush): void
    {
        if ($this->recipientUserIds === []) {
            return;
        }

        $tokens = UserPushToken::query()
            ->whereIn('user_id', $this->recipientUserIds)
            ->where('is_active', true)
            ->pluck('token', 'id');

        if ($tokens->isEmpty()) {
            Log::info('push.dispatch.skipped_no_tokens', [
                'recipient_count' => count($this->recipientUserIds),
                'type' => $this->payload['data']['type'] ?? null,
            ]);
            return;
        }

        $result = $expoPush->send($tokens->values()->all(), $this->payload);

        Log::info('push.dispatch.result', [
            'recipient_count' => count($this->recipientUserIds),
            'token_count' => $tokens->count(),
            'tickets_count' => count($result['tickets']),
            'errors_count' => count($result['errors']),
            'type' => $this->payload['data']['type'] ?? null,
        ]);

        $tickets = $result['tickets'];
        foreach ($tickets as $index => $ticket) {
            if (!is_array($ticket)) {
                continue;
            }
            $status = (string) ($ticket['status'] ?? '');
            if ($status !== 'error') {
                continue;
            }

            $details = is_array($ticket['details'] ?? null) ? $ticket['details'] : [];
            $errorCode = (string) ($details['error'] ?? '');
            if ($errorCode !== 'DeviceNotRegistered') {
                continue;
            }

            $token = $tokens->values()->get($index);
            if (!is_string($token) || $token === '') {
                continue;
            }

            UserPushToken::query()
                ->where('token_hash', hash('sha256', $token))
                ->update(['is_active' => false, 'updated_at' => now()]);
        }
    }
}
