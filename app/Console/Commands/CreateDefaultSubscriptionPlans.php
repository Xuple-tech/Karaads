<?php

namespace App\Console\Commands;

use App\Services\SubscriptionService;
use Illuminate\Console\Command;

class CreateDefaultSubscriptionPlans extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscription:create-defaults';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create default subscription plans (Free, Paid, Premium, Gold)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔄 Creating default subscription plans...');

        try {
            $service = app(SubscriptionService::class);
            $service->createDefaultPlans();

            $this->info('✅ Default subscription plans created successfully!');
            $this->info('');
            $this->table(
                ['Plan Name', 'Slug', 'Requests/Day', 'Tokens/Day', 'Price/Month'],
                [
                    ['Free', 'free', '50', '10,000', '$0.00'],
                    ['Paid', 'paid', '500', '100,000', '$9.99'],
                    ['Premium', 'premium', '2,000', '500,000', '$29.99'],
                    ['Gold', 'gold', 'Unlimited', 'Unlimited', '$99.99'],
                ]
            );

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('❌ Error creating subscription plans: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
