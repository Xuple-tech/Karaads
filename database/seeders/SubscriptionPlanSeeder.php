<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use App\Services\PlanEntitlementService;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'plan' => [
                    'name' => 'Free',
                    'slug' => 'free',
                    'description' => 'Get started with Kwati AI at no cost.',
                    'monthly_price' => 0.00,
                    'yearly_price' => 0.00,
                    'is_active' => true,
                    'display_order' => 1,
                    'stripe_product_id' => null,
                    'stripe_monthly_price_id' => null,
                    'stripe_yearly_price_id' => null,
                ],
                'capabilities' => [
                    'web_search' => true,
                    'image_generation' => true,
                    'api_access' => false,
                    'voice_chat' => true,
                    'email_automation' => false,
                    'projects' => false,
                    'priority_support' => false,
                ],
                'quotas' => [
                    'requests' => ['daily' => 20, 'monthly' => 500, 'total' => null],
                    'tokens' => ['daily' => 50000, 'monthly' => 1000000, 'total' => null],
                    'images' => ['daily' => null, 'monthly' => null, 'total' => null],
                    'voice_messages' => ['daily' => null, 'monthly' => null, 'total' => null],
                    'emails_processed' => ['daily' => null, 'monthly' => null, 'total' => null],
                ],
            ],
            [
                'plan' => [
                    'name' => 'Pro',
                    'slug' => 'pro',
                    'description' => 'For individuals who need more power and features.',
                    'monthly_price' => 15.00,
                    'yearly_price' => 144.00,
                    'is_active' => true,
                    'display_order' => 2,
                    'stripe_product_id' => null,
                    'stripe_monthly_price_id' => null,
                    'stripe_yearly_price_id' => null,
                ],
                'capabilities' => [
                    'web_search' => true,
                    'image_generation' => true,
                    'api_access' => true,
                    'voice_chat' => true,
                    'email_automation' => false,
                    'projects' => false,
                    'priority_support' => false,
                ],
                'quotas' => [
                    'requests' => ['daily' => 200, 'monthly' => 5000, 'total' => null],
                    'tokens' => ['daily' => 500000, 'monthly' => 10000000, 'total' => null],
                    'images' => ['daily' => 20, 'monthly' => 500, 'total' => null],
                    'voice_messages' => ['daily' => null, 'monthly' => null, 'total' => null],
                    'emails_processed' => ['daily' => null, 'monthly' => null, 'total' => null],
                ],
            ],
            [
                'plan' => [
                    'name' => 'Premium',
                    'slug' => 'premium',
                    'description' => 'Unlimited power for teams and heavy users.',
                    'monthly_price' => 40.00,
                    'yearly_price' => 384.00,
                    'is_active' => true,
                    'display_order' => 3,
                    'stripe_product_id' => null,
                    'stripe_monthly_price_id' => null,
                    'stripe_yearly_price_id' => null,
                ],
                'capabilities' => [
                    'web_search' => true,
                    'image_generation' => true,
                    'api_access' => true,
                    'voice_chat' => true,
                    'email_automation' => true,
                    'projects' => true,
                    'priority_support' => true,
                ],
                'quotas' => [
                    'requests' => ['daily' => null, 'monthly' => null, 'total' => null],
                    'tokens' => ['daily' => null, 'monthly' => null, 'total' => null],
                    'images' => ['daily' => null, 'monthly' => null, 'total' => null],
                    'voice_messages' => ['daily' => null, 'monthly' => null, 'total' => null],
                    'emails_processed' => ['daily' => null, 'monthly' => null, 'total' => null],
                ],
            ],
        ];

        $entitlements = app(PlanEntitlementService::class);

        foreach ($plans as $definition) {
            $plan = SubscriptionPlan::updateOrCreate(
                ['slug' => $definition['plan']['slug']],
                $definition['plan']
            );

            $entitlements->syncPlanEntitlements($plan, $definition['capabilities'], $definition['quotas']);
        }

        $this->command->info('Subscription plans seeded with structured entitlements.');
    }
}
