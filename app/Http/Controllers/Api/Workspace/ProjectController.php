<?php

namespace App\Http\Controllers\Api\Workspace;

use App\Http\Controllers\Controller;
use App\Models\Workspace\Project;
use App\Services\Workspace\ProjectWorkspaceService;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function __construct(
        protected ProjectWorkspaceService $workspace,
    ) {
    }

    public function index(Request $request)
    {
        return response()->json([
            'data' => $this->workspace->listProjectsFor($request->user()),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'project_type' => 'nullable|string|max:100',
            'status' => 'nullable|string|max:50',
            'visibility' => 'nullable|string|max:50',
            'settings' => 'nullable|array',
        ]);

        return response()->json([
            'data' => $this->workspace->createProject($request->user(), $validated),
        ], 201);
    }

    public function show(Request $request, Project $project)
    {
        $project = $this->workspace->viewableProject($project, $request->user());

        return response()->json([
            'data' => $project->loadCount(['conversations', 'agents', 'tools', 'mcpServers']),
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|string|max:50',
            'visibility' => 'sometimes|string|max:50',
            'settings' => 'nullable|array',
        ]);

        return response()->json([
            'data' => $this->workspace->updateProject($project, $request->user(), $validated),
        ]);
    }
}
