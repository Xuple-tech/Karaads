<?php

namespace App\Models;

use App\Services\PlanEntitlementService;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsageQuota extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    protected $fillable = [
        'user_id',
        'plan_id',
        'date',
        'requests_used',
        'tokens_used',
        'images_generated',
        'voice_messages',
        'emails_processed',
        'metadata',
    ];

    protected $casts = [
        'date' => 'date',
        'metadata' => 'array',
    ];

    /**
     * Get the user for this quota
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the plan for this quota
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    /**
     * Increment requests used
     */
    public function incrementRequests(int $amount = 1): void
    {
        $this->increment('requests_used', $amount);
    }

    /**
     * Increment tokens used
     */
    public function incrementTokens(int $amount): void
    {
        $this->increment('tokens_used', $amount);
    }

    /**
     * Increment images generated
     */
    public function incrementImages(int $amount = 1): void
    {
        $this->increment('images_generated', $amount);
    }

    /**
     * Increment voice messages
     */
    public function incrementVoiceMessages(int $amount = 1): void
    {
        $this->increment('voice_messages', $amount);
    }

    /**
     * Increment emails processed
     */
    public function incrementEmails(int $amount = 1): void
    {
        $this->increment('emails_processed', $amount);
    }

    /**
     * Get today's quota for user
     */
    public static function getTodayQuota($userId)
    {
        return self::where('user_id', $userId)
            ->where('date', now()->toDateString())
            ->first();
    }

    /**
     * Get or create today's quota for user
     */
    public static function getOrCreateTodayQuota($userId, $planId)
    {
        return self::firstOrCreate(
            [
                'user_id' => $userId,
                'date' => now()->toDateString(),
            ],
            [
                'plan_id' => $planId,
                'requests_used' => 0,
                'tokens_used' => 0,
                'images_generated' => 0,
                'voice_messages' => 0,
                'emails_processed' => 0,
            ]
        );
    }

    /**
     * Get usage for current month
     */
    public static function getMonthlyUsage($userId, $year = null, $month = null)
    {
        $year = $year ?? now()->year;
        $month = $month ?? now()->month;

        return self::where('user_id', $userId)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->get();
    }

    /**
     * Get aggregated monthly usage
     */
    public static function getAggregatedMonthlyUsage($userId, $year = null, $month = null)
    {
        $usage = self::getMonthlyUsage($userId, $year, $month);

        return [
            'requests_used' => $usage->sum('requests_used'),
            'tokens_used' => $usage->sum('tokens_used'),
            'images_generated' => $usage->sum('images_generated'),
            'voice_messages' => $usage->sum('voice_messages'),
            'emails_processed' => $usage->sum('emails_processed'),
        ];
    }

    /**
     * Get usage percentage against limit
     */
    public function getUsagePercentage(string $type): ?int
    {
        if (!$this->plan) {
            return null;
        }

        $limit = app(PlanEntitlementService::class)->getDailyLimitForUsage($this->plan, $type);

        if (!$limit) {
            return null;
        }

        $used = match ($type) {
            'requests' => $this->requests_used,
            'tokens' => $this->tokens_used,
            default => 0,
        };

        return min(100, (int) (($used / $limit) * 100));
    }
}
