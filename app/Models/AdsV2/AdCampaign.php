<?php

namespace App\Models\AdsV2;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class AdCampaign extends Model
{
    use HasUuids;

    protected $table = 'ad_campaigns_v2';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'ad_account_id',
        'user_id',
        'name',
        'objective',
        'billing_model',
        'pricing_media_type',
        'promotion_type',
        'post_id',
        'status',
        'budget_total',
        'budget_daily',
        'daily_target_views',
        'spent',
        'reach_estimate',
        'currency',
        'bid_amount',
        'pacing_type',
        'targeting',
        'start_at',
        'end_at',
        'review_submitted_at',
        'approved_at',
        'rejected_at',
        'approved_by',
        'rejection_reason',
        'last_funded_at',
    ];

    protected function casts(): array
    {
        return [
            'budget_total' => 'decimal:6',
            'budget_daily' => 'decimal:6',
            'daily_target_views' => 'integer',
            'spent' => 'decimal:6',
            'bid_amount' => 'decimal:6',
            'reach_estimate' => 'integer',
            'targeting' => 'array',
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'review_submitted_at' => 'datetime',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'last_funded_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(AdAccount::class, 'ad_account_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function creatives(): HasMany
    {
        return $this->hasMany(AdCreative::class, 'campaign_id');
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(AdDelivery::class, 'campaign_id');
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
