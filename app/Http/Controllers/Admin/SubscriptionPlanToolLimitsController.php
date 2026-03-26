<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SubscriptionPlanToolLimitsController extends Controller
{
    /**
     * Display tool limits for a subscription plan
     */
    public function show(SubscriptionPlan $plan)
    {
        $toolCategories = ['web_search', 'image_generation', 'code_execution', 'email_processing', 'data_analysis'];

        return Inertia::render('Admin/Subscriptions/PlanToolLimits', [
            'plan' => [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
                'max_mcp_servers' => $plan->max_mcp_servers,
                'max_tools_per_workflow' => $plan->max_tools_per_workflow,
                'allowed_tool_categories' => $plan->allowed_tool_categories,
                'supports_custom_tools' => $plan->supports_custom_tools,
                'supports_mcp_integration' => $plan->supports_mcp_integration,
                'tool_limits' => $plan->getToolLimits(),
            ],
            'availableCategories' => $toolCategories,
        ]);
    }

    /**
     * Update tool limits for a plan
     */
    public function update(Request $request, SubscriptionPlan $plan)
    {
        $validated = $request->validate([
            'max_mcp_servers' => 'nullable|integer|min:1',
            'max_tools_per_workflow' => 'nullable|integer|min:1',
            'allowed_tool_categories' => 'nullable|array',
            'allowed_tool_categories.*' => 'string',
            'supports_custom_tools' => 'boolean',
            'supports_mcp_integration' => 'boolean',
        ]);

        try {
            $plan->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Tool limits updated successfully',
                'plan' => [
                    'id' => $plan->id,
                    'max_mcp_servers' => $plan->max_mcp_servers,
                    'max_tools_per_workflow' => $plan->max_tools_per_workflow,
                    'allowed_tool_categories' => $plan->allowed_tool_categories,
                    'supports_custom_tools' => $plan->supports_custom_tools,
                    'supports_mcp_integration' => $plan->supports_mcp_integration,
                    'tool_limits' => $plan->getToolLimits(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating tool limits: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update tool limits',
            ], 500);
        }
    }

    /**
     * Set unlimited MCP servers
     */
    public function setUnlimitedServers(Request $request, SubscriptionPlan $plan)
    {
        try {
            $plan->update(['max_mcp_servers' => null]);

            return response()->json([
                'success' => true,
                'message' => 'MCP servers set to unlimited',
                'max_mcp_servers' => null,
            ]);
        } catch (\Exception $e) {
            Log::error('Error setting unlimited servers: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update tool limits',
            ], 500);
        }
    }

    /**
     * Set unlimited tools per workflow
     */
    public function setUnlimitedToolsPerWorkflow(Request $request, SubscriptionPlan $plan)
    {
        try {
            $plan->update(['max_tools_per_workflow' => null]);

            return response()->json([
                'success' => true,
                'message' => 'Tools per workflow set to unlimited',
                'max_tools_per_workflow' => null,
            ]);
        } catch (\Exception $e) {
            Log::error('Error setting unlimited tools per workflow: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update tool limits',
            ], 500);
        }
    }

    /**
     * Add allowed tool category
     */
    public function addToolCategory(Request $request, SubscriptionPlan $plan)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:100',
        ]);

        try {
            $categories = $plan->allowed_tool_categories ?? [];

            if (!in_array($validated['category'], $categories)) {
                $categories[] = $validated['category'];
                $plan->update(['allowed_tool_categories' => $categories]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Category added to plan',
                'allowed_tool_categories' => $plan->allowed_tool_categories,
            ]);
        } catch (\Exception $e) {
            Log::error('Error adding tool category: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to add category',
            ], 500);
        }
    }

    /**
     * Remove allowed tool category
     */
    public function removeToolCategory(Request $request, SubscriptionPlan $plan)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:100',
        ]);

        try {
            $categories = $plan->allowed_tool_categories ?? [];
            $categories = array_filter($categories, fn($c) => $c !== $validated['category']);
            $plan->update(['allowed_tool_categories' => array_values($categories)]);

            return response()->json([
                'success' => true,
                'message' => 'Category removed from plan',
                'allowed_tool_categories' => $plan->allowed_tool_categories,
            ]);
        } catch (\Exception $e) {
            Log::error('Error removing tool category: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to remove category',
            ], 500);
        }
    }

    /**
     * Get tool usage statistics
     */
    public function getStatistics(SubscriptionPlan $plan)
    {
        try {
            $enabledTools = $plan->enabledTools()->count();
            $totalTools = $plan->planTools()->count();
            $mcpServers = $plan->planTools()
                ->where('tool_category', 'mcp_server')
                ->where('is_enabled', true)
                ->count();

            return response()->json([
                'success' => true,
                'statistics' => [
                    'enabled_tools' => $enabledTools,
                    'total_tools' => $totalTools,
                    'mcp_servers_count' => $mcpServers,
                    'limits' => $plan->getToolLimits(),
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting tool statistics: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get statistics',
            ], 500);
        }
    }
}
