<?php

namespace App\Http\Controllers;

use App\Models\Workspace\Project;
use App\Services\Workspace\ProjectWorkspaceService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkspaceController extends Controller
{
    public function __construct(
        protected ProjectWorkspaceService $workspace,
    ) {
    }

    public function index(Request $request)
    {
        return Inertia::render('Workspace/Index', [
            'projects' => $this->workspace->listProjectsFor($request->user()),
        ]);
    }

    public function show(Request $request, Project $project)
    {
        $project = $this->workspace
            ->viewableProject($project, $request->user())
            ->loadCount(['conversations', 'agents', 'tools', 'mcpServers']);

        return Inertia::render('Workspace/Show', [
            'project' => $project,
        ]);
    }
}
