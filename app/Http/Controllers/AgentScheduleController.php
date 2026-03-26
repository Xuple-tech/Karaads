<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\AgentSchedule;
use App\Models\Projects;
use App\Services\AgentSchedulerService;
use Illuminate\Http\Request;

class AgentScheduleController extends Controller
{
    public function __construct(
        protected AgentSchedulerService $service
    ) {}

    /**
     * List agent schedules
     */
    public function index(Request $request, string $projectId, string $agentId)
    {
        $agent = Agent::findOrFail($agentId);

        $schedules = $agent->schedules()
            ->where('project_id', $projectId)
            ->with(['toolChain', 'executions'])
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'schedules' => $schedules->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'description' => $s->description,
                'trigger_type' => $s->trigger_type,
                'trigger_type_label' => $s->getTriggerTypeLabel(),
                'cron_expression' => $s->cron_expression,
                'webhook_token' => $s->webhook_token,
                'is_active' => $s->is_active,
                'execution_count' => $s->execution_count,
                'last_executed_at' => $s->last_executed_at,
                'next_execution' => $this->service->getNextRunTime($s),
                'tool_chain' => $s->toolChain ? [
                    'id' => $s->toolChain->id,
                    'name' => $s->toolChain->name,
                ] : null,
            ]),
        ]);
    }

    /**
     * Get single schedule
     */
    public function show(Request $request, string $projectId, string $agentId, string $scheduleId)
    {
        $schedule = AgentSchedule::findOrFail($scheduleId);
        $stats = $this->service->getExecutionStats($schedule);

        return response()->json([
            'success' => true,
            'schedule' => [
                'id' => $schedule->id,
                'name' => $schedule->name,
                'description' => $schedule->description,
                'trigger_type' => $schedule->trigger_type,
                'cron_expression' => $schedule->cron_expression,
                'is_active' => $schedule->is_active,
                'input_data' => $schedule->input_data,
                'stats' => $stats,
            ],
        ]);
    }

    /**
     * Create schedule
     */
    public function store(Request $request, string $projectId, string $agentId)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'trigger_type' => 'required|in:cron,webhook,manual',
            'cron_expression' => 'required_if:trigger_type,cron|string',
            'tool_chain_id' => 'nullable|string',
            'input_data' => 'nullable|array',
        ]);

        $agent = Agent::findOrFail($agentId);

        if ($request->input('trigger_type') === 'cron') {
            if (!$this->service->isValidCron($request->input('cron_expression'))) {
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid cron expression',
                ], 422);
            }

            $schedule = $this->service->createSchedule(
                $agent->id,
                $projectId,
                $request->input('name'),
                $request->input('cron_expression'),
                $request->input('tool_chain_id'),
                $request->input('input_data', []),
                $request->input('description')
            );
        } else {
            $schedule = $this->service->createWebhookTrigger(
                $agent->id,
                $projectId,
                $request->input('name'),
                $request->input('tool_chain_id'),
                $request->input('input_data', []),
                $request->input('description')
            );
        }

        return response()->json([
            'success' => true,
            'schedule' => $schedule,
            'message' => 'Schedule created successfully',
        ]);
    }

    /**
     * Update schedule
     */
    public function update(Request $request, string $projectId, string $agentId, string $scheduleId)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'cron_expression' => 'nullable|string',
            'is_active' => 'nullable|boolean',
            'input_data' => 'nullable|array',
        ]);

        $schedule = AgentSchedule::findOrFail($scheduleId);

        if ($request->has('cron_expression') && $request->input('cron_expression') !== $schedule->cron_expression) {
            if (!$this->service->isValidCron($request->input('cron_expression'))) {
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid cron expression',
                ], 422);
            }
        }

        $schedule->update($request->only(['name', 'description', 'cron_expression', 'is_active', 'input_data']));

        return response()->json([
            'success' => true,
            'schedule' => $schedule,
        ]);
    }

    /**
     * Delete schedule
     */
    public function destroy(string $projectId, string $agentId, string $scheduleId)
    {
        $schedule = AgentSchedule::findOrFail($scheduleId);
        $this->service->delete($schedule);

        return response()->json(['success' => true]);
    }

    /**
     * Execute schedule manually
     */
    public function execute(Request $request, string $projectId, string $agentId, string $scheduleId)
    {
        $schedule = AgentSchedule::findOrFail($scheduleId);
        $inputData = $request->input('input_data', []);

        $result = $this->service->execute($schedule, $inputData);

        return response()->json($result);
    }

    /**
     * Get execution history
     */
    public function history(Request $request, string $projectId, string $agentId, string $scheduleId)
    {
        $schedule = AgentSchedule::findOrFail($scheduleId);
        $limit = $request->input('limit', 20);

        $executions = $this->service->getExecutionHistory($schedule, $limit);

        return response()->json([
            'success' => true,
            'executions' => $executions->map(fn ($e) => [
                'id' => $e->id,
                'status' => $e->status,
                'status_color' => $e->getStatusColor(),
                'duration' => $e->getFormattedDuration(),
                'error_message' => $e->error_message,
                'started_at' => $e->started_at,
                'completed_at' => $e->completed_at,
            ]),
        ]);
    }

    /**
     * Get execution stats
     */
    public function stats(string $projectId, string $agentId, string $scheduleId)
    {
        $schedule = AgentSchedule::findOrFail($scheduleId);
        $stats = $this->service->getExecutionStats($schedule);

        return response()->json([
            'success' => true,
            'stats' => $stats,
        ]);
    }

    /**
     * Toggle active status
     */
    public function toggle(string $projectId, string $agentId, string $scheduleId)
    {
        $schedule = AgentSchedule::findOrFail($scheduleId);

        if ($schedule->is_active) {
            $this->service->deactivate($schedule);
        } else {
            $this->service->activate($schedule);
        }

        return response()->json([
            'success' => true,
            'is_active' => $schedule->is_active,
        ]);
    }
}
