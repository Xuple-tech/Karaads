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
        Schema::create('agent_schedules', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('agent_id')->index();
            $table->ulid('project_id')->index();
            $table->ulid('tool_chain_id')->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('cron_expression'); // e.g., "0 9 * * *" for 9 AM daily
            $table->enum('trigger_type', ['cron', 'webhook', 'manual'])->default('cron');
            $table->string('webhook_token')->nullable()->unique();
            $table->boolean('is_active')->default(true)->index();
            $table->json('input_data')->nullable(); // Static input data for executions
            $table->timestamp('last_executed_at')->nullable();
            $table->integer('execution_count')->default(0);
            $table->timestamps();

            $table->foreign('agent_id')->references('id')->on('agents')->onDelete('cascade');
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->foreign('tool_chain_id')->references('id')->on('tool_chains')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_schedules');
    }
};
