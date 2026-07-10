<?php

namespace App\Models\AdsV2;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class AdCreative extends Model
{
    use HasUuids;

    protected $table = 'ad_creatives_v2';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'campaign_id',
        'adset_id',
        'source_type',
        'status',
        'title',
        'description',
        'media_url',
        'media_type',
        'duration_seconds',
        'target_url',
        'render_mode',
        'external_payload',
        'quality_score',
        'policy_flags',
        'approved_by',
        'approved_at',
        'rejected_at',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'external_payload' => 'array',
            'policy_flags' => 'array',
            'quality_score' => 'decimal:4',
            'duration_seconds' => 'decimal:2',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(AdCampaign::class, 'campaign_id');
    }

    public function adset(): BelongsTo
    {
        return $this->belongsTo(AdAdset::class, 'adset_id');
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(AdDelivery::class, 'creative_id');
    }

    public function scopeAdminApproved(Builder $query): Builder
    {
        return $query
            ->whereNotNull('approved_at')
            ->whereIn('status', ['approved', 'active', 'paused', 'completed']);
    }

    public function isAdminApproved(): bool
    {
        return $this->approved_at !== null
            && in_array($this->status, ['approved', 'active', 'paused', 'completed'], true);
    }
}
