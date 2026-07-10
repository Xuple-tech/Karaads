<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Super Admin
        Admin::create([
            'id' => (string) Str::uuid(),
            'name' => 'Super Admin',
            'email' => 'superadmin@karads.local',
            'password' => bcrypt('password123'),
            'role' => Admin::ROLE_SUPER_ADMIN,
            'avatar' => null,
            'phone' => '+1234567890',
            'is_active' => true,
            'permissions' => json_encode([]),
            'last_login_at' => null,
        ]);

        // Regular Admin
        Admin::create([
            'id' => (string) Str::uuid(),
            'name' => 'Admin User',
            'email' => 'admin@karads.local',
            'password' => bcrypt('password123'),
            'role' => Admin::ROLE_ADMIN,
            'avatar' => null,
            'phone' => '+1234567891',
            'is_active' => true,
            'permissions' => json_encode([]),
            'last_login_at' => null,
        ]);

        // Ad Manager
        Admin::create([
            'id' => (string) Str::uuid(),
            'name' => 'Ad Manager',
            'email' => 'admanager@karads.local',
            'password' => bcrypt('password123'),
            'role' => Admin::ROLE_AD_MANAGER,
            'avatar' => null,
            'phone' => '+1234567892',
            'is_active' => true,
            'permissions' => json_encode(['manage_ads', 'manage_campaigns', 'view_analytics']),
            'last_login_at' => null,
        ]);

        // Finance Manager
        Admin::create([
            'id' => (string) Str::uuid(),
            'name' => 'Finance Manager',
            'email' => 'finance@karads.local',
            'password' => bcrypt('password123'),
            'role' => Admin::ROLE_FINANCE_MANAGER,
            'avatar' => null,
            'phone' => '+1234567893',
            'is_active' => true,
            'permissions' => json_encode(['manage_earnings', 'manage_withdrawals', 'view_financial_reports']),
            'last_login_at' => null,
        ]);

        // Moderator
        Admin::create([
            'id' => (string) Str::uuid(),
            'name' => 'Content Moderator',
            'email' => 'moderator@karads.local',
            'password' => bcrypt('password123'),
            'role' => Admin::ROLE_MODERATOR,
            'avatar' => null,
            'phone' => '+1234567894',
            'is_active' => true,
            'permissions' => json_encode(['moderate_content', 'review_posts', 'review_comments']),
            'last_login_at' => null,
        ]);

        $this->command->info('✅ Admin users seeded successfully!');
        $this->command->newLine();
        $this->command->table(['Email', 'Role', 'Password'], [
            ['superadmin@karads.local', 'Super Admin', 'password123'],
            ['admin@karads.local', 'Admin', 'password123'],
            ['admanager@karads.local', 'Ad Manager', 'password123'],
            ['finance@karads.local', 'Finance Manager', 'password123'],
            ['moderator@karads.local', 'Moderator', 'password123'],
        ]);
    }
}
