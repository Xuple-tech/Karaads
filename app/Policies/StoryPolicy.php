<?php

namespace App\Policies;

use App\Models\Story;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class StoryPolicy
{
    public function view(User $user, Story $story): bool
    {
        if ($story->expires_at <= now()) {
            return false;
        }

        if ($user->id === $story->user_id) {
            return true;
        }

        return DB::table('follows')
            ->where('follower_id', $user->id)
            ->where('following_id', $story->user_id)
            ->exists();
    }

    public function delete(User $user, Story $story): bool
    {
        return $user->id === $story->user_id;
    }
}