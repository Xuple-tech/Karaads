<?php

namespace App\Http\Controllers\Meta;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessMetaWebhookMessage;
use App\Models\MetaMessage;
use App\Models\MetaConversation;
use App\Models\MetaAccount;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class MetaWebhookController extends Controller
{
    /**
     * Verify webhook subscription from Meta
     * GET /meta/webhook/receive/{token}
     */
    public function verify(Request $request, string $token)
    {
        Log::info('Meta webhook verification request', [
            'challenge' => $request->query('hub_challenge'),
            'verify_token' => $request->query('hub_verify_token'),
        ]);

        // Verify the token matches
        if ($request->query('hub_verify_token') !== config('services.meta.webhook_verify_token')) {
            Log::warning('Invalid Meta webhook verify token');
            return response('Forbidden', Response::HTTP_FORBIDDEN);
        }

        // Return the challenge to complete verification
        return response($request->query('hub_challenge'));
    }

    /**
     * Receive incoming messages and events from Meta
     * POST /meta/webhook/receive/{token}
     */
    public function handle(Request $request, string $token)
    {
        try {
            $payload = $request->json()->all();

            Log::info('Meta webhook received', [
                'object' => $payload['object'] ?? null,
                'entry_count' => count($payload['entry'] ?? []),
            ]);

            // Validate object type
            if (($payload['object'] ?? null) !== 'page' && ($payload['object'] ?? null) !== 'instagram') {
                return response()->json(['status' => 'ignored'], Response::HTTP_OK);
            }

            // Process each entry (batch of events)
            foreach ($payload['entry'] ?? [] as $entry) {
                $this->processEntry($entry);
            }

            // Acknowledge receipt to Meta immediately
            return response()->json(['status' => 'ok'], Response::HTTP_OK);

        } catch (\Exception $e) {
            Log::error('Meta webhook error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Process a single entry from webhook payload
     */
    protected function processEntry(array $entry): void
    {
        $pageId = $entry['id'] ?? null;
        $messaging = $entry['messaging'] ?? [];
        $changes = $entry['changes'] ?? [];

        // Find the Meta Account for this page
        $account = MetaAccount::where('platform_account_id', $pageId)->first();
        if (!$account) {
            Log::warning('Received webhook for unknown account', ['pageId' => $pageId]);
            return;
        }

        // Handle direct messages (Facebook Messenger, Instagram DMs)
        foreach ($messaging as $message) {
            $this->processMessage($account, $message);
        }

        // Handle feed events (comments, posts, etc.) - for future expansion
        foreach ($changes as $change) {
            $this->processChange($account, $change);
        }
    }

    /**
     * Process incoming message and dispatch auto-reply job
     */
    protected function processMessage(MetaAccount $account, array $messageData): void
    {
        $senderId = $messageData['sender']['id'] ?? null;
        $recipientId = $messageData['recipient']['id'] ?? null;
        $message = $messageData['message'] ?? null;
        $timestamp = $messageData['timestamp'] ?? now()->timestamp;

        if (!$senderId || !$message) {
            Log::warning('Invalid message data in webhook', ['data' => $messageData]);
            return;
        }

        // Determine conversation ID (sender + recipient)
        $conversationId = $this->generateConversationId($senderId, $recipientId);

        // Get or create conversation
        $conversation = MetaConversation::firstOrCreate(
            [
                'account_id' => $account->id,
                'conversation_id' => $conversationId,
            ],
            [
                'platform' => $account->platform,
                'sender_id' => $senderId,
                'recipient_id' => $recipientId,
                'status' => 'active',
            ]
        );

        // Create message record
        $messageRecord = MetaMessage::create([
            'conversation_id' => $conversation->id,
            'account_id' => $account->id,
            'message_id' => $message['mid'] ?? bin2hex(random_bytes(16)),
            'sender_id' => $senderId,
            'content' => $this->extractMessageContent($message),
            'message_type' => $this->getMessageType($message),
            'attachments' => json_encode($message['attachments'] ?? []),
            'received_at' => now()->setTimestamp($timestamp),
            'processed' => false,
        ]);

        Log::info('Meta message stored', [
            'message_id' => $messageRecord->id,
            'from' => $senderId,
            'conversation_id' => $conversation->id,
        ]);

        // Dispatch job to analyze and auto-reply
        ProcessMetaWebhookMessage::dispatch($messageRecord, $account, $conversation);
    }

    /**
     * Process feed changes (comments, reactions, etc.)
     */
    protected function processChange(MetaAccount $account, array $change): void
    {
        $field = $change['field'] ?? null;
        $value = $change['value'] ?? null;

        Log::info('Meta feed change', [
            'account_id' => $account->id,
            'field' => $field,
            'value' => $value,
        ]);

        // Handle specific feed events if needed
        // e.g., page_conversations, messaging_template_status_update, etc.
    }

    /**
     * Extract text content from message object
     */
    protected function extractMessageContent(array $message): string
    {
        // Text message
        if (isset($message['text'])) {
            return $message['text'];
        }

        // Image with caption
        if (isset($message['image'])) {
            return '[Image] ' . ($message['image']['url'] ?? 'Received');
        }

        // Video with caption
        if (isset($message['video'])) {
            return '[Video] Received';
        }

        // File attachment
        if (isset($message['file'])) {
            return '[File] ' . ($message['file']['name'] ?? 'Received');
        }

        // Quick reply
        if (isset($message['quick_reply'])) {
            return 'Quick Reply: ' . ($message['quick_reply']['payload'] ?? '');
        }

        // Fallback
        return '[Message type: ' . implode(',', array_keys($message)) . ']';
    }

    /**
     * Determine message type
     */
    protected function getMessageType(array $message): string
    {
        if (isset($message['text'])) {
            return 'text';
        }
        if (isset($message['image'])) {
            return 'image';
        }
        if (isset($message['video'])) {
            return 'video';
        }
        if (isset($message['file'])) {
            return 'file';
        }
        if (isset($message['sticker'])) {
            return 'sticker';
        }
        if (isset($message['quick_reply'])) {
            return 'quick_reply';
        }

        return 'unknown';
    }

    /**
     * Generate consistent conversation ID from sender and recipient
     */
    protected function generateConversationId(string $senderId, string $recipientId): string
    {
        return hash('sha256', min($senderId, $recipientId) . '|' . max($senderId, $recipientId));
    }
}
