<?php

namespace App\Services;

use App\Models\MetaAccount;
use App\Models\MetaAutomationPreference;
use App\Models\MetaConversation;
use App\Models\MetaMessage;
use App\Models\MetaMessageDraft;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class MetaMessageAnalyzerService
{
    public function __construct(private GrokApiService $grokService) {}

    public function analyzeMessage(MetaMessage $message, MetaAccount $account): array
    {
        try {
            $memory = $this->getRelevantConversationMemory($message);
            $plan = $this->buildPlan($message->content);

            $analysis = $this->grokService->generateChat(
                prompt: $this->buildAnalysisPrompt($message->content, $memory, $plan),
                model: 'grok-4-fast-non-reasoning',
                format: ['type' => 'json_object'],
            );

            $result = $this->normalizeAnalysisResult(json_decode($analysis, true) ?: []);
            $result['plan'] = $plan;
            $result['memory'] = $memory;
            $result['trace'] = $this->buildTrace($message->content, $plan, $memory, $result);

            return [
                'sentiment' => $result['sentiment'] ?? 'neutral',
                'category' => $result['category'] ?? 'other',
                'confidence_score' => (float) ($result['confidence_score'] ?? 50),
                'raw_analysis' => json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                'intent' => $result['intent'] ?? 'general_inquiry',
                'priority' => $result['priority'] ?? 'normal',
                'reply_goal' => $result['reply_goal'] ?? 'answer_helpfully',
                'plan' => $plan,
                'memory' => $memory,
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
            $context = $this->getConversationContext($message, $analysis['memory'] ?? []);
            $prompt = $this->buildDraftPrompt($message->content, $analysis, $preference, $context);
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

    private function buildAnalysisPrompt(string $message, array $memory, array $plan): string
    {
        $memoryBlock = $this->formatMemoryBlock($memory);
        $planBlock = $this->formatPlanBlock($plan);

        return <<<PROMPT
Analyze the customer message below and return only JSON with these keys:
- sentiment: positive, negative, or neutral
- category: question, complaint, feedback, order, or other
- confidence_score: number from 0 to 100
- intent: short snake_case label describing what the customer wants
- priority: low, normal, or high
- reply_goal: one short sentence describing the ideal reply outcome
- key_points: array of short bullet-sized strings

Relevant conversation memory:
{$memoryBlock}

Execution plan:
{$planBlock}

Message:
{$message}
PROMPT;
    }

    private function buildDraftPrompt(string $message, array $analysis, MetaAutomationPreference $preference, string $context): string
    {
        $tone = strtolower($preference->reply_tone);
        $keyPoints = implode("\n", array_map(
            fn (string $point): string => "- {$point}",
            Arr::wrap($analysis['key_points'] ?? [])
        ));
        $planBlock = $this->formatPlanBlock($analysis['plan'] ?? []);

        return <<<PROMPT
Draft a {$tone} response to this customer message.

Detected sentiment: {$analysis['sentiment']}
Detected category: {$analysis['category']}
Confidence score: {$analysis['confidence_score']}
Detected intent: {$analysis['intent']}
Priority: {$analysis['priority']}
Reply goal: {$analysis['reply_goal']}

Key points to address:
{$keyPoints}

Execution plan:
{$planBlock}

Conversation context:
{$context}

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

    private function getConversationContext(MetaMessage $message, array $memory = []): string
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

        if ($memory !== []) {
            $lines[] = '';
            $lines[] = 'Most relevant memory:';

            foreach ($memory as $item) {
                $score = number_format((float) ($item['score'] ?? 0), 2);
                $lines[] = sprintf(
                    '- [%s | score %s] %s',
                    $item['role'] ?? 'Context',
                    $score,
                    $item['text'] ?? ''
                );
            }
        }

        return implode("\n", $lines);
    }

    private function normalizeAnalysisResult(array $result): array
    {
        $sentiment = strtolower((string) ($result['sentiment'] ?? 'neutral'));
        $category = strtolower((string) ($result['category'] ?? 'other'));
        $priority = strtolower((string) ($result['priority'] ?? 'normal'));

        return [
            'sentiment' => in_array($sentiment, ['positive', 'negative', 'neutral'], true) ? $sentiment : 'neutral',
            'category' => in_array($category, ['question', 'complaint', 'feedback', 'order', 'other'], true) ? $category : 'other',
            'confidence_score' => max(0, min(100, (float) ($result['confidence_score'] ?? 50))),
            'intent' => $this->normalizeIntent($result['intent'] ?? 'general_inquiry'),
            'priority' => in_array($priority, ['low', 'normal', 'high'], true) ? $priority : 'normal',
            'reply_goal' => trim((string) ($result['reply_goal'] ?? 'answer helpfully and move the conversation forward')),
            'key_points' => $this->normalizeKeyPoints($result['key_points'] ?? []),
        ];
    }

    private function buildPlan(string $message): array
    {
        $normalized = strtolower($message);
        $steps = ['Acknowledge the customer clearly'];

        if (str_contains($normalized, '?')) {
            $steps[] = 'Answer the customer question directly';
        }

        if (Str::contains($normalized, ['price', 'cost', 'amount', 'buy', 'order'])) {
            $steps[] = 'Clarify product, order, or pricing details';
        }

        if (Str::contains($normalized, ['issue', 'problem', 'error', 'complaint', 'refund'])) {
            $steps[] = 'Address the issue and reduce friction';
        }

        $steps[] = 'Close with a concise next step';

        return array_values(array_unique($steps));
    }

    private function getRelevantConversationMemory(MetaMessage $message, int $limit = 3): array
    {
        $messages = MetaMessage::query()
            ->where('conversation_id', $message->conversation_id)
            ->where('meta_account_id', $message->meta_account_id)
            ->whereKeyNot($message->getKey())
            ->latest('created_at')
            ->limit(12)
            ->get();

        if ($messages->isEmpty()) {
            return [];
        }

        $queryTerms = $this->tokenize($message->content);

        return $messages
            ->map(function (MetaMessage $candidate) use ($queryTerms) {
                $candidateTerms = $this->tokenize($candidate->content);
                $overlap = count(array_intersect($queryTerms, $candidateTerms));
                $freshnessBonus = $candidate->created_at?->timestamp ?? 0;

                return [
                    'role' => $candidate->isIncoming() ? 'Customer' : 'Business',
                    'text' => Str::limit(trim((string) $candidate->content), 240),
                    'score' => $overlap + ($freshnessBonus / 10000000000),
                ];
            })
            ->sortByDesc('score')
            ->take($limit)
            ->filter(fn (array $item): bool => $item['text'] !== '')
            ->values()
            ->all();
    }

    private function tokenize(string $text): array
    {
        $normalized = Str::lower($text);
        $parts = preg_split('/[^a-z0-9]+/', $normalized) ?: [];

        return array_values(array_filter($parts, fn (string $part): bool => strlen($part) > 2));
    }

    private function normalizeIntent(string $intent): string
    {
        $normalized = Str::snake(Str::lower(trim($intent)));

        return $normalized !== '' ? $normalized : 'general_inquiry';
    }

    private function normalizeKeyPoints(mixed $keyPoints): array
    {
        return collect(Arr::wrap($keyPoints))
            ->map(fn ($point) => trim((string) $point))
            ->filter()
            ->take(5)
            ->values()
            ->all();
    }

    private function formatMemoryBlock(array $memory): string
    {
        if ($memory === []) {
            return '- No relevant prior messages found.';
        }

        return implode("\n", array_map(
            fn (array $item): string => sprintf(
                '- [%s] %s',
                $item['role'] ?? 'Context',
                $item['text'] ?? ''
            ),
            $memory
        ));
    }

    private function formatPlanBlock(array $plan): string
    {
        if ($plan === []) {
            return '1. Review the message carefully';
        }

        return implode("\n", array_map(
            fn (string $step, int $index): string => ($index + 1) . '. ' . $step,
            array_values($plan),
            array_keys(array_values($plan))
        ));
    }

    private function buildTrace(string $message, array $plan, array $memory, array $analysis): array
    {
        return [
            'intent' => 'User requested help via Meta message: ' . Str::limit($message, 160),
            'plan' => $plan,
            'memory_hits' => count($memory),
            'tool_usage' => [],
            'final_analysis' => [
                'sentiment' => $analysis['sentiment'] ?? 'neutral',
                'category' => $analysis['category'] ?? 'other',
                'intent' => $analysis['intent'] ?? 'general_inquiry',
                'reply_goal' => $analysis['reply_goal'] ?? null,
            ],
        ];
    }
}
