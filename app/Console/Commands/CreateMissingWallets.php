<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\UserWallet;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class CreateMissingWallets extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-missing-wallets';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create missing wallets for users who don\'t have one';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $users = User::doesntHave('wallet')->get();

        if ($users->isEmpty()) {
            $this->info('All users already have wallets!');
            return self::SUCCESS;
        }

        $this->info("Creating wallets for {$users->count()} users...");

        foreach ($users as $user) {
            UserWallet::create([
                'id' => (string) Str::uuid(),
                'user_id' => $user->id,
                'balance' => 0,
                'total_earned' => 0,
                'total_withdrawn' => 0,
                'pending_withdrawal' => 0,
                'currency' => 'NGN',
                'min_payout_amount' => 10,
                'is_active' => true,
            ]);

            $this->line("✓ Created wallet for {$user->name}");
        }

        $this->info("Successfully created wallets for {$users->count()} users!");
        return self::SUCCESS;
    }
}
