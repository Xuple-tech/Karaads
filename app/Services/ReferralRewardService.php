<?php

namespace App\Services;

use App\Models\Earning;
use App\Models\Referral;
use App\Models\User;
use App\Models\UserWallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReferralRewardService
{
    public function bonusAmount(): float
    {
        return (float) config('referrals.bonus_amount', 5);
    }

    public function currency(): string
    {
        return (string) config('referrals.currency', 'NGN');
    }

    public function createPendingReferralForUser(User $referee, ?string $referralCode): ?Referral
    {
        $normalizedCode = strtoupper(trim((string) $referralCode));
        if ($normalizedCode === '') {
            return null;
        }

        return DB::transaction(function () use ($referee, $normalizedCode) {
            $referee = User::query()->lockForUpdate()->findOrFail($referee->id);
            $referrer = User::query()
                ->where('referral_code', $normalizedCode)
                ->lockForUpdate()
                ->first();

            if (! $referrer || (string) $referrer->id === (string) $referee->id) {
                return null;
            }

            $existingReferral = Referral::query()
                ->where('referee_id', $referee->id)
                ->lockForUpdate()
                ->first();

            if ($existingReferral) {
                $this->ensurePendingEarning($existingReferral);

                return $existingReferral;
            }

            if ($referee->referred_by && (string) $referee->referred_by !== (string) $referrer->id) {
                return null;
            }

            if ((string) $referee->referred_by !== (string) $referrer->id) {
                $referee->forceFill([
                    'referred_by' => $referrer->id,
                ])->save();
            }

            $referral = Referral::create([
                'referrer_id' => $referrer->id,
                'referee_id' => $referee->id,
                'status' => Referral::STATUS_PENDING,
                'bonus_amount' => $this->bonusAmount(),
            ]);

            $this->ensurePendingEarning($referral);

            return $referral;
        });
    }

    public function completeForVerifiedUser(User $referee): ?Referral
    {
        return DB::transaction(function () use ($referee) {
            $referral = Referral::query()
                ->where('referee_id', $referee->id)
                ->lockForUpdate()
                ->first();

            if (! $referral) {
                return null;
            }

            $earning = $this->ensurePendingEarning($referral);

            if ($referral->status !== Referral::STATUS_COMPLETED) {
                $referral->forceFill([
                    'status' => Referral::STATUS_COMPLETED,
                    'completed_at' => $referral->completed_at ?? now(),
                ])->save();
            }

            if ($earning->status !== Earning::STATUS_PAID) {
                $wallet = UserWallet::query()
                    ->where('user_id', $referral->referrer_id)
                    ->lockForUpdate()
                    ->firstOrCreate(
                        ['user_id' => $referral->referrer_id],
                        [
                            'id' => (string) Str::uuid(),
                            'balance' => 0,
                            'total_earned' => 0,
                            'total_withdrawn' => 0,
                            'pending_withdrawal' => 0,
                            'currency' => $this->currency(),
                            'min_payout_amount' => 10,
                            'is_active' => true,
                        ]
                    );

                $amount = (float) $earning->amount;
                $wallet->balance = (float) $wallet->balance + $amount;
                $wallet->total_earned = (float) $wallet->total_earned + $amount;
                $wallet->save();

                $earning->forceFill([
                    'status' => Earning::STATUS_PAID,
                    'paid_at' => now(),
                    'payout_method' => 'wallet_credit',
                ])->save();
            }

            return $referral->fresh();
        });
    }

    public function completeByReferral(Referral $referral): Referral
    {
        $this->completeForVerifiedUser($referral->referee()->firstOrFail());

        return $referral->fresh();
    }

    public function earningReference(Referral|string $referral): string
    {
        $referralId = $referral instanceof Referral ? $referral->id : $referral;

        return 'referral:' . $referralId;
    }

    private function ensurePendingEarning(Referral $referral): Earning
    {
        $reference = $this->earningReference($referral);

        $earning = Earning::query()
            ->where('transaction_id', $reference)
            ->where('earning_type', Earning::TYPE_REFERRAL)
            ->lockForUpdate()
            ->first();

        if ($earning) {
            if ((float) $earning->amount !== (float) $referral->bonus_amount) {
                $earning->forceFill([
                    'amount' => $referral->bonus_amount,
                    'base_amount' => $referral->bonus_amount,
                ])->save();
            }

            return $earning;
        }

        $referrer = $referral->referrer()->first();
        $referee = $referral->referee()->first();
        $refereeName = $referee?->name ?: 'a new user';
        $description = sprintf('Referral reward for inviting %s', $refereeName);

        return Earning::create([
            'user_id' => $referral->referrer_id,
            'earning_type' => Earning::TYPE_REFERRAL,
            'amount' => $referral->bonus_amount,
            'base_amount' => $referral->bonus_amount,
            'currency' => $this->currency(),
            'description' => $description,
            'status' => $referral->status === Referral::STATUS_COMPLETED
                ? Earning::STATUS_PAID
                : Earning::STATUS_PENDING,
            'paid_at' => $referral->status === Referral::STATUS_COMPLETED ? ($referral->completed_at ?? now()) : null,
            'payout_method' => $referral->status === Referral::STATUS_COMPLETED ? 'wallet_credit' : null,
            'transaction_id' => $reference,
        ]);
    }
}
