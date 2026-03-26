<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentAction extends Model
{
    use HasUlids;

    protected $fillable = [
        'agent_id',
        'action_type',
        'action_config',
        'sequence',
        'parameters',
    ];

    protected $casts = [
        'action_config' => 'json',
        'parameters' => 'json',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }

    /**
     * Execute the action
     */
    public function execute(array $context = []): array
    {
        return match($this->action_type) {
            'respond' => $this->executeRespond($context),
            'summarize' => $this->executeSummarize($context),
            'execute_tool' => $this->executeToolAction($context),
            'generate_content' => $this->executeGenerateContent($context),
            'notify' => $this->executeNotify($context),
            'escalate' => $this->executeEscalate($context),
            default => ['status' => 'error', 'message' => 'Unknown action type'],
        };
    }

    /**
     * Execute respond action
     */
    private function executeRespond(array $context): array
    {
        $template = $this->action_config['template'] ?? null;
        $response = $template ? $this->interpolateTemplate($template, $context) : $context['response'] ?? '';

        return [
            'status' => 'success',
            'action' => 'respond',
            'response' => $response,
        ];
    }

    /**
     * Execute summarize action
     */
    private function executeSummarize(array $context): array
    {
        // This would integrate with your chat/AI service
        return [
            'status' => 'pending',
            'action' => 'summarize',
            'message' => 'Summarization queued',
        ];
    }

    /**
     * Execute tool action
     */
    private function executeToolAction(array $context): array
    {
        $tool = $this->action_config['tool'] ?? null;

        return [
            'status' => 'pending',
            'action' => 'execute_tool',
            'tool' => $tool,
            'message' => "Tool {$tool} queued for execution",
        ];
    }

    /**
     * Execute generate content action
     */
    private function executeGenerateContent(array $context): array
    {
        return [
            'status' => 'pending',
            'action' => 'generate_content',
            'message' => 'Content generation queued',
        ];
    }

    /**
     * Execute notify action
     */
    private function executeNotify(array $context): array
    {
        $recipients = $this->action_config['recipients'] ?? [];
        $message = $this->action_config['message'] ?? '';

        return [
            'status' => 'pending',
            'action' => 'notify',
            'recipients' => $recipients,
            'message' => 'Notifications queued',
        ];
    }

    /**
     * Execute escalate action
     */
    private function executeEscalate(array $context): array
    {
        $escalateTo = $this->action_config['escalate_to'] ?? null;

        return [
            'status' => 'success',
            'action' => 'escalate',
            'escalated_to' => $escalateTo,
        ];
    }

    /**
     * Interpolate template with context variables
     */
    private function interpolateTemplate(string $template, array $context): string
    {
        preg_match_all('/\{\{(\w+)\}\}/', $template, $matches);

        foreach ($matches[1] as $variable) {
            $value = $context[$variable] ?? '';
            $template = str_replace("{{$variable}}", $value, $template);
        }

        return $template;
    }
}
