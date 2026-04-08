<?php

namespace App\Http\Controllers\Meta;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessMetaWebhookMessage;
use App\Models\MetaAccount;
use App\Models\MetaConversation;
use App\Models\MetaMessage;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class MetaWebhookController extends Controller
{
    public function verify(Request $request, string $token)
    {
        Log::info('Meta webhook verification requested', [
            'token' => $token,
            'mode' => $request->query('hub_mode'),
        ]);

        if ($request->query('hub_verify_token') !== config('services.meta.webhook_verify_token')) {
            Log::warning('Invalid Meta webhook verify token');

            return response('Forbidden', Response::HTTP_FORBIDDEN);
        }

        return response($request->query('hub_challenge'));
    }

    public function handle(Request $request, string $token)
    {
        try {
            $payload = $request->all();

            Log::info('Meta webhook payload received', [
                'token' => $token,
                'object' => $payload['object'] ?? null,
                'entry_count' => count($payload['entry'] ?? []),
            ]);

            if (! in_array($payload['object'] ?? null, ['page', 'instagram', 'whatsapp_business_account'], true)) {
                return response()->json(['status' => 'ignored'], Response::HTTP_OK);
            }

            foreach ($payload['entry'] ?? [] as $entry) {
                $this->processEntry($payload['object'], $entry);
            }

            return response()->json(['status' => 'ok'], Response::HTTP_OK);
        } catch (\Throwable $e) {
            Log::error('Meta webhook error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    protected function processEntry(string $objectType, array $entry): void
    {
        $entryId = $entry['id'] ?? null;

        $account = MetaAccount::query()
            ->where('account_id', $entryId)
            ->orWhere('page_id', $entryId)
            ->first();

        if (! $account) {
            Log::warning('Received Meta webhook for unknown account', [
                'entry_id' => $entryId,
                'object_type' => $objectType,
            ]);

            return;
        }

        if ($objectType === 'whatsapp_business_account') {
            foreach ($entry['changes'] ?? [] as $change) {
                $value = $change['value'] ?? [];

                foreach ($value['messages'] ?? [] as $message) {
                    $this->processWhatsAppMessage($account, $value, $message);
                }
            }

            return;
        }

        foreach ($entry['messaging'] ?? [] as $message) {
            $this->processMessengerMessage($account, $message);
        }
    }

    protected function processMessengerMessage(MetaAccount $account, array $messageData): void
    {
        $senderId = $messageData['sender']['id'] ?? null;
        $recipientId = $messageData['recipient']['id'] ?? null;
        $message = $messageData['message'] ?? null;
        $timestamp = $messageData['timestamp'] ?? now()->timestamp * 1000;

        if (! $senderId || ! $recipientId || ! $message) {
            Log::warning('Invalid Messenger webhook payload', ['data' => $messageData]);

            return;
        }

        $conversationId = $this->generateConversationId($senderId, $recipientId);
        $content = $this->extractMessageContent($message);
        $receivedAt = now()->setTimestamp((int) floor($timestamp / 1000));

        $conversation = MetaConversation::firstOrCreate(
            [
                'meta_account_id' => $account->id,
                'conversation_id' => $conversationId,
            ],
            [
                'participant_id' => $senderId,
                'participant_name' => $messageData['sender']['name'] ?? null,
                'last_message' => $content,
                'last_message_at' => $receivedAt,
            ]
        );

        $conversation->update([
            'participant_id' => $senderId,
            'participant_name' => $messageData['sender']['name'] ?? $conversation->participant_name,
            'last_message' => $content,
            'last_message_at' => $receivedAt,
            'unread_count' => $conversation->unread_count + 1,
        ]);

        $messageRecord = MetaMessage::create([
            'meta_account_id' => $account->id,
            'conversation_id' => $conversation->conversation_id,
            'message_id' => $message['mid'] ?? uniqid('meta_', true),
            'direction' => 'incoming',
            'sender_id' => $senderId,
            'sender_name' => $messageData['sender']['name'] ?? null,
            'content' => $content,
            'media_attachments' => $message['attachments'] ?? [],
            'status' => 'received',
            'received_at' => $receivedAt,
        ]);

        ProcessMetaWebhookMessage::dispatch($messageRecord, $account, $conversation);
    }

    protected function processWhatsAppMessage(MetaAccount $account, array $value, array $message): void
    {
        $from = $message['from'] ?? null;
        $messageId = $message['id'] ?? null;

        if (! $from || ! $messageId) {
            Log::warning('Invalid WhatsApp webhook payload', ['message' => $message]);

            return;
        }

        $contact = collect($value['contacts'] ?? [])->firstWhere('wa_id', $from);
        $receivedAt = isset($message['timestamp']) ? now()->setTimestamp((int) $message['timestamp']) : now();
        $content = $this->extractWhatsAppContent($message);

        $conversation = MetaConversation::firstOrCreate(
            [
                'meta_account_id' => $account->id,
                'conversation_id' => $from,
            ],
            [
                'participant_id' => $from,
                'participant_name' => $contact['profile']['name'] ?? $from,
                'last_message' => $content,
                'last_message_at' => $receivedAt,
            ]
        );

        $conversation->update([
            'participant_id' => $from,
            'participant_name' => $contact['profile']['name'] ?? $conversation->participant_name,
            'last_message' => $content,
            'last_message_at' => $receivedAt,
            'unread_count' => $conversation->unread_count + 1,
        ]);

        $messageRecord = MetaMessage::create([
            'meta_account_id' => $account->id,
            'conversation_id' => $conversation->conversation_id,
            'message_id' => $messageId,
            'direction' => 'incoming',
            'sender_id' => $from,
            'sender_name' => $contact['profile']['name'] ?? null,
            'content' => $content,
            'media_attachments' => $this->extractWhatsAppAttachments($message),
            'status' => 'received',
            'received_at' => $receivedAt,
        ]);

        ProcessMetaWebhookMessage::dispatch($messageRecord, $account, $conversation);
    }

    protected function extractMessageContent(array $message): string
    {
        if (isset($message['text'])) {
            return $message['text'];
        }

        if (isset($message['quick_reply'])) {
            return 'Quick Reply: ' . ($message['quick_reply']['payload'] ?? '');
        }

        if (isset($message['attachments'])) {
            $types = collect($message['attachments'])->pluck('type')->filter()->implode(', ');

            return $types ? "[Attachment] {$types}" : '[Attachment] Received';
        }

        return '[Unsupported message type]';
    }

    protected function extractWhatsAppContent(array $message): string
    {
        return match ($message['type'] ?? 'unknown') {
            'text' => $message['text']['body'] ?? '',
            'button' => $message['button']['text'] ?? '[Button reply]',
            'interactive' => $message['interactive']['button_reply']['title']
                ?? $message['interactive']['list_reply']['title']
                ?? '[Interactive reply]',
            'image' => '[Image] ' . ($message['image']['caption'] ?? 'Received'),
            'document' => '[Document] ' . ($message['document']['filename'] ?? 'Received'),
            'audio' => '[Audio] Received',
            'video' => '[Video] ' . ($message['video']['caption'] ?? 'Received'),
            default => '[WhatsApp ' . ($message['type'] ?? 'message') . ']',
        };
    }

    protected function extractWhatsAppAttachments(array $message): array
    {
        return match ($message['type'] ?? 'unknown') {
            'image' => [$message['image'] ?? []],
            'document' => [$message['document'] ?? []],
            'audio' => [$message['audio'] ?? []],
            'video' => [$message['video'] ?? []],
            default => [],
        };
    }

    protected function generateConversationId(string $senderId, string $recipientId): string
    {
        return implode(':', collect([$senderId, $recipientId])->sort()->values()->all());
    }
}
