<?php

namespace App\Services\Workspace;

use App\Models\User;
use App\Models\Workspace\Project;
use App\Models\Workspace\ProjectAgent;
use App\Models\Workspace\ProjectConversation;
use App\Models\Workspace\ProjectMessage;

class ProjectChatService
{
    public function __construct(
        protected AgentRunService $agentRuns,
    ) {
    }

    public function listConversations(Project $project)
    {
        return $project->conversations()->latest()->get();
    }

    public function createConversation(Project $project, User $user, array $data): ProjectConversation
    {
        return ProjectConversation::create([
            'project_id' => $project->id,
            'created_by' => $user->id,
            'title' => $data['title'],
            'metadata' => $data['metadata'] ?? [],
        ]);
    }

    public function listMessages(ProjectConversation $conversation)
    {
        return $conversation->messages()->orderBy('created_at')->get();
    }

    public function sendMessage(Project $project, ProjectConversation $conversation, User $user, array $data): array
    {
        abort_unless($conversation->project_id === $project->id, 404);

        $message = ProjectMessage::create([
            'conversation_id' => $conversation->id,
            'project_id' => $project->id,
            'user_id' => $user->id,
            'role' => 'user',
            'content' => $data['content'],
            'metadata' => $data['metadata'] ?? [],
        ]);

        $run = null;

        if (!empty($data['agent_id'])) {
            $agent = ProjectAgent::query()
                ->where('project_id', $project->id)
                ->findOrFail($data['agent_id']);

            $run = $this->agentRuns->execute(
                $project,
                $conversation,
                $agent,
                $user,
                $message,
                $data['tool_name'] ?? null,
                $data['tool_arguments'] ?? []
            );
        }

        return [
            'message' => $message->fresh(),
            'run' => $run?->fresh(),
        ];
    }
}
