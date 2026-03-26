<?php

namespace App\Console\Commands;

use App\Models\SubscriptionPlan;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Stripe\Product;
use Stripe\Price;
use Stripe\Stripe;

class SetupStripeProducts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stripe:setup-products';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create Stripe products and prices for subscription plans';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        $this->info('Setting up Stripe products and prices...');

        $plans = SubscriptionPlan::all();

        if ($plans->isEmpty()) {
            $this->warn('No subscription plans found. Run subscription:create-defaults first.');
            return 1;
        }

        foreach ($plans as $plan) {
            try {
                $this->createOrUpdateProduct($plan);
            } catch (\Exception $e) {
                $this->error("Failed to create product for {$plan->name}: " . $e->getMessage());
                Log::error("Stripe product creation error for {$plan->name}: " . $e->getMessage());
            }
        }

        $this->info('✓ Stripe products and prices setup complete!');
        return 0;
    }

    /**
     * Create or update Stripe product for a plan
     */
    protected function createOrUpdateProduct(SubscriptionPlan $plan): void
    {
        $productName = $plan->name;
        $description = $plan->description ?? 'Subscription Plan';

        // Create or retrieve product
        try {
            $products = Product::all([
                'query' => json_encode([
                    'metadata' => ['plan_id' => $plan->id],
                ]),
            ]);

            $product = $products->data[0] ?? null;

            if (!$product) {
                $product = Product::create([
                    'name' => $productName,
                    'description' => $description,
                    'type' => 'service',
                    'metadata' => [
                        'plan_id' => $plan->id,
                    ],
                ]);

                $this->line("  ✓ Created product: {$productName}");
            }
        } catch (\Exception $e) {
            $this->warn("  ! Could not retrieve existing product: " . $e->getMessage());
            $product = Product::create([
                'name' => $productName,
                'description' => $description,
                'type' => 'service',
                'metadata' => [
                    'plan_id' => $plan->id,
                ],
            ]);

            $this->line("  ✓ Created product: {$productName}");
        }

        // Create prices for monthly and yearly
        if ($plan->monthly_price > 0) {
            try {
                Price::create([
                    'product' => $product->id,
                    'unit_amount' => (int)($plan->monthly_price * 100),
                    'currency' => 'usd',
                    'recurring' => [
                        'interval' => 'month',
                        'interval_count' => 1,
                    ],
                    'lookup_key' => strtolower($plan->slug) . '_monthly',
                ]);

                $this->line("  ✓ Created monthly price: ${$plan->monthly_price}");
            } catch (\Exception $e) {
                $this->warn("  ! Monthly price already exists or error: " . $e->getMessage());
            }
        }

        if ($plan->yearly_price > 0) {
            try {
                Price::create([
                    'product' => $product->id,
                    'unit_amount' => (int)($plan->yearly_price * 100),
                    'currency' => 'usd',
                    'recurring' => [
                        'interval' => 'year',
                        'interval_count' => 1,
                    ],
                    'lookup_key' => strtolower($plan->slug) . '_yearly',
                ]);

                $this->line("  ✓ Created yearly price: ${$plan->yearly_price}");
            } catch (\Exception $e) {
                $this->warn("  ! Yearly price already exists or error: " . $e->getMessage());
            }
        }
    }
}
