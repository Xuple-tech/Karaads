<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerificationRequest extends Model
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'user_id',
        'status',
        'category',
        'full_name',
        'username_snapshot',
        'contact_email',
        'reason',
        'portfolio_url',
        'social_url',
        'followers_count_snapshot',
        'payment_amount',
        'payment_status',
        'payment_provider',
        'payment_reference',
        'paid_at',
        'review_notes',
        'reviewed_by',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
            'paid_at' => 'datetime',
            'payment_amount' => 'decimal:6',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'followers_count_snapshot' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'reviewed_by');
    }
}
