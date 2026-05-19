<?php

namespace Tests\Feature;

use App\Contracts\ChatProvider;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\ChatFile;
use App\Models\Conversation;
use App\Models\User;
use App\Models\ChatToolRun;
use App\Services\Chat\ChatConversationService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ChatApiTest extends TestCase
{
    public function test_authenticated_user_can_create_and_list_chat_conversations(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $this
            ->postJson('/api/chat/conversations', [
                'title' => 'Launch plan',
            ])
            ->assertCreated()
            ->assertJsonPath('conversation.title', 'Launch plan');

        $this
            ->getJson('/api/chat/conversations')
            ->assertOk()
            ->assertJsonCount(1, 'conversations')
            ->assertJsonPath('conversations.0.title', 'Launch plan');
    }

    public function test_show_conversation_migrates_legacy_metadata_into_markdown_blocks(): void
    {
        Storage::fake('private');

        $user = User::factory()->create();
        $conversation = Conversation::create([
            'user_id' => $user->id,
            'title' => 'Legacy conversation',
            'context' => [],
        ]);

        $legacyUserMessage = Chat::create([
            'conversation_id' => $conversation->id,
            'message' => 'Find the latest market data',
            'role' => 'user',
            'metadata' => [],
        ]);

        $legacyAssistantMessage = Chat::create([
            'conversation_id' => $conversation->id,
            'message' => "## Market Summary\nRevenue increased sharply.",
            'role' => 'assistant',
            'metadata' => [
                'provider' => 'grok',
                'model' => 'grok-4-fast-reasoning',
                'references' => [
                    [
                        'title' => 'Quarterly Results',
                        'url' => 'https://example.com/results',
                        'snippet' => 'Quarterly revenue increased by 42%',
                    ],
                ],
                'tool_results' => [
                    [
                        'tool_name' => 'web_search',
                        'result' => 'Fetched current market context',
                    ],
                ],
            ],
        ]);

        Storage::disk('private')->put('legacy/chat/report.pdf', 'legacy file');

        ChatFile::create([
            'chat_id' => $legacyAssistantMessage->id,
            'user_id' => $user->id,
            'filename' => 'report.pdf',
            'filepath' => 'legacy/chat/report.pdf',
            'mime_type' => 'application/pdf',
            'file_size' => 11,
        ]);

        Sanctum::actingAs($user);

        $response = $this
            ->getJson("/api/chat/conversations/{$conversation->id}")
            ->assertOk()
            ->assertJsonPath('conversation.id', $conversation->id);

        $conversationPayload = app(ChatConversationService::class)->show($user, $conversation);
        $messages = $conversationPayload['messages'];

        $this->assertCount(2, $messages);
        $assistant = collect($messages)->firstWhere('role', 'assistant');

        $this->assertNotNull($assistant);
        $this->assertStringContainsString('## Market Summary', $assistant['content_markdown']);
        $this->assertStringContainsString('```kwati-tool', $assistant['content_markdown']);
        $this->assertStringContainsString('```kwati-sources', $assistant['content_markdown']);
        $this->assertStringContainsString('```kwati-attachments', $assistant['content_markdown']);
        $this->assertCount(1, $assistant['attachments']);
        $this->assertSame('report.pdf', $assistant['attachments'][0]['name']);
    }

    public function test_legacy_chat_routes_are_not_registered_anymore(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $this->get('/api/spa/conversations')->assertNotFound();
        $this->post('/create-two-step-challagene')->assertStatus(405);
    }

    public function test_authenticated_user_can_send_image_attachment_without_text(): void
    {
        Storage::fake('private');

        $this->app->bind(ChatProvider::class, fn () => new class implements ChatProvider
        {
            public function streamResponse(array $messages, array $tools, array $options, callable $onEvent): void
            {
                $onEvent('message.delta', ['content' => 'I can see the uploaded image.']);
                $onEvent('message.completed', []);
            }

            public function generateResponse(array $messages, array $tools, array $options): array
            {
                return ['content' => 'I can see the uploaded image.'];
            }

            public function generateTitle(string $prompt): string
            {
                return Str::limit($prompt, 60, '');
            }
        });

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->post('/api/chat/messages/stream', [
            'type' => 'text',
            'files' => [[
                'name' => 'logo.png',
                'type' => 'image/png',
                'data' => 'data:image/png;base64,' . base64_encode('fake-image'),
            ]],
        ], ['Accept' => 'text/event-stream']);

        $response->assertOk();
        $this->assertStringContainsString('I can see the uploaded image.', $response->streamedContent());

        $userMessage = ChatMessage::query()->where('role', 'user')->latest('created_at')->firstOrFail();
        $userMessage->load('attachments');

        $this->assertSame('Please analyze the uploaded image.', $userMessage->content_text);
        $this->assertCount(1, $userMessage->attachments);
        $this->assertSame('image', $userMessage->attachments->first()->kind);
        $this->assertSame('image/png', $userMessage->attachments->first()->mime_type);
    }

    public function test_relative_follow_up_image_prompt_reuses_previous_image_generation_context(): void
    {
        Storage::fake('private');

        $capture = (object) ['messages' => []];

        $this->app->bind(ChatProvider::class, fn () => new class($capture) implements ChatProvider
        {
            public function __construct(private object $capture)
            {
            }

            public function streamResponse(array $messages, array $tools, array $options, callable $onEvent): void
            {
                $this->capture->messages = $messages;

                $onEvent('message.delta', ['content' => 'Generating another image now.']);
                $onEvent('message.completed', []);
            }

            public function generateResponse(array $messages, array $tools, array $options): array
            {
                return ['content' => 'Generating another image now.'];
            }

            public function generateTitle(string $prompt): string
            {
                return 'Image follow-up';
            }
        });

        $user = User::factory()->create();
        $conversation = Conversation::create([
            'user_id' => $user->id,
            'title' => 'Image follow-up',
            'context' => [],
        ]);

        $firstUserMessage = ChatMessage::query()->create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'status' => 'completed',
            'type' => 'image',
            'content_markdown' => 'create a beautiful lady',
            'content_text' => 'create a beautiful lady',
        ]);

        $firstAssistantMessage = ChatMessage::query()->create([
            'conversation_id' => $conversation->id,
            'reply_to_id' => $firstUserMessage->id,
            'role' => 'assistant',
            'status' => 'completed',
            'provider' => 'grok',
            'model' => 'grok-4-fast-non-reasoning',
            'type' => 'image',
            'content_markdown' => '',
            'content_text' => '',
        ]);

        ChatToolRun::query()->create([
            'chat_message_id' => $firstAssistantMessage->id,
            'tool_name' => 'generate_image',
            'status' => 'completed',
            'summary' => 'Generated 1 image',
            'arguments' => [
                'user_prompt' => 'create a beautiful lady',
                'model' => 'sd3.5',
                'size' => '1024x1024',
            ],
            'result' => [
                'prompt' => 'create a beautiful lady',
                'images_count' => 1,
            ],
        ]);

        Sanctum::actingAs($user);

        $response = $this->post('/api/chat/messages/stream', [
            'conversation_id' => $conversation->id,
            'message' => 'create another image',
            'type' => 'image',
        ], ['Accept' => 'text/event-stream']);

        $response->assertOk();
        $response->streamedContent();

        $this->assertNotEmpty($capture->messages);

        $lastUserMessage = collect($capture->messages)->last(fn (array $message) => ($message['role'] ?? null) === 'user');

        $this->assertNotNull($lastUserMessage);
        $this->assertStringContainsString('create another image', (string) ($lastUserMessage['content'] ?? ''));
        $this->assertStringContainsString('Previous successful image prompt: create a beautiful lady', (string) ($lastUserMessage['content'] ?? ''));
        $this->assertStringContainsString('Previous model: sd3.5', (string) ($lastUserMessage['content'] ?? ''));
        $this->assertStringContainsString('Previous size: 1024x1024', (string) ($lastUserMessage['content'] ?? ''));
    }

    public function test_authenticated_user_can_clear_only_their_conversation_history(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Conversation::create(['user_id' => $user->id, 'title' => 'One', 'context' => []]);
        Conversation::create(['user_id' => $user->id, 'title' => 'Two', 'context' => []]);
        Conversation::create(['user_id' => $otherUser->id, 'title' => 'Other', 'context' => []]);

        Sanctum::actingAs($user);

        $this->deleteJson('/api/chat/conversations')
            ->assertOk()
            ->assertJsonPath('deleted_count', 2);

        $this->assertSame(0, Conversation::query()->where('user_id', $user->id)->count());
        $this->assertSame(1, Conversation::query()->where('user_id', $otherUser->id)->count());
    }

    public function test_authenticated_user_can_export_a_conversation_as_markdown(): void
    {
        $user = User::factory()->create();
        $conversation = Conversation::create([
            'user_id' => $user->id,
            'title' => 'Launch Plan',
            'context' => [],
        ]);

        ChatMessage::query()->create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'status' => 'completed',
            'type' => 'text',
            'content_markdown' => 'Outline the launch plan.',
            'content_text' => 'Outline the launch plan.',
        ]);

        Sanctum::actingAs($user);

        $response = $this->get("/api/chat/conversations/{$conversation->id}/export?format=md");

        $response->assertOk();
        $response->assertHeader('content-type', 'text/markdown; charset=UTF-8');
        $this->assertStringContainsString('attachment; filename="launch-plan.md"', (string) $response->headers->get('content-disposition'));
        $this->assertStringContainsString('# Launch Plan', $response->getContent());
        $this->assertStringContainsString('Outline the launch plan.', $response->getContent());
    }

    public function test_authenticated_user_can_export_a_conversation_as_json(): void
    {
        $user = User::factory()->create();
        $conversation = Conversation::create([
            'user_id' => $user->id,
            'title' => 'Quarterly Review',
            'context' => [],
        ]);

        ChatMessage::query()->create([
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'status' => 'completed',
            'type' => 'text',
            'content_markdown' => 'Summary ready.',
            'content_text' => 'Summary ready.',
        ]);

        Sanctum::actingAs($user);

        $response = $this->get("/api/chat/conversations/{$conversation->id}/export?format=json");

        $response->assertOk();
        $response->assertHeader('content-type', 'application/json; charset=UTF-8');
        $response->assertJsonPath('title', 'Quarterly Review');
        $response->assertJsonPath('messages.0.content_text', 'Summary ready.');
    }
}
