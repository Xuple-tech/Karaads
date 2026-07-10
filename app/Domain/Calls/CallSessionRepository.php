<?php

namespace App\Domain\Calls;

use App\Models\CallSession;
use App\Models\CallSessionParticipant;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CallSessionRepository
{
    private int $callTtlMinutes;

    private int $signalTtlMinutes;

    private int $lockTtlSeconds;

    public function __construct()
    {
        $this->callTtlMinutes = (int) config('calls.call_ttl_minutes', 10);
        $this->signalTtlMinutes = (int) config('calls.signal_ttl_minutes', 3);
        $this->lockTtlSeconds = (int) config('calls.lock_ttl_seconds', 5);
    }

    public function getSession(string $callId): ?CallSession
    {
        return CallSession::query()
            ->with(['conversation', 'participants.user'])
            ->find($callId);
    }

    public function getSnapshot(string $callId): ?array
    {
        $snapshot = Cache::get($this->snapshotKey($callId));
        if (is_array($snapshot)) {
            return $snapshot;
        }

        // Backward-compat cache key.
        $legacy = Cache::get("call:{$callId}");
        if (is_array($legacy)) {
            $this->putSnapshot($callId, $legacy);
            return $legacy;
        }

        $session = $this->getSession($callId);
        if (!$session) {
            return null;
        }

        return $this->saveSnapshot($session);
    }

    public function saveSnapshot(CallSession $session): array
    {
        $session->loadMissing(['participants.user']);
        $snapshot = $this->serializeSession($session);
        $this->putSnapshot((string) $session->id, $snapshot);
        $this->syncActiveCallMappings($snapshot);

        return $snapshot;
    }

    public function putSnapshot(string $callId, array $snapshot): void
    {
        $expiresAt = now()->addMinutes($this->callTtlMinutes);
        Cache::put($this->snapshotKey($callId), $snapshot, $expiresAt);
        // Backward-compat cache key used in existing channel auth.
        Cache::put("call:{$callId}", $snapshot, $expiresAt);
    }

    public function getActiveCallIdForUser(string $userId): ?string
    {
        $value = Cache::get($this->activeCallKey($userId));
        return is_string($value) && $value !== '' ? $value : null;
    }

    public function putActiveCallForUser(string $userId, string $callId): void
    {
        Cache::put($this->activeCallKey($userId), $callId, now()->addMinutes($this->callTtlMinutes));
    }

    public function forgetActiveCallForUser(string $userId): void
    {
        Cache::forget($this->activeCallKey($userId));
    }

    public function forgetActiveCallForUsers(iterable $userIds): void
    {
        foreach ($userIds as $userId) {
            if (!is_string($userId) || $userId === '') {
                continue;
            }
            $this->forgetActiveCallForUser($userId);
        }
    }

    public function syncActiveCallMappings(array $call): void
    {
        $callId = (string) ($call['id'] ?? '');
        if ($callId === '') {
            return;
        }

        $status = (string) ($call['status'] ?? '');
        if (!in_array($status, ['ringing', 'accepted'], true)) {
            return;
        }

        foreach ((array) ($call['participant_ids'] ?? []) as $participantId) {
            if (!is_string($participantId) || $participantId === '') {
                continue;
            }
            $this->putActiveCallForUser($participantId, $callId);
        }
    }

    public function isUserCurrentlyInActiveCall(string $userId): bool
    {
        $activeCallId = $this->getActiveCallIdForUser($userId);
        if (!$activeCallId) {
            return false;
        }

        $call = $this->getSnapshot($activeCallId);
        if (!is_array($call)) {
            $this->forgetActiveCallForUser($userId);
            return false;
        }

        $status = (string) ($call['status'] ?? '');
        if (!in_array($status, ['ringing', 'accepted'], true)) {
            $this->forgetActiveCallForUser($userId);
            return false;
        }

        $participants = array_values((array) ($call['participant_ids'] ?? []));
        if (!in_array($userId, $participants, true)) {
            $this->forgetActiveCallForUser($userId);
            return false;
        }

        return true;
    }

    public function putSignal(string $callId, string $type, string $signalId, string $sdp): void
    {
        $key = $this->signalKey($callId, $type, $signalId);
        Cache::put($key, base64_encode($sdp), now()->addMinutes($this->signalTtlMinutes));
    }

    public function getSignal(string $callId, string $type, string $signalId): mixed
    {
        return Cache::get($this->signalKey($callId, $type, $signalId));
    }

    /**
     * @template T
     *
     * @param  callable():T  $callback
     * @return T
     */
    public function withCallLock(string $callId, callable $callback)
    {
        $lock = Cache::lock("call_lock:{$callId}", $this->lockTtlSeconds);
        if (!$lock->get()) {
            abort(response()->json(['message' => 'Call state is being updated, retry'], 409));
        }

        try {
            return $callback();
        } finally {
            try {
                $lock->release();
            } catch (\Throwable) {
                // ignore lock release failures
            }
        }
    }

    public function serializeSession(CallSession $session): array
    {
        /** @var EloquentCollection<int, CallSessionParticipant> $participants */
        $participants = $session->participants instanceof EloquentCollection
            ? $session->participants
            : collect();

        $activeStates = ['invited', 'joined'];
        $activeParticipants = $participants
            ->filter(fn(CallSessionParticipant $participant) => in_array((string) $participant->state, $activeStates, true))
            ->values();

        $participantIds = $activeParticipants
            ->map(fn(CallSessionParticipant $participant) => (string) $participant->user_id)
            ->filter(fn(string $id) => $id !== '')
            ->values()
            ->all();

        $acceptedUserIds = $participants
            ->filter(fn(CallSessionParticipant $participant) => (string) $participant->state === 'joined')
            ->map(fn(CallSessionParticipant $participant) => (string) $participant->user_id)
            ->filter(fn(string $id) => $id !== '')
            ->values()
            ->all();

        $initiatorId = (string) $session->initiator_id;
        $calleeId = '';
        foreach ($participantIds as $participantId) {
            if ($participantId !== $initiatorId) {
                $calleeId = $participantId;
                break;
            }
        }

        $participantSummaries = $activeParticipants->map(function (CallSessionParticipant $participant) {
            $user = $participant->user;

            return [
                'id' => (string) $participant->user_id,
                'name' => (string) ($user?->name ?? 'Unknown'),
                'avatar' => $user?->avatar,
                'username' => $user?->username,
                'state' => (string) $participant->state,
                'role' => (string) $participant->role,
            ];
        })->values()->all();

        return [
            'id' => (string) $session->id,
            'conversation_id' => (string) $session->conversation_id,
            'caller_id' => $initiatorId,
            'callee_id' => $calleeId,
            'initiator_id' => $initiatorId,
            'participant_ids' => array_values(array_unique($participantIds)),
            'accepted_user_ids' => array_values(array_unique($acceptedUserIds)),
            'status' => (string) $session->status,
            'mode' => (string) $session->mode,
            'max_participants' => (int) $session->max_participants,
            'accepted_at' => $session->accepted_at?->toISOString(),
            'ended_at' => $session->ended_at?->toISOString(),
            'last_activity_at' => $session->last_activity_at?->toISOString(),
            'created_at' => $session->created_at?->toISOString() ?? Carbon::now()->toISOString(),
            'participants' => $participantSummaries,
        ];
    }

    public function buildParticipantData(
        string $callId,
        string $userId,
        string $role = 'participant',
        string $source = 'direct_invite',
        string $state = 'invited',
        ?string $invitedBy = null,
    ): array {
        $now = now();

        return [
            'id' => (string) Str::uuid(),
            'call_session_id' => $callId,
            'user_id' => $userId,
            'role' => $role,
            'invite_source' => $source,
            'state' => $state,
            'invited_by_user_id' => $invitedBy,
            'joined_at' => $state === 'joined' ? $now : null,
            'left_at' => null,
            'responded_at' => in_array($state, ['joined', 'declined', 'left', 'kicked'], true) ? $now : null,
            'created_at' => $now,
            'updated_at' => $now,
        ];
    }

    private function snapshotKey(string $callId): string
    {
        return "call_snapshot:{$callId}";
    }

    private function activeCallKey(string $userId): string
    {
        return "active_call_for_user:{$userId}";
    }

    private function signalKey(string $callId, string $type, string $signalId): string
    {
        return "call_signal:{$callId}:{$type}:{$signalId}";
    }
}
