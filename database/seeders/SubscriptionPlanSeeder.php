<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name'                      => 'Free',
                'slug'                      => 'free',
                'description'               => 'Get started with Kwati AI at no cost.',
                'monthly_price'             => 0.00,
                'yearly_price'              => 0.00,
                'requests_per_day'          => 20,
                'requests_per_month'        => 500,
                'tokens_per_day'            => 50000,
                'tokens_per_month'          => 1000000,
                'images_per_day'            => null,
                'images_per_month'          => null,
                'features'                  => [
                    '20 AI requests per day',
                    'Standard chat models',
                    'Conversation history',
                    'Voice chat (text mode)',
                ],
                'supports_api'              => false,
                'supports_voice'            => true,
                'supports_email_automation' => false,
                'supports_projects'         => false,
                'priority_support'          => false,
                'is_active'                 => true,
                'display_order'             => 1,
                'stripe_product_id'         => null,
                'stripe_monthly_price_id'   => null,
                'stripe_yearly_price_id'    => null,
            ],
            [
                'name'                      => 'Pro',
                'slug'                      => 'pro',
                'description'               => 'For individuals who need more power and features.',
                'monthly_price'             => 15.00,
                'yearly_price'              => 144.00,
                'requests_per_day'          => 200,
                'requests_per_month'        => 5000,
                'tokens_per_day'            => 500000,
                'tokens_per_month'          => 10000000,
                'images_per_day'            => 20,
                'images_per_month'          => 500,
                'features'                  => [
                    '200 AI requests per day',
                    'Advanced chat models (GPT-4, Claude)',
                    'Voice & audio conversations',
                    'Image generation (20/day)',
                    'Priority message processing',
                    'Custom AI instructions',
                ],
                'supports_api'              => true,
                'supports_voice'            => true,
                'supports_email_automation' => false,
                'supports_projects'         => false,
                'priority_support'          => false,
                'is_active'                 => true,
                'display_order'             => 2,
                'stripe_product_id'         => null,
                'stripe_monthly_price_id'   => null,
                'stripe_yearly_price_id'    => null,
            ],
            [
                'name'                      => 'Premium',
                'slug'                      => 'premium',
                'description'               => 'Unlimited power for teams and heavy users.',
                'monthly_price'             => 40.00,
                'yearly_price'              => 384.00,
                'requests_per_day'          => null,
                'requests_per_month'        => null,
                'tokens_per_day'            => null,
                'tokens_per_month'          => null,
                'images_per_day'            => null,
                'images_per_month'          => null,
                'features'                  => [
                    'Unlimited AI requests',
                    'All advanced models',
                    'Unlimited voice conversations',
                    'Unlimited image generation',
                    'Email automation tools',
                    'Priority support',
                    'API access',
                    'Custom system prompts',
                ],
                'supports_api'              => true,
                'supports_voice'            => true,
                'supports_email_automation' => true,
                'supports_projects'         => true,
                'priority_support'          => true,
                'is_active'                 => true,
                'display_order'             => 3,
                'stripe_product_id'         => null,
                'stripe_monthly_price_id'   => null,
                'stripe_yearly_price_id'    => null,
            ],
        ];

        foreach ($plans as $planData) {
            SubscriptionPlan::updateOrCreate(
                ['slug' => $planData['slug']],
                $planData
            );
        }

        $this->command->info('Subscription plans seeded: Free, Pro, Premium.');
    }
}
