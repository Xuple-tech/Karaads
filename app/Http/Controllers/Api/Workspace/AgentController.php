<?php

namespace App\Http\Controllers\Api\Workspace;

use App\Http\Controllers\Controller;
use App\Models\Workspace\Project;
use App\Models\Workspace\ProjectAgent;
use App\Models\Workspace\ProjectConversation;
use App\Models\Workspace\ProjectMessage;
use App\Services\Workspace\AgentRunService;
use App\Services\Workspace\ProjectAgentService;
use App\Services\Workspace\ProjectWorkspaceService;
use Illuminate\Http\Request;

class AgentController extends Controller
{
    public function __construct(
        protected ProjectWorkspaceService $workspace,
        protected ProjectAgentService $agents,
        protected AgentRunService $runs,
    ) {
    }

    public function index(Request $request, Project $project)
    {
        $project = $this->workspace->viewableProject($project, $request->user());

        return response()->json([
            'data' => $this->agents->listAgents($project),
        ]);
    }

    public function store(Request $request, Project $project)
    {
        $project = $this->workspace->collaborativeProject($project, $request->user());
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'instructions' => 'nullable|string',
            'provider' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'enabled_tools' => 'nullable|array',
            'memory_mode' => 'nullable|string|max:100',
            'status' => 'nullable|string|max:50',
            'metadata' => 'nullable|array',
        ]);

        return response()->json([
            'data' => $this->agents->createAgent($project, $request->user(), $validated),
        ], 201);
    }

    public function show(Request $request, Project $project, ProjectAgent $agent)
    {
        $this->workspace->viewableProject($project, $request->user());
        abort_unless($agent->project_id === $project->id, 404);

        return response()->json([
            'data' => $agent->load('runs'),
        ]);
    }

    public function update(Request $request, Project $project, ProjectAgent $agent)
    {
        $this->workspace->collaborativeProject($project, $request->user());
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'instructions' => 'nullable|string',
            'provider' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'enabled_tools' => 'nullable|array',
            'memory_mode' => 'nullable|string|max:100',
            'status' => 'nullable|string|max:50',
            'metadata' => 'nullable|array',
        ]);

        return response()->json([
            'data' => $this->agents->updateAgent($project, $agent, $validated),
        ]);
    }

    public function destroy(Request $request, Project $project, ProjectAgent $agent)
    {
        $this->workspace->collaborativeProject($project, $request->user());
        abort_unless($agent->project_id === $project->id, 404);
        $agent->delete();

        return response()->json(['message' => 'Agent deleted.']);
    }

    public function run(Request $request, Project $project, ProjectAgent $agent)
    {
        $this->workspace->collaborativeProject($project, $request->user());
        abort_unless($agent->project_id === $project->id, 404);

        $validated = $request->validate([
            'conversation_id' => 'required|string',
            'message' => 'required|string',
            'tool_name' => 'nullable|string',
            'tool_arguments' => 'nullable|array',
        ]);

        $conversation = ProjectConversation::query()
            ->where('project_id', $project->id)
            ->findOrFail($validated['conversation_id']);

        $sourceMessage = ProjectMessage::create([
            'conversation_id' => $conversation->id,
            'project_id' => $project->id,
            'user_id' => $request->user()->id,
            'role' => 'user',
            'content' => $validated['message'],
        ]);

        $run = $this->runs->execute(
            $project,
            $conversation,
            $agent,
            $request->user(),
            $sourceMessage,
            $validated['tool_name'] ?? null,
            $validated['tool_arguments'] ?? []
        );

        return response()->json([
            'data' => $run->load('agent', 'conversation'),
        ], 201);
    }
}
