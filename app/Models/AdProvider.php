<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class AdProvider extends Model
{
    use SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'name',
        'company_name',
        'contact_email',
        'contact_phone',
        'website',
        'api_key',
        'secret_key',
        'status',
        'balance',
        'payment_method',
        'payment_details',
        'total_spent',
        'total_ads',
        'min_budget',
        'max_budget',
        'targeting_options',
    ];

    protected $casts = [
        'status' => 'boolean',
        'balance' => 'decimal:2',
        'total_spent' => 'decimal:2',
        'min_budget' => 'decimal:2',
        'max_budget' => 'decimal:2',
        'targeting_options' => 'json',
        'payment_details' => 'json',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function campaigns(): HasMany
    {
        return $this->hasMany(AdCampaign::class);
    }

    public function ads(): HasMany
    {
        return $this->hasMany(Ad::class);
    }

    public function isActive(): bool
    {
        return $this->status && $this->balance > 0;
    }
}