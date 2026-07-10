<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoryMedia extends Model
{
    protected $table = 'story_media';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'story_id',
        'file_path',
        'processed_file_path',
        'thumbnail_path',
        'variants',
        'file_type',
        'mime_type',
        'duration_seconds',
        'display_order',
        'processing_status',
        'processing_error',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'duration_seconds' => 'float',
            'variants' => 'array',
            'processed_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function story(): BelongsTo
    {
        return $this->belongsTo(Story::class);
    }
}
