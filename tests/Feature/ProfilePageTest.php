<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProfilePageTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        Event::fake();
    }

    public function test_public_profile_page_renders_correctly()
    {
        $this->withoutVite();

        $user = User::factory()->create([
            'username' => 'johndoe',
            'name' => 'John Doe',
            'bio' => 'Test bio',
        ]);

        $response = $this->get('/@johndoe');

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('app/profile')
                ->has('initialUser', fn (Assert $json) => $json
                    ->where('id', $user->id)
                    ->where('username', 'johndoe')
                    ->where('name', 'John Doe')
                    ->where('bio', 'Test bio')
                    ->etc()
                )
            );
    }

    public function test_authenticated_user_profile_page_renders_correctly()
    {
        $this->withoutVite();

        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/profile');

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('app/profile')
                ->has('initialUser', fn (Assert $json) => $json
                    ->where('id', $user->id)
                    ->where('username', $user->username)
                    ->etc()
                )
                ->where('isOwnProfile', true)
            );
    }

    public function test_can_fetch_user_posts_via_api()
    {
        $user = User::factory()->create();
        $posts = Post::factory()->count(3)->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->getJson("/api/users/{$user->username}/posts");

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data');
    }

    public function test_can_follow_and_unfollow_user()
    {
        $user = User::factory()->create();
        $targetUser = User::factory()->create();

        // Test Follow
        $response = $this->actingAs($user)->postJson("/api/users/{$targetUser->username}/follow");
        $response->assertStatus(200);

        $this->assertTrue($user->following()->where('following_id', $targetUser->id)->exists());
        $this->assertTrue($targetUser->followers()->where('follower_id', $user->id)->exists());

        // Test Unfollow
        $response = $this->actingAs($user)->postJson("/api/users/{$targetUser->username}/unfollow");
        $response->assertStatus(200);

        $this->assertFalse($user->following()->where('following_id', $targetUser->id)->exists());
        $this->assertFalse($targetUser->followers()->where('follower_id', $user->id)->exists());
    }
}
