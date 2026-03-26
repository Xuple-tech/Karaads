<?php

namespace App\Services;

use App\Models\MetaMessage;
use App\Models\MetaConversation;
use App\Models\MetaMessageDraft;
use App\Models\MetaAutomationPreference;
use App\Models\MetaAccount;
use Illuminate\Support\Facades\Log;

class MetaMessageAnalyzerService
{
    private GrokApiService $grokService;

    public function __construct(GrokApiService $grokService)
    {
        $this->grokService = $grokService;
    }

    /**
     * Analyze incoming message and extract sentiment, category
     */
    public function analyzeMessage(MetaMessage $message, MetaAccount $account): array
    {
        try {
            $analysisPrompt = $this->buildAnalysisPrompt($message->content);

            // Call GROK API for analysis
            $analysis = $this->grokService->chat([
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an expert message analyzer. Analyze the given message and provide JSON response with sentiment (positive/negative/neutral), category (question/complaint/feedback/order/other), and confidence_score (0-100).',
                    ],
                    [
                        'role' => 'user',
                        'content' => $analysisPrompt,
                    ],
                ],
                'response_format' => 'json_object',
                'temperature' => 0.3,
            ]);

            $result = json_decode($analysis, true);

            return [
                'sentiment' => $result['sentiment'] ?? 'neutral',
                'category' => $result['category'] ?? 'other',
                'confidence_score' => (float) ($result['confidence_score'] ?? 50),
                'raw_analysis' => $analysis,
            ];
        } catch (\Throwable $e) {
            Log::error('Message analysis failed', [
                'message_id' => $message->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'sentiment' => 'neutral',
                'category' => 'other',
                'confidence_score' => 0,
                'raw_analysis' => null,
            ];
        }
    }

    /**
     * Draft an AI response to a message
     */
    public function draftReply(MetaMessage $message, MetaAccount $account): ?MetaMessageDraft
    {
        try {
            $preference = $this->getPreference($account);

            // First analyze the message
            $analysis = $this->analyzeMessage($message, $account);

            // Build the draft prompt
            $draftPrompt = $this->buildDraftPrompt(
                $message->content,
                $analysis,
                $preference
            );

            // Get conversation context
            $context = $this->getConversationContext($message);

            // Call GROK API to draft response
            $response = $this->grokService->chat([
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $this->buildSystemPrompt($preference, $context),
                    ],
                    [
                        'role' => 'user',
                        'content' => $draftPrompt,
                    ],
                ],
                'temperature' => 0.7,
                'max_tokens' => 500,
            ]);

            // Create draft record
            $conversation = MetaConversation::where('conversation_id', $message->conversation_id)
                ->where('meta_account_id', $account->id)
                ->firstOrCreate(
                    ['conversation_id' => $message->conversation_id, 'meta_account_id' => $account->id],
                    [
                        'participant_id' => $message->sender_id,
                        'participant_name' => $message->sender_name,
                    ]
                );

            $draft = MetaMessageDraft::create([
                'meta_message_id' => $message->id,
                'meta_conversation_id' => $conversation->id,
                'original_message' => $message->content,
                'draft_reply' => $response,
                'ai_analysis' => $analysis['raw_analysis'],
                'sentiment' => $analysis['sentiment'],
                'category' => $analysis['category'],
                'confidence_score' => $analysis['confidence_score'],
                'status' => $preference->require_approval_before_send ? 'draft' : 'approved',
                'auto_approved' => !$preference->require_approval_before_send,
            ]);

            Log::info('Message draft created', [
                'draft_id' => $draft->id,
                'message_id' => $message->id,
                'status' => $draft->status,
            ]);

            return $draft;
        } catch (\Throwable $e) {
            Log::error('Draft generation failed', [
                'message_id' => $message->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    /**
     * Get or create automation preference for account
     */
    private function getPreference(MetaAccount $account): MetaAutomationPreference
    {
        return MetaAutomationPreference::firstOrCreate(
            ['user_id' => $account->user_id, 'meta_account_id' => $account->id],
            [
                'enable_auto_reply' => false,
                'enable_message_analysis' => true,
                'require_approval_before_send' => true,
                'reply_tone' => 'professional',
            ]
        );
    }

    /**
     * Build analysis prompt
     */
    private function buildAnalysisPrompt(string $message): string
    {
        return "Analyze this message and respond with JSON containing: sentiment (positive/negative/neutral), category (question/complaint/feedback/order/other), and confidence_score (0-100):\n\n{$message}";
    }

    /**
     * Build draft prompt
     */
    private function buildDraftPrompt(string $message, array $analysis, MetaAutomationPreference $preference): string
    {
        $tone = strtolower($preference->reply_tone);

        return "Draft a {$tone} response to this message. Sentiment: {$analysis['sentiment']}, Category: {$analysis['category']}. Message: {$message}";
    }

    /**
     * Build system prompt with instructions
     */
    private function buildSystemPrompt(MetaAutomationPreference $preference, string $context): string
    {
        $basePrompt = "You are a helpful customer service AI assistant.";

        if ($preference->custom_instructions) {
            $basePrompt .= "\n\nCustom Instructions: " . $preference->custom_instructions;
        }

        $basePrompt .= "\n\nResponse Tone: " . ucfirst($preference->reply_tone);
        $basePrompt .= "\n\nPrevious Context:\n" . $context;

        return $basePrompt;
    }

    /**
     * Get conversation context from previous messages
     */
    private function getConversationContext(MetaMessage $message): string
    {
        $previousMessages = MetaMessage::where('conversation_id', $message->conversation_id)
            ->where('meta_account_id', $message->meta_account_id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->reverse();

        $context = "Recent conversation:\n";

        foreach ($previousMessages as $msg) {
            $role = $msg->isIncoming() ? "Customer" : "You";
            $context .= "{$role}: {$msg->content}\n";
        }

        return $context;
    }

    /**
     * Get sentiment emoji for display
     */
    public function getSentimentEmoji(string $sentiment): string
    {
        return match ($sentiment) {
            'positive' => '😊',
            'negative' => '😞',
            'neutral' => '😐',
            default => '❓',
        };
    }

    /**
     * Get category icon
     */
    public function getCategoryIcon(string $category): string
    {
        return match ($category) {
            'question' => '❓',
            'complaint' => '😠',
            'feedback' => '💬',
            'order' => '📦',
            'other' => '📌',
            default => '📝',
        };
    }
}
