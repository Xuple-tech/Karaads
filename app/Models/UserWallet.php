<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserWallet extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'balance',
        'total_earned',
        'total_withdrawn',
        'pending_withdrawal',
        'currency',
        'payout_method',
        'payout_details',
        'min_payout_amount',
        'last_payout_at',
        'is_active',
    ];

    protected $casts = [
        'balance' => 'decimal:6',
        'total_earned' => 'decimal:6',
        'total_withdrawn' => 'decimal:6',
        'pending_withdrawal' => 'decimal:6',
        'min_payout_amount' => 'decimal:6',
        'payout_details' => 'encrypted:array',
        'is_active' => 'boolean',
        'last_payout_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function earnings(): HasMany
    {
        return $this->hasMany(Earning::class, 'user_id', 'user_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function withdrawals(): HasMany
    {
        return $this->hasMany(WithdrawalRequest::class);
    }

    public function addEarning($amount, $description = ''): Earning
    {
        $this->balance += $amount;
        $this->total_earned += $amount;
        $this->save();

        return Earning::create([
            'user_id' => $this->user_id,
            'earning_type' => Earning::TYPE_BONUS,
            'amount' => $amount,
            'description' => $description,
            'status' => Earning::STATUS_PENDING,
        ]);
    }

    public function canWithdraw(): bool
    {
        return $this->balance >= $this->min_payout_amount && $this->is_active;
    }
}
