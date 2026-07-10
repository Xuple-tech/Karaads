<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WithdrawalRequest extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'user_id',
        'user_wallet_id',
        'amount',
        'currency',
        'payout_method',
        'payout_details',
        'status',
        'processed_at',
        'completed_at',
        'rejection_reason',
        'transaction_id',
        'fee',
        'net_amount',
        'admin_notes',
    ];

    protected $casts = [
        'amount' => 'decimal:6',
        'fee' => 'decimal:6',
        'net_amount' => 'decimal:6',
        'payout_details' => 'encrypted:array',
        'status' => 'string',
        'processed_at' => 'datetime',
        'completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_COMPLETED = 'completed';
    const STATUS_REJECTED = 'rejected';
    const STATUS_FAILED = 'failed';

    const PAYOUT_PAYPAL = 'paypal';
    const PAYOUT_BANK = 'bank_transfer';
    const PAYOUT_CRYPTO = 'crypto';
    const PAYOUT_PAYONEER = 'payoneer';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(UserWallet::class, 'user_wallet_id');
    }

    public function approve(string $transactionId = null): void
    {
        $this->status = self::STATUS_PROCESSING;
        $this->processed_at = now();
        $this->transaction_id = $transactionId;
        $this->save();

        // Deduct from wallet
        $wallet = $this->wallet;
        $wallet->balance -= $this->amount;
        $wallet->pending_withdrawal += $this->amount;
        $wallet->save();
    }

    public function complete(): void
    {
        $this->status = self::STATUS_COMPLETED;
        $this->completed_at = now();
        $this->save();

        // Update wallet
        $wallet = $this->wallet;
        $wallet->total_withdrawn += $this->amount;
        $wallet->pending_withdrawal -= $this->amount;
        $wallet->last_payout_at = now();
        $wallet->save();
    }

    public function reject(string $reason): void
    {
        $this->status = self::STATUS_REJECTED;
        $this->rejection_reason = $reason;
        $this->save();
    }
}
