<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;
use App\Services\Media\MediaPathService;

class StoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();

        $reactionSummary = $this->whenLoaded('reactions', function () {
            return $this->reactions
                ->groupBy('emoji')
                ->map(fn($collection) => $collection->count())
                ->toArray();
        }, []);

        return [
            'id' => $this->id,
            'caption' => $this->caption,
            'visibility' => $this->visibility,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'music_url' => $this->toPublicUrl($this->music_path),
            'music_title' => $this->music_title,
            'music_mime_type' => $this->music_mime_type,
            'music_duration_seconds' => $this->music_duration_seconds !== null ? (float) $this->music_duration_seconds : null,
            'created_at' => $this->created_at?->toIso8601String(),
            'user' => new UserResource($this->whenLoaded('user')),
            'media' => $this->whenLoaded('media', function () {
                return $this->media->map(fn($media) => [
                    'id' => $media->id,
                    'path' => $this->toPublicUrl(
                        $media->file_type === 'video' && $media->processed_file_path
                            ? $media->processed_file_path
                            : $media->file_path
                    ),
                    'thumbnail' => $this->toPublicUrl(
                        $media->thumbnail_path
                            ?? (is_array($media->variants) ? ($media->variants['thumb'] ?? null) : null)
                            ?? ($media->file_type === 'image' ? $media->file_path : null)
                    ),
                    'type' => $media->file_type,
                    'mime_type' => $media->mime_type,
                    'duration_seconds' => $media->duration_seconds,
                    'display_order' => $media->display_order,
                    'processing_status' => $media->processing_status,
                    'variants' => $this->toPublicUrlMap(is_array($media->variants) ? $media->variants : null),
                ]);
            }, []),
            'is_viewed' => $this->when(isset($this->is_viewed), (bool) $this->is_viewed),
            'viewer_reaction' => $this->when(isset($this->viewer_reaction), $this->viewer_reaction),
            'reaction_summary' => $reactionSummary,
            'view_count' => $this->when(
                isset($this->view_count),
                (int) $this->view_count,
                $this->whenLoaded('views', fn() => $this->views->count())
            ),
            'can_delete' => $user ? $user->id === $this->user_id : false,
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
