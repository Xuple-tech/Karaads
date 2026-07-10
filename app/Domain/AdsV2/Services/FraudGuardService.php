<?php

namespace App\Domain\AdsV2\Services;

use App\Models\AdsV2\AdEvent;

class FraudGuardService
{
    public function evaluate(string $eventType, ?string $fingerprint, ?string $sessionId, ?string $deliveryId): array
    {
        $now = now();

        if (! $fingerprint && ! $sessionId) {
            return ['valid' => false, 'reason' => 'missing_fingerprint'];
        }

        $windowStart = $now->copy()->subMinutes(2);

        $velocity = AdEvent::query()
            ->where('event_type', $eventType)
            ->where('created_at', '>=', $windowStart)
            ->when($fingerprint, fn ($q) => $q->where('fingerprint', $fingerprint))
            ->when(! $fingerprint && $sessionId, fn ($q) => $q->where('session_id', $sessionId))
            ->count();

        if ($velocity > 20) {
            return ['valid' => false, 'reason' => 'velocity_limit'];
        }

        if ($deliveryId) {
            $duplicate = AdEvent::query()
                ->where('delivery_id', $deliveryId)
                ->where('event_type', $eventType)
                ->where('created_at', '>=', $now->copy()->subMinutes(10))
                ->exists();

            if ($duplicate && in_array($eventType, ['click', 'conversion', 'view_complete'], true)) {
                return ['valid' => false, 'reason' => 'duplicate_event'];
            }
        }

        return ['valid' => true, 'reason' => null];
    }
}
