<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoginLog extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $timestamps = false;
    protected $fillable = ['user_id', 'email', 'ip_address', 'user_agent', 'status', 'failure_reason', 'location', 'created_at'];
    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * User relationship
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Log login attempt
     */
    public static function logAttempt(string $email, string $status, string $failureReason = null)
    {
        return self::create([
            'email' => $email,
            'user_id' => $status === 'success' ? auth()->id() : null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'status' => $status,
            'failure_reason' => $failureReason,
            'location' => self::getLocation(request()->ip()),
            'created_at' => now(),
        ]);
    }

    /**
     * Get location from IP (simplified, use MaxMind or similar in production)
     */
    private static function getLocation(string $ip): ?string
    {
        // TODO: Integrate with MaxMind GeoIP2 or similar service
        return null;
    }

    /**
     * Check for suspicious activity
     */
    public static function checkSuspiciousActivity(string $email, int $threshold = 5): bool
    {
        $failedAttempts = self::where('email', $email)
            ->where('status', 'failed')
            ->where('created_at', '>=', now()->subHour())
            ->count();

        return $failedAttempts >= $threshold;
    }
}
