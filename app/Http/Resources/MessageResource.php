<?php

namespace App\Http\Resources;

use App\Services\Media\MediaPathService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'content' => $this->content,
            'user_id' => $this->user_id,
            'conversation_id' => $this->conversation_id,
            'reply_to_message_id' => $this->reply_to_message_id,
            'reply_to' => $this->whenLoaded('replyTo', fn () => $this->replyTo ? [
                'id' => $this->replyTo->id,
                'content' => $this->replyTo->content,
                'user_id' => $this->replyTo->user_id,
                'conversation_id' => $this->replyTo->conversation_id,
                'message_type' => $this->replyTo->message_type,
                'attachments' => $this->normalizeAttachments($this->replyTo->attachments),
                'created_at' => $this->replyTo->created_at?->toIso8601String(),
                'user' => $this->replyTo->relationLoaded('user')
                    ? new UserResource($this->replyTo->user)
                    : null,
            ] : null),
            'message_type' => $this->message_type,
            'attachments' => $this->normalizeAttachments($this->attachments),
            'read_at' => $this->read_at?->toIso8601String(),
            'delivered_at' => $this->delivered_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'user' => new UserResource($this->whenLoaded('user')),
        ];
    }

    /**
     * @param  mixed  $attachments
     * @return mixed
     */
    private function normalizeAttachments(mixed $attachments): mixed
    {
        if (! is_array($attachments)) {
            return $attachments;
        }

        $media = app(MediaPathService::class);

        return array_map(function ($attachment) use ($media) {
            if (! is_array($attachment)) {
                return $attachment;
            }

            $path = $attachment['path'] ?? $attachment['url'] ?? null;
            $thumbnailPath = $attachment['thumbnail_path'] ?? $attachment['thumbnail_url'] ?? $path;

            if ($path) {
                $attachment['url'] = $media->toUrl((string) $path, 'public') ?? $attachment['url'] ?? null;
            }

            if ($thumbnailPath) {
                $attachment['thumbnail_url'] = $media->toUrl((string) $thumbnailPath, 'public') ?? $attachment['thumbnail_url'] ?? null;
            }

            return $attachment;
        }, $attachments);
    }
}
