<?php

namespace App\Models\AdsV2;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdDelivery extends Model
{
    use HasUuids;

    protected $table = 'ad_deliveries_v2';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'placement_id',
        'campaign_id',
        'creative_id',
        'viewer_user_id',
        'source_type',
        'status',
        'score',
        'session_id',
        'fingerprint',
        'served_at',
        'expires_at',
        'invalidated_at',
        'blocked_reason',
        'signature',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'decimal:4',
            'served_at' => 'datetime',
            'expires_at' => 'datetime',
            'invalidated_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function placement(): BelongsTo
    {
        return $this->belongsTo(AdPlacement::class, 'placement_id');
    }

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(AdCampaign::class, 'campaign_id');
    }

    public function creative(): BelongsTo
    {
        return $this->belongsTo(AdCreative::class, 'creative_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(AdEvent::class, 'delivery_id');
    }
}
