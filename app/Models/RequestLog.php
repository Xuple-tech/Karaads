<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RequestLog extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'ip_address',
        'method',
        'path',
        'uri',
        'user_agent',
        'referer',
        'response_status',
        'response_time_ms',
        'request_data',
        'detected_currency',
        'user_country',
        'is_suspected_bot',
        'bot_reason',
        'bot_score',
    ];

    protected $casts = [
        'response_status' => 'integer',
        'response_time_ms' => 'integer',
        'request_data' => 'array',
        'is_suspected_bot' => 'boolean',
        'bot_score' => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeBot($query)
    {
        return $query->where('is_suspected_bot', true);
    }

    public function scopeHumanLike($query)
    {
        return $query->where('is_suspected_bot', false);
    }

    public function scopeHighBotScore($query, int $threshold = 50)
    {
        return $query->where('bot_score', '>=', $threshold);
    }

    public function scopeByIp($query, string $ipAddress)
    {
        return $query->where('ip_address', $ipAddress);
    }

    public function scopeLastHour($query)
    {
        return $query->where('created_at', '>', now()->subHour());
    }
}
