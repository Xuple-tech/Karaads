<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AdCampaign extends Model
{
    use SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'ad_provider_id',
        'user_id',
        'name',
        'description',
        'budget',
        'daily_budget',
        'spent',
        'status',
        'type',
        'targeting',
        'bidding_type',
        'bid_amount',
        'start_date',
        'end_date',
        'impressions_limit',
        'clicks_limit',
        'conversions_limit',
        'pacing_type',
    ];

    protected $casts = [
        'budget' => 'decimal:2',
        'daily_budget' => 'decimal:2',
        'spent' => 'decimal:2',
        'status' => 'string',
        'targeting' => 'json',
        'bid_amount' => 'decimal:4',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'impressions_limit' => 'integer',
        'clicks_limit' => 'integer',
        'conversions_limit' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    const STATUS_ACTIVE = 'active';
    const STATUS_PAUSED = 'paused';
    const STATUS_COMPLETED = 'completed';
    const STATUS_DRAFT = 'draft';

    const TYPE_CPM = 'cpm';
    const TYPE_CPC = 'cpc';
    const TYPE_CPA = 'cpa';

    public function provider(): BelongsTo
    {
        return $this->belongsTo(AdProvider::class, 'ad_provider_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function ads(): HasMany
    {
        return $this->hasMany(Ad::class);
    }

    public function adSpaces(): HasMany
    {
        return $this->hasMany(AdSpace::class);
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE 
            && $this->budget > $this->spent
            && now()->between($this->start_date, $this->end_date ?? now()->addYears(10));
    }
}