<?php

namespace Tests\Feature;

use App\Contracts\ChatProvider;
use App\Models\ChatMessage;
use App\Models\User;
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
