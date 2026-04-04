<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WorkspaceWebTest extends TestCase
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
    }

    public function test_projects_index_now_uses_workspace_page(): void
    {
        $user = User::factory()->create();

        \DB::table('projects')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'user_id' => $user->id,
            'title' => 'Workspace Web',
            'project_type' => 'workspace',
            'status' => 'active',
            'visibility' => 'private',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->actingAs($user)
            ->get('/projects')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Workspace/Index')
                ->where('projects.0.title', 'Workspace Web')
            );
    }

    public function test_projects_detail_and_dashboard_now_use_workspace_show_page(): void
    {
        $user = User::factory()->create();
        $projectId = (string) \Illuminate\Support\Str::uuid();

        \DB::table('projects')->insert([
            'id' => $projectId,
            'user_id' => $user->id,
            'title' => 'Workspace Detail',
            'project_type' => 'workspace',
            'status' => 'active',
            'visibility' => 'private',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->actingAs($user)
            ->get("/projects/{$projectId}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Workspace/Show')
                ->where('project.title', 'Workspace Detail')
            );

        $this->actingAs($user)
            ->get("/projects/{$projectId}/dashboard")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Workspace/Show')
                ->where('project.title', 'Workspace Detail')
            );
    }
}
