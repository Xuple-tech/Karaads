<?php

namespace App\Jobs;

use App\Models\MetaAccount;
use App\Models\MetaAutomationLog;
use App\Models\MetaAutomationPreference;
use App\Models\MetaConversation;
use App\Models\MetaMessage;
use App\Models\MetaMessageDraft;
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

    public $tries = 3;
    public $backoff = [10, 60, 300];
    public $timeout = 120;

    public function __construct(
        protected MetaMessage $message,
        protected MetaAccount $account,
        protected MetaConversation $conversation
    ) {}

    public function handle(MetaMessageAnalyzerService $analyzer, MetaApiService $metaApi): void
    {
        $preferences = $this->getPreferences();

        if (! $preferences->enable_message_analysis && ! $preferences->enable_auto_reply) {
            Log::info('Skipping Meta webhook automation because messaging automation is disabled', [
                'message_id' => $this->message->id,
                'account_id' => $this->account->id,
            ]);

            return;
        }

        $existingDraft = MetaMessageDraft::query()
            ->where('meta_message_id', $this->message->id)
            ->whereIn('status', ['draft', 'approved', 'sent'])
            ->first();

        if ($existingDraft) {
            Log::info('Skipping Meta webhook automation because a draft already exists', [
                'message_id' => $this->message->id,
                'draft_id' => $existingDraft->id,
            ]);

            return;
        }

        $draft = $analyzer->draftReply($this->message, $this->account);

        if (! $draft) {
            Log::warning('Meta webhook draft generation failed', [
                'message_id' => $this->message->id,
                'account_id' => $this->account->id,
            ]);

            return;
        }

        $this->logDraftCreated($draft);

        if (! $preferences->enable_auto_reply || $preferences->require_approval_before_send) {
            return;
        }

        if ($this->isRateLimited()) {
            Log::info('Meta auto-reply skipped because recent outgoing activity was found', [
                'message_id' => $this->message->id,
                'conversation_id' => $this->conversation->id,
            ]);

            return;
        }

        $result = $metaApi->sendMessage(
            $this->account,
            $this->conversation->conversation_id,
            $draft->draft_reply
        );

        if (! $result) {
            Log::warning('Meta auto-reply send failed', [
                'message_id' => $this->message->id,
                'draft_id' => $draft->id,
            ]);

            return;
        }

        MetaMessage::create([
            'meta_account_id' => $this->account->id,
            'conversation_id' => $this->conversation->conversation_id,
            'message_id' => $result['messages'][0]['id'] ?? $result['message_id'] ?? uniqid('meta_', true),
            'direction' => 'outgoing',
            'sender_id' => $this->account->account_id,
            'sender_name' => $this->account->account_name,
            'content' => $draft->draft_reply,
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        $draft->update(['status' => 'sent']);
        $this->conversation->update([
            'last_message' => $draft->draft_reply,
            'last_message_at' => now(),
        ]);

        MetaAutomationLog::create([
            'user_id' => $this->account->user_id,
            'meta_account_id' => $this->account->id,
            'meta_message_draft_id' => $draft->id,
            'action' => 'send',
            'description' => 'Auto-sent AI reply from webhook automation',
            'data' => [
                'trigger' => 'webhook',
                'incoming_message_id' => $this->message->id,
            ],
        ]);
    }

    protected function getPreferences(): MetaAutomationPreference
    {
        $preference = $this->account->preferences()->firstOrCreate(
            ['user_id' => $this->account->user_id],
            [
                'enable_auto_reply' => false,
                'enable_message_analysis' => true,
                'require_approval_before_send' => true,
                'reply_tone' => 'professional',
            ]
        );

        return $preference->loadMissing('aiMode');
    }

    protected function isRateLimited(): bool
    {
        return MetaMessage::query()
            ->where('meta_account_id', $this->account->id)
            ->where('conversation_id', $this->conversation->conversation_id)
            ->where('direction', 'outgoing')
            ->where('created_at', '>', now()->subHour())
            ->exists();
    }

    protected function logDraftCreated(MetaMessageDraft $draft): void
    {
        MetaAutomationLog::create([
            'user_id' => $this->account->user_id,
            'meta_account_id' => $this->account->id,
            'meta_message_draft_id' => $draft->id,
            'action' => 'draft',
            'description' => 'AI-generated draft from webhook message',
            'data' => [
                'message_id' => $this->message->id,
                'conversation_id' => $this->conversation->id,
            ],
        ]);
    }
}
