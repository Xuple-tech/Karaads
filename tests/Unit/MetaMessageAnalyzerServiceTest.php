<?php

namespace Tests\Unit;

use App\Models\MetaAccount;
use App\Models\MetaConversation;
use App\Models\MetaMessage;
use App\Models\User;
use App\Services\GrokApiService;
use App\Services\MetaMessageAnalyzerService;
use Tests\TestCase;

class MetaMessageAnalyzerServiceTest extends TestCase
{
    public function test_draft_reply_includes_agent_style_analysis_context(): void
    {
        $user = User::factory()->create();

        $account = MetaAccount::create([
            'user_id' => $user->id,
            'platform' => 'whatsapp',
            'account_id' => 'acct_123',
            'access_token' => 'token',
            'account_name' => 'Kwati Support',
            'is_business_account' => true,
            'is_active' => true,
        ]);

        $conversation = MetaConversation::create([
            'meta_account_id' => $account->id,
            'conversation_id' => 'conv_123',
            'participant_id' => 'customer_1',
            'participant_name' => 'Customer One',
        ]);

        MetaMessage::create([
            'meta_account_id' => $account->id,
            'conversation_id' => $conversation->conversation_id,
            'message_id' => 'msg_prev_1',
            'direction' => 'incoming',
            'sender_id' => 'customer_1',
            'sender_name' => 'Customer One',
            'content' => 'What is the price of your premium support package?',
            'status' => 'received',
        ]);

        $message = MetaMessage::create([
            'meta_account_id' => $account->id,
            'conversation_id' => $conversation->conversation_id,
            'message_id' => 'msg_current_1',
            'direction' => 'incoming',
            'sender_id' => 'customer_1',
            'sender_name' => 'Customer One',
            'content' => 'Can you share the price and how quickly you can onboard us?',
            'status' => 'received',
        ]);

        $grok = \Mockery::mock(GrokApiService::class);
        $grok->shouldReceive('generateChat')
            ->twice()
            ->andReturn(
                json_encode([
                    'sentiment' => 'neutral',
                    'category' => 'question',
                    'confidence_score' => 91,
                    'intent' => 'pricing_and_onboarding',
                    'priority' => 'high',
                    'reply_goal' => 'Answer the pricing question and propose a next step',
                    'key_points' => ['Share pricing', 'Mention onboarding timeline'],
                ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                'Thanks for reaching out. Our premium support package starts at $299/month, and we can usually onboard new teams within 48 hours.'
            );

        $service = new MetaMessageAnalyzerService($grok);
        $draft = $service->draftReply($message, $account);

        $this->assertNotNull($draft);
        $this->assertSame('question', $draft->category);
        $this->assertSame('neutral', $draft->sentiment);
        $this->assertSame('draft', $draft->status);
        $this->assertStringContainsString('premium support package', $draft->draft_reply);

        $analysis = json_decode((string) $draft->ai_analysis, true);

        $this->assertIsArray($analysis);
        $this->assertSame('pricing_and_onboarding', $analysis['intent']);
        $this->assertSame('high', $analysis['priority']);
        $this->assertNotEmpty($analysis['plan']);
        $this->assertNotEmpty($analysis['memory']);
        $this->assertSame(1, $analysis['trace']['memory_hits']);
    }
}
