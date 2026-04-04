<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class LegacyProjectApiCompatibilityTest extends TestCase
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
    }

    public function test_legacy_project_api_paths_for_basic_workspace_features_use_the_new_core(): void
    {
        $user = User::factory()->create([
            'current_plan' => ['workspace' => ['max_agents' => 5]],
        ]);

        $projectId = (string) Str::uuid();

        \DB::table('projects')->insert([
            'id' => $projectId,
            'user_id' => $user->id,
            'title' => 'Compatibility Project',
            'project_type' => 'workspace',
            'status' => 'active',
            'visibility' => 'private',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        \DB::table('project_tools')->insert([
            'id' => (string) Str::ulid(),
            'project_id' => $projectId,
            'created_by' => $user->id,
            'name' => 'Echo Tool',
            'slug' => 'echo-tool',
            'description' => 'Legacy path should list this from workspace tools.',
            'type' => 'internal',
            'handler' => 'echo',
            'input_schema' => json_encode(['type' => 'object', 'properties' => []]),
            'output_schema' => json_encode(['type' => 'object', 'properties' => []]),
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->actingAs($user);

        $this->getJson("/api/projects/{$projectId}/conversations")
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $conversation = $this->postJson("/api/projects/{$projectId}/conversations", [
            'title' => 'Legacy Conversation',
        ])->assertCreated()
            ->assertJsonPath('data.title', 'Legacy Conversation');

        $conversationId = $conversation->json('data.id');

        $this->postJson("/api/projects/{$projectId}/agents", [
            'name' => 'Legacy Agent',
            'instructions' => 'Respond briefly.',
        ])->assertCreated()
            ->assertJsonPath('data.name', 'Legacy Agent');

        $this->getJson("/api/projects/{$projectId}/agents")
            ->assertOk()
            ->assertJsonPath('data.0.name', 'Legacy Agent');

        $this->getJson("/api/projects/{$projectId}/tools")
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'echo-tool');

        $this->postJson("/api/projects/{$projectId}/conversations/{$conversationId}/messages", [
            'content' => 'Legacy path message',
        ])->assertCreated()
            ->assertJsonPath('data.message.content', 'Legacy path message');
    }
}
