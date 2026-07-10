<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PostMonetization extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'post_id',
        'user_id',
        'is_monetized',
        'ad_integration',
        'cpm_rate',
        'cpc_rate',
        'revenue_share',
        'total_earnings',
        'total_impressions',
        'total_clicks',
        'estimated_earnings',
        'monetization_status',
        'ad_spaces_count',
    ];

    protected $casts = [
        'is_monetized' => 'boolean',
        'ad_integration' => 'boolean',
        'cpm_rate' => 'decimal:6',
        'cpc_rate' => 'decimal:6',
        'revenue_share' => 'decimal:4',
        'total_earnings' => 'decimal:6',
        'total_impressions' => 'integer',
        'total_clicks' => 'integer',
        'estimated_earnings' => 'decimal:6',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    const STATUS_ACTIVE = 'active';
    const STATUS_PAUSED = 'paused';
    const STATUS_BLOCKED = 'blocked';

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function calculateEarnings(): float
    {
        $cpmEarnings = ($this->total_impressions / 1000) * $this->cpm_rate;
        $cpcEarnings = $this->total_clicks * $this->cpc_rate;
        
        return $cpmEarnings + $cpcEarnings;
    }

    public function enableMonetization(): void
    {
        $this->is_monetized = true;
        $this->monetization_status = self::STATUS_ACTIVE;
        $this->save();
    }

    public function disableMonetization(): void
    {
        $this->is_monetized = false;
        $this->monetization_status = self::STATUS_PAUSED;
        $this->save();
    }
}
