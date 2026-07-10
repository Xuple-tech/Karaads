<?php

namespace App\Models\AdsV2;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdCreditLine extends Model
{
    use HasUuids;

    protected $table = 'ad_credit_lines';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'ad_account_id',
        'requested_amount',
        'approved_amount',
        'status',
        'reviewed_by',
        'review_notes',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'requested_amount' => 'decimal:6',
            'approved_amount' => 'decimal:6',
            'reviewed_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(AdAccount::class, 'ad_account_id');
    }
}
