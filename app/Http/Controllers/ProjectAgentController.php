<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\AgentAction;
use App\Models\AgentExecutionLog;
use App\Models\AgentTrigger;
use App\Models\Projects;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * ProjectAgentController - Manages project agents, triggers, and actions
 */
class ProjectAgentController extends Controller
{
    /**
     * Get all agents for a project
     */
    public function index(Projects $project)
    {
        $this->authorize('view', $project);

        $agents = $project->agents()
            ->with('triggers', 'actions', 'executionLogs')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'data' => $agents->items(),
            'pagination' => [
                'current_page' => $agents->currentPage(),
                'total' => $agents->total(),
                'per_page' => $agents->perPage(),
            ],
        ]);
    }

    /**
     * Create agent
     */
    public function store(Projects $project, Request $request)
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:automation,tool,responder',
            'description' => 'nullable|string',
            'configuration' => 'nullable|array',
            'capabilities' => 'nullable|array',
            'status' => 'nullable|string|in:active,inactive',
        ]);

        $agent = $project->agents()->create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'type' => $validated['type'],
            'description' => $validated['description'],
            'configuration' => $validated['configuration'] ?? [],
            'capabilities' => $validated['capabilities'] ?? [],
            'status' => $validated['status'] ?? 'inactive',
        ]);

        return response()->json([
            'data' => $agent->load('triggers', 'actions'),
            'message' => 'Agent created successfully',
        ], 201);
    }

    /**
     * Show agent details
     */
    public function show(Projects $project, Agent $agent)
    {
        $this->authorize('view', $project);

        if ($agent->project_id !== $project->id) {
            abort(404);
        }

        return response()->json([
            'data' => $agent->load('triggers', 'actions', 'executionLogs'),
        ]);
    }

    /**
     * Update agent
     */
    public function update(Projects $project, Agent $agent, Request $request)
    {
        $this->authorize('update', $project);

        if ($agent->project_id !== $project->id) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'configuration' => 'nullable|array',
            'capabilities' => 'nullable|array',
            'status' => 'sometimes|string|in:active,inactive',
        ]);

        $agent->update($validated);

        return response()->json([
            'data' => $agent->load('triggers', 'actions'),
            'message' => 'Agent updated successfully',
        ]);
    }

    /**
     * Delete agent
     */
    public function destroy(Projects $project, Agent $agent)
    {
        $this->authorize('update', $project);

        if ($agent->project_id !== $project->id) {
            abort(404);
        }

        $agent->delete();

        return response()->json([
            'message' => 'Agent deleted successfully',
        ]);
    }

    /**
     * Get agent triggers
     */
    public function triggers(Projects $project, Agent $agent)
    {
        $this->authorize('view', $project);

        if ($agent->project_id !== $project->id) {
            abort(404);
        }

        $triggers = $agent->triggers()
            ->orderBy('priority', 'desc')
            ->paginate(20);

        return response()->json([
            'data' => $triggers->items(),
            'pagination' => [
                'current_page' => $triggers->currentPage(),
                'total' => $triggers->total(),
                'per_page' => $triggers->perPage(),
            ],
        ]);
    }

    /**
     * Create trigger
     */
    public function storeTrigger(Projects $project, Agent $agent, Request $request)
    {
        $this->authorize('update', $project);

        if ($agent->project_id !== $project->id) {
            abort(404);
        }

        $validated = $request->validate([
            'trigger_type' => 'required|string|in:keyword,pattern,schedule,event,condition,manual',
            'trigger_data' => 'required|array',
            'priority' => 'nullable|integer|min:0|max:100',
            'status' => 'nullable|string|in:active,inactive',
            'description' => 'nullable|string',
        ]);

        $trigger = $agent->triggers()->create([
            'trigger_type' => $validated['trigger_type'],
            'trigger_data' => $validated['trigger_data'],
            'priority' => $validated['priority'] ?? 50,
            'status' => $validated['status'] ?? 'active',
            'description' => $validated['description'],
        ]);

        return response()->json([
            'data' => $trigger,
            'message' => 'Trigger created successfully',
        ], 201);
    }

    /**
     * Update trigger
     */
    public function updateTrigger(Projects $project, Agent $agent, AgentTrigger $trigger, Request $request)
    {
        $this->authorize('update', $project);

        if ($agent->project_id !== $project->id || $trigger->agent_id !== $agent->id) {
            abort(404);
        }

        $validated = $request->validate([
            'trigger_data' => 'sometimes|array',
            'priority' => 'sometimes|integer|min:0|max:100',
            'status' => 'sometimes|string|in:active,inactive',
            'description' => 'nullable|string',
        ]);

        $trigger->update($validated);

        return response()->json([
            'data' => $trigger,
            'message' => 'Trigger updated successfully',
        ]);
    }

    /**
     * Delete trigger
     */
    public function destroyTrigger(Projects $project, Agent $agent, AgentTrigger $trigger)
    {
        $this->authorize('update', $project);

        if ($agent->project_id !== $project->id || $trigger->agent_id !== $agent->id) {
            abort(404);
        }

        $trigger->delete();

        return response()->json([
            'message' => 'Trigger deleted successfully',
        ]);
    }

    /**
     * Get agent actions
     */
    public function actions(Projects $project, Agent $agent)
    {
        $this->authorize('view', $project);

        if ($agent->project_id !== $project->id) {
            abort(404);
        }

        $actions = $agent->actions()
            ->orderBy('sequence', 'asc')
            ->paginate(20);

        return response()->json([
            'data' => $actions->items(),
            'pagination' => [
                'current_page' => $actions->currentPage(),
                'total' => $actions->total(),
                'per_page' => $actions->perPage(),
            ],
        ]);
    }

    /**
     * Create action
     */
    public function storeAction(Projects $project, Agent $agent, Request $request)
    {
        $this->authorize('update', $project);

        if ($agent->project_id !== $project->id) {
            abort(404);
        }

        $validated = $request->validate([
            'action_type' => 'required|string|in:respond,summarize,execute_tool,generate_content,notify,escalate',
            'action_config' => 'required|array',
            'sequence' => 'nullable|integer|min:0',
            'enabled' => 'nullable|boolean',
            'description' => 'nullable|string',
        ]);

        // Get max sequence if not provided
        $maxSequence = $agent->actions()->max('sequence') ?? -1;
        $sequence = $validated['sequence'] ?? $maxSequence + 1;

        $action = $agent->actions()->create([
            'action_type' => $validated['action_type'],
            'action_config' => $validated['action_config'],
            'sequence' => $sequence,
            'enabled' => $validated['enabled'] ?? true,
            'description' => $validated['description'],
        ]);

        return response()->json([
            'data' => $action,
            'message' => 'Action created successfully',
        ], 201);
    }

    /**
     * Update action
     */
    public function updateAction(Projects $project, Agent $agent, AgentAction $action, Request $request)
    {
        $this->authorize('update', $project);

        if ($agent->project_id !== $project->id || $action->agent_id !== $agent->id) {
            abort(404);
        }

        $validated = $request->validate([
            'action_config' => 'sometimes|array',
            'sequence' => 'sometimes|integer|min:0',
            'enabled' => 'sometimes|boolean',
            'description' => 'nullable|string',
        ]);

        $action->update($validated);

        return response()->json([
            'data' => $action,
            'message' => 'Action updated successfully',
        ]);
    }

    /**
     * Delete action
     */
    public function destroyAction(Projects $project, Agent $agent, AgentAction $action)
    {
        $this->authorize('update', $project);

        if ($agent->project_id !== $project->id || $action->agent_id !== $agent->id) {
            abort(404);
        }

        $action->delete();

        return response()->json([
            'message' => 'Action deleted successfully',
        ]);
    }

    /**
     * Get execution logs
     */
    public function executionLogs(Projects $project, Agent $agent, Request $request)
    {
        $this->authorize('view', $project);

        if ($agent->project_id !== $project->id) {
            abort(404);
        }

        $query = $agent->executionLogs();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->get('from_date'));
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->get('to_date'));
        }

        $logs = $query->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'data' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
            ],
        ]);
    }

    /**
     * Get specific execution log
     */
    public function executionLogDetail(Projects $project, Agent $agent, AgentExecutionLog $log)
    {
        $this->authorize('view', $project);

        if ($agent->project_id !== $project->id || $log->agent_id !== $agent->id) {
            abort(404);
        }

        return response()->json([
            'data' => $log->load('agent', 'trigger'),
        ]);
    }

    /**
     * Get agent statistics
     */
    public function statistics(Projects $project, Agent $agent)
    {
        $this->authorize('view', $project);

        if ($agent->project_id !== $project->id) {
            abort(404);
        }

        $totalExecutions = $agent->executionLogs()->count();
        $successfulExecutions = $agent->executionLogs()->where('status', 'completed')->count();
        $failedExecutions = $agent->executionLogs()->where('status', 'failed')->count();
        $averageExecutionTime = $agent->executionLogs()
            ->where('status', 'completed')
            ->avg('execution_time') ?? 0;

        $recentActivity = $agent->executionLogs()
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['id', 'status', 'created_at', 'execution_time']);

        return response()->json([
            'total_executions' => $totalExecutions,
            'successful_executions' => $successfulExecutions,
            'failed_executions' => $failedExecutions,
            'success_rate' => $totalExecutions > 0 ? round(($successfulExecutions / $totalExecutions) * 100, 2) : 0,
            'average_execution_time' => round($averageExecutionTime, 2),
            'recent_activity' => $recentActivity,
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
                'type' => $agent->type,
                'status' => $agent->status,
                'execution_count' => $agent->execution_count,
            ],
        ]);
    }

    /**
     * Enable/disable agent
     */
    public function toggleStatus(Projects $project, Agent $agent)
    {
        $this->authorize('update', $project);

        if ($agent->project_id !== $project->id) {
            abort(404);
        }

        $newStatus = $agent->status === 'active' ? 'inactive' : 'active';
        $agent->update(['status' => $newStatus]);

        return response()->json([
            'data' => $agent,
            'status' => $newStatus,
            'message' => "Agent {$newStatus} successfully",
        ]);
    }

    /**
     * Test trigger
     */
    public function testTrigger(Projects $project, Agent $agent, AgentTrigger $trigger, Request $request)
    {
        $this->authorize('update', $project);

        if ($agent->project_id !== $project->id || $trigger->agent_id !== $agent->id) {
            abort(404);
        }

        $validated = $request->validate([
            'test_message' => 'required|string',
        ]);

        // Create a mock chat to test trigger matching
        $mockChat = new \App\Models\Chat([
            'message' => $validated['test_message'],
            'user_id' => Auth::id(),
        ]);

        $service = new \App\Services\AgentExecutionService();
        $matches = $service->matchesTrigger($trigger, $mockChat);

        return response()->json([
            'matches' => $matches,
            'test_message' => $validated['test_message'],
            'trigger' => $trigger,
            'message' => $matches ? 'Trigger matched!' : 'Trigger did not match',
        ]);
    }
}
