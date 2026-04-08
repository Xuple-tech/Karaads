<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BroadcastChannelAuthTest extends TestCase
{
    public function test_user_can_authorize_their_own_user_channel(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/broadcasting/auth', [
            'socket_id' => '1234.5678',
            'channel_name' => "private-user.{$user->id}",
        ]);

        $response->assertOk();
        $this->assertArrayHasKey('auth', $response->json());
    }

    public function test_user_can_authorize_their_own_conversation_channel_and_not_others(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $conversation = Conversation::query()->create([
            'user_id' => $owner->id,
            'title' => 'Private thread',
            'context' => [],
        ]);

        Sanctum::actingAs($owner);
        $this->postJson('/broadcasting/auth', [
            'socket_id' => '1234.5678',
            'channel_name' => "private-conversation.{$conversation->id}",
        ])->assertOk();

        Sanctum::actingAs($other);
        $this->postJson('/broadcasting/auth', [
            'socket_id' => '1234.5678',
            'channel_name' => "private-conversation.{$conversation->id}",
        ])->assertForbidden();
    }
}
