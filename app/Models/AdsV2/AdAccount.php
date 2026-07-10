<?php

namespace App\Models\AdsV2;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AdAccount extends Model
{
    use HasUuids;

    protected $table = 'ad_accounts';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'source_type',
        'name',
        'status',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'meta' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(AdWallet::class, 'ad_account_id');
    }

    public function campaigns(): HasMany
    {
        return $this->hasMany(AdCampaign::class, 'ad_account_id');
    }

    public function creditLineRequests(): HasMany
    {
        return $this->hasMany(AdCreditLine::class, 'ad_account_id');
    }
}
