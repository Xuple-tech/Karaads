<?php

namespace App\Http\Controllers;

use App\Models\Earning;
use App\Models\Referral;
use App\Services\ReferralRewardService;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    public function __construct(
        private readonly ReferralRewardService $referralRewardService,
    ) {}

    /**
     * Get referral stats for authenticated user
     */
    public function stats(Request $request): array
    {
        $user = $request->user();

        // Get referral statistics
        $totalReferred = $user->referrals()->count();
        $activeReferred = $user->referrals()
            ->whereHas('referee', fn($q) => $q->where('status', 'active'))
            ->count();
        $completedReferrals = $user->referrals()
            ->where('status', Referral::STATUS_COMPLETED)
            ->count();

        $pendingBonus = (float) $user->earnings()
            ->where('earning_type', Earning::TYPE_REFERRAL)
            ->where('status', Earning::STATUS_PENDING)
            ->sum('amount');

        $completedBonus = (float) $user->earnings()
            ->where('earning_type', Earning::TYPE_REFERRAL)
            ->where('status', Earning::STATUS_PAID)
            ->sum('amount');

        return [
            'referral_code' => $user->referral_code,
            'total_referred' => $totalReferred,
            'active_referred' => $activeReferred,
            'completed_referrals' => $completedReferrals,
            'pending_bonus' => $pendingBonus,
            'completed_bonus' => $completedBonus,
            'referral_link' => route('register', ['ref' => $user->referral_code]),
        ];
    }

    /**
     * Register a new referral when user signs up with referral code
     */
    public function register(Request $request): array
    {
        $request->validate([
            'referral_code' => 'required|string|exists:users,referral_code',
        ]);

        $referral = $this->referralRewardService->createPendingReferralForUser(
            $request->user(),
            $request->referral_code
        );

        if (! $referral) {
            return [
                'message' => 'Referral could not be registered',
                'status' => false,
            ];
        }

        return [
            'message' => 'Referral registered successfully',
            'referral' => $referral->toArray(),
        ];
    }

    /**
     * Complete a referral and award bonus
     */
    public function complete(Request $request): array
    {
        $request->validate([
            'referral_id' => 'required|string|exists:referrals,id',
        ]);

        $referral = Referral::findOrFail($request->referral_id);

        $referral = $this->referralRewardService->completeByReferral($referral);

        return [
            'message' => 'Referral completed and bonus awarded',
            'referral' => $referral->toArray(),
            'bonus_amount' => $referral->bonus_amount,
        ];
    }
}
