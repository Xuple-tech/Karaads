<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add agent and tool limits to subscription_plans
        Schema::table('subscription_plans', function (Blueprint $table) {
            // Agent Limits
            $table->integer('max_concurrent_agents')->nullable()->after('images_per_month'); // null = unlimited
            $table->integer('max_agents_per_team')->nullable()->after('max_concurrent_agents'); // null = unlimited
            $table->integer('max_active_agents')->nullable()->after('max_agents_per_team'); // null = unlimited

            // Tool and Integration Limits
            $table->integer('max_mcp_servers')->nullable()->after('max_active_agents'); // null = unlimited
            $table->integer('max_tools_per_workflow')->nullable()->after('max_mcp_servers'); // null = unlimited
            $table->json('allowed_tool_categories')->nullable()->after('max_tools_per_workflow'); // e.g., ["web_search", "image_gen", "code_execution"]
            $table->boolean('supports_custom_tools')->default(false)->after('allowed_tool_categories');
            $table->boolean('supports_mcp_integration')->default(false)->after('supports_custom_tools');
        });

        // Create subscription_plan_features table (for tool/feature whitelisting)
        Schema::create('subscription_plan_features', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('plan_id');
            $table->string('feature_key'); // e.g., 'web_search', 'image_generation', 'code_execution'
            $table->string('feature_name');
            $table->text('description')->nullable();
            $table->integer('limit')->nullable(); // null = unlimited usage of this feature
            $table->string('limit_type')->nullable(); // 'daily', 'monthly', 'total'
            $table->boolean('is_enabled')->default(true);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('plan_id')->references('id')->on('subscription_plans')->onDelete('cascade');
            $table->unique(['plan_id', 'feature_key']);
            $table->index('is_enabled');
        });

        // Create subscription_plan_tools table (for tool/MCP server whitelisting)
        Schema::create('subscription_plan_tools', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('plan_id');
            $table->uuid('tool_id')->nullable(); // Reference to Tool model if it exists
            $table->string('tool_key'); // e.g., 'web_search_google', 'mcp_server_github'
            $table->string('tool_name');
            $table->text('description')->nullable();
            $table->string('tool_category'); // 'mcp_server', 'integration', 'built_in_tool'
            $table->boolean('is_enabled')->default(true);
            $table->integer('usage_limit')->nullable(); // null = unlimited
            $table->string('limit_period')->nullable(); // 'daily', 'monthly', 'total'
            $table->json('configuration')->nullable(); // Tool-specific config
            $table->timestamps();

            $table->foreign('plan_id')->references('id')->on('subscription_plans')->onDelete('cascade');
            $table->unique(['plan_id', 'tool_key']);
            $table->index('is_enabled');
            $table->index('tool_category');
        });

        // Create subscription_plan_agent_templates table (optional: predefined agent types per tier)
        Schema::create('subscription_plan_agent_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('plan_id');
            $table->string('template_name');
            $table->text('description')->nullable();
            $table->json('agent_config'); // Agent type configuration
            $table->boolean('is_enabled')->default(true);
            $table->timestamps();

            $table->foreign('plan_id')->references('id')->on('subscription_plans')->onDelete('cascade');
            $table->unique(['plan_id', 'template_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_plan_agent_templates');
        Schema::dropIfExists('subscription_plan_tools');
        Schema::dropIfExists('subscription_plan_features');

        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->dropColumn([
                'max_concurrent_agents',
                'max_agents_per_team',
                'max_active_agents',
                'max_mcp_servers',
                'max_tools_per_workflow',
                'allowed_tool_categories',
                'supports_custom_tools',
                'supports_mcp_integration',
            ]);
        });
    }
};
