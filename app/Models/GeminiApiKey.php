<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GeminiApiKey extends Model
{
    protected $fillable = [
        'name',
        'key',
        'model',
        'request_count',
        'last_used_at'
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
    ];

    /**
     * Get the next available API key with the lowest request count
     */
    public static function getNextAvailableKey()
    {
        return static::orderBy('request_count', 'asc')
            ->first();
    }

    /**
     * Reset request counts for all keys when they all reach the limit
     */
    public static function resetAllCounts()
    {
        return static::query()->update(['request_count' => 0]);
    }

    /**
     * Check if all keys have reached the request limit
     */
    public static function allKeysReachedLimit($limit)
    {
        return !static::where('request_count', '<', $limit)->exists();
    }

    /**
     * Increment the request count for this key
     */
    public function incrementRequestCount()
    {
        $this->increment('request_count');
        $this->update(['last_used_at' => now()]);
    }
}
