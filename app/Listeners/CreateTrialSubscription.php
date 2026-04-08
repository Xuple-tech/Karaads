<?php

namespace App\Listeners;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Services\PlanEntitlementService;
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
                    'is_active' => true,
                    'display_order' => 0,
                ]);

                app(PlanEntitlementService::class)->syncPlanEntitlements($freePlan, [
                    'web_search' => true,
                    'image_generation' => true,
                    'api_access' => false,
                    'voice_chat' => false,
                    'email_automation' => false,
                    'projects' => false,
                    'priority_support' => false,
                ], [
                    'requests' => ['daily' => null, 'monthly' => null, 'total' => null],
                    'tokens' => ['daily' => null, 'monthly' => null, 'total' => null],
                    'images' => ['daily' => null, 'monthly' => null, 'total' => null],
                    'voice_messages' => ['daily' => null, 'monthly' => null, 'total' => null],
                    'emails_processed' => ['daily' => null, 'monthly' => null, 'total' => null],
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
