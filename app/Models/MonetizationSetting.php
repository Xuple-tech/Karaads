<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MonetizationSetting extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'key',
        'value',
        'description',
        'data_type',
        'category',
        'is_editable',
        'min_value',
        'max_value',
        'options',
    ];

    protected $casts = [
        'value' => 'json',
        'is_editable' => 'boolean',
        'min_value' => 'decimal:4',
        'max_value' => 'decimal:4',
        'options' => 'json',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    const CATEGORY_AD_REVENUE = 'ad_revenue';
    const CATEGORY_USER_PAYOUT = 'user_payout';
    const CATEGORY_CONTENT_CREATOR = 'content_creator';
    const CATEGORY_ADMIN = 'admin';
    const CATEGORY_PLATFORM = 'platform';

    public static function getValue($key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        
        return $setting ? $setting->value : $default;
    }

    public static function setValue($key, $value)
    {
        $setting = self::where('key', $key)->first();
        
        if ($setting) {
            $setting->value = $value;
            $setting->save();
        } else {
            self::create([
                'key' => $key,
                'value' => $value,
                'data_type' => is_array($value) ? 'json' : 'string',
            ]);
        }
    }
}