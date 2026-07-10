<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;
use App\Services\Media\MediaPathService;

class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'business_page_id' => $this->business_page_id,
            'content' => $this->content,
            'type' => $this->type,
            'visibility' => $this->visibility,
            'is_pinned' => $this->is_pinned,
            'comments_disabled' => $this->comments_disabled,
            'scheduled_at' => $this->scheduled_at?->toIso8601String(),
            'like_count' => $this->like_count,
            'comment_count' => $this->comment_count,
            'repost_count' => $this->repost_count,
            'view_count' => (int) ($this->view_count ?? 0),
            'save_count' => $this->save_count ?? 0,
            'primary_category' => $this->primary_category,
            'category_confidence' => $this->category_confidence !== null ? (float) $this->category_confidence : null,
            'hashtags' => (array) ($this->hashtags ?? []),
            'music_url' => $this->toPublicUrl($this->music_path),
            'music_title' => $this->music_title,
            'music_mime_type' => $this->music_mime_type,
            'music_duration_seconds' => $this->music_duration_seconds !== null ? (float) $this->music_duration_seconds : null,
            'content_validation' => $this->when(! $request->boolean('lite'), [
                'status' => $this->content_validation_status ?? 'approved',
                'score' => $this->content_validation_score,
                'summary' => $this->content_validation_summary,
                'flags' => (array) ($this->content_validation_flags ?? []),
                'trace' => (array) ($this->content_validation_trace ?? []),
                'validated_at' => $this->content_validated_at?->toIso8601String(),
            ]),
            'reward' => $this->when(! $request->boolean('lite'), [
                'status' => $this->reward_status ?? 'ineligible',
                'amount' => $this->reward_amount !== null ? (float) $this->reward_amount : 0.0,
                'reason' => $this->reward_reason,
                'rewarded_at' => $this->rewarded_at?->toIso8601String(),
            ]),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            'live_replay' => $this->whenLoaded('liveReplayStream', function () {
                if (! $this->liveReplayStream) {
                    return null;
                }

                return [
                    'id' => $this->liveReplayStream->id,
                    'title' => $this->liveReplayStream->title,
                    'started_at' => $this->liveReplayStream->started_at?->toIso8601String(),
                    'ended_at' => $this->liveReplayStream->ended_at?->toIso8601String(),
                    'status' => $this->liveReplayStream->status,
                ];
            }),
            'user' => new UserResource($this->whenLoaded('user')),
            'business_page' => new BusinessPageResource($this->whenLoaded('businessPage')),
            'media' => $this->whenLoaded('media', function () {
                return $this->media
                    ->map(function ($m) {
                        $mediaPath = $m->file_type === 'video'
                            ? ($m->processed_file_path ?: $m->file_path)
                            : (
                                $m->processed_file_path
                                    ?: (is_array($m->variants) ? ($m->variants['medium'] ?? $m->variants['thumb'] ?? null) : null)
                                    ?: $m->file_path
                            );
                        $mediaUrl = $this->toPublicUrl($mediaPath);

                        if (! $mediaUrl) {
                            return null;
                        }

                        return [
                            'id' => $m->id,
                            'path' => $mediaUrl,
                            'url' => $mediaUrl,
                            'thumbnail' => $this->toPublicUrl(
                                $m->thumbnail_path
                                    ?? (is_array($m->variants) ? ($m->variants['thumb'] ?? null) : null)
                                    ?? ($m->file_type === 'image' ? $m->file_path : null)
                            ),
                            'type' => $m->file_type,
                            'mime_type' => $m->mime_type,
                            'duration' => $m->duration !== null ? (int) $m->duration : null,
                            'processing_status' => $m->processing_status,
                            'variants' => $this->toPublicUrlMap(is_array($m->variants) ? $m->variants : null),
                        ];
                    })
                    ->filter()
                    ->values();
            }),
            'original_post' => $this->whenLoaded('originalPost', function () {
                return $this->originalPost ? new self($this->originalPost) : null;
            }),
            'user_liked' => $this->when(true, function () use ($request) {
                if (isset($this->user_liked)) {
                    return (bool) $this->user_liked;
                }

                $user = $request->user();
                if (!$user) {
                    return false;
                }
                
                if ($this->relationLoaded('likes')) {
                    return $this->likes->contains('user_id', $user->id);
                }
                
                return false;
            }),
            'user_reshared' => $this->when(true, function () use ($request) {
                if (isset($this->user_reshared)) {
                    return (bool) $this->user_reshared;
                }

                $user = $request->user();
                if (!$user) {
                    return false;
                }
                return \App\Models\Post::where('user_id', $user->id)
                    ->where('original_post_id', $this->id)
                    ->where('type', 'repost')
                    ->exists();
            }),
            'user_saved' => $this->when(true, function () use ($request) {
                if (isset($this->user_saved)) {
                    return (bool) $this->user_saved;
                }

                $user = $request->user();
                if (!$user) {
                    return false;
                }
                
                if ($this->relationLoaded('bookmarks')) {
                    return $this->bookmarks->contains('user_id', $user->id);
                }

                return \App\Models\Bookmark::where('user_id', $user->id)
                    ->where('post_id', $this->id)
                    ->exists();
            }),
            'monetization' => $this->whenLoaded('monetization', function () {
                return [
                    'id' => $this->monetization->id,
                    'is_monetized' => $this->monetization->is_monetized,
                    'estimated_earnings' => (float) $this->monetization->estimated_earnings,
                    'status' => $this->monetization->status,
                ];
            }),
        ];
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
