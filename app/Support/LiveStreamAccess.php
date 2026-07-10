<?php

namespace App\Support;

use App\Models\Follow;
use App\Models\LiveStream;
use App\Models\User;
use App\Support\UserPrivacy;

class LiveStreamAccess
{
    public static function canView(LiveStream $stream, ?User $viewer): bool
    {
        if ($viewer && (string) $viewer->id === (string) $stream->user_id) {
            return true;
        }

        if ($viewer && $stream->user && UserPrivacy::isBlockedBetween($viewer, $stream->user)) {
            return false;
        }

        if ($stream->visibility === 'everyone') {
            return true;
        }

        if (!$viewer) {
            return false;
        }

        if ($stream->visibility === 'followers') {
            return Follow::query()
                ->where('follower_id', $viewer->id)
                ->where('following_id', $stream->user_id)
                ->exists();
        }

        return false;
    }
}
