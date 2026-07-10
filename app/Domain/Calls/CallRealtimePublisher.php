<?php

namespace App\Domain\Calls;

use App\Events\Calls\CallAccepted;
use App\Events\Calls\CallAnswer;
use App\Events\Calls\CallDeclined;
use App\Events\Calls\CallEnded;
use App\Events\Calls\CallIceCandidate;
use App\Events\Calls\CallOffer;
use App\Events\Calls\CallParticipantRemoved;
use App\Events\Calls\CallJoinRequestCreated;
use App\Events\Calls\CallJoinRequestUpdated;
use App\Events\Calls\IncomingCall;
use App\Models\User;

class CallRealtimePublisher
{
    public function incoming(array $call, User $caller, User $recipient): void
    {
        broadcast(new IncomingCall(call: $call, caller: $caller, recipient: $recipient));
    }

    public function accepted(array $call, string $fromUserId): void
    {
        broadcast(new CallAccepted(call: $call, fromUserId: $fromUserId));
    }

    public function declined(array $call, string $fromUserId): void
    {
        broadcast(new CallDeclined(call: $call, fromUserId: $fromUserId));
    }

    public function ended(array $call, string $fromUserId): void
    {
        broadcast(new CallEnded(call: $call, fromUserId: $fromUserId));
    }

    public function participantRemoved(array $call, string $fromUserId, string $removedUserId, string $reason): void
    {
        broadcast(new CallParticipantRemoved(
            call: $call,
            fromUserId: $fromUserId,
            removedUserId: $removedUserId,
            reason: $reason,
        ));
    }

    public function offer(
        array $call,
        string $fromUserId,
        string $toUserId,
        string $offerSdp,
        string $offerSignalId,
    ): void {
        broadcast(new CallOffer(
            call: $call,
            fromUserId: $fromUserId,
            toUserId: $toUserId,
            offerSdp: $offerSdp,
            offerSignalId: $offerSignalId,
        ));
    }

    public function answer(
        array $call,
        string $fromUserId,
        string $toUserId,
        string $answerSdp,
        string $answerSignalId,
    ): void {
        broadcast(new CallAnswer(
            call: $call,
            fromUserId: $fromUserId,
            toUserId: $toUserId,
            answerSdp: $answerSdp,
            answerSignalId: $answerSignalId,
        ));
    }

    public function ice(array $call, string $fromUserId, string $toUserId, mixed $candidate): void
    {
        broadcast(new CallIceCandidate(
            call: $call,
            fromUserId: $fromUserId,
            toUserId: $toUserId,
            candidate: $candidate,
        ));
    }

    public function joinRequestCreated(array $call, array $requestPayload, array $pendingRequests): void
    {
        broadcast(new CallJoinRequestCreated(
            call: $call,
            requestPayload: $requestPayload,
            pendingRequests: $pendingRequests,
        ));
    }

    public function joinRequestUpdated(
        array $call,
        array $requestPayload,
        array $pendingRequests,
        ?string $decidedByUserId = null,
    ): void {
        broadcast(new CallJoinRequestUpdated(
            call: $call,
            requestPayload: $requestPayload,
            pendingRequests: $pendingRequests,
            decidedByUserId: $decidedByUserId,
        ));
    }
}
