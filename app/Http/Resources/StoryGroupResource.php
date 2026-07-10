<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoryGroupResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'user' => new UserResource($this['user']),
            'has_unseen' => (bool) ($this['has_unseen'] ?? false),
            'latest_story_at' => $this['latest_story_at']?->toIso8601String(),
            'stories' => StoryResource::collection($this['stories']),
        ];
    }
}