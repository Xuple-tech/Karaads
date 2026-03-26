<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Models\SubscriptionPlanTool;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SubscriptionPlanToolsController extends Controller
{
    /**
     * Display tools for a subscription plan
     */
    public function index(SubscriptionPlan $plan)
    {
        $tools = $plan->planTools()
            ->orderBy('tool_category')
            ->orderBy('tool_name')
            ->get()
            ->map(fn($tool) => [
                'id' => $tool->id,
                'tool_key' => $tool->tool_key,
                'tool_name' => $tool->tool_name,
                'description' => $tool->description,
                'tool_category' => $tool->tool_category,
                'category_label' => $tool->getCategoryLabel(),
                'is_enabled' => $tool->is_enabled,
                'usage_limit' => $tool->usage_limit,
                'limit_period' => $tool->limit_period,
                'usage_limit_text' => $tool->getUsageLimitText(),
                'configuration' => $tool->configuration,
            ]);

        return Inertia::render('Admin/Subscriptions/PlanTools', [
            'plan' => $plan,
            'tools' => $tools,
            'categories' => [
                'mcp_server' => 'MCP Servers',
                'integration' => 'Integrations',
                'built_in_tool' => 'Built-in Tools',
            ],
        ]);
    }

    /**
     * Store a new tool for a plan
     */
    public function store(Request $request, SubscriptionPlan $plan)
    {
        $validated = $request->validate([
            'tool_key' => 'required|string|max:100|unique:subscription_plan_tools,tool_key,null,id,plan_id,' . $plan->id,
            'tool_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'tool_category' => 'required|in:mcp_server,integration,built_in_tool',
            'is_enabled' => 'boolean',
            'usage_limit' => 'nullable|integer|min:1',
            'limit_period' => 'nullable|in:daily,monthly,total',
            'configuration' => 'nullable|array',
        ]);

        try {
            $tool = $plan->planTools()->create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Tool added successfully',
                'tool' => [
                    'id' => $tool->id,
                    'tool_key' => $tool->tool_key,
                    'tool_name' => $tool->tool_name,
                    'description' => $tool->description,
                    'tool_category' => $tool->tool_category,
                    'category_label' => $tool->getCategoryLabel(),
                    'is_enabled' => $tool->is_enabled,
                    'usage_limit' => $tool->usage_limit,
                    'limit_period' => $tool->limit_period,
                    'usage_limit_text' => $tool->getUsageLimitText(),
                    'configuration' => $tool->configuration,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error adding tool: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to add tool',
            ], 500);
        }
    }

    /**
     * Update a tool
     */
    public function update(Request $request, SubscriptionPlan $plan, SubscriptionPlanTool $tool)
    {
        if ($tool->plan_id !== $plan->id) {
            return response()->json([
                'success' => false,
                'error' => 'Tool does not belong to this plan',
            ], 404);
        }

        $validated = $request->validate([
            'tool_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'tool_category' => 'required|in:mcp_server,integration,built_in_tool',
            'is_enabled' => 'boolean',
            'usage_limit' => 'nullable|integer|min:1',
            'limit_period' => 'nullable|in:daily,monthly,total',
            'configuration' => 'nullable|array',
        ]);

        try {
            $tool->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Tool updated successfully',
                'tool' => [
                    'id' => $tool->id,
                    'tool_key' => $tool->tool_key,
                    'tool_name' => $tool->tool_name,
                    'description' => $tool->description,
                    'tool_category' => $tool->tool_category,
                    'category_label' => $tool->getCategoryLabel(),
                    'is_enabled' => $tool->is_enabled,
                    'usage_limit' => $tool->usage_limit,
                    'limit_period' => $tool->limit_period,
                    'usage_limit_text' => $tool->getUsageLimitText(),
                    'configuration' => $tool->configuration,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating tool: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update tool',
            ], 500);
        }
    }

    /**
     * Delete a tool
     */
    public function destroy(SubscriptionPlan $plan, SubscriptionPlanTool $tool)
    {
        if ($tool->plan_id !== $plan->id) {
            return response()->json([
                'success' => false,
                'error' => 'Tool does not belong to this plan',
            ], 404);
        }

        try {
            $tool->delete();

            return response()->json([
                'success' => true,
                'message' => 'Tool deleted successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting tool: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete tool',
            ], 500);
        }
    }

    /**
     * Bulk enable/disable tools
     */
    public function bulkToggle(Request $request, SubscriptionPlan $plan)
    {
        $validated = $request->validate([
            'tool_ids' => 'required|array|min:1',
            'tool_ids.*' => 'string',
            'is_enabled' => 'required|boolean',
        ]);

        try {
            $updated = $plan->planTools()
                ->whereIn('id', $validated['tool_ids'])
                ->update(['is_enabled' => $validated['is_enabled']]);

            return response()->json([
                'success' => true,
                'message' => $validated['is_enabled'] ? 'Tools enabled' : 'Tools disabled',
                'updated_count' => $updated,
            ]);
        } catch (\Exception $e) {
            Log::error('Error bulk toggling tools: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update tools',
            ], 500);
        }
    }

    /**
     * Get tools by category
     */
    public function getByCategory(Request $request, SubscriptionPlan $plan)
    {
        $validated = $request->validate([
            'category' => 'required|in:mcp_server,integration,built_in_tool',
        ]);

        $tools = $plan->planTools()
            ->where('tool_category', $validated['category'])
            ->orderBy('tool_name')
            ->get()
            ->map(fn($tool) => [
                'id' => $tool->id,
                'tool_key' => $tool->tool_key,
                'tool_name' => $tool->tool_name,
                'is_enabled' => $tool->is_enabled,
            ]);

        return response()->json([
            'success' => true,
            'category' => $validated['category'],
            'tools' => $tools,
        ]);
    }
}
