<?php

namespace App\Http\Resources;

use App\Services\Media\MediaPathService;
use App\Support\UserPresence;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isOwner = (string) $request->user()?->id === (string) $this->id;
        $presence = app(UserPresence::class);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'avatar' => $this->resolveAvatarUrl(),
            'avatar_variants' => $this->toPublicUrlMap(is_array($this->avatar_variants) ? $this->avatar_variants : null),
            'avatar_processing_status' => $this->when($isOwner, $this->avatar_processing_status),
            'cover' => $this->resolveCoverUrl(),
            'cover_variants' => $this->toPublicUrlMap(is_array($this->cover_variants) ? $this->cover_variants : null),
            'cover_processing_status' => $this->cover_processing_status,
            'username' => $this->username,
            'email' => $this->when($isOwner, $this->email),
            'phone' => $this->when($isOwner, $this->phone),
            'country' => $this->when($isOwner, $this->country),
            'state' => $this->when($isOwner, $this->state),
            'location' => $this->when($isOwner, $this->location),
            'bio' => $this->bio,
            'birth_date' => $this->when($isOwner, $this->birth_date?->toDateString()),
            'onboarding_interests' => $this->when(
                $isOwner,
                is_array($this->onboarding_interests) ? array_values($this->onboarding_interests) : null
            ),
            'onboarding_completed_at' => $this->when($isOwner, $this->onboarding_completed_at?->toIso8601String()),
            'onboarding_complete' => $this->when($isOwner, ! is_null($this->onboarding_completed_at)),
            'content_validation_agreed_at' => $this->when(
                $isOwner,
                $this->content_validation_agreed_at?->toIso8601String()
            ),
            'kara_verified_at' => $this->when(
                $isOwner,
                $this->kara_verified_at?->toIso8601String()
            ),
            'kara_verified_expires_at' => $this->when(
                $isOwner,
                $this->kara_verified_expires_at?->toIso8601String()
            ),
            'status' => $this->when($isOwner, $this->status),
            'message_policy' => $this->when($isOwner, $this->message_policy ?? 'everyone'),
            'default_post_visibility' => $this->when($isOwner, $this->default_post_visibility ?? 'everyone'),
            'post_email_notifications_enabled' => $this->when($isOwner, (bool) ($this->post_email_notifications_enabled ?? true)),
            'referral_code' => $this->when($isOwner, $this->referral_code),
            'referred_by' => $this->when($isOwner, $this->referred_by),
            'followers_count' => $this->followers_count,
            'following_count' => $this->following_count,
            'posts_count' => $this->when(isset($this->posts_count), $this->posts_count),
            'media_count' => $this->when(isset($this->media_count), $this->media_count),
            'bookmarks_count' => $this->when(isset($this->bookmarks_count), $this->bookmarks_count),
            'is_online' => $presence->isOnline($this->resource),
            'last_seen_at' => $presence->lastSeenAt($this->resource)?->toIso8601String(),
            'email_is_verified' => ! is_null($this->email_verified_at),
            'is_verified' => $this->hasActiveKaraVerifiedBadge(),
            'has_verification_badge' => $this->hasActiveKaraVerifiedBadge(),
            'created_at' => $this->created_at->toIso8601String(),
            'is_following' => $this->when(
                isset($this->is_following),
                (bool) $this->is_following
            ),
            'is_blocked' => $this->when(
                isset($this->is_blocked),
                (bool) $this->is_blocked
            ),
            'has_blocked_me' => $this->when(
                isset($this->has_blocked_me),
                (bool) $this->has_blocked_me
            ),
        ];
    }

    private function resolveCoverUrl(): ?string
    {
        $variants = is_array($this->cover_variants) ? $this->cover_variants : null;
        if (($this->cover_processing_status === 'ready') && !empty($variants['lg'])) {
            return (string) $this->toPublicUrl($variants['lg']);
        }
        if (!empty($variants['md'])) {
            return (string) $this->toPublicUrl($variants['md']);
        }
        return $this->cover ? (string) $this->toPublicUrl($this->cover) : null;
    }

    private function resolveAvatarUrl(): string
    {
        $variants = is_array($this->avatar_variants) ? $this->avatar_variants : null;
        if (($this->avatar_processing_status === 'ready') && !empty($variants['md'])) {
            return (string) $this->toPublicUrl($variants['md']);
        }

        return (string) ($this->toPublicUrl($this->avatar) ?? $this->avatar_url);
    }

    private function toPublicUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        return app(MediaPathService::class)->toUrl($path, 'public');
    }

    /**
     * @param  array<string, string|null>|null  $paths
     * @return array<string, string|null>|null
     */
    private function toPublicUrlMap(?array $paths): ?array
    {
        if ($paths === null) {
            return null;
        }

        $mapped = [];
        foreach ($paths as $key => $path) {
            $mapped[$key] = $this->toPublicUrl($path);
        }

        return $mapped;
    }
}
