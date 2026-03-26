<?php

namespace App\Http\Controllers\Api\Widget;

use App\Http\Controllers\Controller;
use App\Models\AgentConversation;
use App\Models\AgentMessage;
use App\Models\AIAgent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function conversationUpdated(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|string',
            'event' => 'required|string|in:created,updated,closed,reopened',
            'data' => 'nullable|array',
            'signature' => 'nullable|string',
        ]);

        // Verify signature if provided
        if ($request->has('signature')) {
            $isValid = $this->verifySignature($request);
            if (!$isValid) {
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid signature'
                ], 401);
            }
        }

        // Get conversation
        $conversation = AgentConversation::find($request->conversation_id);

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'error' => 'Conversation not found'
            ], 404);
        }

        // Get agent webhook URL if configured
        $agent = $conversation->aiAgent;
        if ($agent && $agent->metadata && isset($agent->metadata['webhook_url'])) {
            $this->forwardToWebhook($agent->metadata['webhook_url'], $request->all());
        }

        return response()->json([
            'success' => true,
            'message' => 'Webhook processed'
        ]);
    }

    public function messageReceived(Request $request)
    {
        $request->validate([
            'message_id' => 'required|string',
            'event' => 'required|string|in:created,read,deleted',
            'data' => 'nullable|array',
            'signature' => 'nullable|string',
        ]);

        // Verify signature if provided
        if ($request->has('signature')) {
            $isValid = $this->verifySignature($request);
            if (!$isValid) {
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid signature'
                ], 401);
            }
        }

        // Get message
        $message = AgentMessage::find($request->message_id);

        if (!$message) {
            return response()->json([
                'success' => false,
                'error' => 'Message not found'
            ], 404);
        }

        // Get agent webhook URL if configured
        $agent = $message->aiAgent;
        if ($agent && $agent->metadata && isset($agent->metadata['webhook_url'])) {
            $this->forwardToWebhook($agent->metadata['webhook_url'], $request->all());
        }

        return response()->json([
            'success' => true,
            'message' => 'Webhook processed'
        ]);
    }

    public function widgetStatus(Request $request)
    {
        $request->validate([
            'widget_id' => 'required|string',
            'status' => 'required|string|in:loaded,opened,closed,error',
            'data' => 'nullable|array',
            'signature' => 'nullable|string',
        ]);

        // Verify signature if provided
        if ($request->has('signature')) {
            $isValid = $this->verifySignature($request);
            if (!$isValid) {
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid signature'
                ], 401);
            }
        }

        // Get agent
        $agent = AIAgent::where('slug', $request->widget_id)
            ->where('is_active', true)
            ->first();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'error' => 'Widget not found'
            ], 404);
        }

        // Log widget status (you might want to create a WidgetStatus model)
        Log::info('Widget status update', [
            'widget_id' => $request->widget_id,
            'status' => $request->status,
            'agent_id' => $agent->id,
            'data' => $request->data,
        ]);

        // Forward to agent webhook if configured
        if ($agent->metadata && isset($agent->metadata['webhook_url'])) {
            $this->forwardToWebhook($agent->metadata['webhook_url'], $request->all());
        }

        return response()->json([
            'success' => true,
            'message' => 'Status recorded'
        ]);
    }

    private function verifySignature(Request $request)
    {
        $payload = $request->except('signature');
        $secret = env('WEBHOOK_SECRET');

        if (!$secret) {
            return false;
        }

        $computedSignature = hash_hmac('sha256', json_encode($payload), $secret);

        return hash_equals($computedSignature, $request->signature);
    }

    private function forwardToWebhook($url, $data)
    {
        try {
            Http::timeout(5)->post($url, $data);
        } catch (\Exception $e) {
            Log::error('Failed to forward webhook', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
