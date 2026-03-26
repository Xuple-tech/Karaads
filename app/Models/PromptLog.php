<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PromptLog extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'ip_address',
        'prompt',
        'prompt_length',
        'model_used',
        'estimated_cost',
        'detected_currency',
        'timestamp',
        'tokens_used',
        'is_likely_abuse',
        'abuse_reason',
        'prompt_hash',
        'similar_prompts_in_hour',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'estimated_cost' => 'decimal:6',
        'tokens_used' => 'integer',
        'is_likely_abuse' => 'boolean',
        'similar_prompts_in_hour' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeAbusive($query)
    {
        return $query->where('is_likely_abuse', true);
    }

    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByIp($query, string $ipAddress)
    {
        return $query->where('ip_address', $ipAddress);
    }

    public function scopeLastHour($query)
    {
        return $query->where('timestamp', '>', now()->subHour());
    }

    public function scopeLastDay($query)
    {
        return $query->where('timestamp', '>', now()->subDay());
    }

    public function scopeByModel($query, string $model)
    {
        return $query->where('model_used', $model);
    }
}
