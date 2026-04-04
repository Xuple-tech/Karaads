<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('project_conversations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->uuid('project_id');
            $table->uuid('created_by');
            $table->string('title');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['project_id', 'created_at']);
        });

        Schema::create('project_messages', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('conversation_id');
            $table->uuid('project_id');
            $table->uuid('user_id')->nullable();
            $table->ulid('agent_id')->nullable();
            $table->string('role', 32);
            $table->longText('content');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['conversation_id', 'created_at']);
            $table->index(['project_id', 'created_at']);
        });

        Schema::create('project_agents', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->uuid('project_id');
            $table->uuid('created_by');
            $table->string('name');
            $table->text('instructions')->nullable();
            $table->string('provider')->default('internal');
            $table->string('model')->default('workspace-default');
            $table->json('enabled_tools')->nullable();
            $table->string('memory_mode')->default('conversation');
            $table->string('status')->default('active');
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['project_id', 'status']);
        });

        Schema::create('project_agent_runs', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->uuid('project_id');
            $table->ulid('conversation_id')->nullable();
            $table->ulid('agent_id');
            $table->uuid('triggered_by_user_id')->nullable();
            $table->ulid('source_message_id')->nullable();
            $table->ulid('response_message_id')->nullable();
            $table->string('status')->default('completed');
            $table->longText('input_message')->nullable();
            $table->longText('output_message')->nullable();
            $table->json('tool_calls')->nullable();
            $table->json('usage')->nullable();
            $table->json('billing')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->index(['project_id', 'created_at']);
            $table->index(['agent_id', 'created_at']);
        });

        Schema::create('project_tools', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->uuid('project_id');
            $table->uuid('created_by');
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('type')->default('internal');
            $table->string('handler')->default('echo');
            $table->json('config')->nullable();
            $table->json('input_schema')->nullable();
            $table->json('output_schema')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
            $table->unique(['project_id', 'slug']);
        });

        Schema::create('project_mcp_servers', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->uuid('project_id');
            $table->uuid('created_by');
            $table->string('name');
            $table->string('slug');
            $table->string('type')->default('internal');
            $table->string('endpoint')->nullable();
            $table->string('auth_type')->default('none');
            $table->json('auth_config')->nullable();
            $table->json('capabilities')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
            $table->unique(['project_id', 'slug']);
        });

        Schema::create('project_mcp_sessions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->uuid('project_id');
            $table->ulid('project_mcp_server_id')->nullable();
            $table->uuid('created_by');
            $table->string('session_token', 128)->unique();
            $table->string('status')->default('active');
            $table->json('capabilities_requested')->nullable();
            $table->json('capabilities_offered')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
            $table->index(['project_id', 'status']);
        });

        Schema::create('project_mcp_resources', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->uuid('project_id');
            $table->ulid('project_mcp_server_id')->nullable();
            $table->string('name');
            $table->string('uri');
            $table->string('mime_type')->default('application/json');
            $table->longText('contents')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->unique(['project_id', 'uri']);
        });

        Schema::create('project_mcp_logs', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->uuid('project_id');
            $table->ulid('project_mcp_server_id')->nullable();
            $table->ulid('project_mcp_session_id')->nullable();
            $table->uuid('created_by')->nullable();
            $table->string('method');
            $table->string('target')->nullable();
            $table->json('request_payload')->nullable();
            $table->json('response_payload')->nullable();
            $table->string('status')->default('success');
            $table->decimal('billed_units', 12, 4)->default(0);
            $table->text('error_message')->nullable();
            $table->timestamps();
            $table->index(['project_id', 'created_at']);
            $table->index(['project_mcp_session_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_mcp_logs');
        Schema::dropIfExists('project_mcp_resources');
        Schema::dropIfExists('project_mcp_sessions');
        Schema::dropIfExists('project_mcp_servers');
        Schema::dropIfExists('project_tools');
        Schema::dropIfExists('project_agent_runs');
        Schema::dropIfExists('project_agents');
        Schema::dropIfExists('project_messages');
        Schema::dropIfExists('project_conversations');
    }
};
