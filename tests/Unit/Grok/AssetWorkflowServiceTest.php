<?php

namespace Tests\Unit\Grok;

use App\Models\Chat;
use App\Models\Conversation;
use App\Models\User;
use App\Services\Grok\AssetWorkflowService;
use App\Services\PythonDocumentGenerationService;
use App\Services\StabilityAIImageService;
use App\Services\SubscriptionService;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class AssetWorkflowServiceTest extends TestCase
{
    public function test_document_generation_resolves_user_from_chat_when_running_in_queue(): void
    {
        Auth::logout();

        $user = User::factory()->create();
        $conversation = Conversation::query()->create([
            'user_id' => $user->id,
            'title' => 'Queued chat',
            'context' => [],
        ]);

        $chat = Chat::query()->create([
            'conversation_id' => $conversation->id,
            'message' => 'Create a proposal',
            'role' => 'user',
            'type' => 'text',
        ]);

        $imageService = $this->createMock(StabilityAIImageService::class);
        $documentService = $this->createMock(PythonDocumentGenerationService::class);
        $subscriptionService = $this->createMock(SubscriptionService::class);

        $subscriptionService->expects($this->once())
            ->method('canGenerateDocuments')
            ->with($this->callback(fn (User $resolvedUser) => $resolvedUser->id === $user->id), 1)
            ->willReturn(['allowed' => true]);

        $documentService->expects($this->once())
            ->method('generateDocument')
            ->willReturn([
                'success' => true,
                'title' => 'Business Proposal',
                'format' => 'pdf',
                'filename' => 'business-proposal.pdf',
                'url' => 'https://example.test/business-proposal.pdf',
                'path' => 'user-content/documents/2026/04/08/business-proposal.pdf',
                'mime_type' => 'application/pdf',
                'size' => 2048,
                'document_type' => 'proposal',
                'generated_at' => now()->toISOString(),
            ]);

        $service = new AssetWorkflowService($imageService, $documentService, $subscriptionService);

        $result = $service->generatePdfDocument([
            'title' => 'Business Proposal',
            'content' => '# Proposal',
            'document_type' => 'proposal',
        ], $chat->id);

        $this->assertTrue($result['success']);
        $this->assertSame('business-proposal.pdf', $result['filename']);
        $this->assertSame('proposal', $result['document_type']);
    }
}
