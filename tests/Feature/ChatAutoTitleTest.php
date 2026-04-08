<?php

namespace Tests\Feature;

use App\Contracts\ChatProvider;
use App\Models\ChatMessage;
use App\Models\Conversation;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ChatAutoTitleTest extends TestCase
{
    public function test_first_completed_assistant_reply_auto_generates_a_title(): void
    {
        $this->bindFakeProvider('Launch Strategy');

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->post('/api/chat/messages/stream', [
            'message' => 'Help me plan a product launch',
            'type' => 'text',
        ], ['Accept' => 'text/event-stream']);

        $response->assertOk();
        $response->streamedContent();

        $conversation = Conversation::query()->latest('created_at')->firstOrFail();

        $this->assertSame('Launch Strategy', $conversation->title);
        $this->assertTrue((bool) $conversation->ai_generated_title);
        $this->assertNotNull($conversation->title_generated_at);
    }

    public function test_manual_title_is_not_overwritten_by_auto_title_generation(): void
    {
        $this->bindFakeProvider('Should Not Win');

        $user = User::factory()->create();
        $conversation = Conversation::create([
            'user_id' => $user->id,
            'title' => 'Manual Title',
            'ai_generated_title' => false,
            'context' => [],
        ]);

        Sanctum::actingAs($user);

        $response = $this->post('/api/chat/messages/stream', [
            'conversation_id' => $conversation->id,
            'message' => 'Continue this conversation',
            'type' => 'text',
        ], ['Accept' => 'text/event-stream']);

        $response->assertOk();
        $response->streamedContent();

        $this->assertSame('Manual Title', $conversation->fresh()->title);
        $this->assertFalse((bool) $conversation->fresh()->ai_generated_title);
    }

    public function test_title_generation_failure_does_not_fail_message_completion(): void
    {
        $this->bindFakeProvider('', true);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->post('/api/chat/messages/stream', [
            'message' => 'Write a short note',
            'type' => 'text',
        ], ['Accept' => 'text/event-stream']);

        $response->assertOk();
        $response->streamedContent();

        $assistant = ChatMessage::query()->where('role', 'assistant')->latest('created_at')->firstOrFail();
        $conversation = Conversation::query()->latest('created_at')->firstOrFail();

        $this->assertSame('completed', $assistant->status);
        $this->assertSame('New chat', $conversation->title);
    }

    private function bindFakeProvider(string $generatedTitle, bool $throwOnTitle = false): void
    {
        $this->app->bind(ChatProvider::class, fn () => new class($generatedTitle, $throwOnTitle) implements ChatProvider
        {
            public function __construct(
                private readonly string $generatedTitle,
                private readonly bool $throwOnTitle,
            ) {
            }

            public function streamResponse(array $messages, array $tools, array $options, callable $onEvent): void
            {
                $onEvent('message.delta', [
                    'content' => 'Assistant reply body.',
                ]);
                $onEvent('message.completed', []);
            }

            public function generateResponse(array $messages, array $tools, array $options): array
            {
                return ['content' => ''];
            }

            public function generateTitle(string $prompt): string
            {
                if ($this->throwOnTitle) {
                    throw new \RuntimeException('Title service unavailable');
                }

                return $this->generatedTitle;
            }
        });
    }
}
