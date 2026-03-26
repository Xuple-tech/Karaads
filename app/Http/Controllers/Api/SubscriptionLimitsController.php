<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SubscriptionLimitService;
use Illuminate\Http\Request;

class SubscriptionLimitsController extends Controller
{
    protected $limitService;

    public function __construct(SubscriptionLimitService $limitService)
    {
        $this->limitService = $limitService;
    }

    /**
     * Get current user's subscription limits
     *
     * @route GET /api/subscription/limits
     */
    public function show(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        try {
            $limits = $this->limitService->getUserLimits($user);

            return response()->json([
                'success' => true,
                'limits' => $limits,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve subscription limits',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check if user can create an agent
     *
     * @route POST /api/subscription/check-agent-creation
     */
    public function checkAgentCreation(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        $teamId = $request->get('team_id');
        $team = null;

        if ($teamId) {
            $team = \App\Models\Team::find($teamId);
            if (!$team || $team->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Team not found',
                ], 404);
            }
        }

        try {
            $result = $this->limitService->canCreateAgent($user, $team);

            return response()->json([
                'success' => true,
                'allowed' => $result['allowed'],
                'reason' => $result['reason'] ?? null,
                'details' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check agent creation limit',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check if user can activate an agent
     *
     * @route POST /api/subscription/check-agent-activation
     */
    public function checkAgentActivation(Request $request)
    {
        $validated = $request->validate([
            'agent_id' => 'required|uuid',
        ]);

        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        $agent = \App\Models\Agent::find($validated['agent_id']);

        if (!$agent || $agent->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Agent not found',
            ], 404);
        }

        try {
            $result = $this->limitService->canActivateAgent($user, $agent);

            return response()->json([
                'success' => true,
                'allowed' => $result['allowed'],
                'reason' => $result['reason'] ?? null,
                'details' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check agent activation limit',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check if user can add tools to a workflow
     *
     * @route POST /api/subscription/check-tools
     */
    public function checkToolsUsage(Request $request)
    {
        $validated = $request->validate([
            'tool_count' => 'required|integer|min:1',
        ]);

        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        try {
            $result = $this->limitService->canAddToolsToWorkflow($user, $validated['tool_count']);

            return response()->json([
                'success' => true,
                'allowed' => $result['allowed'],
                'reason' => $result['reason'] ?? null,
                'details' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check tools limit',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check if a feature is available
     *
     * @route GET /api/subscription/features/{featureKey}
     */
    public function checkFeature(Request $request, string $featureKey)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        try {
            $enabled = $this->limitService->isFeatureEnabled($user, $featureKey);
            $limit = $this->limitService->getFeatureLimit($user, $featureKey);

            return response()->json([
                'success' => true,
                'feature' => $featureKey,
                'enabled' => $enabled,
                'limit' => $limit,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check feature',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all enabled features
     *
     * @route GET /api/subscription/features
     */
    public function getFeatures(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        try {
            $features = $this->limitService->getEnabledFeatures($user)
                ->map(fn($feature) => [
                    'key' => $feature->feature_key,
                    'name' => $feature->feature_name,
                    'description' => $feature->description,
                    'limit' => $feature->limit,
                    'limit_type' => $feature->limit_type,
                ])
                ->toArray();

            return response()->json([
                'success' => true,
                'features' => $features,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve features',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all available tools
     *
     * @route GET /api/subscription/tools
     */
    public function getTools(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        try {
            $tools = $this->limitService->getAvailableTools($user)
                ->map(fn($tool) => [
                    'key' => $tool->tool_key,
                    'name' => $tool->tool_name,
                    'description' => $tool->description,
                    'category' => $tool->tool_category,
                ])
                ->toArray();

            return response()->json([
                'success' => true,
                'tools' => $tools,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve tools',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check if tool is available
     *
     * @route GET /api/subscription/tools/{toolKey}
     */
    public function checkTool(Request $request, string $toolKey)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        try {
            $available = $this->limitService->isToolAvailable($user, $toolKey);

            return response()->json([
                'success' => true,
                'tool' => $toolKey,
                'available' => $available,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check tool availability',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
