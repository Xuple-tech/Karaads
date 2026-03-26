<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class StripePaymentTransaction extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $keyType = 'string';
    protected $fillable = [
        'subscription_id',
        'stripe_invoice_id',
        'stripe_charge_id',
        'type',
        'amount',
        'currency',
        'status',
        'description',
        'failure_reason',
        'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'metadata' => 'array',
    ];

    /**
     * Get the subscription associated with this transaction
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    /**
     * Log a transaction
     */
    public static function logTransaction(
        string $subscriptionId,
        string $type,
        float $amount,
        string $status,
        ?string $invoiceId = null,
        ?string $chargeId = null,
        ?string $description = null,
        ?string $failureReason = null,
        ?array $metadata = null
    ): self {
        return self::create([
            'subscription_id' => $subscriptionId,
            'stripe_invoice_id' => $invoiceId,
            'stripe_charge_id' => $chargeId,
            'type' => $type,
            'amount' => $amount,
            'currency' => 'usd',
            'status' => $status,
            'description' => $description,
            'failure_reason' => $failureReason,
            'metadata' => $metadata ?? [],
        ]);
    }

    /**
     * Get succeeded transactions
     */
    public function scopeSucceeded($query)
    {
        return $query->where('status', 'succeeded');
    }

    /**
     * Get failed transactions
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Get charge type transactions
     */
    public function scopeCharges($query)
    {
        return $query->where('type', 'charge');
    }

    /**
     * Get refund type transactions
     */
    public function scopeRefunds($query)
    {
        return $query->where('type', 'refund');
    }
}
