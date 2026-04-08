<?php

namespace Tests\Feature;

use App\Jobs\ProcessChatMessageRealtime;
use App\Jobs\ProcessDocBuilderRealtime;
use App\Models\ChatMessage;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Facades\Bus;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RealtimeChatCommandTest extends TestCase
{
    public function test_chat_message_command_returns_accepted_and_dispatches_job(): void
    {
        Bus::fake();

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/chat/messages', [
            'message' => 'Write me a business plan',
            'type' => 'text',
            'model' => 'grok-4-fast-reasoning',
        ]);

        $response->assertAccepted()
            ->assertJsonStructure([
                'success',
                'conversation_id',
                'user_message_id',
                'assistant_message_id',
                'assistant_message' => ['id', 'role', 'status'],
            ]);

        $conversation = Conversation::query()->findOrFail($response->json('conversation_id'));
        $this->assertSame($user->id, $conversation->user_id);

        Bus::assertDispatched(ProcessChatMessageRealtime::class);
    }

    public function test_regenerate_command_returns_accepted_and_dispatches_job(): void
    {
        Bus::fake();

        $user = User::factory()->create();
        $conversation = Conversation::query()->create([
            'user_id' => $user->id,
            'title' => 'Existing chat',
            'context' => [],
        ]);

        $userMessage = ChatMessage::query()->create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'status' => 'completed',
            'type' => 'text',
            'content_markdown' => 'Tell me more',
            'content_text' => 'Tell me more',
        ]);

        $assistantMessage = ChatMessage::query()->create([
            'conversation_id' => $conversation->id,
            'reply_to_id' => $userMessage->id,
            'role' => 'assistant',
            'status' => 'completed',
            'type' => 'text',
            'content_markdown' => 'Old reply',
            'content_text' => 'Old reply',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/chat/messages/{$assistantMessage->id}/regenerate");

        $response->assertAccepted()
            ->assertJson([
                'success' => true,
                'conversation_id' => $conversation->id,
                'assistant_message_id' => $assistantMessage->id,
                'replace' => true,
            ]);

        Bus::assertDispatched(ProcessChatMessageRealtime::class);
    }

    public function test_doc_builder_command_returns_accepted_and_dispatches_job(): void
    {
        Bus::fake();

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/doc-builder/messages', [
            'message' => 'Draft a technical design document',
            'title' => 'System Design',
            'document_type' => 'technical',
            'model' => 'grok-4-fast-reasoning',
        ]);

        $response->assertAccepted()
            ->assertJsonStructure([
                'success',
                'conversation_id',
                'user_message_id',
                'assistant_message_id',
            ]);

        $conversation = Conversation::query()->findOrFail($response->json('conversation_id'));
        $this->assertSame('doc_builder', $conversation->mode);
        $this->assertSame('technical', $conversation->document_type);

        Bus::assertDispatched(ProcessDocBuilderRealtime::class);
    }
}
