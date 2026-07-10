<?php

namespace App\Http\Controllers\Api;

use App\Domain\Calls\CallSessionService;
use App\Domain\Calls\CallSignalService;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Illuminate\Http\Request;

class CallController extends Controller
{
    public function __construct(
        private readonly CallSessionService $calls,
        private readonly CallSignalService $signals,
    ) {
    }

    public function show(string $callId, Request $request)
    {
        return response()->json(
            $this->calls->show($callId, (string) $request->user()->id)
        );
    }

    public function active(Request $request)
    {
        return response()->json(
            $this->calls->active((string) $request->user()->id)
        );
    }

    public function store(Conversation $conversation, Request $request)
    {
        $validated = $request->validate([
            'mode' => 'nullable|in:video,audio',
            'max_participants' => 'nullable|integer|min:2|max:' . max(2, (int) config('calls.hard_max_participants', 8)),
        ]);

        $payload = $this->calls->start(
            conversation: $conversation,
            initiatorId: (string) $request->user()->id,
            mode: (string) ($validated['mode'] ?? 'video'),
            maxParticipants: isset($validated['max_participants']) ? (int) $validated['max_participants'] : null,
        );

        return response()->json($payload, 201);
    }

    public function accept(string $callId, Request $request)
    {
        return response()->json(
            $this->calls->accept($callId, (string) $request->user()->id)
        );
    }

    public function decline(string $callId, Request $request)
    {
        return response()->json(
            $this->calls->decline($callId, (string) $request->user()->id)
        );
    }

    public function end(string $callId, Request $request)
    {
        return response()->json(
            $this->calls->end($callId, (string) $request->user()->id)
        );
    }

    public function leave(string $callId, Request $request)
    {
        return response()->json(
            $this->calls->leave($callId, (string) $request->user()->id)
        );
    }

    public function heartbeat(string $callId, Request $request)
    {
        return response()->json(
            $this->calls->heartbeat($callId, (string) $request->user()->id)
        );
    }

    public function offer(string $callId, Request $request)
    {
        $validated = $request->validate([
            'to_user_id' => ['nullable', 'string', 'uuid'],
            'sdp' => ['required', 'string', 'max:' . $this->signals->sdpMaxLen()],
        ]);

        return response()->json(
            $this->calls->offer(
                $callId,
                (string) $request->user()->id,
                $validated['to_user_id'] ?? null,
                (string) $validated['sdp'],
            )
        );
    }

    public function answer(string $callId, Request $request)
    {
        $validated = $request->validate([
            'to_user_id' => ['nullable', 'string', 'uuid'],
            'sdp' => ['required', 'string', 'max:' . $this->signals->sdpMaxLen()],
        ]);

        return response()->json(
            $this->calls->answer(
                $callId,
                (string) $request->user()->id,
                $validated['to_user_id'] ?? null,
                (string) $validated['sdp'],
            )
        );
    }

    public function signal(string $callId, string $type, string $signalId, Request $request)
    {
        return response()->json(
            $this->calls->signal($callId, $type, $signalId, (string) $request->user()->id)
        );
    }

    public function ice(string $callId, Request $request)
    {
        $validated = $request->validate([
            'to_user_id' => ['nullable', 'string', 'uuid'],
            'candidate' => ['required'],
        ]);

        return response()->json(
            $this->calls->ice(
                $callId,
                (string) $request->user()->id,
                $validated['to_user_id'] ?? null,
                $validated['candidate'],
            )
        );
    }

    public function invite(string $callId, Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'string', 'uuid', 'exists:users,id'],
        ]);

        return response()->json(
            $this->calls->invite(
                $callId,
                (string) $request->user()->id,
                (string) $validated['user_id'],
            )
        );
    }

    public function kick(string $callId, Request $request)
    {
        $validated = $request->validate([
            'user_id' => ['required', 'string', 'uuid', 'exists:users,id'],
        ]);

        return response()->json(
            $this->calls->kick(
                $callId,
                (string) $request->user()->id,
                (string) $validated['user_id'],
            )
        );
    }

    public function createJoinLink(string $callId, Request $request)
    {
        return response()->json(
            $this->calls->createJoinLink($callId, (string) $request->user()->id)
        );
    }

    public function createJoinRequest(string $callId, Request $request)
    {
        $validated = $request->validate([
            'join_token' => ['required', 'string', 'min:16'],
        ]);

        return response()->json(
            $this->calls->createJoinRequest(
                $callId,
                (string) $request->user()->id,
                (string) $validated['join_token'],
            ),
            202
        );
    }

    public function listJoinRequests(string $callId, Request $request)
    {
        return response()->json(
            $this->calls->listJoinRequests($callId, (string) $request->user()->id)
        );
    }

    public function approveJoinRequest(string $callId, string $requestId, Request $request)
    {
        return response()->json(
            $this->calls->approveJoinRequest($callId, (string) $request->user()->id, $requestId)
        );
    }

    public function rejectJoinRequest(string $callId, string $requestId, Request $request)
    {
        return response()->json(
            $this->calls->rejectJoinRequest($callId, (string) $request->user()->id, $requestId)
        );
    }

    /**
     * @return array{0:string,1:int}
     */
    private function sanitizeSdp(string $sdp): array
    {
        return $this->signals->sanitizeSdp($sdp);
    }
}
