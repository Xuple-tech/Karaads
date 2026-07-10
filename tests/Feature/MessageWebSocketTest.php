<?php

namespace Tests\Feature;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class MessageWebSocketTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        Event::fake();
    }

    public function test_message_sent_event_broadcasts_when_message_created()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Create a conversation
        $conversation = Conversation::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => 'private',
            'created_by' => $user1->id,
        ]);

        // Add participants
        $conversation->participants()->attach([
            $user1->id => ['id' => (string) \Illuminate\Support\Str::uuid(), 'joined_at' => now()],
            $user2->id => ['id' => (string) \Illuminate\Support\Str::uuid(), 'joined_at' => now()],
        ]);

        // Send a message
        $response = $this->actingAs($user1)->postJson(
            "/api/conversations/{$conversation->id}/messages",
            ['content' => 'Hello World']
        );

        $response->assertStatus(201);
        $response->assertJson(['data' => ['content' => 'Hello World']]);

        // Verify MessageSent event was dispatched
        Event::assertDispatched(MessageSent::class, function ($event) {
            return $event->message->content === 'Hello World';
        });
    }

    public function test_message_broadcast_contains_correct_data()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $conversation = Conversation::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => 'private',
            'created_by' => $user1->id,
        ]);

        $conversation->participants()->attach([
            $user1->id => ['id' => (string) \Illuminate\Support\Str::uuid(), 'joined_at' => now()],
            $user2->id => ['id' => (string) \Illuminate\Support\Str::uuid(), 'joined_at' => now()],
        ]);

        $this->actingAs($user1)->postJson(
            "/api/conversations/{$conversation->id}/messages",
            ['content' => 'Test broadcast data']
        );

        Event::assertDispatched(MessageSent::class, function ($event) use ($user1, $conversation) {
            $broadcastData = $event->broadcastWith();
            $message = $broadcastData['message'];

            return $message['content'] === 'Test broadcast data' &&
                $message['user_id'] === $user1->id &&
                $message['conversation_id'] === $conversation->id &&
                $message['user']['id'] === $user1->id &&
                $message['user']['name'] === $user1->name;
        });
    }

    public function test_message_event_broadcasts_to_correct_channel()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $conversation = Conversation::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => 'private',
            'created_by' => $user1->id,
        ]);

        $conversation->participants()->attach([
            $user1->id => ['id' => (string) \Illuminate\Support\Str::uuid(), 'joined_at' => now()],
            $user2->id => ['id' => (string) \Illuminate\Support\Str::uuid(), 'joined_at' => now()],
        ]);

        $this->actingAs($user1)->postJson(
            "/api/conversations/{$conversation->id}/messages",
            ['content' => 'Channel test']
        );

        Event::assertDispatched(MessageSent::class, function ($event) use ($conversation) {
            $channels = $event->broadcastOn();
            return !empty($channels) &&
                strpos($channels[0]->name, "conversation.{$conversation->id}") !== false;
        });
    }

    public function test_message_sent_event_has_broadcast_as_method()
    {
        $user1 = User::factory()->create();
        $conversation = Conversation::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => 'private',
            'created_by' => $user1->id,
        ]);

        $message = Message::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $user1->id,
            'conversation_id' => $conversation->id,
            'content' => 'Test broadcast name',
        ]);

        $event = new MessageSent($message);

        // Verify the event has a broadcastAs() method that returns 'MessageSent'
        $this->assertEquals('MessageSent', $event->broadcastAs());
    }

    public function test_message_cannot_be_sent_to_non_existent_conversation()
    {
        $user = User::factory()->create();
        $fakeConversationId = (string) \Illuminate\Support\Str::uuid();

        $response = $this->actingAs($user)->postJson(
            "/api/conversations/{$fakeConversationId}/messages",
            ['content' => 'Test message']
        );

        $response->assertStatus(404);
    }

    public function test_empty_message_is_not_sent()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $conversation = Conversation::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => 'private',
            'created_by' => $user1->id,
        ]);

        $conversation->participants()->attach([
            $user1->id => ['id' => (string) \Illuminate\Support\Str::uuid(), 'joined_at' => now()],
            $user2->id => ['id' => (string) \Illuminate\Support\Str::uuid(), 'joined_at' => now()],
        ]);

        $response = $this->actingAs($user1)->postJson(
            "/api/conversations/{$conversation->id}/messages",
            ['content' => '']
        );

        // Should return unprocessable entity
        $response->assertStatus(422);
        Event::assertNotDispatched(MessageSent::class);
    }
}
