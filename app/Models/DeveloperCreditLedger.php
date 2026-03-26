<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeveloperCreditLedger extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'wallet_id',
        'user_id',
        'developer_api_key_id',
        'type',
        'amount_usd',
        'balance_before_usd',
        'balance_after_usd',
        'external_reference',
        'description',
        'metadata',
    ];

    protected $casts = [
        'amount_usd' => 'decimal:6',
        'balance_before_usd' => 'decimal:6',
        'balance_after_usd' => 'decimal:6',
        'metadata' => 'array',
    ];

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(DeveloperWallet::class, 'wallet_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function apiKey(): BelongsTo
    {
        return $this->belongsTo(DeveloperApiKey::class, 'developer_api_key_id');
    }
}
