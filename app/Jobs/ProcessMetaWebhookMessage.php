<?php

namespace App\Jobs;

use App\Models\MetaMessage;
use App\Models\MetaConversation;
use App\Models\MetaAccount;
use App\Models\MetaMessageDraft;
use App\Services\GrokApiService;
use App\Services\MetaApiService;
use App\Services\MetaMessageAnalyzerService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessMetaWebhookMessage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected MetaMessage $message;
    protected MetaAccount $account;
    protected MetaConversation $conversation;

    public $tries = 3;
    public $backoff = [10, 60, 300]; // Exponential backoff: 10s, 60s, 5min
    public $timeout = 120;

    /**
     * Create a new job instance.
     */
    public function __construct(MetaMessage $message, MetaAccount $account, MetaConversation $conversation)
    {
        $this->message = $message;
        $this->account = $account;
        $this->conversation = $conversation;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info('Processing Meta webhook message', [
                'message_id' => $this->message->id,
                'account_id' => $this->account->id,
            ]);

            // Step 1: Analyze the incoming message
            $analysis = $this->analyzeMessage();
            if (!$analysis) {
                Log::warning('Message analysis failed', ['message_id' => $this->message->id]);
                return;
            }

            // Step 2: Check if auto-reply is enabled for this account
            $preferences = $this->account->automationPreferences()->first();
            if (!$preferences || !$preferences->auto_reply_enabled) {
                Log::info('Auto-reply disabled for account', ['account_id' => $this->account->id]);
                $this->message->update(['processed' => true]);
                return;
            }

            // Step 3: Check rate limiting (don't spam)
            if ($this->isRateLimited()) {
                Log::info('Rate limit reached, skipping auto-reply', ['account_id' => $this->account->id]);
                return;
            }

            // Step 4: Generate AI-powered response using analysis
            $response = $this->generateResponse($analysis, $preferences);
            if (!$response) {
                Log::warning('Response generation failed', ['message_id' => $this->message->id]);
                return;
            }

            // Step 5: Create draft or send directly based on preference
            if ($preferences->require_approval) {
                $this->createDraftForApproval($response, $analysis);
            } else {
                $this->sendReplyDirect($response, $analysis);
            }

            // Step 6: Mark as processed
            $this->message->update(['processed' => true]);

        } catch (\Exception $e) {
            Log::error('Error processing Meta webhook message', [
                'message_id' => $this->message->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e; // Will retry based on $tries and $backoff
        }
    }

    /**
     * Analyze message using AI service
     */
    protected function analyzeMessage(): ?array
    {
        try {
            $analyzer = app(MetaMessageAnalyzerService::class);

            // Get conversation context (last 3 messages)
            $context = $this->conversation->messages()
                ->orderByDesc('received_at')
                ->limit(3)
                ->get()
                ->reverse()
                ->map(fn($m) => $m->content)
                ->implode(' ');

            return $analyzer->analyze(
                message: $this->message->content,
                context: $context,
                platform: $this->account->platform,
            );
        } catch (\Exception $e) {
            Log::error('Message analysis error', [
                'message_id' => $this->message->id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Check if we're rate limited (don't send more than 1 reply per hour)
     */
    protected function isRateLimited(): bool
    {
        $lastReply = $this->conversation->messages()
            ->where('sender_id', $this->account->platform_account_id)
            ->where('created_at', '>', now()->subHour())
            ->latest()
            ->first();

        return $lastReply !== null;
    }

    /**
     * Generate response based on analysis and preferences
     */
    protected function generateResponse(array $analysis, $preferences): ?string
    {
        try {
            // Build context for response generation
            $tone = $preferences->tone ?? 'professional';
            $customPrompt = $preferences->custom_prompt ?? null;

            // Get conversation history for context
            $history = $this->conversation->messages()
                ->orderBy('received_at')
                ->limit(5)
                ->get()
                ->map(fn($m) => [
                    'role' => $m->sender_id === $this->account->platform_account_id ? 'assistant' : 'user',
                    'content' => $m->content,
                ])
                ->toArray();

            // Use the primary chat service for automated reply generation.
            $grokService = app(GrokApiService::class);

            $prompt = $this->buildPrompt($analysis, $tone, $customPrompt);

            $response = $grokService->generateChat(
                prompt: $prompt,
                model: 'grok-4-fast-reasoning',
                history: $history,
            );

            return $response;

        } catch (\Exception $e) {
            Log::error('Response generation error', [
                'message_id' => $this->message->id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Build the prompt for AI response generation
     */
    protected function buildPrompt(array $analysis, string $tone, ?string $customPrompt): string
    {
        $basePrompt = $customPrompt ?? "You are a helpful business assistant responding to customer messages. Keep responses brief and professional.";

        $sentiment = $analysis['sentiment'] ?? 'neutral';
        $category = $analysis['category'] ?? 'general';
        $confidence = $analysis['confidence'] ?? 0;

        $prompt = "
CONTEXT:
- Customer Sentiment: {$sentiment}
- Message Category: {$category}
- Confidence Score: {$confidence}%
- Tone: " . ucfirst($tone) . "

INSTRUCTIONS:
{$basePrompt}

INCOMING MESSAGE:
{$this->message->content}

Generate a brief, {$tone} response that addresses the customer's message. Keep it under 280 characters for best compatibility.
";

        return trim($prompt);
    }

    /**
     * Create draft for manual approval
     */
    protected function createDraftForApproval(string $response, array $analysis): void
    {
        try {
            $draft = MetaMessageDraft::create([
                'conversation_id' => $this->conversation->id,
                'account_id' => $this->account->id,
                'content' => $response,
                'sentiment' => $analysis['sentiment'] ?? 'neutral',
                'category' => $analysis['category'] ?? 'general',
                'confidence' => $analysis['confidence'] ?? 0,
                'status' => 'pending_review',
                'triggered_by_webhook' => true,
                'analysis_data' => json_encode($analysis),
            ]);

            Log::info('Draft created for approval', [
                'draft_id' => $draft->id,
                'message_id' => $this->message->id,
            ]);

            // TODO: Notify user via Inertia/WebSocket that draft is ready
        } catch (\Exception $e) {
            Log::error('Failed to create draft', [
                'message_id' => $this->message->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send reply directly without approval
     */
    protected function sendReplyDirect(string $response, array $analysis): void
    {
        try {
            $metaApiService = app(MetaApiService::class);

            // Send via Meta API
            $result = $metaApiService->sendMessage(
                token: $this->account->getDecryptedAccessToken(),
                recipientId: $this->conversation->sender_id,
                message: $response,
                platform: $this->account->platform,
            );

            if ($result && $result['message_id'] ?? null) {
                // Log the sent message
                MetaMessage::create([
                    'conversation_id' => $this->conversation->id,
                    'account_id' => $this->account->id,
                    'message_id' => $result['message_id'],
                    'sender_id' => $this->account->platform_account_id,
                    'content' => $response,
                    'message_type' => 'text',
                    'received_at' => now(),
                    'processed' => true,
                    'auto_reply' => true,
                ]);

                Log::info('Auto-reply sent', [
                    'message_id' => $this->message->id,
                    'reply_id' => $result['message_id'],
                ]);

                // Log to automation log
                $this->logAutomationActivity('auto_reply_sent', $analysis);

            } else {
                Log::error('Failed to send auto-reply', [
                    'message_id' => $this->message->id,
                    'api_result' => $result,
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Error sending direct reply', [
                'message_id' => $this->message->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Log automation activity for audit trail
     */
    protected function logAutomationActivity(string $action, array $analysis): void
    {
        try {
            \App\Models\MetaAutomationLog::create([
                'account_id' => $this->account->id,
                'conversation_id' => $this->conversation->id,
                'message_id' => $this->message->id,
                'action' => $action,
                'data' => json_encode([
                    'sentiment' => $analysis['sentiment'] ?? null,
                    'category' => $analysis['category'] ?? null,
                    'confidence' => $analysis['confidence'] ?? null,
                ]),
            ]);
        } catch (\Exception $e) {
            Log::warning('Failed to log automation activity', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Handle failed job
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessMetaWebhookMessage job failed', [
            'message_id' => $this->message->id,
            'account_id' => $this->account->id,
            'error' => $exception->getMessage(),
        ]);

        // TODO: Send notification to user that automation failed
    }
}
