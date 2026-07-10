<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create test users
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        // Seed admin users
        $this->call(AdminSeeder::class);

        // Seed Ads V2 baseline configuration
        $this->call(AdsMonetizationSettingsSeeder::class);

        // Seed 100 users with 100 posts each
        // $this->call(UserPostSeeder::class);
    }
}
