<?php

namespace App\Listeners;

use App\Services\ReferralRewardService;
use Illuminate\Auth\Events\Verified;

class CompleteReferralReward
{
    public function __construct(
        private readonly ReferralRewardService $referralRewardService,
    ) {}

    public function handle(Verified $event): void
    {
        $this->referralRewardService->completeForVerifiedUser($event->user);
    }
}
