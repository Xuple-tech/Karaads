<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RateLimitViolation extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    protected $fillable = [
        'user_id',
        'plan_id',
        'type',
        'limit_value',
        'attempted_value',
        'description',
    ];

    /**
     * Get the user for this violation
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the plan for this violation
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    /**
     * Log a violation
     */
    public static function logViolation($userId, $planId, $type, $limitValue, $attemptedValue, $description = null)
    {
        return self::create([
            'user_id' => $userId,
            'plan_id' => $planId,
            'type' => $type,
            'limit_value' => $limitValue,
            'attempted_value' => $attemptedValue,
            'description' => $description,
        ]);
    }

    /**
     * Get recent violations for user
     */
    public static function getRecentViolations($userId, $days = 7)
    {
        return self::where('user_id', $userId)
            ->where('created_at', '>=', now()->subDays($days))
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
