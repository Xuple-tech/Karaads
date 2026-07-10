<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostMediaResource extends JsonResource
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
            'file_path' => $this->file_path,
            'processed_file_path' => $this->processed_file_path,
            'file_type' => $this->file_type,
            'mime_type' => $this->mime_type,
            'width' => $this->width,
            'height' => $this->height,
            'duration' => $this->duration,
            'thumbnail_path' => $this->thumbnail_path,
            'variants' => $this->variants,
            'processing_status' => $this->processing_status,
            'processing_error' => $this->processing_error,
            'processed_at' => $this->processed_at?->toIso8601String(),
            'order' => $this->order,
        ];
    }
}
