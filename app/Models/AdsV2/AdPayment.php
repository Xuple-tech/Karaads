<?php

namespace App\Models\AdsV2;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdPayment extends Model
{
    use HasUuids;

    protected $table = 'ad_payments';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'ad_wallet_id',
        'amount',
        'currency',
        'provider',
        'reference',
        'status',
        'fees',
        'meta',
        'raw_payload',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:6',
            'fees' => 'decimal:6',
            'meta' => 'encrypted:array',
            'raw_payload' => 'encrypted:array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(AdWallet::class, 'ad_wallet_id');
    }
}
