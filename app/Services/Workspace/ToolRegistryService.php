<?php

namespace App\Services\Workspace;

use App\Models\User;
use App\Models\Workspace\Project;
use App\Models\Workspace\ProjectTool;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ToolRegistryService
{
    public function listTools(Project $project)
    {
        return $project->tools()->orderBy('created_at')->get();
    }

    public function createTool(Project $project, User $user, array $data): ProjectTool
    {
        return ProjectTool::create([
            'project_id' => $project->id,
            'created_by' => $user->id,
            'name' => $data['name'],
            'slug' => $data['slug'] ?? Str::slug($data['name']),
            'description' => $data['description'] ?? null,
            'type' => $data['type'] ?? 'internal',
            'handler' => $data['handler'] ?? 'echo',
            'config' => $data['config'] ?? [],
            'input_schema' => $data['input_schema'] ?? ['type' => 'object', 'properties' => []],
            'output_schema' => $data['output_schema'] ?? ['type' => 'object', 'properties' => ['result' => ['type' => 'string']]],
            'status' => $data['status'] ?? 'active',
        ]);
    }

    public function execute(Project $project, ProjectTool $tool, array $arguments = []): array
    {
        if ($tool->project_id !== $project->id) {
            throw ValidationException::withMessages(['tool' => 'Tool does not belong to the project.']);
        }

        if ($tool->status !== 'active') {
            throw ValidationException::withMessages(['tool' => 'Tool is not active.']);
        }

        return match ($tool->handler) {
            'project_summary' => $this->projectSummary($project),
            'static_response' => [
                'success' => true,
                'result' => $tool->config['response'] ?? 'No static response configured.',
            ],
            default => [
                'success' => true,
                'result' => $arguments['message'] ?? $arguments['input'] ?? 'Tool executed.',
                'arguments' => $arguments,
            ],
        };
    }

    protected function projectSummary(Project $project): array
    {
        return [
            'success' => true,
            'result' => sprintf(
                'Project "%s" has %d conversations, %d agents, %d tools, and %d MCP servers.',
                $project->title,
                $project->conversations()->count(),
                $project->agents()->count(),
                $project->tools()->count(),
                $project->mcpServers()->count()
            ),
        ];
    }
}
