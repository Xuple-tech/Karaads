<?php

namespace App\Http\Controllers;

use App\Models\Workflow;
use App\Models\WorkflowExecution;
use App\Models\Team;
use App\Models\Tool;
use App\Services\WorkflowExecutionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class WorkflowController extends Controller
{
    protected WorkflowExecutionService $executionService;

    public function __construct(WorkflowExecutionService $executionService)
    {
        $this->executionService = $executionService;
        $this->middleware('auth');
    }

    /**
     * GET /api/teams/{team}/workflows - List workflows
     */
    public function index(Team $team)
    {
        $this->authorize('view', $team);

        $workflows = $team->workflows()
            ->with('creator')
            ->orderByDesc('updated_at')
            ->paginate(20);

        return response()->json([
            'data' => $workflows->items(),
            'pagination' => [
                'total' => $workflows->total(),
                'per_page' => $workflows->perPage(),
                'current_page' => $workflows->currentPage(),
                'last_page' => $workflows->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/teams/{team}/workflows - Create workflow
     */
    public function store(Request $request, Team $team)
    {
        $this->authorize('create', Workflow::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'in:visual,code,hybrid',
            'definition' => 'required|array',
        ]);

        $workflow = $team->workflows()->create([
            'created_by' => Auth::id(),
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . Str::random(6),
            'description' => $validated['description'],
            'type' => $validated['type'] ?? 'visual',
            'definition' => $validated['definition'],
        ]);

        // Log activity
        $team->logActivity(Auth::user(), 'create', 'Workflow', $workflow->id);

        return response()->json(['data' => $workflow], 201);
    }

    /**
     * GET /api/workflows/{workflow} - Get workflow details
     */
    public function show(Workflow $workflow)
    {
        $this->authorize('view', $workflow);

        return response()->json([
            'data' => [
                'id' => $workflow->id,
                'name' => $workflow->name,
                'description' => $workflow->description,
                'type' => $workflow->type,
                'status' => $workflow->status,
                'version' => $workflow->version,
                'definition' => $workflow->definition,
                'created_by' => $workflow->creator->name,
                'created_at' => $workflow->created_at->toIso8601String(),
                'updated_at' => $workflow->updated_at->toIso8601String(),
                'steps_count' => $workflow->steps()->count(),
                'triggers_count' => $workflow->triggers()->count(),
            ],
        ]);
    }

    /**
     * PUT /api/workflows/{workflow} - Update workflow
     */
    public function update(Request $request, Workflow $workflow)
    {
        $this->authorize('update', $workflow);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'definition' => 'array',
            'status' => 'in:draft,published,archived',
        ]);

        $workflow->update($validated);

        $workflow->team?->logActivity(Auth::user(), 'update', 'Workflow', $workflow->id, $validated);

        return response()->json(['data' => $workflow]);
    }

    /**
     * DELETE /api/workflows/{workflow} - Delete workflow
     */
    public function destroy(Workflow $workflow)
    {
        $this->authorize('delete', $workflow);

        $team = $workflow->team;
        $workflow->delete();

        if ($team) {
            $team->logActivity(Auth::user(), 'delete', 'Workflow', $workflow->id);
        }

        return response()->json(['message' => 'Workflow deleted']);
    }

    /**
     * POST /api/workflows/{workflow}/execute - Execute workflow
     */
    public function execute(Request $request, Workflow $workflow)
    {
        $this->authorize('execute', $workflow);

        $validated = $request->validate([
            'input_data' => 'nullable|array',
        ]);

        try {
            $execution = $this->executionService->executeWorkflow(
                $workflow,
                Auth::user(),
                $validated['input_data'] ?? []
            );

            return response()->json(['data' => $execution->getDetails()]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * GET /api/workflows/{workflow}/executions - Get execution history
     */
    public function executionHistory(Workflow $workflow)
    {
        $this->authorize('view', $workflow);

        $history = $this->executionService->getExecutionHistory($workflow, 50);

        return response()->json(['data' => $history]);
    }

    /**
     * GET /api/workflow-executions/{execution} - Get execution details
     */
    public function executionDetails(WorkflowExecution $execution)
    {
        $this->authorize('view', $execution->workflow);

        return response()->json([
            'data' => $this->executionService->getExecutionDetails($execution),
        ]);
    }

    /**
     * GET /api/workflows/{workflow}/stats - Get workflow statistics
     */
    public function stats(Workflow $workflow)
    {
        $this->authorize('view', $workflow);

        $stats = $this->executionService->getWorkflowStats($workflow);

        return response()->json(['data' => $stats]);
    }

    /**
     * POST /api/workflows/{workflow}/publish - Publish workflow
     */
    public function publish(Request $request, Workflow $workflow)
    {
        $this->authorize('update', $workflow);

        $validated = $request->validate([
            'changelog' => 'nullable|string',
        ]);

        $version = $workflow->publish(Auth::user(), $validated['changelog'] ?? '');

        $workflow->team?->logActivity(Auth::user(), 'publish', 'Workflow', $workflow->id);

        return response()->json([
            'data' => [
                'version' => $version->version_number,
                'status' => $version->status,
                'published_at' => $version->created_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * POST /api/workflows/{workflow}/revert - Revert to version
     */
    public function revert(Request $request, Workflow $workflow)
    {
        $this->authorize('update', $workflow);

        $validated = $request->validate([
            'version' => 'required|integer|min:1',
        ]);

        if ($workflow->revertToVersion($validated['version'], Auth::user())) {
            $workflow->team?->logActivity(Auth::user(), 'revert', 'Workflow', $workflow->id, [
                'to_version' => $validated['version'],
            ]);

            return response()->json(['message' => 'Reverted successfully']);
        }

        return response()->json(['error' => 'Version not found'], 404);
    }

    /**
     * GET /api/workflows/{workflow}/versions - Get version history
     */
    public function versions(Workflow $workflow)
    {
        $this->authorize('view', $workflow);

        $versions = $workflow->versions()
            ->get()
            ->map(fn($v) => $v->getSummary());

        return response()->json(['data' => $versions]);
    }

    /**
     * GET /api/tools - Get available tools for workflow builder
     */
    public function availableTools()
    {
        $tools = Tool::where('active', true)
            ->select('id', 'name', 'description', 'category', 'parameters', 'return_schema')
            ->get();

        return response()->json(['data' => $tools]);
    }

    /**
     * GET /api/workflows/{workflow}/executions/{execution} - Get specific execution
     */
    public function getExecution(Workflow $workflow, WorkflowExecution $execution)
    {
        $this->authorize('view', $workflow);

        // Verify execution belongs to this workflow
        if ($execution->workflow_id !== $workflow->id) {
            return response()->json(['error' => 'Execution not found'], 404);
        }

        return response()->json([
            'data' => $this->executionService->getExecutionDetails($execution),
        ]);
    }

    /**
     * GET /api/teams/{team}/executions - Get all team executions
     */
    public function getTeamExecutions(Team $team)
    {
        $this->authorize('view', $team);

        $executions = WorkflowExecution::whereIn(
            'workflow_id',
            $team->workflows()->pluck('id')
        )
            ->with(['workflow', 'user'])
            ->orderByDesc('started_at')
            ->paginate(10);

        return response()->json([
            'data' => $executions->items(),
            'pagination' => [
                'total' => $executions->total(),
                'per_page' => $executions->perPage(),
                'current_page' => $executions->currentPage(),
                'last_page' => $executions->lastPage(),
            ],
            'stats' => [
                'completed' => WorkflowExecution::whereIn('workflow_id', $team->workflows()->pluck('id'))
                    ->where('status', 'completed')->count(),
                'failed' => WorkflowExecution::whereIn('workflow_id', $team->workflows()->pluck('id'))
                    ->where('status', 'failed')->count(),
                'avg_duration_ms' => WorkflowExecution::whereIn('workflow_id', $team->workflows()->pluck('id'))
                    ->where('status', 'completed')
                    ->avg('duration_ms') ?? 0,
            ],
        ]);
    }

    /**
     * POST /api/workflows/{workflow}/executions/{execution}/cancel - Cancel execution
     */
    public function cancelExecution(Workflow $workflow, WorkflowExecution $execution)
    {
        $this->authorize('view', $workflow);

        // Verify execution belongs to this workflow
        if ($execution->workflow_id !== $workflow->id) {
            return response()->json(['error' => 'Execution not found'], 404);
        }

        if ($execution->status !== 'running') {
            return response()->json(['error' => 'Can only cancel running executions'], 422);
        }

        $execution->update([
            'status' => 'cancelled',
            'completed_at' => now(),
        ]);

        return response()->json(['message' => 'Execution cancelled']);
    }

    /**
     * DELETE /api/workflows/{workflow}/executions/{execution} - Delete execution
     */
    public function deleteExecution(Workflow $workflow, WorkflowExecution $execution)
    {
        $this->authorize('delete', $workflow);

        // Verify execution belongs to this workflow
        if ($execution->workflow_id !== $workflow->id) {
            return response()->json(['error' => 'Execution not found'], 404);
        }

        $execution->delete();

        return response()->json(['message' => 'Execution deleted']);
    }
}
