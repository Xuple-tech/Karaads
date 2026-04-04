<?php

namespace App\Services\Workspace;

use App\Models\User;
use App\Models\Workspace\Project;

class BillingGateService
{
    public function canCreateProjectAgent(Project $project, User $user): array
    {
        $limit = $this->limitFor($user, 'max_agents', 10);
        $current = $project->agents()->count();

        return [
            'allowed' => $current < $limit,
            'limit' => $limit,
            'current' => $current,
            'reason' => $current < $limit ? null : 'Project agent limit reached.',
        ];
    }

    public function canAttachMcpServer(Project $project, User $user): array
    {
        $limit = $this->limitFor($user, 'max_mcp_servers', 5);
        $current = $project->mcpServers()->count();

        return [
            'allowed' => $current < $limit,
            'limit' => $limit,
            'current' => $current,
            'reason' => $current < $limit ? null : 'Project MCP server limit reached.',
        ];
    }

    public function canExecuteAgentRun(Project $project, User $user): array
    {
        $limit = $this->limitFor($user, 'max_daily_agent_runs', 500);
        $current = $project->agents()
            ->withCount(['runs' => fn ($query) => $query->whereDate('created_at', today())])
            ->get()
            ->sum('runs_count');

        return [
            'allowed' => $current < $limit,
            'limit' => $limit,
            'current' => $current,
            'reason' => $current < $limit ? null : 'Daily project agent run limit reached.',
        ];
    }

    public function recordUsage(Project $project, User $user, string $category, float $amount, array $metadata = []): array
    {
        return [
            'project_id' => $project->id,
            'user_id' => $user->id,
            'category' => $category,
            'amount' => round($amount, 4),
            'metadata' => $metadata,
            'recorded_at' => now()->toIso8601String(),
        ];
    }

    protected function limitFor(User $user, string $key, int $default): int
    {
        $plan = $user->current_plan ?? [];

        if (isset($plan['workspace'][$key]) && is_numeric($plan['workspace'][$key])) {
            return (int) $plan['workspace'][$key];
        }

        if (isset($plan[$key]) && is_numeric($plan[$key])) {
            return (int) $plan[$key];
        }

        return $default;
    }
}
