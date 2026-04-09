<?php

namespace Database\Seeders;

use App\Models\InternalUser;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class InternalUserSeeder extends Seeder
{
    public function run(): void
    {
        InternalUser::firstOrCreate(
            ['email' => 'admin@kwatiai.com'],
            [
                'name'     => 'Super Admin',
                'password' => Hash::make('changeme123'),
                'role'     => 'super_admin',
                'is_active' => true,
            ]
        );
    }
}
