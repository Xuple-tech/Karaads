<?php

namespace App\Http\Middleware;

use App\Models\AIAgent;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAgentTrialExpiry
{
    public function handle(Request $request, Closure $next): Response
    {
        $widgetId = $request->input('widget_id') ?? $request->route('agentSlug') ?? $request->route('slug');

        if (!$widgetId) {
            return response()->json([
                'success' => false,
                'error' => 'widget_id is required',
                'code' => 'MISSING_WIDGET_ID'
            ], 400);
        }

        $agent = AIAgent::where('slug', $widgetId)
            ->orWhere('id', $widgetId)
            ->first();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'error' => 'Widget not found or inactive',
                'code' => 'WIDGET_NOT_FOUND'
            ], 404);
        }

        $owner = $agent->user;

        if (!$owner->canCreateAgents()) {
            return response()->json([
                'success' => false,
                'error' => 'This widget\'s trial period has expired. Please upgrade your plan to continue using this widget.',
                'code' => 'TRIAL_EXPIRED',
                'data' => [
                    'trial_expired_at' => $owner->getTrialExpiresAt(),
                    'action' => 'upgrade',
                    'upgrade_url' => route('user.billing.plans') ?? '/pricing'
                ]
            ], 403);
        }

        $request->merge(['agent' => $agent]);

        return $next($request);
    }
}
