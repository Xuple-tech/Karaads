<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusinessPageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $viewer = $request->user();

        return [
            'id' => $this->id,
            'owner_user_id' => $this->owner_user_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'category' => $this->category,
            'description' => $this->description,
            'avatar' => $this->avatar_url,
            'cover' => $this->cover_url,
            'follower_count' => (int) ($this->follower_count ?? 0),
            'is_owner' => $viewer ? (string) $viewer->id === (string) $this->owner_user_id : false,
            'is_following' => $this->when(
                $viewer !== null,
                fn () => (bool) (
                    $this->is_following
                    ?? $this->followers()
                        ->where('users.id', $viewer?->id)
                        ->exists()
                ),
            ),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'owner' => new UserResource($this->whenLoaded('owner')),
        ];
    }
}
