<?php

namespace App\Domain\Calls;

use App\Models\Conversation;
use App\Models\Follow;

class CallAuthorizationService
{
    public function ensureConversationParticipant(Conversation $conversation, string $userId): void
    {
        $isParticipant = $conversation->participants()
            ->where('users.id', $userId)
            ->exists();

        abort_unless($isParticipant, 403);
    }

    public function ensureCallParticipant(array $call, string $userId): void
    {
        $participantIds = array_values((array) ($call['participant_ids'] ?? []));
        if (!in_array($userId, $participantIds, true)) {
            abort(403);
        }
    }

    public function ensureHost(array $call, string $userId): void
    {
        $initiatorId = (string) ($call['initiator_id'] ?? '');
        if ($initiatorId !== $userId) {
            abort(403);
        }
    }

    public function ensureSignalTarget(array $call, string $fromUserId, string $toUserId): void
    {
        if ($fromUserId === $toUserId) {
            abort(422, 'Invalid call signal target');
        }

        $participants = array_values((array) ($call['participant_ids'] ?? []));
        if (!in_array($fromUserId, $participants, true) || !in_array($toUserId, $participants, true)) {
            abort(403);
        }
    }

    public function resolveSignalTarget(array $call, string $fromUserId, ?string $requestedToUserId): string
    {
        $requested = is_string($requestedToUserId) ? trim($requestedToUserId) : '';
        if ($requested !== '') {
            return $requested;
        }

        $participants = array_values((array) ($call['participant_ids'] ?? []));
        if (count($participants) === 2) {
            foreach ($participants as $participantId) {
                if (!is_string($participantId) || $participantId === $fromUserId) {
                    continue;
                }

                return $participantId;
            }
        }

        abort(422, 'Missing to_user_id');
    }

    public function ensureMutualFollow(string $userAId, string $userBId): void
    {
        $aFollowsB = Follow::query()
            ->where('follower_id', $userAId)
            ->where('following_id', $userBId)
            ->exists();
        $bFollowsA = Follow::query()
            ->where('follower_id', $userBId)
            ->where('following_id', $userAId)
            ->exists();

        if (!$aFollowsB || !$bFollowsA) {
            abort(response()->json(['message' => 'Mutual follow is required for call invites'], 403));
        }
    }
}
