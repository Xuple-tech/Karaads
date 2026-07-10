<?php

namespace App\Http\Resources;

use App\Services\Media\MediaPathService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class ConversationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $inviteEnabled = (bool) ($this->invite_enabled ?? true);

        if ($this->type === 'group' && $inviteEnabled && ! $this->invite_token) {
            $this->forceFill(['invite_token' => Str::random(48)])->saveQuietly();
        }

        return [
            'id' => $this->id,
            'type' => $this->type,
            'name' => $this->name,
            'avatar' => $this->avatar ? app(MediaPathService::class)->toUrl((string) $this->avatar, 'public') : null,
            'invite_token' => $this->when(
                $this->type === 'group' && $inviteEnabled,
                $this->invite_token
            ),
            'invite_url' => $this->when(
                $this->type === 'group' && $inviteEnabled && $this->invite_token,
                url('/messages?join=' . $this->invite_token)
            ),
            'invite_enabled' => $inviteEnabled,
            'created_by' => $this->created_by,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            'participants' => UserResource::collection($this->whenLoaded('participants')),
            'last_message' => new MessageResource($this->whenLoaded('latestMessage')),
            'unread_count' => $this->whenLoaded('messages', function () use ($request) {
                return $this->messages()
                    ->whereNull('read_at')
                    ->where('user_id', '!=', $request->user()?->id)
                    ->count();
            }),
        ];
    }
}
