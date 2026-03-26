<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Projects;
use App\Models\ToolChain;
use App\Models\ToolChainStep;
use App\Services\ToolCompositionService;
use Illuminate\Http\Request;

class ToolChainController extends Controller
{
    public function __construct(
        protected ToolCompositionService $service
    ) {}

    /**
     * List tool chains for an agent
     */
    public function index(Request $request, string $projectId, string $agentId)
    {
        $agent = Agent::findOrFail($agentId);

        $chains = $agent->toolChains()
            ->where('project_id', $projectId)
            ->with('steps')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'chains' => $chains->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'description' => $c->description,
                'execution_mode' => $c->execution_mode,
                'execution_mode_label' => $c->getExecutionModeLabel(),
                'is_active' => $c->is_active,
                'execution_count' => $c->execution_count,
                'last_executed_at' => $c->last_executed_at,
                'steps_count' => $c->steps->count(),
            ]),
        ]);
    }

    /**
     * Get single tool chain
     */
    public function show(Request $request, string $projectId, string $agentId, string $chainId)
    {
        $chain = ToolChain::findOrFail($chainId);
        $steps = $chain->steps()->orderBy('sequence')->get();

        return response()->json([
            'success' => true,
            'chain' => [
                'id' => $chain->id,
                'name' => $chain->name,
                'description' => $chain->description,
                'execution_mode' => $chain->execution_mode,
                'is_active' => $chain->is_active,
                'steps' => $steps->map(fn ($s) => [
                    'id' => $s->id,
                    'sequence' => $s->sequence,
                    'tool_name' => $s->tool_name,
                    'parameters' => $s->parameters,
                    'next_step_on_success' => $s->next_step_on_success,
                    'next_step_on_failure' => $s->next_step_on_failure,
                    'is_conditional' => $s->is_conditional,
                    'condition_logic' => $s->condition_logic,
                ]),
            ],
        ]);
    }

    /**
     * Create tool chain
     */
    public function store(Request $request, string $projectId, string $agentId)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'execution_mode' => 'required|in:sequential,parallel,conditional',
            'steps' => 'required|array|min:1',
            'steps.*.tool_name' => 'required|string',
            'steps.*.parameters' => 'nullable|array',
        ]);

        $agent = Agent::findOrFail($agentId);

        $chain = $agent->toolChains()->create([
            'project_id' => $projectId,
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'execution_mode' => $request->input('execution_mode'),
        ]);

        // Create steps
        foreach ($request->input('steps') as $index => $stepData) {
            $chain->steps()->create([
                'sequence' => $index + 1,
                'tool_name' => $stepData['tool_name'],
                'parameters' => $stepData['parameters'] ?? [],
                'next_step_on_success' => $stepData['next_step_on_success'] ?? null,
                'next_step_on_failure' => $stepData['next_step_on_failure'] ?? null,
                'is_conditional' => $stepData['is_conditional'] ?? false,
                'condition_logic' => $stepData['condition_logic'] ?? null,
            ]);
        }

        return response()->json([
            'success' => true,
            'chain' => $chain->load('steps'),
            'message' => 'Tool chain created successfully',
        ]);
    }

    /**
     * Update tool chain
     */
    public function update(Request $request, string $projectId, string $agentId, string $chainId)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'execution_mode' => 'required|in:sequential,parallel,conditional',
            'is_active' => 'nullable|boolean',
        ]);

        $chain = ToolChain::findOrFail($chainId);

        $chain->update([
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'execution_mode' => $request->input('execution_mode'),
            'is_active' => $request->input('is_active', $chain->is_active),
        ]);

        return response()->json([
            'success' => true,
            'chain' => $chain,
        ]);
    }

    /**
     * Delete tool chain
     */
    public function destroy(string $projectId, string $agentId, string $chainId)
    {
        $chain = ToolChain::findOrFail($chainId);
        $chain->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Validate chain
     */
    public function validateChain(Request $request, string $projectId, string $agentId, string $chainId)
    {
        $chain = ToolChain::findOrFail($chainId);
        $errors = $this->service->validateChain($chain);

        return response()->json([
            'success' => empty($errors),
            'errors' => $errors,
        ]);
    }

    /**
     * Get execution plan
     */
    public function plan(string $projectId, string $agentId, string $chainId)
    {
        $chain = ToolChain::findOrFail($chainId);
        $plan = $this->service->getExecutionPlan($chain);

        return response()->json([
            'success' => true,
            'plan' => $plan,
        ]);
    }

    /**
     * Execute tool chain
     */
    public function execute(Request $request, string $projectId, string $agentId, string $chainId)
    {
        $chain = ToolChain::findOrFail($chainId);
        $agent = Agent::findOrFail($agentId);
        $inputData = $request->input('input_data', []);

        $result = $this->service->execute($chain, $inputData, $agent);

        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'] ?? '',
            'results' => $result['results'] ?? [],
            'errors' => $result['errors'] ?? [],
        ]);
    }
}
