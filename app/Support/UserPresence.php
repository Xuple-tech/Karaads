<?php

namespace App\Support;

use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

class UserPresence
{
    private const ONLINE_WINDOW_SECONDS = 120;

    public function touch(User $user): void
    {
        $now = CarbonImmutable::now();

        $this->putPresenceValue(
            $user,
            fn () => Cache::put($this->onlineKey($user->id), $now->addSeconds(self::ONLINE_WINDOW_SECONDS)->toIso8601String(), self::ONLINE_WINDOW_SECONDS),
        );

        $this->putPresenceValue(
            $user,
            fn () => Cache::forever($this->lastSeenKey($user->id), $now->toIso8601String()),
        );
    }

    public function markOnline(User $user): void
    {
        $this->touch($user);
    }

    public function markOffline(User $user): void
    {
        $this->putPresenceValue(
            $user,
            fn () => Cache::forget($this->onlineKey($user->id)),
        );

        $this->putPresenceValue(
            $user,
            fn () => Cache::forever($this->lastSeenKey($user->id), CarbonImmutable::now()->toIso8601String()),
        );
    }

    public function isOnline(User $user): bool
    {
        $onlineUntil = $this->onlineUntil($user);

        return $onlineUntil?->isFuture() ?? false;
    }

    public function lastSeenAt(User $user): ?CarbonImmutable
    {
        $cached = $this->getPresenceValue($user, $this->lastSeenKey($user->id));

        if (! is_string($cached) || $cached === '') {
            return null;
        }

        try {
            return CarbonImmutable::parse($cached);
        } catch (\Throwable) {
            return null;
        }
    }

    private function onlineUntil(User $user): ?CarbonImmutable
    {
        $cached = $this->getPresenceValue($user, $this->onlineKey($user->id));

        if (! is_string($cached) || $cached === '') {
            return null;
        }

        try {
            return CarbonImmutable::parse($cached);
        } catch (\Throwable) {
            return null;
        }
    }

    private function onlineKey(string $userId): string
    {
        return "presence:user:{$userId}:online_until";
    }

    private function lastSeenKey(string $userId): string
    {
        return "presence:user:{$userId}:last_seen_at";
    }

    private function putPresenceValue(User $user, callable $callback): void
    {
        try {
            $callback();
        } catch (Throwable $exception) {
            Log::warning('Unable to update user presence cache.', [
                'user_id' => $user->id,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    private function getPresenceValue(User $user, string $key): mixed
    {
        try {
            return Cache::get($key);
        } catch (Throwable $exception) {
            Log::warning('Unable to read user presence cache.', [
                'user_id' => $user->id,
                'key' => $key,
                'error' => $exception->getMessage(),
            ]);

            return null;
        }
    }
}
