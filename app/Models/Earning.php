<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Earning extends Model
{
    use HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'ad_id',
        'ad_space_id',
        'ad_interaction_id',
        'post_id',
        'earning_type',
        'amount',
        'currency',
        'description',
        'status',
        'paid_at',
        'payout_method',
        'transaction_id',
        'split_percentage',
        'base_amount',
    ];

    protected $casts = [
        'amount' => 'decimal:6',
        'base_amount' => 'decimal:6',
        'split_percentage' => 'decimal:4',
        'status' => 'string',
        'paid_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    const TYPE_AD_IMPRESSION = 'ad_impression';
    const TYPE_AD_CLICK = 'ad_click';
    const TYPE_AD_CONVERSION = 'ad_conversion';
    const TYPE_CONTENT_CREATOR = 'content_creator';
    const TYPE_REFERRAL = 'referral';
    const TYPE_BONUS = 'bonus';

    const STATUS_PENDING = 'pending';
    const STATUS_PROCESSING = 'processing';
    const STATUS_PAID = 'paid';
    const STATUS_FAILED = 'failed';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function markAsPaid(string $transactionId, string $payoutMethod): void
    {
        $this->status = self::STATUS_PAID;
        $this->paid_at = now();
        $this->transaction_id = $transactionId;
        $this->payout_method = $payoutMethod;
        $this->save();
    }
}
