<?php

namespace Tests\Feature;

use App\Models\Chat;
use App\Models\ChatFile;
use App\Models\Conversation;
use App\Models\User;
use App\Services\Chat\ChatConversationService;
use Illuminate\Support\Facades\Storage;
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
}
