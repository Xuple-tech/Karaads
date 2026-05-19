<?php

namespace Tests\Feature;

use App\Contracts\ChatProvider;
use App\Models\ChatMessage;
use App\Models\ChatToolRun;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ChatDocumentToolTest extends TestCase
{
    public function test_pdf_tool_completion_creates_a_file_attachment(): void
    {
        $this->bindFakeProvider('generate_pdf_document', [
            'title' => 'Board Proposal',
            'filename' => 'board-proposal.pdf',
            'url' => 'https://example.test/board-proposal.pdf',
            'path' => 'user-content/documents/2026/04/04/board-proposal.pdf',
            'format' => 'pdf',
            'mime_type' => 'application/pdf',
            'document_type' => 'proposal',
            'size' => 2048,
            'generated_at' => now()->toISOString(),
        ]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->post('/api/chat/messages/stream', [
            'message' => 'Create a board proposal as a PDF',
            'type' => 'text',
            'model' => 'grok-4-fast-reasoning',
        ], ['Accept' => 'text/event-stream']);

        $response->assertOk();
        $this->assertStringContainsString('event: attachment.created', $response->streamedContent());

        /** @var ChatMessage $assistant */
        $assistant = ChatMessage::query()->where('role', 'assistant')->latest('created_at')->firstOrFail();
        $assistant->load('attachments');

        $this->assertCount(1, $assistant->attachments);
        $this->assertSame('file', $assistant->attachments->first()->kind);
        $this->assertSame('board-proposal.pdf', $assistant->attachments->first()->name);
        $this->assertStringContainsString('kwati-attachments', $assistant->content_markdown);
    }

    public function test_docx_tool_completion_creates_a_file_attachment(): void
    {
        $this->bindFakeProvider('generate_word_document', [
            'title' => 'Quarterly Report',
            'filename' => 'quarterly-report.docx',
            'url' => 'https://example.test/quarterly-report.docx',
            'path' => 'user-content/documents/2026/04/04/quarterly-report.docx',
            'format' => 'docx',
            'mime_type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'document_type' => 'report',
            'size' => 1024,
            'generated_at' => now()->toISOString(),
        ]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->post('/api/chat/messages/stream', [
            'message' => 'Create a quarterly report in DOCX',
            'type' => 'text',
            'model' => 'grok-4-fast-reasoning',
        ], ['Accept' => 'text/event-stream']);

        $response->assertOk();
        $this->assertStringContainsString('event: attachment.created', $response->streamedContent());

        /** @var ChatMessage $assistant */
        $assistant = ChatMessage::query()->where('role', 'assistant')->latest('created_at')->firstOrFail();
        $assistant->load('attachments');

        $this->assertCount(1, $assistant->attachments);
        $this->assertSame('quarterly-report.docx', $assistant->attachments->first()->name);
        $this->assertStringContainsString('kwati-attachments', $assistant->content_markdown);
    }

    public function test_powerpoint_tool_completion_creates_a_file_attachment(): void
    {
        $this->bindFakeProvider('generate_powerpoint_presentation', [
            'title' => 'Investor Pitch',
            'filename' => 'investor-pitch.pptx',
            'url' => 'https://example.test/investor-pitch.pptx',
            'path' => 'user-content/documents/2026/04/04/investor-pitch.pptx',
            'format' => 'pptx',
            'mime_type' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'document_type' => 'pitch_deck',
            'size' => 4096,
            'generated_at' => now()->toISOString(),
        ]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->post('/api/chat/messages/stream', [
            'message' => 'Create an investor pitch deck as PowerPoint',
            'type' => 'text',
            'model' => 'grok-4-fast-reasoning',
        ], ['Accept' => 'text/event-stream']);

        $response->assertOk();
        $this->assertStringContainsString('event: attachment.created', $response->streamedContent());

        /** @var ChatMessage $assistant */
        $assistant = ChatMessage::query()->where('role', 'assistant')->latest('created_at')->firstOrFail();
        $assistant->load('attachments');

        $this->assertCount(1, $assistant->attachments);
        $this->assertSame('investor-pitch.pptx', $assistant->attachments->first()->name);
        $this->assertStringContainsString('kwati-attachments', $assistant->content_markdown);
    }

    public function test_follow_up_logo_upload_gets_previous_powerpoint_context(): void
    {
        Storage::fake('private');

        $capture = (object) [
            'messages' => [],
            'options' => [],
        ];

        $this->app->bind(ChatProvider::class, fn () => new class($capture) implements ChatProvider
        {
            public function __construct(private object $capture)
            {
            }

            public function streamResponse(array $messages, array $tools, array $options, callable $onEvent): void
            {
                $this->capture->messages = $messages;
                $this->capture->options = $options;

                $onEvent('message.delta', ['content' => 'I will recreate the PowerPoint with your logo.']);
                $onEvent('message.completed', []);
            }

            public function generateResponse(array $messages, array $tools, array $options): array
            {
                return ['content' => ''];
            }

            public function generateTitle(string $prompt): string
            {
                return Str::limit($prompt, 60, '');
            }
        });

        $user = User::factory()->create();
        $conversation = Conversation::create([
            'user_id' => $user->id,
            'title' => 'Investor Pitch',
            'context' => [],
        ]);

        ChatMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'status' => 'completed',
            'type' => 'text',
            'content_markdown' => 'Create an investor pitch deck as PowerPoint',
            'content_text' => 'Create an investor pitch deck as PowerPoint',
        ]);

        $assistant = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'status' => 'completed',
            'provider' => 'grok',
            'model' => 'grok-4-fast-reasoning',
            'type' => 'text',
            'content_markdown' => 'Created investor-pitch.pptx',
            'content_text' => 'Created investor-pitch.pptx',
        ]);

        ChatToolRun::create([
            'chat_message_id' => $assistant->id,
            'tool_name' => 'generate_powerpoint_presentation',
            'status' => 'completed',
            'summary' => 'Created PowerPoint',
            'arguments' => [
                'title' => 'Investor Pitch',
                'content' => "# Market Opportunity\n- TAM: 500\n- SAM: 125\n\n# Pie Chart: Revenue Mix\n- Product: 70\n- Services: 30",
                'document_type' => 'pitch_deck',
                'design_style' => 'creative',
                'logo_image' => [
                    'name' => 'old-logo.png',
                    'data' => 'data:image/png;base64,'.base64_encode('old-logo-bytes'),
                ],
            ],
            'result' => [
                'filename' => 'investor-pitch.pptx',
                'format' => 'pptx',
                'design_style' => 'creative',
                'has_logo' => false,
            ],
        ]);

        Sanctum::actingAs($user);

        $response = $this->post('/api/chat/messages/stream', [
            'conversation_id' => $conversation->id,
            'message' => 'Add this logo to the PowerPoint and create it again',
            'type' => 'text',
            'model' => 'grok-4',
            'files' => [[
                'name' => 'new-logo.png',
                'type' => 'image/png',
                'data' => 'data:image/png;base64,'.base64_encode('new-logo-bytes'),
            ]],
        ], ['Accept' => 'text/event-stream']);

        $response->assertOk();
        $response->streamedContent();

        $providerHistory = json_encode($capture->messages, JSON_UNESCAPED_SLASHES);
        $this->assertStringContainsString('Previous PowerPoint generation context', $providerHistory);
        $this->assertStringContainsString('Investor Pitch', $providerHistory);
        $this->assertStringContainsString('# Market Opportunity', $providerHistory);
        $this->assertStringContainsString('design_style', $providerHistory);
        $this->assertStringContainsString('creative', $providerHistory);
        $this->assertStringNotContainsString('old-logo-bytes', $providerHistory);
        $this->assertStringNotContainsString('logo_image', $providerHistory);

        $this->assertCount(1, $capture->options['files']);
        $this->assertSame('new-logo.png', $capture->options['files'][0]['name']);
    }

    public function test_failed_document_tool_marks_message_failed(): void
    {
        $this->app->bind(ChatProvider::class, fn () => new class implements ChatProvider
        {
            public function streamResponse(array $messages, array $tools, array $options, callable $onEvent): void
            {
                $onEvent('tool.started', [
                    'tool_name' => 'generate_pdf_document',
                    'message' => 'Generating PDF',
                    'arguments' => [],
                ]);
                $onEvent('tool.failed', [
                    'tool_name' => 'generate_pdf_document',
                    'error' => 'Worker crashed',
                ]);
                $onEvent('message.failed', [
                    'error' => 'Worker crashed',
                ]);
            }

            public function generateResponse(array $messages, array $tools, array $options): array
            {
                return ['content' => ''];
            }

            public function generateTitle(string $prompt): string
            {
                return Str::limit($prompt, 60, '');
            }
        });

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->post('/api/chat/messages/stream', [
            'message' => 'Create a PDF',
            'type' => 'text',
        ], ['Accept' => 'text/event-stream']);

        $response->assertOk();
        $this->assertStringContainsString('event: message.failed', $response->streamedContent());

        /** @var ChatMessage $assistant */
        $assistant = ChatMessage::query()->where('role', 'assistant')->latest('created_at')->firstOrFail();
        $assistant->load('attachments');

        $this->assertSame('failed', $assistant->status);
        $this->assertCount(0, $assistant->attachments);
    }

    private function bindFakeProvider(string $toolName, array $result): void
    {
        $this->app->bind(ChatProvider::class, fn () => new class($toolName, $result) implements ChatProvider
        {
            public function __construct(
                private readonly string $toolName,
                private readonly array $result,
            ) {
            }

            public function streamResponse(array $messages, array $tools, array $options, callable $onEvent): void
            {
                $onEvent('tool.started', [
                    'tool_name' => $this->toolName,
                    'message' => 'Generating document',
                    'arguments' => [],
                ]);
                $onEvent('tool.completed', [
                    'tool_name' => $this->toolName,
                    'summary' => 'Created document',
                    'result' => $this->result,
                ]);
                $onEvent('message.completed', []);
            }

            public function generateResponse(array $messages, array $tools, array $options): array
            {
                return ['content' => ''];
            }

            public function generateTitle(string $prompt): string
            {
                return Str::limit($prompt, 60, '');
            }
        });
    }
}
