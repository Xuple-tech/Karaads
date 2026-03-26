<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\AgentAction;
use App\Models\AgentExecutionLog;
use App\Models\AgentTrigger;
use App\Models\Chat;
use App\Models\Conversation;
use Illuminate\Support\Facades\Log;

/**
 * AgentExecutionService - Handles agent trigger evaluation and action execution
 */
class AgentExecutionService
{
    /**
     * Evaluate triggers and execute matching agents
     */
    public function evaluateTriggers(Conversation $conversation, Chat $message): void
    {
        if (!$conversation->projects_id) {
            return; // Only process project conversations
        }

        try {
            $agents = Agent::where('project_id', $conversation->projects_id)
                ->where('status', 'active')
                ->get();

            foreach ($agents as $agent) {
                $this->evaluateAgentTriggers($agent, $conversation, $message);
            }
        } catch (\Exception $e) {
            Log::error('Agent trigger evaluation failed', [
                'error' => $e->getMessage(),
                'conversation_id' => $conversation->id,
            ]);
        }
    }

    /**
     * Evaluate specific agent triggers
     */
    public function evaluateAgentTriggers(Agent $agent, Conversation $conversation, Chat $message): void
    {
        $triggers = $agent->triggers()
            ->where('status', 'active')
            ->orderBy('priority', 'desc')
            ->get();

        foreach ($triggers as $trigger) {
            if ($this->matchesTrigger($trigger, $message)) {
                $this->executeAgent($agent, $trigger, $conversation, $message);
                break; // Execute only first matching trigger
            }
        }
    }

    /**
     * Check if message matches trigger
     */
    public function matchesTrigger(AgentTrigger $trigger, Chat $message): bool
    {
        $text = strtolower($message->message);
        $triggerData = $trigger->trigger_data;

        return match($trigger->trigger_type) {
            'keyword' => $this->matchKeyword($text, $triggerData),
            'pattern' => $this->matchPattern($text, $triggerData),
            'event' => $this->matchEvent($triggerData, $message),
            'condition' => $this->matchCondition($triggerData, $message),
            default => false,
        };
    }

    /**
     * Match keyword trigger
     */
    private function matchKeyword(string $text, array $data): bool
    {
        $keywords = $data['keywords'] ?? [];
        $matchType = $data['match_type'] ?? 'any'; // 'any' or 'all'

        if ($matchType === 'all') {
            foreach ($keywords as $keyword) {
                if (strpos($text, strtolower($keyword)) === false) {
                    return false;
                }
            }
            return true;
        }

        foreach ($keywords as $keyword) {
            if (strpos($text, strtolower($keyword)) !== false) {
                return true;
            }
        }
        return false;
    }

    /**
     * Match regex pattern
     */
    private function matchPattern(string $text, array $data): bool
    {
        $pattern = $data['pattern'] ?? '';
        try {
            return preg_match("/{$pattern}/i", $text) === 1;
        } catch (\Exception $e) {
            Log::warning('Invalid regex pattern', ['pattern' => $pattern]);
            return false;
        }
    }

    /**
     * Match event trigger
     */
    private function matchEvent(array $data, Chat $message): bool
    {
        $eventType = $data['event_type'] ?? '';

        return match($eventType) {
            'message_created' => true,
            'message_edited' => $message->wasChanged(),
            'user_mentioned' => !empty($message->mentions),
            'file_shared' => $message->files()->exists(),
            default => false,
        };
    }

