<?php

namespace App\Http\Controllers\Meta;

use App\Http\Controllers\Controller;
use App\Models\MetaAccount;
use App\Models\MetaMessage;
use App\Models\MetaConversation;
use App\Models\MetaMessageDraft;
use App\Models\MetaAutomationLog;
use App\Services\MetaApiService;
use App\Services\MetaMessageAnalyzerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MetaMessageController extends Controller
{
    private MetaApiService $metaService;
    private MetaMessageAnalyzerService $analyzerService;

    public function __construct(MetaApiService $metaService, MetaMessageAnalyzerService $analyzerService)
    {
        $this->metaService = $metaService;
        $this->analyzerService = $analyzerService;
    }

    /**
     * List conversations for an account
     */
    public function conversations(MetaAccount $account, Request $request)
    {
        $this->authorize('view', $account);

        $perPage = $request->get('per_page', 20);
        $search = $request->get('search', '');

        $query = MetaConversation::where('meta_account_id', $account->id)
            ->where('is_archived', false);

        if ($search) {
            $query->where('participant_name', 'like', "%{$search}%")
                ->orWhere('last_message', 'like', "%{$search}%");
        }

        $conversations = $query->orderBy('last_message_at', 'desc')
            ->paginate($perPage)
            ->map(function ($conv) {
                return [
                    'id' => $conv->id,
                    'conversation_id' => $conv->conversation_id,
                    'participant_name' => $conv->participant_name,
                    'participant_id' => $conv->participant_id,
                    'last_message' => substr($conv->last_message, 0, 150),
                    'last_message_at' => $conv->last_message_at,
                    'unread_count' => $conv->unread_count,
                    'has_pending_draft' => MetaMessageDraft::where('meta_conversation_id', $conv->id)
                        ->where('status', 'draft')
                        ->exists(),
                ];
            });

        $payload = [
            'account' => [
                'id' => $account->id,
                'platform' => $account->platform,
                'account_name' => $account->account_name,
            ],
            'conversations' => $conversations,
        ];

        return response()->json($payload);
    }

    /**
     * Show single conversation with messages
     */
    public function conversation(MetaAccount $account, MetaConversation $conversation, Request $request)
    {
        $this->authorize('view', $account);

        if ($conversation->meta_account_id !== $account->id) {
            abort(403);
        }

        $perPage = $request->get('per_page', 50);

        $messages = MetaMessage::where('conversation_id', $conversation->conversation_id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->map(function ($msg) {
                return [
                    'id' => $msg->id,
                    'direction' => $msg->direction,
                    'sender_id' => $msg->sender_id,
                    'sender_name' => $msg->sender_name,
                    'content' => $msg->content,
                    'media_attachments' => $msg->media_attachments,
                    'status' => $msg->status,
                    'created_at' => $msg->created_at,
                    'has_draft' => MetaMessageDraft::where('meta_message_id', $msg->id)->exists(),
                ];
            });

        $drafts = MetaMessageDraft::where('meta_conversation_id', $conversation->id)
            ->where('status', 'draft')
            ->latest()
            ->get()
            ->map(function ($draft) {
                return [
                    'id' => $draft->id,
                    'original_message' => $draft->original_message,
                    'draft_reply' => $draft->draft_reply,
                    'ai_analysis' => $draft->ai_analysis,
                    'sentiment' => $draft->sentiment,
                    'category' => $draft->category,
                    'confidence_score' => $draft->confidence_score,
                ];
            });

        // Mark as read
        $conversation->update(['unread_count' => 0]);

        $payload = [
            'account' => [
                'id' => $account->id,
                'platform' => $account->platform,
                'account_name' => $account->account_name,
            ],
            'conversation' => [
                'id' => $conversation->id,
                'participant_name' => $conversation->participant_name,
                'participant_id' => $conversation->participant_id,
                'last_message_at' => $conversation->last_message_at,
            ],
            'messages' => $messages,
            'drafts' => $drafts,
        ];

        return response()->json($payload);
    }

    /**
     * Analyze message and generate draft reply
     */
    public function analyzeAndDraft(MetaMessage $message, Request $request)
    {
        $conversation = $message->conversation;
        $account = $conversation->metaAccount;

        $this->authorize('view', $account);

        try {
            // Only analyze incoming messages
            if ($message->direction !== 'incoming') {
                return response()->json(['error' => 'Can only analyze incoming messages'], 400);
            }

            // Check if draft already exists
            $existingDraft = MetaMessageDraft::where('meta_message_id', $message->id)
                ->where('status', 'draft')
                ->first();

            if ($existingDraft) {
                return response()->json(['draft' => $this->formatDraft($existingDraft)]);
            }

            $preferences = $account->preferences()->with('aiMode')->first();
            $analysis = $this->analyzerService->analyzeMessage($message, $account);
            $draft = $this->analyzerService->draftReply($message, $account);

            if (! $draft) {
                return response()->json(['error' => 'Failed to generate draft'], 500);
            }

            // Log activity
            MetaAutomationLog::create([
                'user_id' => Auth::id(),
                'meta_account_id' => $account->id,
                'meta_message_draft_id' => $draft->id,
                'action' => 'draft',
                'description' => 'AI-generated draft for incoming message',
                'data' => [
                    'message_id' => $message->id,
                    'sentiment' => $analysis['sentiment'],
                    'category' => $analysis['category'],
                ],
            ]);

            // Auto-send if configured
            if ($draft->status === 'approved' && $preferences?->enable_auto_reply) {
                $this->sendDraftInternal($draft, $account, $conversation);
            }

            return response()->json(['draft' => $this->formatDraft($draft)]);
        } catch (\Throwable $e) {
            Log::error('Failed to analyze message', [
                'message_id' => $message->id,
                'error' => $e->getMessage(),
            ]);

            MetaAutomationLog::create([
                'user_id' => Auth::id(),
                'meta_account_id' => $message->conversation->meta_account_id,
                'action' => 'error',
                'description' => 'Failed to analyze message',
                'error_message' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Failed to analyze message'], 500);
        }
    }

    /**
     * Update draft reply
     */
    public function updateDraft(MetaMessageDraft $draft, Request $request)
    {
        $validated = $request->validate([
            'draft_reply' => 'required|string',
        ]);

        $draft->update([
            'draft_reply' => $validated['draft_reply'],
            'user_modifications' => [
                'modified_at' => now(),
                'original_draft' => $draft->draft_reply,
            ],
        ]);

        MetaAutomationLog::create([
            'user_id' => Auth::id(),
            'meta_account_id' => $draft->metaConversation->meta_account_id,
            'meta_message_draft_id' => $draft->id,
            'action' => 'draft',
            'description' => 'User modified AI-generated draft',
        ]);

        return response()->json(['success' => true, 'draft' => $this->formatDraft($draft)]);
    }

    /**
     * Send draft reply
     */
    public function sendDraft(MetaMessageDraft $draft, Request $request)
    {
        $conversation = $draft->metaConversation;
        $account = $conversation->metaAccount;

        $this->authorize('view', $account);

        try {
            return $this->sendDraftInternal($draft, $account, $conversation);
        } catch (\Throwable $e) {
            Log::error('Failed to send draft', ['draft_id' => $draft->id, 'error' => $e->getMessage()]);

            return response()->json(['error' => 'Failed to send message'], 500);
        }
    }

    /**
     * Reject draft reply
     */
    public function rejectDraft(MetaMessageDraft $draft)
    {
        $conversation = $draft->metaConversation;
        $account = $conversation->metaAccount;

        $this->authorize('view', $account);

        $draft->update(['status' => 'rejected']);

        MetaAutomationLog::create([
            'user_id' => Auth::id(),
            'meta_account_id' => $account->id,
            'meta_message_draft_id' => $draft->id,
            'action' => 'reject',
            'description' => 'User rejected AI-generated draft',
        ]);

        return response()->json(['success' => true]);
    }

    /**
     * Send manual message
     */
    public function send(MetaConversation $conversation, Request $request)
    {
        $account = $conversation->metaAccount;
        $this->authorize('view', $account);

        $validated = $request->validate([
            'message' => 'required|string|min:1',
        ]);

        try {
            // Send via Meta API
            $result = $this->metaService->sendMessage(
                $account,
                $conversation->conversation_id,
                $validated['message']
            );

            if (!$result) {
                return response()->json(['error' => 'Failed to send message'], 400);
            }

            // Store sent message
            $sentMessage = MetaMessage::create([
                'meta_account_id' => $account->id,
                'conversation_id' => $conversation->conversation_id,
                'message_id' => $result['message_id'] ?? uniqid(),
                'direction' => 'outgoing',
                'sender_id' => Auth::id(),
                'sender_name' => Auth::user()->name,
                'content' => $validated['message'],
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            // Update conversation
            $conversation->update([
                'last_message' => $validated['message'],
                'last_message_at' => now(),
            ]);

            MetaAutomationLog::create([
                'user_id' => Auth::id(),
                'meta_account_id' => $account->id,
                'action' => 'send',
                'description' => 'User sent manual message',
                'data' => ['message_id' => $sentMessage->id],
            ]);

            return response()->json(['success' => true, 'message' => $this->formatMessage($sentMessage)]);
        } catch (\Throwable $e) {
            Log::error('Failed to send message', ['error' => $e->getMessage()]);

            return response()->json(['error' => 'Failed to send message'], 500);
        }
    }

    /**
     * Internal method to send draft
     */
    private function sendDraftInternal(MetaMessageDraft $draft, MetaAccount $account, MetaConversation $conversation)
    {
        // Send via Meta API
        $result = $this->metaService->sendMessage(
            $account,
            $conversation->conversation_id,
            $draft->draft_reply
        );

        if (!$result) {
            throw new \Exception('Failed to send message via Meta API');
        }

        // Store sent message
        $sentMessage = MetaMessage::create([
            'meta_account_id' => $account->id,
            'conversation_id' => $conversation->conversation_id,
            'message_id' => $result['message_id'] ?? uniqid(),
            'direction' => 'outgoing',
            'sender_id' => Auth::id(),
            'sender_name' => Auth::user()->name,
            'content' => $draft->draft_reply,
            'status' => 'sent',
            'sent_at' => now(),
        ]);

        // Update draft status
        $draft->update(['status' => 'sent']);

        // Update conversation
        $conversation->update([
            'last_message' => $draft->draft_reply,
            'last_message_at' => now(),
        ]);

        // Log activity
        MetaAutomationLog::create([
            'user_id' => Auth::id(),
            'meta_account_id' => $account->id,
            'meta_message_draft_id' => $draft->id,
            'action' => 'send',
            'description' => $draft->auto_approved ? 'Auto-sent AI reply' : 'User sent approved AI reply',
            'data' => ['message_id' => $sentMessage->id],
        ]);

        return response()->json([
            'success' => true,
            'message' => $this->formatMessage($sentMessage),
            'draft' => $this->formatDraft($draft),
        ]);
    }

    /**
     * Format message for response
     */
    private function formatMessage(MetaMessage $message)
    {
        return [
            'id' => $message->id,
            'direction' => $message->direction,
            'sender_id' => $message->sender_id,
            'sender_name' => $message->sender_name,
            'content' => $message->content,
            'media_attachments' => $message->media_attachments,
            'status' => $message->status,
            'created_at' => $message->created_at,
        ];
    }

    /**
     * Format draft for response
     */
    private function formatDraft(MetaMessageDraft $draft)
    {
        return [
            'id' => $draft->id,
            'original_message' => $draft->original_message,
            'draft_reply' => $draft->draft_reply,
            'ai_analysis' => $draft->ai_analysis,
            'sentiment' => $draft->sentiment,
            'category' => $draft->category,
            'confidence_score' => $draft->confidence_score,
            'status' => $draft->status,
            'auto_approved' => $draft->auto_approved,
        ];
    }
}
