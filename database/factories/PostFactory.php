<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Post>
 */
class PostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'user_id' => User::factory(),
            'content' => $this->faker->paragraph(),
            'type' => 'post',
            'like_count' => $this->faker->numberBetween(0, 1000),
            'comment_count' => $this->faker->numberBetween(0, 100),
            'repost_count' => $this->faker->numberBetween(0, 50),
        ];
    }
}
