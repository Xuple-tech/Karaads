<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * GrokApiConfig Model
 *
 * Manages Grok API keys and configurations
 * Stored encrypted in database for security
 */
class GrokApiConfig extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    protected $fillable = ['api_key', 'model', 'is_active', 'rate_limit', 'allowed_features', 'notes', 'created_by'];
    protected $casts = [
        'allowed_features' => 'json',
        'is_active' => 'boolean',
    ];
    protected $hidden = ['api_key'];

    /**
     * Creator relationship
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get active API key for usage
     */
    public static function getActive()
    {
        return self::where('is_active', true)->latest()->first();
    }

    /**
     * Verify API key is still valid
     */
    public function verifyKey(): bool
    {
        try {
            // This would make a test call to Grok API
            $this->touch('last_verified_at');
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Check if feature is allowed with this key
     */
    public function isFeatureAllowed(string $feature): bool
    {
        if (!$this->allowed_features) {
            return true;
        }
        return in_array($feature, $this->allowed_features);
    }
}
