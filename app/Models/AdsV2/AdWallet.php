<?php

namespace App\Models\AdsV2;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdWallet extends Model
{
    use HasUuids;

    protected $table = 'ad_wallets';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'ad_account_id',
        'currency',
        'balance',
        'credit_limit',
        'credit_used',
        'is_credit_approved',
    ];

    protected function casts(): array
    {
        return [
            'balance' => 'decimal:6',
            'credit_limit' => 'decimal:6',
            'credit_used' => 'decimal:6',
            'is_credit_approved' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(AdAccount::class, 'ad_account_id');
    }

    public function ledger(): HasMany
    {
        return $this->hasMany(AdWalletLedger::class, 'ad_wallet_id');
    }
}
