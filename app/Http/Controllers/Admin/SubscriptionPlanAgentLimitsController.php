<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SubscriptionPlanAgentLimitsController extends Controller
{
    /**
     * Display agent limits for a subscription plan
     */
    public function show(SubscriptionPlan $plan)
    {
        return Inertia::render('Admin/Subscriptions/PlanAgentLimits', [
            'plan' => [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
                'max_concurrent_agents' => $plan->max_concurrent_agents,
                'max_agents_per_team' => $plan->max_agents_per_team,
                'max_active_agents' => $plan->max_active_agents,
                'agent_limits' => $plan->getAgentLimits(),
            ],
        ]);
    }

    /**
     * Update agent limits for a plan
     */
    public function update(Request $request, SubscriptionPlan $plan)
    {
        $validated = $request->validate([
            'max_concurrent_agents' => 'nullable|integer|min:1',
            'max_agents_per_team' => 'nullable|integer|min:1',
            'max_active_agents' => 'nullable|integer|min:1',
        ]);

        try {
            $plan->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Agent limits updated successfully',
                'plan' => [
                    'id' => $plan->id,
                    'max_concurrent_agents' => $plan->max_concurrent_agents,
                    'max_agents_per_team' => $plan->max_agents_per_team,
                    'max_active_agents' => $plan->max_active_agents,
                    'agent_limits' => $plan->getAgentLimits(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating agent limits: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update agent limits',
            ], 500);
        }
    }

    /**
     * Set unlimited agents
     */
    public function setUnlimited(Request $request, SubscriptionPlan $plan)
    {
        $validated = $request->validate([
            'type' => 'required|in:concurrent,per_team,active',
        ]);

        try {
            $column = match ($validated['type']) {
                'concurrent' => 'max_concurrent_agents',
                'per_team' => 'max_agents_per_team',
                'active' => 'max_active_agents',
            };

            $plan->update([$column => null]);

            return response()->json([
                'success' => true,
                'message' => 'Agent limit set to unlimited',
                'plan' => $plan->getAgentLimits(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error setting unlimited agents: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update agent limits',
            ], 500);
        }
    }

    /**
     * Get agent statistics for a plan
     */
    public function getStatistics(SubscriptionPlan $plan)
    {
        try {
            $subscriptions = $plan->activeSubscriptions()->count();

            // You would need to count actual agents in production
            // This is a skeleton for the endpoint
            $totalAgentsCreated = 0; // Aggregate from Agent model where subscription is on this plan
            $avgAgentsPerTeam = 0;

            return response()->json([
                'success' => true,
                'statistics' => [
                    'active_subscriptions' => $subscriptions,
                    'total_agents_created' => $totalAgentsCreated,
                    'average_agents_per_team' => $avgAgentsPerTeam,
                    'limits' => $plan->getAgentLimits(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting agent statistics: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get statistics',
            ], 500);
        }
    }
}
