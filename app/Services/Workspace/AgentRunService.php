<?php

namespace App\Services\Workspace;

use App\Models\User;
use App\Models\Workspace\Project;
use App\Models\Workspace\ProjectAgent;
use App\Models\Workspace\ProjectAgentRun;
use App\Models\Workspace\ProjectConversation;
use App\Models\Workspace\ProjectMessage;

class AgentRunService
{
    public function __construct(
        protected BillingGateService $billingGate,
        protected ToolRegistryService $toolRegistry,
    ) {
    }

    public function execute(
        Project $project,
        ProjectConversation $conversation,
        ProjectAgent $agent,
        User $user,
        ProjectMessage $sourceMessage,
        ?string $toolSlug = null,
        array $toolArguments = []
    ): ProjectAgentRun {
        abort_unless($agent->project_id === $project->id, 404);

        $gate = $this->billingGate->canExecuteAgentRun($project, $user);
        abort_unless($gate['allowed'], 422, $gate['reason']);

        $toolCalls = [];
        $toolResult = null;

        if ($toolSlug !== null && $agent->hasTool($toolSlug)) {
            $tool = $project->tools()->where('slug', $toolSlug)->firstOrFail();
            $toolResult = $this->toolRegistry->execute($project, $tool, $toolArguments);
            $toolCalls[] = [
                'tool' => $tool->slug,
                'arguments' => $toolArguments,
                'result' => $toolResult,
            ];
        }

        $response = $this->buildResponse($project, $agent, $sourceMessage->content, $toolResult);

        $assistantMessage = ProjectMessage::create([
            'conversation_id' => $conversation->id,
            'project_id' => $project->id,
            'agent_id' => $agent->id,
            'role' => 'assistant',
            'content' => $response,
            'metadata' => [
                'agent_name' => $agent->name,
                'tool_calls' => $toolCalls,
            ],
        ]);

        $billing = $this->billingGate->recordUsage($project, $user, 'agent_run', 1, [
            'agent_id' => $agent->id,
            'tool_calls' => count($toolCalls),
        ]);

        return ProjectAgentRun::create([
            'project_id' => $project->id,
            'conversation_id' => $conversation->id,
            'agent_id' => $agent->id,
            'triggered_by_user_id' => $user->id,
            'source_message_id' => $sourceMessage->id,
            'response_message_id' => $assistantMessage->id,
            'status' => 'completed',
            'input_message' => $sourceMessage->content,
            'output_message' => $response,
            'tool_calls' => $toolCalls,
            'usage' => [
                'messages' => 2,
                'tool_calls' => count($toolCalls),
            ],
            'billing' => $billing,
            'completed_at' => now(),
        ]);
    }

    protected function buildResponse(Project $project, ProjectAgent $agent, string $message, ?array $toolResult): string
    {
        $instructionPrefix = $agent->instructions
            ? trim($agent->instructions) . "\n\n"
            : '';

        $body = sprintf(
            'Agent "%s" processed your message in project "%s": %s',
            $agent->name,
            $project->title,
            $message
        );

        if ($toolResult) {
            $body .= "\n\nTool result: " . ($toolResult['result'] ?? json_encode($toolResult));
        }

        return $instructionPrefix . $body;
    }
}
