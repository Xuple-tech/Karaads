<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WidgetSession extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'widget_id',
        'session_token',
        'visitor_id',
        'referrer_url',
        'page_url',
        'metadata',
        'last_seen_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'last_seen_at' => 'datetime',
    ];

    public function widget(): BelongsTo
    {
        return $this->belongsTo(WidgetConfig::class, 'widget_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(WidgetMessage::class, 'session_id');
    }

    public static function generateToken(): string
    {
        do {
            $token = bin2hex(random_bytes(20));
        } while (self::where('session_token', $token)->exists());

        return $token;
    }
}
