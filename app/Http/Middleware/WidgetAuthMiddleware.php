<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\AgentApiKey;
use App\Models\AIAgent;

class WidgetAuthMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Get API key from header
        $apiKey = $request->header('Authorization');
        $widgetId = $request->header('X-Widget-ID');

        if (!$apiKey || !$widgetId) {
            return response()->json([
                'success' => false,
                'error' => 'Missing authentication headers'
            ], 401);
        }

        // Extract Bearer token
        if (str_starts_with($apiKey, 'Bearer ')) {
            $apiKey = substr($apiKey, 7);
        }

        // Hash the provided key for comparison
        $hashedKey = hash('sha256', $apiKey);

        // Find the API key
        $agentApiKey = AgentApiKey::where('api_key', $hashedKey)
            ->where('is_active', true)
            ->first();

        if (!$agentApiKey) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid API key'
            ], 401);
        }

        // Check if API key has expired
        if ($agentApiKey->expires_at && $agentApiKey->expires_at->isPast()) {
            return response()->json([
                'success' => false,
                'error' => 'API key has expired'
            ], 401);
        }

        // Get the agent
        $agent = $agentApiKey->agent;

        // Check if agent is active
        if (!$agent->is_active) {
            return response()->json([
                'success' => false,
                'error' => 'Agent is inactive'
            ], 403);
        }

        // Check if widget ID matches
        if ($widgetId !== $agent->slug) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid widget ID'
            ], 401);
        }

        // Update last used timestamp
        $agentApiKey->update(['last_used_at' => now()]);

        // Add agent to request for later use
        $request->merge(['agent' => $agent]);
        $request->merge(['agent_api_key' => $agentApiKey]);

        return $next($request);
    }
}
