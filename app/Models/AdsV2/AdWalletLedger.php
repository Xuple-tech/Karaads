<?php

namespace App\Models\AdsV2;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdWalletLedger extends Model
{
    use HasUuids;

    protected $table = 'ad_wallet_ledger';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'ad_wallet_id',
        'direction',
        'entry_type',
        'amount',
        'reference_type',
        'reference_id',
        'idempotency_key',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:6',
            'meta' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(AdWallet::class, 'ad_wallet_id');
    }
}
