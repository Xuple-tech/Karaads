<?php

use App\Models\CallSession;
use App\Models\LiveStream;
use App\Models\User;
use App\Support\LiveStreamAccess;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// ✅ Register the broadcasting routes with web middleware
Broadcast::routes([
    'middleware' => ['web'],
]);

// Private channel for a user
Broadcast::channel('App.Models.User.{id}', function (User $user, string $id) {
    return (string) $user->id === $id;
});

// Private channel for personal feed
Broadcast::channel('feed.{userId}', function (User $user, string $userId) {
    return (string) $user->id === $userId;
});

// Private channel for conversations
Broadcast::channel('conversation.{id}', function (User $user, string $id) {
    $isParticipant = $user->conversations()->where('conversations.id', $id)->exists();
    if (!$isParticipant) {
        Log::warning("User {$user->id} attempted to join conversation {$id} but is not a participant");
    }
    return $isParticipant;
});

// Private channel for direct messages
Broadcast::channel('direct-message.{userId1}.{userId2}', function (User $user, string $userId1, string $userId2) {
    return in_array((string) $user->id, [$userId1, $userId2], true);
});

// Presence channel
Broadcast::channel('presence.{userId}', function (User $user, string $userId) {
    return (string) $user->id === $userId ? ['id' => $user->id, 'name' => $user->name] : false;
});

// Public channels
Broadcast::channel('posts', fn(User $user) => true);
Broadcast::channel('notifications.{userId}', fn(User $user, string $userId) => (string) $user->id === $userId);

// Live streams (presence for realtime viewers/chat + private for guards)
Broadcast::channel('live.{streamId}', function (User $user, string $streamId) {
    $stream = LiveStream::query()->find($streamId);
    if (!$stream) {
        return false;
    }

    return LiveStreamAccess::canView($stream, $user);
});

Broadcast::channel('presence.live.{streamId}', function (User $user, string $streamId) {
    $stream = LiveStream::query()->find($streamId);
    if (!$stream) {
        return false;
    }

    if (!LiveStreamAccess::canView($stream, $user)) {
        return false;
    }

    $isHost = (string) $stream->user_id === (string) $user->id;
    $join = $isHost
        ? null
        : \App\Models\LiveStreamJoin::query()
            ->where('live_stream_id', (string) $stream->id)
            ->where('user_id', (string) $user->id)
            ->first();
    $joinedAt = $isHost ? $stream->started_at : $join?->created_at;

    return [
        'id' => $user->id,
        'name' => $user->name,
        'username' => $user->username,
        'avatar' => $user->avatar_url,
        'joined_at' => $joinedAt?->toIso8601String(),
        'watch_minutes' => $joinedAt ? (int) $joinedAt->diffInMinutes(now()) : 0,
    ];
});

Broadcast::channel('live.global', fn(User $user) => true);

// Private channel for WebRTC call signaling (authorized via cached call session)
Broadcast::channel('call.{callId}', function (User $user, string $callId) {
    $call = Cache::get("call_snapshot:{$callId}");
    if (!is_array($call)) {
        $call = Cache::get("call:{$callId}");
    }

    if (!is_array($call)) {
        $session = CallSession::query()
            ->where('id', $callId)
            ->whereIn('status', ['ringing', 'accepted'])
            ->whereHas('participants', function ($query) use ($user) {
                $query->where('user_id', (string) $user->id)
                    ->whereIn('state', ['invited', 'joined']);
            })
            ->exists();

        return $session;
    }

    $participants = array_values((array) ($call['participant_ids'] ?? []));
    if ($participants === []) {
        $callerId = (string) ($call['caller_id'] ?? '');
        $calleeId = (string) ($call['callee_id'] ?? '');
        $participants = array_values(array_filter([$callerId, $calleeId]));
    }

    return in_array((string) $user->id, $participants, true);
});
