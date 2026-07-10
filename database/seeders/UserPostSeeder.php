<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserPostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Seeding 100 users with 100 posts each...');

        // Create 100 users
        $users = User::factory(100)->create();

        $this->command->info('Created 100 users');

        // Create 100 posts for each user
        foreach ($users as $index => $user) {
            Post::factory(100)->create([
                'user_id' => $user->id,
            ]);

            if (($index + 1) % 10 === 0) {
                $this->command->info('Created posts for ' . ($index + 1) . ' users...');
            }
        }

        $this->command->info('Seeding complete! Total: 100 users x 100 posts = 10,000 posts');
    }
}
