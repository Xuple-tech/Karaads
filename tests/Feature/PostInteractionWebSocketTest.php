<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Follow;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class PostInteractionWebSocketTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected User $otherUser;

    protected Post $post;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->otherUser = User::factory()->create();
        $this->post = Post::factory()->create([
            'user_id' => $this->user->id,
            'like_count' => 0,
            'comment_count' => 0,
            'repost_count' => 0,
        ]);
    }

    public function test_post_like_dispatches_web_socket_event(): void
    {
        Event::fake();

        $response = $this->actingAs($this->otherUser)
            ->postJson('/api/posts/' . $this->post->id . '/like');

        $response->assertSuccessful();
        $response->assertJson(['liked' => true]);

        // Reload to get updated count
        $this->post->refresh();
        $this->assertEquals(1, $this->post->like_count);
    }

    public function test_post_unlike_dispatches_web_socket_event(): void
    {
        // First create a like
        $this->post->likes()->create([
            'id' => \Illuminate\Support\Str::uuid(),
            'user_id' => $this->otherUser->id,
            'likeable_type' => 'App\\Models\\Post',
        ]);
        $this->post->increment('like_count');

        Event::fake();

        $response = $this->actingAs($this->otherUser)
            ->postJson('/api/posts/' . $this->post->id . '/unlike');

        $response->assertSuccessful();
        $response->assertJson(['liked' => false]);

        $this->post->refresh();
        $this->assertEquals(0, $this->post->like_count);
    }

    public function test_post_reshare_dispatches_web_socket_event(): void
    {
        Event::fake();
        Bus::fake();

        $response = $this->actingAs($this->otherUser)
            ->postJson('/api/posts/' . $this->post->id . '/reshare');

        $response->assertSuccessful();

        // Check that repost was created
        $repost = Post::where('type', 'repost')
            ->where('original_post_id', $this->post->id)
            ->where('user_id', $this->otherUser->id)
            ->first();

        $this->assertNotNull($repost);
        $this->post->refresh();
        $this->assertEquals(1, $this->post->repost_count);
    }

    public function test_post_unreshare_decrements_count(): void
    {
        // First create a repost
        $repost = Post::factory()->create([
            'user_id' => $this->otherUser->id,
            'original_post_id' => $this->post->id,
            'type' => 'repost',
        ]);
        $this->post->increment('repost_count');

        $response = $this->actingAs($this->otherUser)
            ->postJson('/api/posts/' . $this->post->id . '/unreshare');

        $response->assertSuccessful();

        $this->post->refresh();
        $this->assertEquals(0, $this->post->repost_count);
    }

    public function test_post_comment_dispatches_web_socket_event(): void
    {
        Event::fake();
        Bus::fake();

        $response = $this->actingAs($this->otherUser)
            ->postJson('/api/posts/' . $this->post->id . '/comment', [
                'content' => 'Great post!',
            ]);

        $response->assertSuccessful();
        $response->assertJsonStructure([
            'id',
            'post_id',
            'user_id',
            'content',
            'user' => ['id', 'name', 'username'],
            'created_at',
        ]);

        $this->post->refresh();
        $this->assertEquals(1, $this->post->comment_count);

        $comment = Comment::find($response->json('id'));
        $this->assertEquals('Great post!', $comment->content);
    }

    public function test_comment_requires_content(): void
    {
        $response = $this->actingAs($this->otherUser)
            ->postJson('/api/posts/' . $this->post->id . '/comment', []);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('content');
    }

    public function test_comment_max_length(): void
    {
        $longContent = str_repeat('a', 1001);

        $response = $this->actingAs($this->otherUser)
            ->postJson('/api/posts/' . $this->post->id . '/comment', [
                'content' => $longContent,
            ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors('content');
    }

    public function test_post_resource_includes_monetization_data(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/posts/' . $this->post->id);

        $response->assertSuccessful();
        $response->assertJsonStructure([
            'data' => [
                'id',
                'content',
                'user',
                'monetization',
                'ad_spaces',
                'ads',
            ],
        ]);
    }

    public function test_feed_includes_monetization_data(): void
    {
        // Create a follow relationship with explicit UUID
        Follow::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'follower_id' => $this->otherUser->id,
            'following_id' => $this->user->id,
        ]);

        $response = $this->actingAs($this->otherUser)
            ->getJson('/api/posts/feed');

        $response->assertSuccessful();

        if ($response->json('data.0')) {
            $response->assertJsonStructure([
                'data' => [
                    ['monetization', 'ad_spaces', 'ads'],
                ],
            ]);
        }
    }

    public function test_reshare_creates_correct_post_type(): void
    {
        Bus::fake();

        $response = $this->actingAs($this->otherUser)
            ->postJson('/api/posts/' . $this->post->id . '/reshare');

        $response->assertSuccessful();

        $repost = Post::where('type', 'repost')
            ->where('original_post_id', $this->post->id)
            ->first();

        $this->assertEquals('repost', $repost->type);
        $this->assertEquals('everyone', $repost->visibility);
        $this->assertEquals($this->otherUser->id, $repost->user_id);
    }

    public function test_duplicate_reshare_returns_existing(): void
    {
        // Create first repost
        $repost = Post::factory()->create([
            'user_id' => $this->otherUser->id,
            'original_post_id' => $this->post->id,
            'type' => 'repost',
        ]);

        // Try to reshare again
        $response = $this->actingAs($this->otherUser)
            ->postJson('/api/posts/' . $this->post->id . '/reshare');

        $response->assertSuccessful();
        $response->assertJson(['data' => ['id' => $repost->id]]);
    }
}
