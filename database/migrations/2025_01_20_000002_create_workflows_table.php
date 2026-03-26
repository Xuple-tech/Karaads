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
         Schema::dropIfExists('workflow_versions');
        Schema::dropIfExists('workflow_triggers');
        Schema::dropIfExists('workflow_executions');
        Schema::dropIfExists('workflow_connections');
        Schema::dropIfExists('workflow_steps');
        Schema::dropIfExists('workflows');
        // Workflows Table - Multi-step tool chains
        Schema::create('workflows', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('team_id')->nullable(); // Associated team
            $table->foreignUuid('project_id')->nullable(); // Associated project (UUID)
            $table->foreignUuid('created_by'); // User who created (UUID)
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->enum('type', ['visual', 'code', 'hybrid'])->default('visual');
            $table->json('definition'); // Visual: {steps, connections}, Code: {yaml/json}
            $table->json('metadata')->nullable(); // Tags, categories, etc.
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->integer('version')->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('team_id')->references('id')->on('teams')->onDelete('cascade');
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->index(['team_id', 'status']);
            $table->index('created_by');
            $table->unique(['team_id', 'slug']);
        });

        // Workflow Steps Table - Individual steps in workflow
        Schema::create('workflow_steps', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('workflow_id');
            $table->foreignUuid('tool_id'); // Reference to Tool model (UUID)
            $table->integer('order')->default(0);
            $table->string('step_name'); // User-friendly name
            $table->json('input_mapping'); // How to map previous outputs to inputs
            $table->json('parameters'); // Tool parameters
            $table->json('conditions')->nullable(); // Conditional execution rules
            $table->json('error_handling')->nullable(); // Retry, skip, abort, etc.
            $table->boolean('enabled')->default(true);
            $table->timestamps();

            $table->foreign('workflow_id')->references('id')->on('workflows')->onDelete('cascade');
            $table->foreign('tool_id')->references('id')->on('tools')->onDelete('restrict');
            $table->index('workflow_id');
            $table->index(['workflow_id', 'order']);
        });

        // Workflow Connections - Links between steps
        Schema::create('workflow_connections', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('workflow_id');
            $table->unsignedBigInteger('from_step_id');
            $table->unsignedBigInteger('to_step_id');
            $table->string('connection_type')->default('sequential'); // sequential, conditional, parallel
            $table->json('mapping'); // Output field to input field mapping
            $table->timestamps();

            $table->foreign('workflow_id')->references('id')->on('workflows')->onDelete('cascade');
            $table->foreign('from_step_id')->references('id')->on('workflow_steps')->onDelete('cascade');
            $table->foreign('to_step_id')->references('id')->on('workflow_steps')->onDelete('cascade');
            $table->index('workflow_id');
            $table->unique(['workflow_id', 'from_step_id', 'to_step_id']);
        });

        // Workflow Executions - Track execution history
        Schema::create('workflow_executions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('workflow_id');
            $table->foreignUuid('executed_by'); // User who triggered (UUID)
            $table->json('input_data')->nullable(); // Initial input to workflow
            $table->enum('status', ['pending', 'running', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->json('execution_log'); // Step-by-step execution details
            $table->json('output')->nullable(); // Final workflow output
            $table->text('error_message')->nullable(); // Error details if failed
            $table->integer('steps_executed')->default(0);
            $table->integer('steps_failed')->default(0);
            $table->integer('duration_ms')->nullable(); // Total execution time
            $table->timestamps();

            $table->foreign('workflow_id')->references('id')->on('workflows')->onDelete('cascade');
            // $table->foreign('executed_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['workflow_id', 'status']);
            $table->index(['workflow_id', 'created_at']);
        });

        // Workflow Triggers - Scheduled or event-based execution
        Schema::create('workflow_triggers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('workflow_id');
            $table->enum('trigger_type', ['manual', 'schedule', 'event', 'webhook'])->default('manual');
            $table->json('trigger_config'); // Cron, webhook path, event type, etc.
            $table->json('input_defaults')->nullable(); // Default inputs for execution
            $table->boolean('enabled')->default(true);
            $table->integer('execution_count')->default(0);
            $table->timestamp('last_executed_at')->nullable();
            $table->timestamps();

            $table->foreign('workflow_id')->references('id')->on('workflows')->onDelete('cascade');
            $table->index('trigger_type');
            $table->index(['workflow_id', 'enabled']);
        });

        // Workflow Versions - Version history
        Schema::create('workflow_versions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('workflow_id');
            $table->integer('version_number');
            $table->json('definition'); // Complete workflow definition
            $table->foreignUuid('created_by'); // User who created version (UUID)
            $table->text('changelog')->nullable();
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->timestamps();

            $table->foreign('workflow_id')->references('id')->on('workflows')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['workflow_id', 'version_number']);
            $table->index('workflow_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workflow_versions');
        Schema::dropIfExists('workflow_triggers');
        Schema::dropIfExists('workflow_executions');
        Schema::dropIfExists('workflow_connections');
        Schema::dropIfExists('workflow_steps');
        Schema::dropIfExists('workflows');
    }
};
