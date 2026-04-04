<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $tables = [
            'project_mcp_logs',
            'project_mcp_resources',
            'project_mcp_sessions',
            'project_mcp_servers',
            'project_tools',
            'project_agent_runs',
            'project_agents',
            'project_messages',
            'project_conversations',
            'project_agent',
            'project_members',
            'project_file_shares',
            'project_files',
            'project_categories',
            'project_activities',
            'project_versions',
            'project_templates',
            'projects',
            'agent_messages',
            'agent_conversations',
            'agent_usage_stats',
            'agent_api_keys',
            'agent_widget_settings',
            'agent_tools',
            'ai_agents',
            'agent_knowledge_base',
            'agent_templates',
            'agent_plans',
            'agent_schedules',
            'schedule_executions',
            'tool_chain_steps',
            'tool_chains',
            'agent_memories',
            'tools',
            'agent_execution_logs',
            'agent_actions',
            'agent_triggers',
            'agents',
            'mcp_logs',
            'mcp_sessions',
            'mcp_resources',
            'mcp_tools',
            'mcp_server_configs',
            'workflow_versions',
            'workflow_triggers',
            'workflow_executions',
            'workflow_connections',
            'workflow_steps',
            'workflows',
            'team_activity_logs',
            'team_invitations',
            'team_members',
            'teams',
            'sites',
            'site_subscriptions',
            'developer_usage_records',
            'developer_credit_ledgers',
            'developer_wallets',
            'developer_api_keys',
            'api_models',
            'subscription_plan_agent_templates',
            'subscription_plan_tools',
        ];

        foreach ($tables as $table) {
            Schema::dropIfExists($table);
        }

        if (Schema::hasTable('conversations') && Schema::hasColumn('conversations', 'project_id')) {
            Schema::table('conversations', function (Blueprint $table) {
                $table->dropColumn('project_id');
            });
        }

        if (Schema::hasTable('users')) {
            $userColumns = [
                'max_sites',
                'max_agents',
                'current_sites_count',
                'current_agents_count',
                'agent_billing_mode',
            ];

            $dropUserColumns = array_values(array_filter(
                $userColumns,
                fn (string $column) => Schema::hasColumn('users', $column)
            ));

            if ($dropUserColumns !== []) {
                Schema::table('users', function (Blueprint $table) use ($dropUserColumns) {
                    $table->dropColumn($dropUserColumns);
                });
            }
        }

        if (Schema::hasTable('subscription_plans')) {
            $planColumns = [
                'max_concurrent_agents',
                'max_agents_per_team',
                'max_active_agents',
                'max_mcp_servers',
                'max_tools_per_workflow',
                'allowed_tool_categories',
                'supports_custom_tools',
                'supports_mcp_integration',
            ];

            $dropPlanColumns = array_values(array_filter(
                $planColumns,
                fn (string $column) => Schema::hasColumn('subscription_plans', $column)
            ));

            if ($dropPlanColumns !== []) {
                Schema::table('subscription_plans', function (Blueprint $table) use ($dropPlanColumns) {
                    $table->dropColumn($dropPlanColumns);
                });
            }
        }
    }

    public function down(): void
    {
        // Intentional no-op. This cleanup is one-way.
    }
};
