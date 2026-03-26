<?php

namespace App\Http\Controllers\Api\Widget;

use App\Http\Controllers\Controller;
use App\Models\AgentConversation;
use App\Models\AIAgent;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SessionController extends Controller
{
    public function create(Request $request)
    {
        $request->validate([
            'widget_id' => 'required|string',
            'metadata' => 'nullable|array',
        ]);

        // Get agent by widget ID (slug)
        $agent = AIAgent::where('slug', $request->widget_id)
            ->where('is_active', true)
            ->first();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'error' => 'Widget not found or inactive'
            ], 404);
        }

        // Check if agent's site is active
        if (!$agent->site || !$agent->site->is_active || !$agent->site->widget_enabled) {
            return response()->json([
                'success' => false,
                'error' => 'Widget is disabled for this site'
            ], 403);
        }

        // Create a new conversation session
        $conversation = AgentConversation::create([
            'id' => Str::uuid(),
            'agent_id' => $agent->id,
            'session_id' => Str::random(32),
            'visitor_id' => $this->generateVisitorId($request),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'referrer' => $request->header('referer'),
            'page_url' => $request->input('metadata.url', $request->header('referer')),
            'title' => $request->input('metadata.title', 'Chat Session'),
            'status' => 'active',
            'message_count' => 0,
            'started_at' => now(),
            'last_message_at' => now(),
            'metadata' => $request->metadata,
        ]);

        // Create welcome message
        $welcomeMessage = $agent->welcome_message ?: 'Hello! How can I help you today?';

        // Return session data
        return response()->json([
            'success' => true,
            'data' => [
                'session_id' => $conversation->session_id,
                'conversation_id' => $conversation->id,
                'agent' => [
                    'id' => $agent->id,
                    'name' => $agent->name,
                    'welcome_message' => $welcomeMessage,
                    'primary_color' => $agent->primary_color,
                    'secondary_color' => $agent->secondary_color,
                    'widget_position' => $agent->widget_position,
                ],
                'session' => [
                    'started_at' => $conversation->started_at->toISOString(),
                    'visitor_id' => $conversation->visitor_id,
                ]
            ]
        ]);
    }

    public function show($sessionId)
    {
        $conversation = AgentConversation::where('session_id', $sessionId)
            ->with(['aiAgent'])
            ->first();

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'error' => 'Session not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'session_id' => $conversation->session_id,
                'conversation_id' => $conversation->id,
                'status' => $conversation->status,
                'message_count' => $conversation->message_count,
                'started_at' => $conversation->started_at->toISOString(),
                'last_message_at' => $conversation->last_message_at->toISOString(),
                'agent' => $conversation->aiAgent ? [
                    'id' => $conversation->aiAgent->id,
                    'name' => $conversation->aiAgent->name,
                ] : null
            ]
        ]);
    }

    public function destroy($sessionId)
    {
        $conversation = AgentConversation::where('session_id', $sessionId)->first();

        if (!$conversation) {
            return response()->json([
                'success' => false,
                'error' => 'Session not found'
            ], 404);
        }

        // Soft delete or close the conversation
        $conversation->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Session closed successfully'
        ]);
    }

    private function generateVisitorId(Request $request)
    {
        // Generate a unique visitor ID based on IP and user agent
        $ip = $request->ip();
        $userAgent = $request->userAgent();
        return hash('sha256', $ip . $userAgent . time());
    }
}
