<?php

namespace App\Support;

use App\Models\Follow;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

class UserPrivacy
{
    public static function isBlockedBetween(?User $left, ?User $right): bool
    {
        if (! $left || ! $right) {
            return false;
        }

        return DB::table('blocks')
            ->where(function ($query) use ($left, $right) {
                $query->where('blocker_id', $left->id)
                    ->where('blocked_user_id', $right->id);
            })
            ->orWhere(function ($query) use ($left, $right) {
                $query->where('blocker_id', $right->id)
                    ->where('blocked_user_id', $left->id);
            })
            ->exists();
    }

    public static function canViewUser(?User $viewer, User $target): bool
    {
        if (! $viewer) {
            return true;
        }

        if ((string) $viewer->id === (string) $target->id) {
            return true;
        }

        return ! self::isBlockedBetween($viewer, $target);
    }

    public static function canMessage(User $sender, User $recipient): bool
    {
        if ((string) $sender->id === (string) $recipient->id) {
            return false;
        }

        if (self::isBlockedBetween($sender, $recipient)) {
            return false;
        }

        $policy = $recipient->message_policy ?? 'everyone';

        if ($policy === 'nobody') {
            return false;
        }

        if ($policy === 'followers') {
            // "Followers" means people the recipient follows can message them.
            return Follow::query()
                ->where('follower_id', $recipient->id)
                ->where('following_id', $sender->id)
                ->exists();
        }

        return true;
    }

    public static function excludeBlockedUsers(Builder $query, ?User $viewer, string $userIdColumn = 'user_id'): Builder
    {
        if (! $viewer) {
            return $query;
        }

        return $query
            ->whereNotIn($userIdColumn, function ($sub) use ($viewer) {
                $sub->select('blocked_user_id')
                    ->from('blocks')
                    ->where('blocker_id', $viewer->id);
            })
            ->whereNotIn($userIdColumn, function ($sub) use ($viewer) {
                $sub->select('blocker_id')
                    ->from('blocks')
                    ->where('blocked_user_id', $viewer->id);
            });
    }
}

