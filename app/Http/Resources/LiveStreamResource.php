<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LiveStreamResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'visibility' => $this->visibility,
            'status' => $this->status,
            'max_viewers' => $this->max_viewers,
            'viewer_count' => $this->viewer_count,
            'peak_viewer_count' => (int) ($this->peak_viewer_count ?? 0),
            'reaction_count' => (int) ($this->reaction_count ?? 0),
            'share_count' => (int) ($this->share_count ?? 0),
            'comments_count' => (int) ($this->comments_count ?? 0),
            'total_watch_seconds' => (int) ($this->total_watch_seconds ?? 0),
            'likes_count' => (int) ($this->likes_count ?? 0),
            'user_liked' => (bool) ($this->user_liked ?? false),
            'started_at' => $this->started_at?->toIso8601String(),
            'ended_at' => $this->ended_at?->toIso8601String(),
            'last_activity_at' => $this->last_activity_at?->toIso8601String(),
            'scheduled_for' => $this->scheduled_for?->toIso8601String(),
            'thumbnail_path' => $this->thumbnail_path,
            'stream_mode' => $this->stream_mode ?? 'webrtc',
            'health_status' => $this->health_status ?? 'unknown',
            'health_meta' => $this->health_meta ?? [],
            'settings' => $this->settings ?? [],
            'category' => $this->settings['category'] ?? 'Live',
            'last_health_at' => $this->last_health_at?->toIso8601String(),
            'replay_post_id' => $this->replay_post_id,
            'viewer_joined' => (bool) ($this->viewer_joined ?? false),
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }
}
