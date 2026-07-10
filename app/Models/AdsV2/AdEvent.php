<?php

namespace App\Models\AdsV2;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdEvent extends Model
{
    use HasUuids;

    protected $table = 'ad_events_v2';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'delivery_id',
        'placement_id',
        'campaign_id',
        'creative_id',
        'viewer_user_id',
        'event_type',
        'occurred_at',
        'session_id',
        'fingerprint',
        'ip_address',
        'user_agent',
        'idempotency_key',
        'meta',
        'is_billable',
        'billed_amount',
        'currency',
        'invalidated',
        'invalid_reason',
    ];

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
            'meta' => 'array',
            'is_billable' => 'boolean',
            'invalidated' => 'boolean',
            'billed_amount' => 'decimal:6',
            'currency' => 'string',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function delivery(): BelongsTo
    {
        return $this->belongsTo(AdDelivery::class, 'delivery_id');
    }
}
