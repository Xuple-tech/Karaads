<?php

namespace App\Models\AdsV2;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdPayoutItem extends Model
{
    use HasUuids;

    protected $table = 'ad_payout_items';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'batch_id',
        'user_id',
        'source',
        'amount',
        'status',
        'reference_type',
        'reference_id',
        'meta',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:6',
            'meta' => 'array',
            'paid_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(AdPayoutBatch::class, 'batch_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
