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
    public function __construct(
        private readonly PlanEntitlementService $entitlements
    ) {
    }

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
        $dailyLimit = $this->entitlements->getDailyLimitForUsage($plan, 'requests');
        $monthlyLimit = $this->entitlements->getMonthlyLimitForUsage($plan, 'requests');

        if ($dailyLimit && $quota->requests_used >= $dailyLimit) {
            RateLimitViolation::logViolation(
                $user->id,
                $plan->id,
                'requests_per_day',
                $dailyLimit,
                $quota->requests_used + 1,
                'Exceeded daily request limit'
            );

            return [
                'allowed' => false,
                'reason' => 'Daily request limit exceeded',
                'limit' => $dailyLimit,
                'used' => $quota->requests_used,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'reset_at' => now()->addDay()->toDateTimeString(),
            ];
        }

        // Check monthly request limit
        if ($monthlyLimit) {
            $monthlyUsage = UsageQuota::getAggregatedMonthlyUsage($user->id);
            if ($monthlyUsage['requests_used'] >= $monthlyLimit) {
                RateLimitViolation::logViolation(
                    $user->id,
                    $plan->id,
                    'requests_per_month',
                    $monthlyLimit,
                    $monthlyUsage['requests_used'] + 1,
                    'Exceeded monthly request limit'
                );

                return [
                    'allowed' => false,
                    'reason' => 'Monthly request limit exceeded',
                    'limit' => $monthlyLimit,
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
        $dailyLimit = $this->entitlements->getDailyLimitForUsage($plan, 'images');
        $monthlyLimit = $this->entitlements->getMonthlyLimitForUsage($plan, 'images');

        if (!$dailyLimit && !$monthlyLimit) {
            return [
                'allowed' => true,
                'plan_name' => $plan->name,
            ];
        }

        // Get or create today's quota
        $quota = UsageQuota::getOrCreateTodayQuota($user->id, $plan->id);

        // Check daily image limit
        if ($dailyLimit && ($quota->images_generated + $count) > $dailyLimit) {
            RateLimitViolation::logViolation(
                $user->id,
                $plan->id,
                'images_per_day',
                $dailyLimit,
                $quota->images_generated + $count,
                "Attempted to generate {$count} images, limit is {$dailyLimit}"
            );

            return [
                'allowed' => false,
                'reason' => 'Daily image limit exceeded',
                'limit' => $dailyLimit,
                'used' => $quota->images_generated,
                'needed' => $count,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'reset_at' => now()->addDay()->startOfDay()->toDateTimeString(),
                'reset_type' => 'daily',
            ];
        }

        // Check monthly image limit
        if ($monthlyLimit) {
            $monthlyUsage = UsageQuota::getAggregatedMonthlyUsage($user->id);
            if (($monthlyUsage['images_generated'] + $count) > $monthlyLimit) {
                RateLimitViolation::logViolation(
                    $user->id,
                    $plan->id,
                    'images_per_month',
                    $monthlyLimit,
                    $monthlyUsage['images_generated'] + $count,
                    "Attempted to generate {$count} images, monthly limit is {$monthlyLimit}"
                );

                return [
                    'allowed' => false,
                    'reason' => 'Monthly image limit exceeded',
                    'limit' => $monthlyLimit,
                    'used' => $monthlyUsage['images_generated'],
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
        $dailyLimit = $this->entitlements->getDailyLimitForUsage($plan, 'tokens');
        $monthlyLimit = $this->entitlements->getMonthlyLimitForUsage($plan, 'tokens');

        if (!$dailyLimit && !$monthlyLimit) {
            return [
                'allowed' => true,
            ];
        }

        $quota = UsageQuota::getOrCreateTodayQuota($user->id, $plan->id);

        // Check daily token limit
        if ($dailyLimit && ($quota->tokens_used + $tokensNeeded) > $dailyLimit) {
            RateLimitViolation::logViolation(
                $user->id,
                $plan->id,
                'tokens_per_day',
                $dailyLimit,
                $quota->tokens_used + $tokensNeeded,
                "Attempted to use {$tokensNeeded} tokens, limit is {$dailyLimit}"
            );

            return [
                'allowed' => false,
                'reason' => 'Daily token limit exceeded',
                'limit' => $dailyLimit,
                'used' => $quota->tokens_used,
                'needed' => $tokensNeeded,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
            ];
        }

        if ($monthlyLimit) {
            $monthlyUsage = UsageQuota::getAggregatedMonthlyUsage($user->id);

            if (($monthlyUsage['tokens_used'] + $tokensNeeded) > $monthlyLimit) {
                RateLimitViolation::logViolation(
                    $user->id,
                    $plan->id,
                    'tokens_per_month',
                    $monthlyLimit,
                    $monthlyUsage['tokens_used'] + $tokensNeeded,
                    "Attempted to use {$tokensNeeded} tokens, monthly limit is {$monthlyLimit}"
                );

                return [
                    'allowed' => false,
                    'reason' => 'Monthly token limit exceeded',
                    'limit' => $monthlyLimit,
                    'used' => $monthlyUsage['tokens_used'],
                    'needed' => $tokensNeeded,
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                ];
            }
        }

        return [
            'allowed' => true,
        ];
    }

    public function canUseWidgetRequest(User $user, int $count = 1): array
    {
        $plan = $this->getUserPlan($user);

        if (! $plan) {
            return [
                'allowed' => false,
                'reason' => 'No plan found',
            ];
        }

        if (! $this->entitlements->hasCapability($plan, 'widget_chat')) {
            return [
                'allowed' => false,
                'reason' => 'Widget chat is not included in this plan',
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
            ];
        }

        $dailyLimit = $this->entitlements->getDailyLimitForUsage($plan, 'widget_requests');
        $monthlyLimit = $this->entitlements->getMonthlyLimitForUsage($plan, 'widget_requests');

        if (! $dailyLimit && ! $monthlyLimit) {
            return [
                'allowed' => true,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
            ];
        }

        $quota = UsageQuota::getOrCreateTodayQuota($user->id, $plan->id);

        if ($dailyLimit && ($quota->widget_requests_used + $count) > $dailyLimit) {
            RateLimitViolation::logViolation(
                $user->id,
                $plan->id,
                'widget_requests_per_day',
                $dailyLimit,
                $quota->widget_requests_used + $count,
                "Attempted {$count} widget requests, limit is {$dailyLimit}"
            );

            return [
                'allowed' => false,
                'reason' => 'Daily widget request limit exceeded',
                'limit' => $dailyLimit,
                'used' => $quota->widget_requests_used,
                'needed' => $count,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
                'reset_at' => now()->addDay()->startOfDay()->toDateTimeString(),
                'reset_type' => 'daily',
            ];
        }

        if ($monthlyLimit) {
            $monthlyUsage = UsageQuota::getAggregatedMonthlyUsage($user->id);

            if (($monthlyUsage['widget_requests_used'] + $count) > $monthlyLimit) {
                RateLimitViolation::logViolation(
                    $user->id,
                    $plan->id,
                    'widget_requests_per_month',
                    $monthlyLimit,
                    $monthlyUsage['widget_requests_used'] + $count,
                    "Attempted {$count} widget requests, monthly limit is {$monthlyLimit}"
                );

                return [
                    'allowed' => false,
                    'reason' => 'Monthly widget request limit exceeded',
                    'limit' => $monthlyLimit,
                    'used' => $monthlyUsage['widget_requests_used'],
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
        ];
    }

    public function canCreateWidget(User $user, int $activeWidgets = 0): array
    {
        $plan = $this->getUserPlan($user);

        if (! $plan) {
            return [
                'allowed' => false,
                'reason' => 'No plan found',
            ];
        }

        if (! $this->entitlements->hasCapability($plan, 'widget_chat')) {
            return [
                'allowed' => false,
                'reason' => 'Embeddable widget is not included in this plan',
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
            ];
        }

        $widgetLimit = $this->entitlements->getQuotaLimit($plan, 'widgets', 'total');

        if (! $widgetLimit) {
            return [
                'allowed' => true,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
            ];
        }

        if ($activeWidgets >= $widgetLimit) {
            return [
                'allowed' => false,
                'reason' => 'Active widget limit exceeded',
                'limit' => $widgetLimit,
                'used' => $activeWidgets,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
            ];
        }

        return [
            'allowed' => true,
            'plan_id' => $plan->id,
            'plan_name' => $plan->name,
            'limit' => $widgetLimit,
            'used' => $activeWidgets,
        ];
    }

    public function hasPlanCapability(User $user, string $capability): bool
    {
        $plan = $this->getUserPlan($user);

        return $plan ? $this->entitlements->hasCapability($plan, $capability) : false;
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

    public function recordWidgetRequest(User $user, int $count = 1): void
    {
        $plan = $this->getUserPlan($user);

        if (! $plan) {
            return;
        }

        $quota = UsageQuota::getOrCreateTodayQuota($user->id, $plan->id);
        $quota->incrementWidgetRequests($count);
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
                'widget_requests' => $today?->widget_requests_used ?? 0,
            ],
            'monthly' => [
                'requests' => $monthlyUsage['requests_used'],
                'tokens' => $monthlyUsage['tokens_used'],
                'images' => $monthlyUsage['total_images'],
                'voice_messages' => $monthlyUsage['total_voice_messages'],
                'emails' => $monthlyUsage['total_emails'],
                'widget_requests' => $monthlyUsage['widget_requests_used'],
            ],
            'limits' => $plan ? [
                'requests_per_day' => $this->entitlements->getDailyLimitForUsage($plan, 'requests'),
                'requests_per_month' => $this->entitlements->getMonthlyLimitForUsage($plan, 'requests'),
                'tokens_per_day' => $this->entitlements->getDailyLimitForUsage($plan, 'tokens'),
                'tokens_per_month' => $this->entitlements->getMonthlyLimitForUsage($plan, 'tokens'),
                'images_per_day' => $this->entitlements->getDailyLimitForUsage($plan, 'images'),
                'images_per_month' => $this->entitlements->getMonthlyLimitForUsage($plan, 'images'),
                'widget_requests_per_day' => $this->entitlements->getDailyLimitForUsage($plan, 'widget_requests'),
                'widget_requests_per_month' => $this->entitlements->getMonthlyLimitForUsage($plan, 'widget_requests'),
                'widgets_total' => $this->entitlements->getQuotaLimit($plan, 'widgets', 'total'),
            ] : null,
            'progress' => [
                'daily_requests' => $today ? $this->calculateProgress($today->requests_used, $this->entitlements->getDailyLimitForUsage($plan, 'requests')) : 0,
                'daily_tokens' => $today ? $this->calculateProgress($today->tokens_used, $this->entitlements->getDailyLimitForUsage($plan, 'tokens')) : 0,
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
        return SubscriptionPlan::getActivePlans()
            ->load('planFeatures')
            ->map(fn (SubscriptionPlan $plan) => array_merge($plan->toArray(), [
                'features' => $this->entitlements->getDisplayFeatures($plan),
            ]))
            ->toArray();
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

        $freePlan = SubscriptionPlan::create([
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
        $this->entitlements->syncPlanEntitlements($freePlan, [
            'web_search' => true,
            'image_generation' => true,
            'api_access' => false,
            'voice_chat' => false,
            'email_automation' => false,
            'projects' => false,
            'priority_support' => false,
        ], [
            'requests' => ['daily' => 50, 'monthly' => 500, 'total' => null],
            'tokens' => ['daily' => 10000, 'monthly' => 100000, 'total' => null],
            'images' => ['daily' => 1, 'monthly' => 10, 'total' => null],
            'voice_messages' => ['daily' => null, 'monthly' => null, 'total' => null],
            'emails_processed' => ['daily' => null, 'monthly' => null, 'total' => null],
        ]);

        $paidPlan = SubscriptionPlan::create([
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
        $this->entitlements->syncPlanEntitlements($paidPlan, [
            'web_search' => true,
            'image_generation' => true,
            'api_access' => true,
            'voice_chat' => true,
            'email_automation' => false,
            'projects' => true,
            'priority_support' => false,
        ], [
            'requests' => ['daily' => 500, 'monthly' => 10000, 'total' => null],
            'tokens' => ['daily' => 100000, 'monthly' => 1000000, 'total' => null],
            'images' => ['daily' => 50, 'monthly' => 500, 'total' => null],
            'voice_messages' => ['daily' => null, 'monthly' => null, 'total' => null],
            'emails_processed' => ['daily' => null, 'monthly' => null, 'total' => null],
        ]);

        $premiumPlan = SubscriptionPlan::create([
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
        $this->entitlements->syncPlanEntitlements($premiumPlan, [
            'web_search' => true,
            'image_generation' => true,
            'api_access' => true,
            'voice_chat' => true,
            'email_automation' => true,
            'projects' => true,
            'priority_support' => true,
        ], [
            'requests' => ['daily' => 2000, 'monthly' => 50000, 'total' => null],
            'tokens' => ['daily' => 500000, 'monthly' => 5000000, 'total' => null],
            'images' => ['daily' => 200, 'monthly' => 2000, 'total' => null],
            'voice_messages' => ['daily' => null, 'monthly' => null, 'total' => null],
            'emails_processed' => ['daily' => null, 'monthly' => null, 'total' => null],
        ]);

        $goldPlan = SubscriptionPlan::create([
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
        $this->entitlements->syncPlanEntitlements($goldPlan, [
            'web_search' => true,
            'image_generation' => true,
            'api_access' => true,
            'voice_chat' => true,
            'email_automation' => true,
            'projects' => true,
            'priority_support' => true,
        ], [
            'requests' => ['daily' => null, 'monthly' => null, 'total' => null],
            'tokens' => ['daily' => null, 'monthly' => null, 'total' => null],
            'images' => ['daily' => null, 'monthly' => null, 'total' => null],
            'voice_messages' => ['daily' => null, 'monthly' => null, 'total' => null],
            'emails_processed' => ['daily' => null, 'monthly' => null, 'total' => null],
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
