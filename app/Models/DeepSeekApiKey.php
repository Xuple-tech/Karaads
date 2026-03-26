<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class DeepSeekApiKey extends Model
{
    use HasUlids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name',
        'key',
        'model',
        'request_count',
        'last_used_at',
        'is_active',
        'rate_limit'
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
        'is_active' => 'boolean',
        'request_count' => 'integer',
        'rate_limit' => 'integer'
    ];

    /**
     * Increment the request count for this key
     */
    public function incrementRequestCount(): void
    {
        $this->increment('request_count');
        $this->update(['last_used_at' => now()]);
    }

    /**
     * Check if all keys have reached their rate limit
     */
    public static function allKeysReachedLimit(int $limit): bool
    {
        return self::where('is_active', true)
            ->where('request_count', '<', $limit)
            ->count() === 0;
    }

    /**
     * Reset all request counts
     */
    public static function resetAllCounts(): void
    {
        self::where('is_active', true)->update(['request_count' => 0]);
    }

    /**
     * Get the next available key with the lowest request count
     */
    public static function getNextAvailableKey(): ?self
    {
        return self::where('is_active', true)
            ->orderBy('request_count', 'asc')
            ->orderBy('last_used_at', 'asc')
            ->first();
    }

    /**
     * Check if this key has reached its rate limit
     */
    public function hasReachedLimit(): bool
    {
        return $this->request_count >= $this->rate_limit;
    }

    /**
     * Get usage percentage
     */
    public function getUsagePercentage(): float
    {
        if ($this->rate_limit === 0) {
            return 0;
        }

        return min(100, ($this->request_count / $this->rate_limit) * 100);
    }
}
