<?php

namespace App\Http\Controllers\Api\Workspace;

use App\Http\Controllers\Controller;
use App\Models\Workspace\Project;
use App\Models\Workspace\ProjectTool;
use App\Services\Workspace\ProjectWorkspaceService;
use App\Services\Workspace\ToolRegistryService;
use Illuminate\Http\Request;

class ToolController extends Controller
{
    public function __construct(
        protected ProjectWorkspaceService $workspace,
        protected ToolRegistryService $tools,
    ) {
    }

    public function index(Request $request, Project $project)
    {
        $project = $this->workspace->viewableProject($project, $request->user());

        return response()->json([
            'data' => $this->tools->listTools($project),
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $project = $this->workspace->collaborativeProject($project, $request->user());
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'type' => 'nullable|string|max:50',
            'handler' => 'nullable|string|max:100',
            'config' => 'nullable|array',
            'input_schema' => 'nullable|array',
            'output_schema' => 'nullable|array',
            'status' => 'nullable|string|max:50',
        ]);

        return response()->json([
            'data' => $this->tools->createTool($project, $request->user(), $validated),
        ], 201);
    }

    public function execute(Request $request, Project $project, ProjectTool $tool)
    {
        $this->workspace->collaborativeProject($project, $request->user());
        $validated = $request->validate([
            'arguments' => 'nullable|array',
        ]);

        return response()->json([
            'data' => $this->tools->execute($project, $tool, $validated['arguments'] ?? []),
        ]);
    }
}
