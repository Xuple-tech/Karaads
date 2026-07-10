<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Ad extends Model
{
    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'ad_provider_id',
        'user_id',
        'ad_campaign_id',
        'title',
        'description',
        'content',
        'media_url',
        'media_type',
        'target_url',
        'ad_type',
        'status',
        'approval_status',
        'approved_by',
        'rejection_reason',
        'approved_at',
        'impressions',
        'clicks',
        'conversions',
        'ctr',
        'conversion_rate',
        'total_spent',
    ];

    protected $casts = [
        'status' => 'boolean',
        'impressions' => 'integer',
        'clicks' => 'integer',
        'conversions' => 'integer',
        'ctr' => 'decimal:4',
        'conversion_rate' => 'decimal:4',
        'total_spent' => 'decimal:2',
        'approved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    const TYPE_BANNER = 'banner';

    const TYPE_INTERSTITIAL = 'interstitial';

    const TYPE_REWARDED = 'rewarded';

    const TYPE_NATIVE = 'native';

    const TYPE_SPONSORED = 'sponsored';

    public function provider(): BelongsTo
    {
        return $this->belongsTo(AdProvider::class, 'ad_provider_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'approved_by');
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(AdCampaign::class, 'ad_campaign_id');
    }

    public function adSpaces(): HasMany
    {
        return $this->hasMany(AdSpace::class);
    }

    public function posts(): MorphToMany
    {
        return $this->morphedByMany(Post::class, 'advertisable', 'ad_placements');
    }

    public function users(): MorphToMany
    {
        return $this->morphedByMany(User::class, 'advertisable', 'ad_placements');
    }

    public function views(): HasMany
    {
        return $this->hasMany(AdView::class);
    }

    public function incrementImpressions(): void
    {
        $this->increment('impressions');
        $this->ctr = $this->clicks / max(1, $this->impressions);
        $this->save();
    }

    public function incrementClicks(): void
    {
        $this->increment('clicks');
        $this->ctr = $this->clicks / max(1, $this->impressions);
        $this->save();
    }
}
