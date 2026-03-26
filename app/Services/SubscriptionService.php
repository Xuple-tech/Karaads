<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\UsageQuota;
use App\Models\UsageSummary;
use App\Models\RateLimitViolation;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SubscriptionService
{
    /**
     * Get user's current subscription (or free tier if none)
     */
    public function getUserSubscription(User $user): ?Subscription
    {
        return Subscription::getCurrentSubscriptionForUser($user->id);
    }

    /**
     * Get user's current plan
     */
    public function getUserPlan(User $user): ?SubscriptionPlan
    {
        $subscription = $this->getUserSubscription($user);
        return $subscription ? $subscription->plan : SubscriptionPlan::getFreePlan();
    }

    /**
     * Check if user can make a request (rate limiting)
     */
    public function canMakeRequest(User $user, array $metadata = []): array
    {
        $plan = $this->getUserPlan($user);

        if (!$plan) {
            return [
                'allowed' => false,
                'reason' => 'No plan found',
                'plan_id' => null,
            ];
        }

        // Get or create today's quota
        $quota = UsageQuota::getOrCreateTodayQuota($user->id, $plan->id);

        // Check daily request limit
        if ($plan->requests_per_day && $quota->requests_used >= $plan->requests_per_day) {
            RateLimitViolation::logViolation(
                $user->id,
                $plan->id,
                'requests_per_day',
                $plan->requests_per_day,
                $quota->requests_used + 1,
                'Exceeded daily request limit'
            );

            return [
                'allowed' => false,
                'reason' => 'Daily request limit exceeded',
                'limit' => $plan->requests_per_day,
                'used' => $quota->requests_used,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'reset_at' => now()->addDay()->toDateTimeString(),
            ];
        }

        // Check monthly request limit
        if ($plan->requests_per_month) {
            $monthlyUsage = UsageQuota::getAggregatedMonthlyUsage($user->id);
            if ($monthlyUsage['requests_used'] >= $plan->requests_per_month) {
                RateLimitViolation::logViolation(
                    $user->id,
                    $plan->id,
                    'requests_per_month',
                    $plan->requests_per_month,
                    $monthlyUsage['requests_used'] + 1,
                    'Exceeded monthly request limit'
                );

                return [
                    'allowed' => false,
                    'reason' => 'Monthly request limit exceeded',
                    'limit' => $plan->requests_per_month,
                    'used' => $monthlyUsage['requests_used'],
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                    'reset_at' => now()->addMonth()->startOfMonth()->toDateTimeString(),
                ];
            }
        }

        return [
            'allowed' => true,
            'plan_id' => $plan->id,
            'plan_name' => $plan->name,
            'quota' => $quota,
        ];
    }

    /**
     * Check if user can generate images
     */
    public function canGenerateImages(User $user, int $count = 1): array
    {
        $plan = $this->getUserPlan($user);

        if (!$plan) {
            return [
                'allowed' => false,
                'reason' => 'No plan found',
            ];
        }

        // Unlimited image plans can always proceed
        if (!$plan->images_per_day && !$plan->images_per_month) {
            return [
                'allowed' => true,
                'plan_name' => $plan->name,
            ];
        }

        // Get or create today's quota
        $quota = UsageQuota::getOrCreateTodayQuota($user->id, $plan->id);

        // Check daily image limit
        if ($plan->images_per_day && ($quota->images_generated + $count) > $plan->images_per_day) {
            RateLimitViolation::logViolation(
                $user->id,
                $plan->id,
                'images_per_day',
                $plan->images_per_day,
                $quota->images_generated + $count,
                "Attempted to generate {$count} images, limit is {$plan->images_per_day}"
            );

            return [
                'allowed' => false,
                'reason' => 'Daily image limit exceeded',
                'limit' => $plan->images_per_day,
                'used' => $quota->images_generated,
                'needed' => $count,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'reset_at' => now()->addDay()->startOfDay()->toDateTimeString(),
                'reset_type' => 'daily',
            ];
        }

        // Check monthly image limit
        if ($plan->images_per_month) {
            $monthlyUsage = UsageQuota::getAggregatedMonthlyUsage($user->id);
            if (($monthlyUsage['total_images'] + $count) > $plan->images_per_month) {
                RateLimitViolation::logViolation(
                    $user->id,
                    $plan->id,
                    'images_per_month',
                    $plan->images_per_month,
                    $monthlyUsage['total_images'] + $count,
                    "Attempted to generate {$count} images, monthly limit is {$plan->images_per_month}"
                );

                return [
                    'allowed' => false,
                    'reason' => 'Monthly image limit exceeded',
                    'limit' => $plan->images_per_month,
                    'used' => $monthlyUsage['total_images'],
                    'needed' => $count,
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                    'reset_at' => now()->addMonth()->startOfMonth()->toDateTimeString(),
                    'reset_type' => 'monthly',
                ];
            }
        }

        return [
            'allowed' => true,
            'plan_id' => $plan->id,
            'plan_name' => $plan->name,
            'quota' => $quota,
        ];
    }

    /**
     * Check if user can use tokens
     */
    public function canUseTokens(User $user, int $tokensNeeded = 1): array
    {
        $plan = $this->getUserPlan($user);

        if (!$plan) {
            return [
                'allowed' => false,
                'reason' => 'No plan found',
            ];
        }

        // Unlimited token plans can always proceed
        if (!$plan->tokens_per_day && !$plan->tokens_per_month) {
            return [
                'allowed' => true,
            ];
        }

        $quota = UsageQuota::getOrCreateTodayQuota($user->id, $plan->id);

        // Check daily token limit
        if ($plan->tokens_per_day && ($quota->tokens_used + $tokensNeeded) > $plan->tokens_per_day) {
            RateLimitViolation::logViolation(
                $user->id,
                $plan->id,
                'tokens_per_day',
                $plan->tokens_per_day,
                $quota->tokens_used + $tokensNeeded,
                "Attempted to use {$tokensNeeded} tokens, limit is {$plan->tokens_per_day}"
            );

            return [
                'allowed' => false,
                'reason' => 'Daily token limit exceeded',
                'limit' => $plan->tokens_per_day,
                'used' => $quota->tokens_used,
                'needed' => $tokensNeeded,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
            ];
        }

        return [
            'allowed' => true,
        ];
    }

    /**
     * Record a request usage
     */
    public function recordRequest(User $user, int $tokens = 0, array $metadata = []): void
    {
        $plan = $this->getUserPlan($user);

        if (!$plan) {
            Log::warning("Cannot record request: no plan found for user {$user->id}");
            return;
        }

        $quota = UsageQuota::getOrCreateTodayQuota($user->id, $plan->id);
        $quota->incrementRequests();

        if ($tokens > 0) {
            $quota->incrementTokens($tokens);
        }

        // Update metadata if provided
        if (!empty($metadata)) {
            $quota->metadata = array_merge($quota->metadata ?? [], $metadata);
            $quota->save();
        }
    }

    /**
     * Record image generation
     */
    public function recordImageGeneration(User $user, int $count = 1): void
    {
        $plan = $this->getUserPlan($user);

        if (!$plan) {
            return;
        }

        $quota = UsageQuota::getOrCreateTodayQuota($user->id, $plan->id);
        $quota->incrementImages($count);
    }

    /**
     * Record voice message
     */
    public function recordVoiceMessage(User $user): void
    {
        $plan = $this->getUserPlan($user);

        if (!$plan) {
            return;
        }

        $quota = UsageQuota::getOrCreateTodayQuota($user->id, $plan->id);
        $quota->incrementVoiceMessages();
    }

    /**
     * Record email processing
     */
    public function recordEmailProcessing(User $user, int $count = 1): void
    {
        $plan = $this->getUserPlan($user);

        if (!$plan) {
            return;
        }

        $quota = UsageQuota::getOrCreateTodayQuota($user->id, $plan->id);
        $quota->incrementEmails($count);
    }

    /**
     * Get user's usage statistics
     */
    public function getUserUsageStats(User $user): array
    {
        $plan = $this->getUserPlan($user);
        $today = UsageQuota::getTodayQuota($user->id);
        $monthlyUsage = UsageQuota::getAggregatedMonthlyUsage($user->id);

        return [
            'plan' => $plan ? [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
            ] : null,
            'today' => [
                'requests' => $today?->requests_used ?? 0,
                'tokens' => $today?->tokens_used ?? 0,
                'images' => $today?->images_generated ?? 0,
                'voice_messages' => $today?->voice_messages ?? 0,
                'emails' => $today?->emails_processed ?? 0,
            ],
            'monthly' => [
                'requests' => $monthlyUsage['requests_used'],
                'tokens' => $monthlyUsage['tokens_used'],
                'images' => $monthlyUsage['total_images'],
                'voice_messages' => $monthlyUsage['total_voice_messages'],
                'emails' => $monthlyUsage['total_emails'],
            ],
            'limits' => $plan ? [
                'requests_per_day' => $plan->requests_per_day,
                'requests_per_month' => $plan->requests_per_month,
                'tokens_per_day' => $plan->tokens_per_day,
                'tokens_per_month' => $plan->tokens_per_month,
                'images_per_day' => $plan->images_per_day,
                'images_per_month' => $plan->images_per_month,
            ] : null,
            'progress' => [
                'daily_requests' => $today ? $this->calculateProgress($today->requests_used, $plan->requests_per_day) : 0,
                'daily_tokens' => $today ? $this->calculateProgress($today->tokens_used, $plan->tokens_per_day) : 0,
            ],
        ];
    }

    /**
     * Calculate progress percentage
     */
    private function calculateProgress(int $used, ?int $limit): int
    {
        if (!$limit) {
            return 0;
        }

        return min(100, (int) (($used / $limit) * 100));
    }

    /**
     * Upgrade user to a new plan
     */
    public function upgradePlan(User $user, SubscriptionPlan $newPlan, ?string $paymentMethod = null): Subscription
    {
        return DB::transaction(function () use ($user, $newPlan, $paymentMethod) {
            // Cancel existing active subscription
            $activeSubscription = Subscription::getActiveSubscriptionForUser($user->id);
            if ($activeSubscription) {
                $activeSubscription->cancel();
            }

            // Create new subscription
            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $newPlan->id,
                'status' => 'active',
                'started_at' => now(),
                'renews_at' => now()->addMonth(),
                'payment_method' => $paymentMethod,
                'is_trial' => false,
            ]);

            Log::info("User {$user->id} upgraded to plan {$newPlan->slug}");

            return $subscription;
        });
    }

    /**
     * Downgrade user to a lower plan
     */
    public function downgradePlan(User $user, SubscriptionPlan $newPlan): Subscription
    {
        return DB::transaction(function () use ($user, $newPlan) {
            // Cancel existing active subscription
            $activeSubscription = Subscription::getActiveSubscriptionForUser($user->id);
            if ($activeSubscription) {
                $activeSubscription->cancel();
            }

            // Create new subscription
            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $newPlan->id,
                'status' => 'active',
                'started_at' => now(),
                'renews_at' => now()->addMonth(),
                'is_trial' => false,
            ]);

            Log::info("User {$user->id} downgraded to plan {$newPlan->slug}");

            return $subscription;
        });
    }

    /**
     * Start trial subscription for user
     */
    public function startTrial(User $user, SubscriptionPlan $plan, int $days = 7): Subscription
    {
        return DB::transaction(function () use ($user, $plan, $days) {
            // Cancel any existing subscriptions
            Subscription::where('user_id', $user->id)->active()->update(['status' => 'cancelled']);

            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'status' => 'active',
                'is_trial' => true,
                'trial_ends_at' => now()->addDays($days),
                'started_at' => now(),
            ]);

            Log::info("User {$user->id} started trial for plan {$plan->slug}");

            return $subscription;
        });
    }

    /**
     * Cancel trial subscription
     */
    public function cancelTrial(User $user): bool
    {
        $subscription = Subscription::where('user_id', $user->id)
            ->where('is_trial', true)
            ->active()
            ->first();

        if (!$subscription) {
            return false;
        }

        return $subscription->cancel();
    }

    /**
     * Get all available plans
     */
    public function getAvailablePlans(): array
    {
        return SubscriptionPlan::getActivePlans()->toArray();
    }

    /**
     * Get free plan
     */
    public function getFreePlan(): ?SubscriptionPlan
    {
        return SubscriptionPlan::getFreePlan();
    }

    /**
     * Create default plans (called during setup)
     */
    public function createDefaultPlans(): void
    {
        if (SubscriptionPlan::count() > 0) {
            return; // Plans already exist
        }

        SubscriptionPlan::create([
            'name' => 'Free',
            'slug' => 'free',
            'description' => 'Get started with Kwati AI for free',
            'monthly_price' => 0,
            'yearly_price' => null,
            'requests_per_day' => 50,
            'requests_per_month' => 500,
            'tokens_per_day' => 10000,
            'tokens_per_month' => 100000,
            'images_per_day' => 1,
            'images_per_month' => 10,
            'features' => [
                'web_search',
                'chat',
                'basic_ai_modes',
                'limited_image_generation',
            ],
            'supports_api' => false,
            'supports_voice' => false,
            'supports_email_automation' => false,
            'supports_projects' => false,
            'priority_support' => false,
            'is_active' => true,
            'display_order' => 1,
        ]);

        SubscriptionPlan::create([
            'name' => 'Paid',
            'slug' => 'paid',
            'description' => 'Enhanced features for power users',
            'monthly_price' => 9.99,
            'yearly_price' => 99.99,
            'requests_per_day' => 500,
            'requests_per_month' => 10000,
            'tokens_per_day' => 100000,
            'tokens_per_month' => 1000000,
            'images_per_day' => 50,
            'images_per_month' => 500,
            'features' => [
                'web_search',
                'chat',
                'image_generation',
                'advanced_ai_modes',
                'api_access',
            ],
            'supports_api' => true,
            'supports_voice' => true,
            'supports_email_automation' => false,
            'supports_projects' => true,
            'priority_support' => false,
            'is_active' => true,
            'display_order' => 2,
        ]);

        SubscriptionPlan::create([
            'name' => 'Premium',
            'slug' => 'premium',
            'description' => 'Professional features with priority support',
            'monthly_price' => 19.99,
            'yearly_price' => 199.99,
            'requests_per_day' => 2000,
            'requests_per_month' => 50000,
            'tokens_per_day' => 500000,
            'tokens_per_month' => 5000000,
            'images_per_day' => 200,
            'images_per_month' => 2000,
            'features' => [
                'web_search',
                'chat',
                'image_generation',
                'advanced_ai_modes',
                'api_access',
                'voice_chat',
                'email_automation',
                'projects',
            ],
            'supports_api' => true,
            'supports_voice' => true,
            'supports_email_automation' => true,
            'supports_projects' => true,
            'priority_support' => true,
            'is_active' => true,
            'display_order' => 3,
        ]);

        SubscriptionPlan::create([
            'name' => 'Gold',
            'slug' => 'gold',
            'description' => 'Unlimited access with dedicated support',
            'monthly_price' => 49.99,
            'yearly_price' => 499.99,
            'requests_per_day' => null, // Unlimited
            'requests_per_month' => null,
            'tokens_per_day' => null,
            'tokens_per_month' => null,
            'images_per_day' => null, // Unlimited
            'images_per_month' => null,
            'features' => [
                'web_search',
                'chat',
                'image_generation',
                'advanced_ai_modes',
                'api_access',
                'voice_chat',
                'email_automation',
                'projects',
                'batch_processing',
                'custom_models',
                'unlimited_generations',
            ],
            'supports_api' => true,
            'supports_voice' => true,
            'supports_email_automation' => true,
            'supports_projects' => true,
            'priority_support' => true,
            'is_active' => true,
            'display_order' => 4,
        ]);

        Log::info('Default subscription plans created');
    }
    public function canGenerateDocuments(User $user, int $count = 1): array
{
    $plan = $this->getUserPlan($user);
    
    // $maxDocuments = $plan->features['max_documents_per_month'] ?? 10;
    // $usedDocuments = $this->getUsa($user, 'documents_generated');
    
    // if (($usedDocuments + $count) > $maxDocuments) {
    //     return [
    //         'allowed' => false,
    //         'reason' => 'document_limit_exceeded',
    //         'message' => "You've reached your monthly document generation limit ($maxDocuments documents).",
    //         'limit' => $maxDocuments,
    //         'used' => $usedDocuments,
    //         'remaining' => max(0, $maxDocuments - $usedDocuments)
    //     ];
    // }
    
    return [
        'allowed' => true,
        'limit' => 10,
        'used' => 0,
        'remaining' => 10
    ];
}
}
