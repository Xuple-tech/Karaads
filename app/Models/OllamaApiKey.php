<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class OllamaApiKey extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'key',
        'model',
        'request_count',
        'last_used_at',
        'is_active',
        'rate_limit',
        'notes'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'last_used_at' => 'datetime',
        'is_active' => 'boolean',
        'request_count' => 'integer',
        'rate_limit' => 'integer'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'key' // Always hide the actual API key
    ];

    /**
     * Scope to get only active keys
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to order by least used keys
     */
    public function scopeLeastUsed($query)
    {
        return $query->orderBy('request_count')->orderBy('last_used_at');
    }

    /**
     * Check if all keys have reached their rate limit
     */
    public static function allKeysReachedLimit(int $limit): bool
    {
        return !self::active()->where('request_count', '<', $limit)->exists();
    }

    /**
     * Reset request counts for all keys
     */
    public static function resetAllCounts(): void
    {
        self::active()->update([
            'request_count' => 0,
            'last_used_at' => now()
        ]);
    }

    /**
     * Get the next available API key with the lowest usage
     */
    public static function getNextAvailableKey(): ?self
    {
        return self::active()
            ->where('request_count', '<', DB::raw('rate_limit'))
            ->orderBy('request_count')
            ->orderBy('last_used_at')
            ->first();
    }

    /**
     * Increment the request count and update last_used_at
     */
    public function incrementRequestCount(): void
    {
        $this->update([
            'request_count' => $this->request_count + 1,
            'last_used_at' => now()
        ]);
    }

    /**
     * Check if this key has reached its rate limit
     */
    public function hasReachedLimit(): bool
    {
        return $this->request_count >= $this->rate_limit;
    }

    /**
     * Get the remaining requests for this key
     */
    public function getRemainingRequests(): int
    {
        return max(0, $this->rate_limit - $this->request_count);
    }

    /**
     * Reset this key's request count
     */
    public function resetRequestCount(): void
    {
        $this->update([
            'request_count' => 0,
            'last_used_at' => now()
        ]);
    }

    /**
     * Deactivate this key
     */
    public function deactivate(): void
    {
        $this->update(['is_active' => false]);
    }

    /**
     * Activate this key
     */
    public function activate(): void
    {
        $this->update(['is_active' => true]);
    }

    /**
     * Get the masked key for display purposes
     */
    public function getMaskedKeyAttribute(): string
    {
        if (empty($this->key)) {
            return 'No key set';
        }

        $keyLength = strlen($this->key);
        if ($keyLength <= 8) {
            return substr($this->key, 0, 4) . '****';
        }

        return substr($this->key, 0, 4) . '****' . substr($this->key, -4);
    }

    /**
     * Get the usage percentage
     */
    public function getUsagePercentageAttribute(): float
    {
        if ($this->rate_limit === 0) {
            return 0;
        }

        return ($this->request_count / $this->rate_limit) * 100;
    }

    /**
     * Check if key is nearing its limit (80% or more)
     */
    public function isNearingLimit(): bool
    {
        return $this->getUsagePercentageAttribute() >= 80;
    }
}
