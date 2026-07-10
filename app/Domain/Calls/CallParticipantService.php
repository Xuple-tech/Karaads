<?php

namespace App\Domain\Calls;

use App\Models\CallSession;
use App\Models\CallSessionParticipant;
use App\Models\Conversation;
use Illuminate\Support\Str;

class CallParticipantService
{
    /**
     * @return array<int,string>
     */
    public function resolveInitialParticipantIds(Conversation $conversation, string $initiatorId): array
    {
        $conversationParticipantIds = $conversation->participants()
            ->orderBy('conversation_user.joined_at')
            ->pluck('users.id')
            ->map(fn($id) => (string) $id)
            ->filter(fn(string $id) => $id !== '')
            ->unique()
            ->values()
            ->all();

        if (($conversation->type ?? 'private') === 'private') {
            $peerId = '';
            foreach ($conversationParticipantIds as $participantId) {
                if ($participantId !== $initiatorId) {
                    $peerId = $participantId;
                    break;
                }
            }

            return array_values(array_filter([$initiatorId, $peerId]));
        }

        // Group calls start with the initiator only and expand via invites.
        return [$initiatorId];
    }

    public function ensureCapacity(CallSession $session, int $additional = 0): void
    {
        $activeCount = $session->participants()
            ->whereIn('state', ['invited', 'joined'])
            ->count();

        if ($activeCount + $additional > (int) $session->max_participants) {
            abort(response()->json([
                'message' => 'Group call participant limit exceeded',
                'max_participants' => (int) $session->max_participants,
            ], 422));
        }
    }

    public function getParticipant(CallSession $session, string $userId): ?CallSessionParticipant
    {
        return $session->participants
            ->first(fn(CallSessionParticipant $participant) => (string) $participant->user_id === $userId);
    }

    public function addParticipant(
        CallSession $session,
        string $userId,
        string $role = 'participant',
        string $inviteSource = 'direct_invite',
        string $state = 'invited',
        ?string $invitedByUserId = null,
    ): CallSessionParticipant {
        $now = now();

        return CallSessionParticipant::query()->create([
            'id' => (string) Str::uuid(),
            'call_session_id' => (string) $session->id,
            'user_id' => $userId,
            'role' => $role,
            'invite_source' => $inviteSource,
            'state' => $state,
            'invited_by_user_id' => $invitedByUserId,
            'joined_at' => $state === 'joined' ? $now : null,
            'left_at' => null,
            'responded_at' => in_array($state, ['joined', 'declined', 'left', 'kicked'], true) ? $now : null,
        ]);
    }

    public function transitionParticipantState(
        CallSessionParticipant $participant,
        string $state,
    ): CallSessionParticipant {
        $now = now();
        $participant->state = $state;
        $participant->responded_at = $now;

        if ($state === 'joined') {
            $participant->joined_at = $participant->joined_at ?? $now;
            $participant->left_at = null;
        }

        if ($state === 'invited') {
            $participant->left_at = null;
        }

        if (in_array($state, ['left', 'kicked', 'declined'], true)) {
            $participant->left_at = $participant->left_at ?? $now;
        }

        $participant->save();

        return $participant;
    }
}
