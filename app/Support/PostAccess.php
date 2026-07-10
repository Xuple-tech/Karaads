<?php

namespace App\Support;

use App\Models\Follow;
use App\Models\Post;
use App\Models\User;
use App\Support\UserPrivacy;

class PostAccess
{
    public static function canView(Post $post, ?User $viewer): bool
    {
        if ($viewer && $viewer->id === $post->user_id) {
            return true;
        }

        if ($viewer && UserPrivacy::isBlockedBetween($viewer, $post->user)) {
            return false;
        }

        if ($post->scheduled_at && $post->scheduled_at->isFuture()) {
            return false;
        }

        if ($post->visibility === 'everyone') {
            return true;
        }

        if (!$viewer) {
            return false;
        }

        if ($post->visibility === 'followers') {
            return Follow::query()
                ->where('follower_id', $viewer->id)
                ->where('following_id', $post->user_id)
                ->exists();
        }

        return false;
    }
}
