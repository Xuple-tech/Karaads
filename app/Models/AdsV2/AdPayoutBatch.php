<?php

namespace App\Models\AdsV2;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdPayoutBatch extends Model
{
    use HasUuids;

    protected $table = 'ad_payout_batches';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'period_start',
        'period_end',
        'status',
        'total_amount',
        'currency',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'period_start' => 'datetime',
            'period_end' => 'datetime',
            'processed_at' => 'datetime',
            'total_amount' => 'decimal:6',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }
}
