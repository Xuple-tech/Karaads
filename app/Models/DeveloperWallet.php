<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeveloperWallet extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'balance_usd',
        'lifetime_credited_usd',
        'lifetime_debited_usd',
    ];

    protected $casts = [
        'balance_usd' => 'decimal:6',
        'lifetime_credited_usd' => 'decimal:6',
        'lifetime_debited_usd' => 'decimal:6',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function ledgers(): HasMany
    {
        return $this->hasMany(DeveloperCreditLedger::class, 'wallet_id');
    }
}
