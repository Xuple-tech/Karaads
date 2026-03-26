<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Projects;
use App\Services\AgentMemoryService;
use App\Services\AgentSchedulerService;
use App\Services\ToolCompositionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

/**
 * AgentIntelligenceController - Serves the Agent Intelligence Dashboard
 *
 * Manages the display of:
 * - Memory System: Agent memory browsing and management
 * - Workflow System: Workflow creation and composition
 * - Scheduling System: Schedule management and execution
 * - Execution Monitor: Real-time workflow execution tracking
 */
class AgentIntelligenceController extends Controller
{
    protected AgentMemoryService $memoryService;
    protected AgentSchedulerService $schedulerService;
    protected ToolCompositionService $toolService;

    public function __construct(
        AgentMemoryService $memoryService,
        AgentSchedulerService $schedulerService,
        ToolCompositionService $toolService
    ) {
        $this->memoryService = $memoryService;
        $this->schedulerService = $schedulerService;
        $this->toolService = $toolService;
    }

    /**
     * Show the Agent Intelligence Dashboard
     */
    public function show(Projects $project, Agent $agent)
    {
        // Authorize access to project and agent
        $this->authorize('view', $project);

        if ($agent->project_id !== $project->id) {
            abort(404);
        }

        // Load agent with relationships
        $agent->load(['memories', 'schedules', 'triggers', 'actions']);

        // Get dashboard statistics
        $memoryStats = $this->getMemoryStats($agent);
        $scheduleStats = $this->getScheduleStats($agent);
        $workflowStats = $this->getWorkflowStats($agent);

        return Inertia::render('Projects/AgentIntelligence', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
            ],
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
                'type' => $agent->type,
                'description' => $agent->description,
                'status' => $agent->status,
                'capabilities' => $agent->capabilities,
                'configuration' => $agent->configuration,
            ],
            'stats' => [
                'memory' => $memoryStats,
                'schedules' => $scheduleStats,
                'workflows' => $workflowStats,
            ],
            'availableTools' => $this->getAvailableTools(),
        ]);
    }

    /**
     * Get memory system statistics
     */
    private function getMemoryStats(Agent $agent): array
    {
        $memories = $agent->memories()->get();

        return [
            'total' => $memories->count(),
            'averageRelevance' => $memories->avg('relevance_score') ?? 0,
            'mostUsedTags' => $this->getMostUsedTags($agent),
            'totalReuses' => $memories->sum('usage_count') ?? 0,
            'lastUpdated' => $memories->max('updated_at')?->toIso8601String(),
        ];
    }

    /**
     * Get most used tags from memories
     */
    private function getMostUsedTags(Agent $agent): array
    {
        $memories = $agent->memories()->get();
        $tagCounts = [];

        foreach ($memories as $memory) {
            $tags = $memory->tags ?? [];
            foreach ($tags as $tag) {
                $tagCounts[$tag] = ($tagCounts[$tag] ?? 0) + 1;
            }
        }

        arsort($tagCounts);
        return array_slice(array_keys($tagCounts), 0, 5);
    }

    /**
     * Get schedule system statistics
     */
    private function getScheduleStats(Agent $agent): array
    {
        $schedules = $agent->schedules()->get();
        $executions = $agent->executionLogs()->recent()->limit(100)->get();

        $successful = $executions->where('status', 'completed')->count();
        $failed = $executions->where('status', 'failed')->count();
        $totalExecutions = $executions->count();

        return [
            'total' => $schedules->count(),
            'active' => $schedules->where('enabled', true)->count(),
            'executions' => [
                'total' => $totalExecutions,
                'successful' => $successful,
                'failed' => $failed,
                'successRate' => $totalExecutions > 0 ? ($successful / $totalExecutions) * 100 : 0,
            ],
            'nextExecution' => $this->getNextExecution($agent),
        ];
    }

    /**
     * Get next scheduled execution
     */
    private function getNextExecution(Agent $agent): ?array
    {
        $nextSchedule = $agent->schedules()
            ->where('enabled', true)
            ->whereNotNull('cron_expression')
            ->orderBy('next_run_at', 'asc')
            ->first();

        if (!$nextSchedule) {
            return null;
        }

        return [
            'scheduleId' => $nextSchedule->id,
            'name' => $nextSchedule->name,
            'runAt' => $nextSchedule->next_run_at?->toIso8601String(),
        ];
    }

    /**
     * Get workflow system statistics
     */
    private function getWorkflowStats(Agent $agent): array
    {
        $workflows = $agent->toolChains()->get();

        return [
            'total' => $workflows->count(),
            'byExecutionMode' => [
                'sequential' => $workflows->where('execution_mode', 'sequential')->count(),
                'parallel' => $workflows->where('execution_mode', 'parallel')->count(),
                'conditional' => $workflows->where('execution_mode', 'conditional')->count(),
            ],
            'averageSteps' => $workflows->average('total_steps') ?? 0,
            'mostUsed' => $this->getMostUsedWorkflow($agent),
        ];
    }

    /**
     * Get most frequently executed workflow
     */
    private function getMostUsedWorkflow(Agent $agent): ?array
    {
        $mostUsed = $agent->toolChains()
            ->withCount('executionLogs')
            ->orderByDesc('execution_logs_count')
            ->first();

        if (!$mostUsed) {
            return null;
        }

        return [
            'id' => $mostUsed->id,
            'name' => $mostUsed->name,
            'executions' => $mostUsed->execution_logs_count ?? 0,
        ];
    }

    /**
     * Get available tools for workflow composition
     */
    private function getAvailableTools(): array
    {
        $tools = \App\Models\Tool::where('status', 'active')
            ->select(['id', 'name', 'description', 'category', 'parameters', 'output_schema'])
            ->get();

        return $tools->map(fn ($tool) => [
            'id' => $tool->id,
            'name' => $tool->name,
            'description' => $tool->description,
            'category' => $tool->category,
            'parameters' => $tool->parameters,
            'outputSchema' => $tool->output_schema,
        ])->toArray();
    }

    /**
     * Export memories to markdown
     */
    public function exportMemories(Projects $project, Agent $agent, Request $request)
    {
        $this->authorize('view', $project);

        if ($agent->project_id !== $project->id) {
            abort(404);
        }

        $memories = $agent->memories()->get();

        $markdown = "# Agent Memory Export\n\n";
        $markdown .= "**Agent:** {$agent->name}\n";
        $markdown .= "**Project:** {$project->name}\n";
        $markdown .= "**Exported:** " . now()->toDateTimeString() . "\n\n";

        foreach ($memories as $memory) {
            $markdown .= "## {$memory->title}\n\n";
            $markdown .= "**Content:** {$memory->content}\n\n";
            $markdown .= "**Relevance Score:** {$memory->relevance_score}\n";
            $markdown .= "**Tags:** " . implode(', ', $memory->tags ?? []) . "\n";
            $markdown .= "**Usage Count:** {$memory->usage_count}\n\n";
            $markdown .= "---\n\n";
        }

        return response()->streamDownload(
            fn () => print($markdown),
            'agent-memories-' . $agent->slug . '.md'
        );
    }

    /**
     * Dashboard summary for quick stats
     */
    public function summary(Projects $project, Agent $agent)
    {
        $this->authorize('view', $project);

        if ($agent->project_id !== $project->id) {
            abort(404);
        }

        return response()->json([
            'memory' => $this->getMemoryStats($agent),
            'schedules' => $this->getScheduleStats($agent),
            'workflows' => $this->getWorkflowStats($agent),
        ]);
    }
}
