<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Attributes\SearchUsingFullText;
use Laravel\Scout\Searchable;

class Post extends Model
{
    use HasFactory, Searchable, SoftDeletes;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'user_id',
        'business_page_id',
        'content',
        'type',
        'visibility',
        'original_post_id',
        'quote_content',
        'is_pinned',
        'comments_disabled',
        'scheduled_at',
        'like_count',
        'comment_count',
        'repost_count',
        'view_count',
        'save_count',
        'primary_category',
        'category_confidence',
        'category_scores',
        'hashtags',
        'music_path',
        'music_title',
        'music_mime_type',
        'music_duration_seconds',
        'content_validation_status',
        'content_validation_score',
        'content_validation_summary',
        'content_validation_flags',
        'content_validation_trace',
        'content_validated_at',
        'reward_status',
        'reward_amount',
        'reward_reason',
        'rewarded_at',
    ];

    protected function casts(): array
    {
        return [
            'is_pinned' => 'boolean',
            'comments_disabled' => 'boolean',
            'scheduled_at' => 'datetime',
            'category_confidence' => 'decimal:4',
            'category_scores' => 'array',
            'hashtags' => 'array',
            'music_duration_seconds' => 'float',
            'content_validation_score' => 'integer',
            'content_validation_flags' => 'array',
            'content_validation_trace' => 'array',
            'content_validated_at' => 'datetime',
            'reward_amount' => 'decimal:6',
            'rewarded_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
            'view_count' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function businessPage(): BelongsTo
    {
        return $this->belongsTo(BusinessPage::class);
    }

    public function originalPost(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'original_post_id');
    }

    public function reposts(): HasMany
    {
        return $this->hasMany(Post::class, 'original_post_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(PostMedia::class);
    }

    public function likes(): MorphMany
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    public function views(): HasMany
    {
        return $this->hasMany(PostView::class);
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }
    public function monetization(): HasOne
    {
        return $this->hasOne(PostMonetization::class);
    }

    public function liveReplayStream(): HasOne
    {
        return $this->hasOne(LiveStream::class, 'replay_post_id');
    }

    public function earnings(): HasMany
    {
        return $this->hasMany(Earning::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(ContentReport::class);
    }

    #[SearchUsingFullText(['content'])]
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'content' => $this->content ?? '',
            'hashtags' => json_encode($this->hashtags ?? []),
            'visibility' => $this->visibility ?? 'everyone',
            'user_id' => $this->user_id,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
