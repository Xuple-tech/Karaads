<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CurrencyRate extends Model
{
    protected $fillable = [
        'base_currency',
        'target_currency',
        'rate',
        'original_rate',
        'rate_timestamp',
        'expires_at',
    ];

    protected $casts = [
        'rate' => 'decimal:8',
        'original_rate' => 'decimal:8',
        'rate_timestamp' => 'datetime',
        'expires_at' => 'datetime',
    ];
}
