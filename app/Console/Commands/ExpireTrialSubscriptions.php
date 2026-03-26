<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ExpireTrialSubscriptions extends Command
{
    protected $signature = 'subscriptions:expire-trials';
    protected $description = 'Mark trial subscriptions as expired when trial period ends';

    public function handle()
    {
        try {
            $expired = Subscription::where('is_trial', true)
                ->where('status', 'active')
                ->where('trial_ends_at', '<=', now())
                ->update([
                    'status' => 'expired',
                    'expires_at' => now(),
                ]);

            Log::info('Trial subscriptions expired', [
                'count' => $expired,
                'timestamp' => now()->toDateTimeString(),
            ]);

            $this->info("✅ Expired $expired trial subscription(s)");
            return Command::SUCCESS;
        } catch (\Exception $e) {
            Log::error('Failed to expire trial subscriptions', [
                'error' => $e->getMessage(),
            ]);

            $this->error('❌ Error expiring trial subscriptions: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
