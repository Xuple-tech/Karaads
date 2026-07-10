<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdSpace extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'ad_id',
        'ad_campaign_id',
        'user_id',
        'post_id',
        'placement_type',
        'position',
        'width',
        'height',
        'price_per_impression',
        'price_per_click',
        'price_per_conversion',
        'daily_limit',
        'total_limit',
        'status',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'price_per_impression' => 'decimal:6',
        'price_per_click' => 'decimal:6',
        'price_per_conversion' => 'decimal:6',
        'daily_limit' => 'integer',
        'total_limit' => 'integer',
        'status' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function ad(): BelongsTo
    {
        return $this->belongsTo(Ad::class);
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(AdCampaign::class, 'ad_campaign_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function interactions(): HasMany
    {
        return $this->hasMany(AdInteraction::class);
    }

    public function earnings(): HasMany
    {
        return $this->hasMany(Earning::class);
    }

    public function isActive(): bool
    {
        return $this->status && now()->between($this->start_date, $this->end_date ?? now()->addYears(10));
    }
}