<?php

namespace App\Services\Workspace;

use App\Models\User;
use App\Models\Workspace\Project;
use App\Models\Workspace\ProjectAgent;

class ProjectAgentService
{
    public function __construct(
        protected BillingGateService $billingGate,
    ) {
    }

    public function listAgents(Project $project)
    {
        return $project->agents()->orderBy('created_at')->get();
    }

    public function createAgent(Project $project, User $user, array $data): ProjectAgent
    {
        $gate = $this->billingGate->canCreateProjectAgent($project, $user);
        abort_unless($gate['allowed'], 422, $gate['reason']);

        return ProjectAgent::create([
            'project_id' => $project->id,
            'created_by' => $user->id,
            'name' => $data['name'],
            'instructions' => $data['instructions'] ?? null,
            'provider' => $data['provider'] ?? 'internal',
            'model' => $data['model'] ?? 'workspace-default',
            'enabled_tools' => $data['enabled_tools'] ?? [],
            'memory_mode' => $data['memory_mode'] ?? 'conversation',
            'status' => $data['status'] ?? 'active',
            'metadata' => $data['metadata'] ?? [],
        ]);
    }

    public function updateAgent(Project $project, ProjectAgent $agent, array $data): ProjectAgent
    {
        abort_unless($agent->project_id === $project->id, 404);

        $agent->update([
            'name' => $data['name'] ?? $agent->name,
            'instructions' => array_key_exists('instructions', $data) ? $data['instructions'] : $agent->instructions,
            'provider' => $data['provider'] ?? $agent->provider,
            'model' => $data['model'] ?? $agent->model,
            'enabled_tools' => $data['enabled_tools'] ?? $agent->enabled_tools,
            'memory_mode' => $data['memory_mode'] ?? $agent->memory_mode,
            'status' => $data['status'] ?? $agent->status,
            'metadata' => $data['metadata'] ?? $agent->metadata,
        ]);

        return $agent->refresh();
    }
}
