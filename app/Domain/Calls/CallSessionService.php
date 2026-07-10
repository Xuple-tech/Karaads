<?php

namespace App\Domain\Calls;

use App\Events\MessageSent;
use App\Models\CallJoinRequest;
use App\Models\CallSession;
use App\Models\CallSessionParticipant;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Services\Push\PushDispatchService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CallSessionService
{
    public function __construct(
        private readonly CallSessionRepository $repository,
        private readonly CallAuthorizationService $authorization,
        private readonly CallParticipantService $participants,
        private readonly CallSignalService $signals,
        private readonly CallRealtimePublisher $realtime,
        private readonly PushDispatchService $pushDispatch,
    ) {
    }

    public function show(string $callId, string $userId): array
    {
        $session = $this->getSessionOrFail($callId);
        $call = $this->repository->saveSnapshot($session);
        $this->authorization->ensureCallParticipant($call, $userId);

        return $call;
    }

    public function active(string $userId): array
    {
        $callId = $this->repository->getActiveCallIdForUser($userId);
        if (!$callId) {
            return ['call' => null];
        }

        $call = $this->repository->getSnapshot($callId);
        if (!is_array($call)) {
            $this->repository->forgetActiveCallForUser($userId);
            return ['call' => null];
        }

        $status = (string) ($call['status'] ?? '');
        if (!in_array($status, ['ringing', 'accepted'], true)) {
            $this->repository->forgetActiveCallForUser($userId);
            return ['call' => null];
        }

        $participantIds = array_values((array) ($call['participant_ids'] ?? []));
        if (!in_array($userId, $participantIds, true)) {
            $this->repository->forgetActiveCallForUser($userId);
            return ['call' => null];
        }

        $this->repository->syncActiveCallMappings($call);

        return ['call' => $call];
    }

    public function start(
        Conversation $conversation,
        string $initiatorId,
        string $mode = 'video',
        ?int $maxParticipants = null,
    ): array {
        $this->authorization->ensureConversationParticipant($conversation, $initiatorId);

        if ($this->repository->isUserCurrentlyInActiveCall($initiatorId)) {
            abort(response()->json(['message' => 'User is already in a call'], 409));
        }

        $hardCap = max(2, (int) config('calls.hard_max_participants', 8));
        $defaultCap = max(2, (int) config('calls.default_max_participants', 8));
        $effectiveMaxParticipants = $maxParticipants ?? $defaultCap;
        $effectiveMaxParticipants = min($hardCap, max(2, $effectiveMaxParticipants));

        $initialParticipants = $this->participants->resolveInitialParticipantIds($conversation, $initiatorId);
        if (($conversation->type ?? 'private') === 'private' && count($initialParticipants) < 2) {
            abort(response()->json(['message' => 'Call requires at least 2 participants'], 422));
        }
        if (count($initialParticipants) > $effectiveMaxParticipants) {
            abort(response()->json([
                'message' => 'Group call participant limit exceeded',
                'max_participants' => $effectiveMaxParticipants,
            ], 422));
        }

        foreach ($initialParticipants as $participantId) {
            if ($this->repository->isUserCurrentlyInActiveCall($participantId)) {
                abort(response()->json(['message' => 'User is already in a call'], 409));
            }
        }

        $session = DB::transaction(function () use (
            $conversation,
            $initiatorId,
            $mode,
            $effectiveMaxParticipants,
            $initialParticipants
        ) {
            $session = CallSession::query()->create([
                'id' => (string) Str::uuid(),
                'conversation_id' => (string) $conversation->id,
                'initiator_id' => $initiatorId,
                'mode' => $mode,
                'status' => 'ringing',
                'max_participants' => $effectiveMaxParticipants,
                'last_activity_at' => now(),
            ]);

            foreach ($initialParticipants as $participantId) {
                $this->participants->addParticipant(
                    session: $session,
                    userId: $participantId,
                    role: $participantId === $initiatorId ? 'initiator' : 'participant',
                    inviteSource: 'conversation_default',
                    state: 'invited',
                    invitedByUserId: $initiatorId,
                );
            }

            return $session->fresh(['participants.user']);
        });

        $call = $this->repository->saveSnapshot($session);
        $caller = User::query()->findOrFail($initiatorId);

        $recipientIds = array_values(array_filter(
            (array) ($call['participant_ids'] ?? []),
            fn(string $id) => $id !== $initiatorId
        ));
        if ($recipientIds !== []) {
            $recipients = User::query()->whereIn('id', $recipientIds)->get();
            foreach ($recipients as $recipient) {
                $this->realtime->incoming($call, $caller, $recipient);
                $this->pushDispatch->dispatchIncomingCallNotification(
                    (string) $recipient->id,
                    $caller,
                    (string) ($call['id'] ?? ''),
                    (string) ($call['conversation_id'] ?? ''),
                    (string) ($call['mode'] ?? 'audio'),
                );
            }
        }

        $calleeSummary = null;
        foreach ((array) ($call['participants'] ?? []) as $participantSummary) {
            if (($participantSummary['id'] ?? null) === $initiatorId) {
                continue;
            }
            $calleeSummary = [
                'id' => (string) ($participantSummary['id'] ?? ''),
                'name' => (string) ($participantSummary['name'] ?? 'Unknown'),
                'avatar' => $participantSummary['avatar'] ?? null,
                'username' => $participantSummary['username'] ?? null,
            ];
            break;
        }

        return [
            'call_id' => (string) $call['id'],
            'conversation_id' => (string) $call['conversation_id'],
            'status' => (string) $call['status'],
            'mode' => (string) $call['mode'],
            'participant_ids' => array_values((array) ($call['participant_ids'] ?? [])),
            'participants' => array_values((array) ($call['participants'] ?? [])),
            'initiator_id' => (string) $call['initiator_id'],
            'max_participants' => (int) ($call['max_participants'] ?? $effectiveMaxParticipants),
            'callee' => $calleeSummary,
        ];
    }

    public function accept(string $callId, string $userId): array
    {
        return $this->repository->withCallLock($callId, function () use ($callId, $userId) {
            $session = $this->getSessionOrFail($callId);
            $call = $this->repository->saveSnapshot($session);
            $this->authorization->ensureCallParticipant($call, $userId);

            if (!$this->isActiveCallStatus((string) $session->status)) {
                abort(response()->json(['message' => 'Call is not available'], 409));
            }

            $participant = $this->participants->getParticipant($session, $userId);
            if (!$participant) {
                abort(403);
            }

            $alreadyAccepted = (string) $participant->state === 'joined';
            if (!$alreadyAccepted) {
                $this->participants->transitionParticipantState($participant, 'joined');
            }

            $session->status = 'accepted';
            if (!$session->accepted_at) {
                $session->accepted_at = now();
            }
            $session->last_activity_at = now();
            $session->save();

            $session = $this->getSessionOrFail($callId);
            $call = $this->repository->saveSnapshot($session);
            $this->repository->putActiveCallForUser($userId, $callId);

            if (!$alreadyAccepted) {
                $this->realtime->accepted($call, $userId);
            }

            return [
                'status' => 'accepted',
                'participant_ids' => array_values((array) ($call['participant_ids'] ?? [])),
                'accepted_user_ids' => array_values((array) ($call['accepted_user_ids'] ?? [])),
                'participants' => array_values((array) ($call['participants'] ?? [])),
                'max_participants' => (int) ($call['max_participants'] ?? 0),
            ];
        });
    }

    public function decline(string $callId, string $userId): array
    {
        return $this->repository->withCallLock($callId, function () use ($callId, $userId) {
            $session = $this->getSessionOrFail($callId);
            $call = $this->repository->saveSnapshot($session);
            $this->authorization->ensureCallParticipant($call, $userId);

            if (!$this->isActiveCallStatus((string) $session->status)) {
                abort(response()->json(['message' => 'Call cannot be declined'], 409));
            }

            $participant = $this->participants->getParticipant($session, $userId);
            if (!$participant) {
                abort(403);
            }

            $isInitiator = (string) $session->initiator_id === $userId;
            $activeCount = $this->activeParticipantCount($session);

            $this->participants->transitionParticipantState($participant, 'declined');
            $this->repository->forgetActiveCallForUser($userId);

            if ($isInitiator || $activeCount <= 2) {
                $call = $this->finalizeSession($session, $userId, 'declined');
                $this->realtime->declined($call, $userId);
                $this->realtime->ended($call, $userId);

                return ['status' => 'declined'];
            }

            $session = $this->getSessionOrFail($callId);
            if ($this->activeParticipantCount($session) < 2) {
                $call = $this->finalizeSession($session, $userId, 'ended');
                $this->realtime->declined($call, $userId);
                $this->realtime->ended($call, $userId);

                return ['status' => 'ended'];
            }

            $call = $this->repository->saveSnapshot($session);
            $this->realtime->declined($call, $userId);
            $this->realtime->participantRemoved($call, $userId, $userId, 'declined');

            return [
                'status' => 'declined',
                'participant_ids' => array_values((array) ($call['participant_ids'] ?? [])),
                'participants' => array_values((array) ($call['participants'] ?? [])),
            ];
        });
    }

    public function end(string $callId, string $userId): array
    {
        return $this->repository->withCallLock($callId, function () use ($callId, $userId) {
            $session = $this->getSessionOrFail($callId);
            $call = $this->repository->saveSnapshot($session);
            $this->authorization->ensureCallParticipant($call, $userId);

            if (!$this->isActiveCallStatus((string) $session->status)) {
                abort(response()->json(['message' => 'Call already ended'], 409));
            }

            $isInitiator = (string) $session->initiator_id === $userId;
            $isGroup = ($session->conversation?->type ?? 'private') === 'group';
            if ($isGroup && !$isInitiator) {
                abort(response()->json(['message' => 'Only the initiator can end a group call'], 403));
            }

            $call = $this->finalizeSession($session, $userId, 'ended');
            $this->realtime->ended($call, $userId);

            return ['status' => 'ended'];
        });
    }

    public function leave(string $callId, string $userId): array
    {
        return $this->repository->withCallLock($callId, function () use ($callId, $userId) {
            $session = $this->getSessionOrFail($callId);
            $call = $this->repository->saveSnapshot($session);
            $this->authorization->ensureCallParticipant($call, $userId);

            if (!$this->isActiveCallStatus((string) $session->status)) {
                abort(response()->json(['message' => 'Call already ended'], 409));
            }

            $participant = $this->participants->getParticipant($session, $userId);
            if (!$participant) {
                abort(403);
            }

            $this->participants->transitionParticipantState($participant, 'left');
            $this->repository->forgetActiveCallForUser($userId);

            $session = $this->getSessionOrFail($callId);
            if ($this->activeParticipantCount($session) < 2) {
                $call = $this->finalizeSession($session, $userId, 'ended');
                $this->realtime->ended($call, $userId);

                return ['status' => 'ended'];
            }

            $call = $this->repository->saveSnapshot($session);
            $this->realtime->participantRemoved($call, $userId, $userId, 'left');

            return [
                'status' => 'left',
                'participant_ids' => array_values((array) ($call['participant_ids'] ?? [])),
                'participants' => array_values((array) ($call['participants'] ?? [])),
            ];
        });
    }

    public function heartbeat(string $callId, string $userId): array
    {
        $session = $this->getSessionOrFail($callId);
        $call = $this->repository->saveSnapshot($session);
        $this->authorization->ensureCallParticipant($call, $userId);

        if (!$this->isActiveCallStatus((string) $session->status)) {
            abort(response()->json(['message' => 'Call is not active'], 409));
        }

        $this->touchSessionActivity($session);
        $call = $this->repository->saveSnapshot($session);

        return [
            'ok' => true,
            'call' => $call,
        ];
    }

    public function offer(string $callId, string $fromUserId, ?string $requestedToUserId, string $sdp): array
    {
        $session = $this->getSessionOrFail($callId);
        $call = $this->repository->saveSnapshot($session);
        $this->authorization->ensureCallParticipant($call, $fromUserId);

        if ((string) $session->status !== 'accepted') {
            abort(response()->json(['message' => 'Call is not accepted'], 409));
        }

        $toUserId = $this->authorization->resolveSignalTarget($call, $fromUserId, $requestedToUserId);
        $this->authorization->ensureSignalTarget($call, $fromUserId, $toUserId);

        $this->touchSessionActivity($session);
        $call = $this->repository->saveSnapshot($session);

        $signal = $this->signals->storeOffer($callId, $sdp);
        $this->realtime->offer($call, $fromUserId, $toUserId, $signal['sdp'], $signal['signal_id']);

        return ['ok' => true];
    }

    public function answer(string $callId, string $fromUserId, ?string $requestedToUserId, string $sdp): array
    {
        $session = $this->getSessionOrFail($callId);
        $call = $this->repository->saveSnapshot($session);
        $this->authorization->ensureCallParticipant($call, $fromUserId);

        if ((string) $session->status !== 'accepted') {
            abort(response()->json(['message' => 'Call is not accepted'], 409));
        }

        $toUserId = $this->authorization->resolveSignalTarget($call, $fromUserId, $requestedToUserId);
        $this->authorization->ensureSignalTarget($call, $fromUserId, $toUserId);

        $this->touchSessionActivity($session);
        $call = $this->repository->saveSnapshot($session);

        $signal = $this->signals->storeAnswer($callId, $sdp);
        $this->realtime->answer($call, $fromUserId, $toUserId, $signal['sdp'], $signal['signal_id']);

        return ['ok' => true];
    }

    public function ice(string $callId, string $fromUserId, ?string $requestedToUserId, mixed $candidate): array
    {
        $session = $this->getSessionOrFail($callId);
        $call = $this->repository->saveSnapshot($session);
        $this->authorization->ensureCallParticipant($call, $fromUserId);

        if ((string) $session->status !== 'accepted') {
            abort(response()->json(['message' => 'Call is not accepted'], 409));
        }

        $toUserId = $this->authorization->resolveSignalTarget($call, $fromUserId, $requestedToUserId);
        $this->authorization->ensureSignalTarget($call, $fromUserId, $toUserId);
        $this->signals->validateIceCandidatePayload($candidate);

        $this->touchSessionActivity($session);
        $call = $this->repository->saveSnapshot($session);

        $this->realtime->ice($call, $fromUserId, $toUserId, $candidate);

        return ['ok' => true];
    }

    public function signal(string $callId, string $type, string $signalId, string $userId): array
    {
        if (!in_array($type, ['offer', 'answer'], true)) {
            abort(404);
        }

        $session = $this->getSessionOrFail($callId);
        $call = $this->repository->saveSnapshot($session);
        $this->authorization->ensureCallParticipant($call, $userId);

        $sdpBase64 = $this->signals->getSignal($callId, $type, $signalId);
        if (!is_string($sdpBase64) || $sdpBase64 === '') {
            abort(404);
        }

        return [
            'call_id' => $callId,
            'type' => $type,
            'signal_id' => $signalId,
            'sdp_b64' => $sdpBase64,
        ];
    }

    public function invite(string $callId, string $hostUserId, string $targetUserId): array
    {
        return $this->repository->withCallLock($callId, function () use ($callId, $hostUserId, $targetUserId) {
            $session = $this->getSessionOrFail($callId);
            $call = $this->repository->saveSnapshot($session);
            $this->authorization->ensureCallParticipant($call, $hostUserId);
            $this->authorization->ensureHost($call, $hostUserId);

            if (!$this->isActiveCallStatus((string) $session->status)) {
                abort(response()->json(['message' => 'Call is not active'], 409));
            }

            $this->authorization->ensureMutualFollow($hostUserId, $targetUserId);

            $existing = $this->participants->getParticipant($session, $targetUserId);
            if ($existing && in_array((string) $existing->state, ['invited', 'joined'], true)) {
                abort(response()->json(['message' => 'User is already in the call'], 409));
            }

            if (!$existing) {
                $this->participants->ensureCapacity($session, 1);
            }

            if ($this->repository->isUserCurrentlyInActiveCall($targetUserId)) {
                abort(response()->json(['message' => 'User is already in a call'], 409));
            }

            if ($existing) {
                $existing->invite_source = 'direct_invite';
                $existing->invited_by_user_id = $hostUserId;
                $this->participants->transitionParticipantState($existing, 'invited');
            } else {
                $this->participants->addParticipant(
                    session: $session,
                    userId: $targetUserId,
                    role: 'participant',
                    inviteSource: 'direct_invite',
                    state: 'invited',
                    invitedByUserId: $hostUserId,
                );
            }

            $this->touchSessionActivity($session);
            $this->repository->putActiveCallForUser($targetUserId, $callId);
            $session = $this->getSessionOrFail($callId);
            $call = $this->repository->saveSnapshot($session);

            $caller = User::query()->findOrFail($hostUserId);
            $recipient = User::query()->findOrFail($targetUserId);
            $this->realtime->incoming($call, $caller, $recipient);
            $this->pushDispatch->dispatchIncomingCallNotification(
                (string) $recipient->id,
                $caller,
                (string) ($call['id'] ?? ''),
                (string) ($call['conversation_id'] ?? ''),
                (string) ($call['mode'] ?? 'audio'),
            );

            return [
                'status' => 'invited',
                'participant_ids' => array_values((array) ($call['participant_ids'] ?? [])),
                'participants' => array_values((array) ($call['participants'] ?? [])),
            ];
        });
    }

    public function kick(string $callId, string $hostUserId, string $targetUserId): array
    {
        return $this->repository->withCallLock($callId, function () use ($callId, $hostUserId, $targetUserId) {
            $session = $this->getSessionOrFail($callId);
            $call = $this->repository->saveSnapshot($session);
            $this->authorization->ensureCallParticipant($call, $hostUserId);
            $this->authorization->ensureHost($call, $hostUserId);

            if ($targetUserId === $hostUserId) {
                abort(response()->json(['message' => 'Initiator cannot be removed'], 422));
            }

            $participant = $this->participants->getParticipant($session, $targetUserId);
            if (!$participant || !in_array((string) $participant->state, ['invited', 'joined'], true)) {
                abort(response()->json(['message' => 'User is not in this call'], 422));
            }

            $this->participants->transitionParticipantState($participant, 'kicked');
            $this->repository->forgetActiveCallForUser($targetUserId);

            $session = $this->getSessionOrFail($callId);
            if ($this->activeParticipantCount($session) < 2) {
                $call = $this->finalizeSession($session, $hostUserId, 'ended');
                $this->realtime->ended($call, $hostUserId);

                return ['status' => 'ended'];
            }

            $call = $this->repository->saveSnapshot($session);
            $this->realtime->participantRemoved($call, $hostUserId, $targetUserId, 'kicked');

            return [
                'status' => 'removed',
                'participant_ids' => array_values((array) ($call['participant_ids'] ?? [])),
                'participants' => array_values((array) ($call['participants'] ?? [])),
            ];
        });
    }

    public function createJoinLink(string $callId, string $hostUserId): array
    {
        return $this->repository->withCallLock($callId, function () use ($callId, $hostUserId) {
            $session = $this->getSessionOrFail($callId);
            $call = $this->repository->saveSnapshot($session);
            $this->authorization->ensureCallParticipant($call, $hostUserId);
            $this->authorization->ensureHost($call, $hostUserId);

            if (!$this->isActiveCallStatus((string) $session->status)) {
                abort(response()->json(['message' => 'Call is not active'], 409));
            }

            $token = (string) Str::random(48);
            $expiresAt = now()->addMinutes((int) config('calls.join_token_ttl_minutes', 15));

            $session->join_token_hash = hash('sha256', $token);
            $session->join_token_expires_at = $expiresAt;
            $session->last_activity_at = now();
            $session->save();

            $this->repository->saveSnapshot($session);

            $url = rtrim((string) config('app.url'), '/') . '/messages?call_id=' .
                urlencode($callId) . '&join_token=' . urlencode($token);

            return [
                'join_url' => $url,
                'join_token' => $token,
                'expires_at' => $expiresAt->toISOString(),
            ];
        });
    }

    public function createJoinRequest(string $callId, string $userId, string $token): array
    {
        return $this->repository->withCallLock($callId, function () use ($callId, $userId, $token) {
            $session = $this->getSessionOrFail($callId);
            $call = $this->repository->saveSnapshot($session);

            if (!$this->isActiveCallStatus((string) $session->status)) {
                abort(response()->json(['message' => 'Call is not active'], 409));
            }

            $this->assertValidJoinToken($session, $token);

            if (in_array($userId, (array) ($call['participant_ids'] ?? []), true)) {
                abort(response()->json(['message' => 'User is already in the call'], 409));
            }

            if ($this->repository->isUserCurrentlyInActiveCall($userId)) {
                abort(response()->json(['message' => 'User is already in a call'], 409));
            }

            $pending = CallJoinRequest::query()
                ->where('call_session_id', $callId)
                ->where('requested_by_user_id', $userId)
                ->where('status', 'pending')
                ->latest('created_at')
                ->first();

            if ($pending) {
                return [
                    'status' => 'pending',
                    'request_id' => (string) $pending->id,
                ];
            }

            $this->touchSessionActivity($session);

            $request = CallJoinRequest::query()->create([
                'id' => (string) Str::uuid(),
                'call_session_id' => $callId,
                'requested_by_user_id' => $userId,
                'status' => 'pending',
                'expires_at' => $session->join_token_expires_at ?? now()->addMinutes(15),
            ]);

            $requestPayload = $this->serializeJoinRequest(
                $request->fresh(['requestedBy'])
            );
            $this->realtime->joinRequestCreated(
                $call,
                $requestPayload,
                $this->pendingJoinRequestsForCall($callId),
            );

            return [
                'status' => 'pending',
                'request_id' => (string) $request->id,
            ];
        });
    }

    public function listJoinRequests(string $callId, string $hostUserId): array
    {
        $session = $this->getSessionOrFail($callId);
        $call = $this->repository->saveSnapshot($session);
        $this->authorization->ensureCallParticipant($call, $hostUserId);
        $this->authorization->ensureHost($call, $hostUserId);

        $this->expireJoinRequests($session);

        $requests = CallJoinRequest::query()
            ->with('requestedBy')
            ->where('call_session_id', $callId)
            ->where('status', 'pending')
            ->orderBy('created_at')
            ->get()
            ->map(function (CallJoinRequest $request) {
                return [
                    'id' => (string) $request->id,
                    'status' => (string) $request->status,
                    'created_at' => $request->created_at?->toISOString(),
                    'expires_at' => $request->expires_at?->toISOString(),
                    'requested_by' => [
                        'id' => (string) ($request->requestedBy?->id ?? $request->requested_by_user_id),
                        'name' => (string) ($request->requestedBy?->name ?? 'Unknown'),
                        'avatar' => $request->requestedBy?->avatar,
                        'username' => $request->requestedBy?->username,
                    ],
                ];
            })
            ->values()
            ->all();

        return ['requests' => $requests];
    }

    public function approveJoinRequest(string $callId, string $hostUserId, string $requestId): array
    {
        return $this->repository->withCallLock($callId, function () use ($callId, $hostUserId, $requestId) {
            $session = $this->getSessionOrFail($callId);
            $call = $this->repository->saveSnapshot($session);
            $this->authorization->ensureCallParticipant($call, $hostUserId);
            $this->authorization->ensureHost($call, $hostUserId);

            if (!$this->isActiveCallStatus((string) $session->status)) {
                abort(response()->json(['message' => 'Call is not active'], 409));
            }

            $request = CallJoinRequest::query()
                ->where('id', $requestId)
                ->where('call_session_id', $callId)
                ->firstOrFail();

            if ((string) $request->status !== 'pending') {
                abort(response()->json(['message' => 'Join request is no longer pending'], 409));
            }

            if ($request->expires_at && $request->expires_at->isPast()) {
                $request->status = 'expired';
                $request->decided_by_user_id = $hostUserId;
                $request->decided_at = now();
                $request->save();
                abort(response()->json(['message' => 'Join request has expired'], 409));
            }

            $targetUserId = (string) $request->requested_by_user_id;
            if ($this->repository->isUserCurrentlyInActiveCall($targetUserId)) {
                abort(response()->json(['message' => 'User is already in a call'], 409));
            }

            $existing = $this->participants->getParticipant($session, $targetUserId);
            if ($existing && in_array((string) $existing->state, ['invited', 'joined'], true)) {
                abort(response()->json(['message' => 'User is already in the call'], 409));
            }

            if (!$existing) {
                $this->participants->ensureCapacity($session, 1);
            }

            if ($existing) {
                $existing->invite_source = 'link_request';
                $existing->invited_by_user_id = $hostUserId;
                $this->participants->transitionParticipantState($existing, 'invited');
            } else {
                $this->participants->addParticipant(
                    session: $session,
                    userId: $targetUserId,
                    role: 'participant',
                    inviteSource: 'link_request',
                    state: 'invited',
                    invitedByUserId: $hostUserId,
                );
            }

            $this->touchSessionActivity($session);
            $request->status = 'approved';
            $request->decided_by_user_id = $hostUserId;
            $request->decided_at = now();
            $request->save();

            $requestPayload = $this->serializeJoinRequest(
                $request->fresh(['requestedBy'])
            );

            $this->repository->putActiveCallForUser($targetUserId, $callId);

            $session = $this->getSessionOrFail($callId);
            $call = $this->repository->saveSnapshot($session);

            $this->realtime->joinRequestUpdated(
                $call,
                $requestPayload,
                $this->pendingJoinRequestsForCall($callId),
                $hostUserId,
            );

            $caller = User::query()->findOrFail((string) $session->initiator_id);
            $recipient = User::query()->findOrFail($targetUserId);
            $this->realtime->incoming($call, $caller, $recipient);
            $this->pushDispatch->dispatchIncomingCallNotification(
                (string) $recipient->id,
                $caller,
                (string) ($call['id'] ?? ''),
                (string) ($call['conversation_id'] ?? ''),
                (string) ($call['mode'] ?? 'audio'),
            );

            return [
                'status' => 'approved',
                'request_id' => (string) $request->id,
                'participant_ids' => array_values((array) ($call['participant_ids'] ?? [])),
                'participants' => array_values((array) ($call['participants'] ?? [])),
            ];
        });
    }

    public function rejectJoinRequest(string $callId, string $hostUserId, string $requestId): array
    {
        return $this->repository->withCallLock($callId, function () use ($callId, $hostUserId, $requestId) {
            $session = $this->getSessionOrFail($callId);
            $call = $this->repository->saveSnapshot($session);
            $this->authorization->ensureCallParticipant($call, $hostUserId);
            $this->authorization->ensureHost($call, $hostUserId);

            $request = CallJoinRequest::query()
                ->where('id', $requestId)
                ->where('call_session_id', $callId)
                ->firstOrFail();

            if ((string) $request->status !== 'pending') {
                abort(response()->json(['message' => 'Join request is no longer pending'], 409));
            }

            $request->status = 'rejected';
            $request->decided_by_user_id = $hostUserId;
            $request->decided_at = now();
            $request->save();

            $requestPayload = $this->serializeJoinRequest(
                $request->fresh(['requestedBy'])
            );
            $this->realtime->joinRequestUpdated(
                $call,
                $requestPayload,
                $this->pendingJoinRequestsForCall($callId),
                $hostUserId,
            );

            return [
                'status' => 'rejected',
                'request_id' => (string) $request->id,
            ];
        });
    }

    private function getSessionOrFail(string $callId): CallSession
    {
        $session = $this->repository->getSession($callId);
        if (!$session) {
            abort(404);
        }

        return $session;
    }

    private function isActiveCallStatus(string $status): bool
    {
        return in_array($status, ['ringing', 'accepted'], true);
    }

    private function activeParticipantCount(CallSession $session): int
    {
        return $session->participants()
            ->whereIn('state', ['invited', 'joined'])
            ->count();
    }

    private function finalizeSession(CallSession $session, string $endedByUserId, string $status): array
    {
        if (!$session->ended_at) {
            $session->ended_at = now();
        }
        $session->last_activity_at = now();
        $session->status = $status;
        $session->save();

        $session->loadMissing('participants.user');
        $allParticipantIds = $session->participants
            ->map(fn(CallSessionParticipant $participant) => (string) $participant->user_id)
            ->filter(fn(string $id) => $id !== '')
            ->values()
            ->all();
        $this->repository->forgetActiveCallForUsers($allParticipantIds);

        $call = $this->repository->saveSnapshot($session);
        $this->persistCallRecordOnce($session, $call, $endedByUserId);

        return $call;
    }

    private function persistCallRecordOnce(CallSession $session, array $call, string $endedByUserId): void
    {
        if ($session->record_persisted_at) {
            return;
        }

        $conversationId = (string) $session->conversation_id;
        $initiatorId = (string) $session->initiator_id;
        if ($conversationId === '' || $initiatorId === '') {
            return;
        }

        $status = $session->accepted_at ? 'received' : 'missed';
        $createdAtIso = $session->created_at?->toISOString() ?? now()->toISOString();
        $acceptedAtIso = $session->accepted_at?->toISOString();
        $endedAtIso = $session->ended_at?->toISOString();
        $durationSeconds = null;

        if ($acceptedAtIso && $endedAtIso) {
            try {
                $durationSeconds = Carbon::parse($acceptedAtIso)->diffInSeconds(Carbon::parse($endedAtIso));
            } catch (\Throwable) {
                $durationSeconds = null;
            }
        }

        $mode = (string) ($call['mode'] ?? 'video');
        $content = ucfirst($mode) . ' call - ' . $status;

        $message = Message::query()->create([
            'id' => (string) Str::uuid(),
            'conversation_id' => $conversationId,
            'user_id' => $initiatorId,
            'content' => $content,
            'message_type' => 'call',
            'attachments' => [
                [
                    'type' => 'call_record',
                    'call_id' => (string) $session->id,
                    'mode' => $mode,
                    'status' => $status,
                    'initiator_id' => $initiatorId,
                    'participant_ids' => array_values((array) ($call['participant_ids'] ?? [])),
                    'accepted_user_ids' => array_values((array) ($call['accepted_user_ids'] ?? [])),
                    'ended_by_user_id' => $endedByUserId,
                    'created_at' => $createdAtIso,
                    'accepted_at' => $acceptedAtIso,
                    'ended_at' => $endedAtIso,
                    'duration_seconds' => $durationSeconds,
                ],
            ],
            'delivered_at' => now(),
        ]);

        $message->load('user');
        broadcast(new MessageSent($message))->toOthers();

        $session->record_persisted_at = now();
        $session->save();
    }

    private function assertValidJoinToken(CallSession $session, string $token): void
    {
        $tokenHash = $session->join_token_hash;
        $expiresAt = $session->join_token_expires_at;
        $providedHash = hash('sha256', $token);

        if (!is_string($tokenHash) || $tokenHash === '' || !is_string($providedHash) || $providedHash === '') {
            abort(response()->json(['message' => 'Invalid join token'], 403));
        }

        if (!hash_equals($tokenHash, $providedHash)) {
            abort(response()->json(['message' => 'Invalid join token'], 403));
        }

        if (!$expiresAt || $expiresAt->isPast()) {
            abort(response()->json(['message' => 'Join token expired'], 403));
        }
    }

    private function expireJoinRequests(CallSession $session): void
    {
        CallJoinRequest::query()
            ->where('call_session_id', (string) $session->id)
            ->where('status', 'pending')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->update([
                'status' => 'expired',
                'decided_at' => now(),
                'updated_at' => now(),
            ]);
    }

    private function touchSessionActivity(CallSession $session): void
    {
        $session->last_activity_at = now();
        $session->save();
    }

    /**
     * @return array<int,array<string,mixed>>
     */
    private function pendingJoinRequestsForCall(string $callId): array
    {
        return CallJoinRequest::query()
            ->with('requestedBy')
            ->where('call_session_id', $callId)
            ->where('status', 'pending')
            ->orderBy('created_at')
            ->get()
            ->map(fn(CallJoinRequest $request) => $this->serializeJoinRequest($request))
            ->values()
            ->all();
    }

    /**
     * @return array<string,mixed>
     */
    private function serializeJoinRequest(CallJoinRequest $request): array
    {
        $request->loadMissing('requestedBy');

        return [
            'id' => (string) $request->id,
            'status' => (string) $request->status,
            'created_at' => $request->created_at?->toISOString(),
            'expires_at' => $request->expires_at?->toISOString(),
            'requested_by' => [
                'id' => (string) ($request->requestedBy?->id ?? $request->requested_by_user_id),
                'name' => (string) ($request->requestedBy?->name ?? 'Unknown'),
                'avatar' => $request->requestedBy?->avatar,
                'username' => $request->requestedBy?->username,
            ],
        ];
    }
}