    /**
     * Match condition-based trigger
     */
    private function matchCondition(array $data, Chat $message): bool
    {
        $conditions = $data['conditions'] ?? [];

        foreach ($conditions as $condition) {
            if (!$this->evaluateCondition($condition, $message)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Evaluate single condition
     */
    private function evaluateCondition(array $condition, Chat $message): bool
    {
        $field = $condition['field'] ?? '';
        $operator = $condition['operator'] ?? '=';
        $value = $condition['value'] ?? '';

        $fieldValue = match($field) {
            'message' => strtolower($message->message),
            'user_id' => $message->user_id,
            'role' => auth()->user()?->role,
            'message_length' => strlen($message->message),
            default => '',
        };

        return match($operator) {
            '=' => $fieldValue == $value,
            '!=' => $fieldValue != $value,
            '>' => $fieldValue > $value,
            '<' => $fieldValue < $value,
            '>=' => $fieldValue >= $value,
            '<=' => $fieldValue <= $value,
            'contains' => strpos((string)$fieldValue, (string)$value) !== false,
            'in' => in_array($fieldValue, (array)$value),
            default => false,
        };
    }

    /**
     * Execute agent actions
     */
    public function executeAgent(
        Agent $agent,
        AgentTrigger $trigger,
        Conversation $conversation,
        Chat $triggeringMessage
    ): void {
        try {
            $log = AgentExecutionLog::create([
                'agent_id' => $agent->id,
                'trigger_id' => $trigger->id,
                'status' => 'running',
                'input_data' => [
                    'message_id' => $triggeringMessage->id,
                    'message' => $triggeringMessage->message,
                    'user_id' => $triggeringMessage->user_id,
                ],
            ]);

            $actions = $agent->actions()
                ->orderBy('sequence')
                ->get();

            $output = [];

            foreach ($actions as $action) {
                $result = $this->executeAction($action, $trigger, $conversation, $triggeringMessage, $agent);
                $output[] = $result;
            }

            $agent->increment('execution_count');

            $log->update([
                'status' => 'completed',
                'output_data' => $output,
                'execution_time' => now()->diffInMilliseconds($log->created_at),
            ]);

        } catch (\Exception $e) {
            Log::error('Agent execution failed', [
                'agent_id' => $agent->id,
                'error' => $e->getMessage(),
            ]);

            $log->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Execute individual action
     */
    public function executeAction(
        AgentAction $action,
        AgentTrigger $trigger,
        Conversation $conversation,
        Chat $triggeringMessage,
        Agent $agent
    ): array {
        $context = [
            'message' => $triggeringMessage->message,
            'user' => $triggeringMessage->user?->name ?? 'User',
            'timestamp' => now()->format('Y-m-d H:i:s'),
        ];

        return match($action->action_type) {
            'respond' => $this->respondAction($action, $conversation, $triggeringMessage, $agent, $context),
            'summarize' => $this->summarizeAction($action, $conversation),
            'notify' => $this->notifyAction($action, $conversation, $triggeringMessage),
            'escalate' => $this->escalateAction($action, $conversation, $triggeringMessage),
            'execute_tool' => $this->toolAction($action, $conversation, $triggeringMessage),
            'generate_content' => $this->generateContentAction($action, $context),
            default => ['status' => 'unknown'],
        };
    }

    /**
     * Respond action - Generate automatic response
     */
    private function respondAction(
        AgentAction $action,
        Conversation $conversation,
        Chat $triggeringMessage,
        Agent $agent,
        array $context
    ): array {
        try {
            $template = $action->action_config['template'] ?? '';
            $response = $this->interpolateTemplate($template, $context);

            $chat = $conversation->chats()->create([
                'user_id' => $agent->user_id ?? auth()->id(),
                'message' => $response,
                'role' => 'assistant',
                'agent_id' => $agent->id,
                'content_type' => 'text',
                'reply_to_id' => $triggeringMessage->id, // Thread the response
            ]);

            return [
                'status' => 'success',
                'action_type' => 'respond',
                'message_id' => $chat->id,
                'response' => $response,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'action_type' => 'respond',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Summarize action - Create conversation summary
     */
    private function summarizeAction(AgentAction $action, Conversation $conversation): array
    {
        try {
            $messages = $conversation->chats()
                ->where('role', 'user')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            $messageTexts = $messages->map(fn($m) => "- {$m->message}")->join("\n");

            $summary = "## Conversation Summary\n\nRecent messages:\n{$messageTexts}";

            return [
                'status' => 'success',
                'action_type' => 'summarize',
                'summary' => $summary,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'action_type' => 'summarize',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Notify action - Send notification to project members
     */
    private function notifyAction(
        AgentAction $action,
        Conversation $conversation,
        Chat $message
    ): array {
        try {
            $notificationType = $action->action_config['notification_type'] ?? 'info';
            $message_text = $action->action_config['message'] ?? 'Agent notification';

            // Implementation depends on your notification system
            // For now, just log it
            Log::info('Agent notification', [
                'type' => $notificationType,
                'message' => $message_text,
                'conversation_id' => $conversation->id,
            ]);

            return [
                'status' => 'success',
                'action_type' => 'notify',
                'notification_type' => $notificationType,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'action_type' => 'notify',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Escalate action - Mark for manual review
     */
    private function escalateAction(
        AgentAction $action,
        Conversation $conversation,
        Chat $message
    ): array {
        try {
            $message->addTag('escalated');
            $message->addTag('requires_review');

            return [
                'status' => 'success',
                'action_type' => 'escalate',
                'message_id' => $message->id,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'action_type' => 'escalate',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Execute tool action
     */
    private function toolAction(
        AgentAction $action,
        Conversation $conversation,
        Chat $message
    ): array {
        try {
            $toolName = $action->action_config['tool_name'] ?? '';

            // Tool execution would be implemented based on your tools system
            return [
                'status' => 'success',
                'action_type' => 'execute_tool',
                'tool' => $toolName,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'action_type' => 'execute_tool',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Generate content action
     */
    private function generateContentAction(AgentAction $action, array $context): array
    {
        try {
            $contentType = $action->action_config['content_type'] ?? 'text';
            $template = $action->action_config['template'] ?? '';

            $content = $this->interpolateTemplate($template, $context);

            return [
                'status' => 'success',
                'action_type' => 'generate_content',
                'content_type' => $contentType,
                'content' => $content,
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'action_type' => 'generate_content',
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Interpolate template with context variables
     */
    private function interpolateTemplate(string $template, array $context): string
    {
        $result = $template;

        foreach ($context as $key => $value) {
            $result = str_replace("{{$key}}", $value, $result);
        }

        return $result;
    }

    /**
     * Record agent execution
     */
    public function recordExecution(
        Agent $agent,
        AgentTrigger $trigger,
        array $inputData,
        array $outputData,
        string $status = 'completed'
    ): AgentExecutionLog {
        return AgentExecutionLog::create([
            'agent_id' => $agent->id,
            'trigger_id' => $trigger->id,
            'status' => $status,
            'input_data' => $inputData,
            'output_data' => $outputData,
        ]);
    }
}
