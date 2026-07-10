<?php

namespace App\Policies;

use App\Models\LiveStream;
use App\Models\User;
use App\Support\LiveStreamAccess;

class LiveStreamPolicy
{
    public function view(?User $user, LiveStream $stream): bool
    {
        return LiveStreamAccess::canView($stream, $user);
    }

    public function update(User $user, LiveStream $stream): bool
    {
        return (string) $user->id === (string) $stream->user_id;
    }

    public function start(User $user, LiveStream $stream): bool
    {
        return $this->update($user, $stream);
    }

    public function end(User $user, LiveStream $stream): bool
    {
        return $this->update($user, $stream);
    }

    public function archive(User $user, LiveStream $stream): bool
    {
        return $this->update($user, $stream);
    }

    public function viewAnalytics(User $user, LiveStream $stream): bool
    {
        return $this->update($user, $stream);
    }
}
