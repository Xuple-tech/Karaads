<?php

namespace App\Http\Controllers\Meta;

use App\Http\Controllers\Controller;
use App\Models\MetaAccount;
use App\Models\MetaBroadcast;
use App\Models\MetaBroadcastRecipient;
use App\Models\MetaConversation;
use App\Models\MetaMessage;
use App\Services\MetaApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MetaBroadcastController extends Controller
{
    public function index(MetaAccount $account)
    {
        $this->authorize('view', $account);

        $broadcasts = MetaBroadcast::where('meta_account_id', $account->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20)
            ->map(fn($b) => $this->formatBroadcast($b));

        return response()->json(['success' => true, 'broadcasts' => $broadcasts]);
    }

    public function store(MetaAccount $account, Request $request)
    {
        $this->authorize('update', $account);

        $validated = $request->validate([
            'name'               => 'required|string|max:120',
            'message'            => 'required|string|max:1000',
            'conversation_ids'   => 'required|array|min:1',
            'conversation_ids.*' => 'exists:meta_conversations,id',
        ]);

        $conversations = MetaConversation::whereIn('id', $validated['conversation_ids'])
            ->where('meta_account_id', $account->id)
            ->get();

        $broadcast = MetaBroadcast::create([
            'meta_account_id' => $account->id,
            'user_id'         => Auth::id(),
            'name'            => $validated['name'],
            'message'         => $validated['message'],
            'recipient_count' => $conversations->count(),
        ]);

        foreach ($conversations as $conversation) {
            MetaBroadcastRecipient::create([
                'broadcast_id'     => $broadcast->id,
                'participant_id'   => $conversation->participant_id,
                'participant_name' => $conversation->participant_name,
                'conversation_id'  => $conversation->id,
            ]);
        }

        return response()->json(['success' => true, 'broadcast' => $this->formatBroadcast($broadcast)], 201);
    }

    public function show(MetaAccount $account, MetaBroadcast $broadcast)
    {
        $this->authorize('view', $account);
        abort_if($broadcast->meta_account_id !== $account->id, 403);

        $recipients = $broadcast->recipients()->get()->map(fn($r) => [
            'id'               => $r->id,
            'participant_name' => $r->participant_name,
            'participant_id'   => $r->participant_id,
            'status'           => $r->status,
            'error_message'    => $r->error_message,
        ]);

        return response()->json([
            'success'    => true,
            'broadcast'  => $this->formatBroadcast($broadcast),
            'recipients' => $recipients,
        ]);
    }

    public function send(MetaAccount $account, MetaBroadcast $broadcast, MetaApiService $metaService)
    {
        $this->authorize('update', $account);
        abort_if($broadcast->meta_account_id !== $account->id, 403);
        abort_if($broadcast->status === 'sent', 422, 'Broadcast already sent.');

        $broadcast->update(['status' => 'sending']);

        foreach ($broadcast->recipients()->where('status', 'pending')->get() as $recipient) {
            try {
                $metaService->sendMessage($account, $recipient->participant_id, $broadcast->message);

                // Record as an outgoing message in the conversation
                $conversation = MetaConversation::find($recipient->conversation_id);
                if ($conversation) {
                    MetaMessage::create([
                        'meta_account_id' => $account->id,
                        'conversation_id' => $conversation->conversation_id,
                        'message_id'      => 'broadcast_' . $broadcast->id . '_' . $recipient->id,
                        'direction'       => 'outgoing',
                        'sender_id'       => $account->account_id,
                        'sender_name'     => $account->account_name,
                        'content'         => $broadcast->message,
                        'status'          => 'sent',
                        'sent_at'         => now(),
                    ]);

                    $conversation->update([
                        'last_message'    => substr($broadcast->message, 0, 150),
                        'last_message_at' => now(),
                    ]);
                }

                $recipient->update(['status' => 'sent']);
                $broadcast->increment('sent_count');
            } catch (\Exception $e) {
                Log::error('Broadcast send failed', ['recipient' => $recipient->id, 'error' => $e->getMessage()]);
                $recipient->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
                $broadcast->increment('failed_count');
            }
        }

        $broadcast->update(['status' => 'sent', 'sent_at' => now()]);

        return response()->json(['success' => true, 'broadcast' => $this->formatBroadcast($broadcast->fresh())]);
    }

    private function formatBroadcast(MetaBroadcast $broadcast): array
    {
        return [
            'id'               => $broadcast->id,
            'name'             => $broadcast->name,
            'message'          => $broadcast->message,
            'status'           => $broadcast->status,
            'recipient_count'  => $broadcast->recipient_count,
            'sent_count'       => $broadcast->sent_count,
            'failed_count'     => $broadcast->failed_count,
            'sent_at'          => $broadcast->sent_at,
            'created_at'       => $broadcast->created_at,
        ];
    }
}
