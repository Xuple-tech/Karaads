<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WorkspaceApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config()->set('database.default', 'sqlite');
        config()->set('database.connections.sqlite.database', ':memory:');

        Schema::dropAllTables();

        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken()->nullable();
            $table->string('role')->nullable();
            $table->json('current_plan')->nullable();
            $table->timestamps();
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('title');
            $table->string('project_type')->default('workspace');
            $table->text('description')->nullable();
            $table->string('status')->default('active');
            $table->string('visibility')->default('private');
            $table->json('settings')->nullable();
            $table->timestamps();
        });

        Schema::create('project_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('project_id');
            $table->uuid('user_id');
            $table->string('role')->default('member');
            $table->timestamps();
            $table->unique(['project_id', 'user_id']);
        });

        Schema::create('project_conversations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->uuid('project_id');
            $table->uuid('created_by');
            $table->string('title');
            $table->json('metadata')->nullable();
            $table->timestamps();
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
        });
    }

    public function test_workspace_project_index_and_create_use_the_new_api_surface(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $create = $this->postJson('/api/workspace/projects', [
            'title' => 'Workspace Alpha',
            'description' => 'Fresh workspace core',
        ]);

        $create->assertCreated()
            ->assertJsonPath('data.title', 'Workspace Alpha');

        $this->getJson('/api/workspace/projects')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Workspace Alpha');
    }

    public function test_workspace_chat_can_create_agent_run_and_persist_tool_usage(): void
    {
        $user = User::factory()->create([
            'current_plan' => ['workspace' => ['max_agents' => 5, 'max_daily_agent_runs' => 10]],
        ]);
        Sanctum::actingAs($user);

        $projectId = (string) Str::uuid();

        \DB::table('projects')->insert([
            'id' => $projectId,
            'user_id' => $user->id,
            'title' => 'Workspace Beta',
            'project_type' => 'workspace',
            'status' => 'active',
            'visibility' => 'private',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $tool = $this->postJson("/api/workspace/projects/{$projectId}/tools", [
            'name' => 'Project Summary',
            'slug' => 'project-summary',
            'handler' => 'project_summary',
        ])->assertCreated();

        $agent = $this->postJson("/api/workspace/projects/{$projectId}/agents", [
            'name' => 'Core Agent',
            'instructions' => 'Be concise.',
            'enabled_tools' => ['project-summary'],
        ])->assertCreated();

        $conversation = $this->postJson("/api/workspace/projects/{$projectId}/chat/conversations", [
            'title' => 'General',
        ])->assertCreated();

        $conversationId = $conversation->json('data.id');
        $agentId = $agent->json('data.id');

        $message = $this->postJson("/api/workspace/projects/{$projectId}/chat/conversations/{$conversationId}/messages", [
            'content' => 'Summarize the workspace',
            'agent_id' => $agentId,
            'tool_name' => 'project-summary',
        ]);

        $message->assertCreated()
            ->assertJsonPath('data.run.status', 'completed');

        $this->getJson("/api/workspace/projects/{$projectId}/chat/conversations/{$conversationId}/messages")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.1.role', 'assistant');
    }

    public function test_workspace_mcp_sessions_are_project_scoped_and_can_call_internal_tools(): void
    {
        $user = User::factory()->create([
            'current_plan' => ['workspace' => ['max_mcp_servers' => 3]],
        ]);
        Sanctum::actingAs($user);

        $projectId = (string) Str::uuid();

        \DB::table('projects')->insert([
            'id' => $projectId,
            'user_id' => $user->id,
            'title' => 'Workspace Gamma',
            'project_type' => 'workspace',
            'status' => 'active',
            'visibility' => 'private',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->postJson("/api/workspace/projects/{$projectId}/tools", [
            'name' => 'Echo Tool',
            'slug' => 'echo-tool',
            'handler' => 'echo',
        ])->assertCreated();

        \DB::table('project_mcp_resources')->insert([
            'id' => (string) Str::ulid(),
            'project_id' => $projectId,
            'name' => 'Workspace Policy',
            'uri' => 'resource://workspace/policy',
            'mime_type' => 'text/plain',
            'contents' => 'Project policy document.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $sessionResponse = $this->postJson("/api/workspace/projects/{$projectId}/mcp/sessions", [
            'capabilities_requested' => ['tools' => true, 'resources' => true],
        ])->assertCreated();

        $token = $sessionResponse->json('data.session_token');

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/workspace/projects/{$projectId}/mcp/tools/list")
            ->assertOk()
            ->assertJsonPath('result.tools.0.name', 'echo-tool');

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/workspace/projects/{$projectId}/mcp/tools/call", [
                'params' => [
                    'name' => 'echo-tool',
                    'arguments' => ['message' => 'hello workspace'],
                ],
            ])
            ->assertOk()
            ->assertJsonPath('result.content.0.type', 'text');

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/workspace/projects/{$projectId}/mcp/resources/read", [
                'params' => ['uri' => 'resource://workspace/policy'],
            ])
            ->assertOk()
            ->assertJsonPath('result.contents.0.text', 'Project policy document.');
    }
}
