<?php

namespace App\Http\Controllers\Api\Workspace;

use App\Http\Controllers\Controller;
use App\Models\Workspace\Project;
use App\Models\Workspace\ProjectConversation;
use App\Services\Workspace\ProjectChatService;
use App\Services\Workspace\ProjectWorkspaceService;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function __construct(
        protected ProjectWorkspaceService $workspace,
        protected ProjectChatService $chat,
    ) {
    }

    public function conversations(Request $request, Project $project)
    {
        $project = $this->workspace->viewableProject($project, $request->user());

        return response()->json([
            'data' => $this->chat->listConversations($project),
        ]);
    }

    public function createConversation(Request $request, Project $project)
    {
        $project = $this->workspace->collaborativeProject($project, $request->user());
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'metadata' => 'nullable|array',
        ]);

        return response()->json([
            'data' => $this->chat->createConversation($project, $request->user(), $validated),
        ], 201);
    }

    public function messages(Request $request, Project $project, ProjectConversation $conversation)
    {
        $this->workspace->viewableProject($project, $request->user());
        abort_unless($conversation->project_id === $project->id, 404);

        return response()->json([
            'data' => $this->chat->listMessages($conversation),
        ]);
    }

    public function sendMessage(Request $request, Project $project, ProjectConversation $conversation)
    {
        $project = $this->workspace->collaborativeProject($project, $request->user());
        $validated = $request->validate([
            'content' => 'required|string',
            'agent_id' => 'nullable|string',
            'tool_name' => 'nullable|string',
            'tool_arguments' => 'nullable|array',
            'metadata' => 'nullable|array',
        ]);

        return response()->json([
            'data' => $this->chat->sendMessage($project, $conversation, $request->user(), $validated),
        ], 201);
    }
}
