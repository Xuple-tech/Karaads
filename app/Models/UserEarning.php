<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserEarning extends Model
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'user_id',
        'total_earned',
        'total_withdrawn',
        'available_balance',
        'ads_watched',
        'ads_completed',
        'average_earning_per_ad',
    ];

    protected function casts(): array
    {
        return [
            'total_earned' => 'decimal:2',
            'total_withdrawn' => 'decimal:2',
            'available_balance' => 'decimal:2',
            'average_earning_per_ad' => 'decimal:2',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
