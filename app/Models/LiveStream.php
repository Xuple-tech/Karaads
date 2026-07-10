<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class LiveStream extends Model
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'user_id',
        'title',
        'description',
        'visibility',
        'status',
        'max_viewers',
        'viewer_count',
        'peak_viewer_count',
        'reaction_count',
        'share_count',
        'total_watch_seconds',
        'started_at',
        'ended_at',
        'last_activity_at',
        'scheduled_for',
        'thumbnail_path',
        'stream_mode',
        'health_status',
        'health_meta',
        'settings',
        'last_health_at',
        'replay_post_id',
    ];

    protected function casts(): array
    {
        return [
            'max_viewers' => 'integer',
            'viewer_count' => 'integer',
            'peak_viewer_count' => 'integer',
            'reaction_count' => 'integer',
            'share_count' => 'integer',
            'total_watch_seconds' => 'integer',
            'health_meta' => 'array',
            'settings' => 'array',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'last_activity_at' => 'datetime',
            'scheduled_for' => 'datetime',
            'last_health_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(LiveStreamMessage::class);
    }

    public function joins(): HasMany
    {
        return $this->hasMany(LiveStreamJoin::class);
    }

    public function likes(): MorphMany
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    public function replayPost(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'replay_post_id');
    }
}
