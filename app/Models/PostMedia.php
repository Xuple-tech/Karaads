<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostMedia extends Model
{
    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'post_id',
        'file_path',
        'processed_file_path',
        'file_type',
        'mime_type',
        'media_fingerprint',
        'width',
        'height',
        'duration',
        'thumbnail_path',
        'variants',
        'processing_status',
        'processing_error',
        'processed_at',
        'order',
    ];

    protected function casts(): array
    {
        return [
            'variants' => 'array',
            'duration' => 'integer',
            'processed_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }
}
