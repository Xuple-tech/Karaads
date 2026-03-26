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
         Schema::dropIfExists('mcp_logs');
        Schema::dropIfExists('mcp_sessions');
        Schema::dropIfExists('mcp_resources');
        Schema::dropIfExists('mcp_tools');
        Schema::dropIfExists('mcp_server_configs');
        // MCP Server Configuration - Model Context Protocol server settings
        Schema::create('mcp_server_configs', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('type', ['internal', 'external'])->default('internal');
            $table->string('protocol_version')->default('1.0.0'); // MCP version
            $table->json('capabilities'); // {tools, resources, prompts, etc.}
            $table->json('settings')->nullable(); // Server-specific settings
            $table->string('endpoint')->nullable(); // For external servers
            $table->json('authentication')->nullable(); // Auth config
            $table->boolean('enabled')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // MCP Tools Registry - Register all tools in MCP format
        Schema::create('mcp_tools', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mcp_server_id');
            $table->foreignUuid('tool_id')->nullable(); // Reference to Tool model (UUID)
            $table->string('name')->unique();
            $table->string('mcp_id')->unique(); // MCP standard ID format
            $table->text('description');
            $table->json('input_schema'); // JSON Schema for inputs
            $table->json('output_schema'); // JSON Schema for outputs
            $table->json('metadata')->nullable(); // Categories, tags, version
            $table->integer('call_count')->default(0);
            $table->timestamp('last_called_at')->nullable();
            $table->timestamps();

            $table->foreign('mcp_server_id')->references('id')->on('mcp_server_configs')->onDelete('cascade');
            $table->foreign('tool_id')->references('id')->on('tools')->onDelete('set null');
            $table->index('mcp_server_id');
            $table->index('tool_id');
        });

        // MCP Resources - Shared resources managed via MCP
        Schema::create('mcp_resources', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('mcp_server_id');
            $table->string('name');
            $table->string('uri')->unique(); // Unique resource identifier
            $table->string('mime_type')->default('application/json');
            $table->json('metadata')->nullable();
            $table->json('data')->nullable(); // Resource content
            $table->boolean('readable')->default(true);
            $table->boolean('writable')->default(false);
            $table->timestamps();

            $table->foreign('mcp_server_id')->references('id')->on('mcp_server_configs')->onDelete('cascade');
            $table->index('mcp_server_id');
            $table->index('uri');
        });

        // MCP Sessions - Active MCP connections
        Schema::create('mcp_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('user_id'); // User ID as UUID
            $table->unsignedBigInteger('mcp_server_id');
            $table->string('session_token')->unique();
            $table->json('capabilities_offered'); // Capabilities from server
            $table->json('capabilities_requested')->nullable(); // Capabilities client requested
            $table->integer('request_count')->default(0);
            $table->timestamp('last_activity_at')->useCurrent();
            $table->timestamp('expires_at')->nullable();
            $table->enum('status', ['active', 'idle', 'expired'])->default('active');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('mcp_server_id')->references('id')->on('mcp_server_configs')->onDelete('cascade');
            $table->index(['user_id', 'status']);
            $table->index('session_token');
        });

        // MCP Logs - Track all MCP requests/responses
        Schema::create('mcp_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('session_id')->nullable();
            $table->unsignedBigInteger('mcp_server_id');
            $table->string('method'); // tools/call, resources/read, etc.
            $table->string('tool_name')->nullable();
            $table->json('request_data')->nullable();
            $table->json('response_data')->nullable();
            $table->integer('response_time_ms')->nullable();
            $table->enum('status', ['success', 'error', 'pending'])->default('success');
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->foreign('session_id')->references('id')->on('mcp_sessions')->onDelete('set null');
            $table->foreign('mcp_server_id')->references('id')->on('mcp_server_configs')->onDelete('cascade');
            $table->index(['mcp_server_id', 'method']);
            $table->index(['session_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mcp_logs');
        Schema::dropIfExists('mcp_sessions');
        Schema::dropIfExists('mcp_resources');
        Schema::dropIfExists('mcp_tools');
        Schema::dropIfExists('mcp_server_configs');
    }
};
