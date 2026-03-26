<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCurrencyPreference extends Model
{
    protected $table = 'user_currency_preferences';

    protected $fillable = [
        'user_id',
        'preferred_currency',
        'country_code',
        'auto_detect',
    ];

    protected $casts = [
        'auto_detect' => 'boolean',
    ];

    /**
     * Get the user
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get users with auto-detect enabled
     */
    public function scopeAutoDetect($query)
    {
        return $query->where('auto_detect', true);
    }

    /**
     * Scope to filter by currency
     */
    public function scopeByCurrency($query, string $currency)
    {
        return $query->where('preferred_currency', strtoupper($currency));
    }

    /**
     * Get users by country
     */
    public function scopeByCountry($query, string $countryCode)
    {
        return $query->where('country_code', strtoupper($countryCode));
    }
}
