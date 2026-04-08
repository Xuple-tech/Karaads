<?php

namespace App\Services;

use App\Models\MetaAccount;
use App\Models\MetaAutomationPreference;
use App\Models\MetaConversation;
use App\Models\MetaMessage;
use App\Models\MetaMessageDraft;
use Illuminate\Support\Facades\Log;

class MetaMessageAnalyzerService
{
    public function __construct(private GrokApiService $grokService) {}

    public function analyzeMessage(MetaMessage $message, MetaAccount $account): array
    {
        try {
            $analysis = $this->grokService->generateChat(
                prompt: $this->buildAnalysisPrompt($message->content),
                model: 'grok-4-fast-non-reasoning',
                format: ['type' => 'json_object'],
            );

            $result = json_decode($analysis, true);

            return [
                'sentiment' => $result['sentiment'] ?? 'neutral',
                'category' => $result['category'] ?? 'other',
                'confidence_score' => (float) ($result['confidence_score'] ?? 50),
                'raw_analysis' => $analysis,
            ];
        } catch (\Throwable $e) {
            Log::error('Meta message analysis failed', [
                'message_id' => $message->id,
                'account_id' => $account->id,
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

    public function draftReply(MetaMessage $message, MetaAccount $account): ?MetaMessageDraft
    {
        try {
            $preference = $this->getPreference($account);
            $analysis = $this->analyzeMessage($message, $account);
            $context = $this->getConversationContext($message);
            $prompt = $this->buildDraftPrompt($message->content, $analysis, $preference);
            $systemPrompt = $this->buildSystemPrompt($preference, $context);

            $response = trim($this->grokService->generateChat(
                prompt: $prompt,
                model: 'grok-4-fast-non-reasoning',
                history: [],
                customSystemPrompt: $systemPrompt,
            ));

            $conversation = MetaConversation::where('conversation_id', $message->conversation_id)
                ->where('meta_account_id', $account->id)
                ->firstOrCreate(
                    ['conversation_id' => $message->conversation_id, 'meta_account_id' => $account->id],
                    [
                        'participant_id' => $message->sender_id,
                        'participant_name' => $message->sender_name,
                    ]
                );

            return MetaMessageDraft::create([
                'meta_message_id' => $message->id,
                'meta_conversation_id' => $conversation->id,
                'original_message' => $message->content,
                'draft_reply' => $response,
                'ai_analysis' => $analysis['raw_analysis'],
                'sentiment' => $analysis['sentiment'],
                'category' => $analysis['category'],
                'confidence_score' => $analysis['confidence_score'],
                'status' => $preference->require_approval_before_send ? 'draft' : 'approved',
                'auto_approved' => ! $preference->require_approval_before_send,
            ]);
        } catch (\Throwable $e) {
            Log::error('Meta draft generation failed', [
                'message_id' => $message->id,
                'account_id' => $account->id,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }

    private function getPreference(MetaAccount $account): MetaAutomationPreference
    {
        $preference = MetaAutomationPreference::firstOrCreate(
            ['user_id' => $account->user_id, 'meta_account_id' => $account->id],
            [
                'enable_auto_reply' => false,
                'enable_message_analysis' => true,
                'require_approval_before_send' => true,
                'reply_tone' => 'professional',
            ]
        );

        return $preference->loadMissing('aiMode');
    }

    private function buildAnalysisPrompt(string $message): string
    {
        return <<<PROMPT
Analyze the customer message below and return only JSON with these keys:
- sentiment: positive, negative, or neutral
- category: question, complaint, feedback, order, or other
- confidence_score: number from 0 to 100

Message:
{$message}
PROMPT;
    }

    private function buildDraftPrompt(string $message, array $analysis, MetaAutomationPreference $preference): string
    {
        $tone = strtolower($preference->reply_tone);

        return <<<PROMPT
Draft a {$tone} response to this customer message.

Detected sentiment: {$analysis['sentiment']}
Detected category: {$analysis['category']}
Confidence score: {$analysis['confidence_score']}

Customer message:
{$message}

Keep the response concise, useful, and ready to send on WhatsApp.
PROMPT;
    }

    private function buildSystemPrompt(MetaAutomationPreference $preference, string $context): string
    {
        $basePrompt = '';

        if ($preference->aiMode?->system_prompt) {
            $basePrompt = trim($preference->aiMode->system_prompt) . "\n\n";
        }

        if ($preference->custom_instructions) {
            $basePrompt .= 'Additional business instructions: ' . trim($preference->custom_instructions) . "\n\n";
        } elseif (! $preference->aiMode) {
            $basePrompt = "You are a helpful business assistant responding to customer messages. Keep responses brief and professional.\n\n";
        }

        $basePrompt .= 'Response tone: ' . ucfirst($preference->reply_tone) . "\n\n";
        $basePrompt .= $context;

        return trim($basePrompt);
    }

    private function getConversationContext(MetaMessage $message): string
    {
        $previousMessages = MetaMessage::where('conversation_id', $message->conversation_id)
            ->where('meta_account_id', $message->meta_account_id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->reverse();

        $lines = ["Recent conversation:"];

        foreach ($previousMessages as $previousMessage) {
            $role = $previousMessage->isIncoming() ? 'Customer' : 'Business';
            $lines[] = "{$role}: {$previousMessage->content}";
        }

        return implode("\n", $lines);
    }
}
