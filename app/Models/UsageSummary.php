<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsageSummary extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    protected $fillable = [
        'user_id',
        'plan_id',
        'year',
        'month',
        'total_requests',
        'total_tokens',
        'total_images',
        'total_voice_messages',
        'total_emails',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /**
     * Get the user for this summary
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the plan for this summary
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    /**
     * Get or create summary for period
     */
    public static function getOrCreateSummary($userId, $planId, $year, $month)
    {
        return self::firstOrCreate(
            [
                'user_id' => $userId,
                'year' => $year,
                'month' => $month,
            ],
            [
                'plan_id' => $planId,
            ]
        );
    }

    /**
     * Update from daily quotas
     */
    public static function aggregateFromDailyQuotas($userId, $year, $month)
    {
        $quotas = UsageQuota::where('user_id', $userId)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->get();

        $summary = self::getOrCreateSummary($userId, $quotas->first()?->plan_id, $year, $month);

        $summary->update([
            'total_requests' => $quotas->sum('requests_used'),
            'total_tokens' => $quotas->sum('tokens_used'),
            'total_images' => $quotas->sum('images_generated'),
            'total_voice_messages' => $quotas->sum('voice_messages'),
            'total_emails' => $quotas->sum('emails_processed'),
        ]);

        return $summary;
    }
}
