<?php

namespace App\Listeners;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Log;

class CreateTrialSubscription
{
    public function handle(Registered $event): void
    {
        try {
            $user = $event->user;

            $freePlan = SubscriptionPlan::getFreePlan();

            if (!$freePlan) {
                $freePlan = SubscriptionPlan::create([
                    'name' => 'Free Trial',
                    'slug' => 'free-trial',
                    'description' => '7-day free trial for chat access',
                    'monthly_price' => 0,
                    'yearly_price' => 0,
                    'requests_per_day' => null,
                    'requests_per_month' => null,
                    'tokens_per_day' => null,
                    'tokens_per_month' => null,
                    'images_per_day' => null,
                    'images_per_month' => null,
                    'supports_api' => false,
                    'supports_voice' => false,
                    'supports_email_automation' => false,
                    'supports_projects' => false,
                    'priority_support' => false,
                    'is_active' => true,
                    'display_order' => 0,
                ]);
            }

            Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $freePlan->id,
                'status' => 'active',
                'is_trial' => true,
                'trial_ends_at' => now()->addDays(7),
                'started_at' => now(),
            ]);

            Log::info('Trial subscription created for user', [
                'user_id' => $user->id,
                'email' => $user->email,
                'trial_ends_at' => now()->addDays(7)->toDateTimeString(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create trial subscription', [
                'user_id' => $event->user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
