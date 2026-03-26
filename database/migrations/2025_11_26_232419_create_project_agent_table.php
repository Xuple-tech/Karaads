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
        Schema::create('project_agent', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('project_id')->constrained('projects')->onDelete('cascade');
            $table->foreignUlid('agent_id')->constrained('agents')->onDelete('cascade');
            $table->json('agent_configuration')->nullable(); // Project-specific agent settings
            $table->text('project_instructions')->nullable(); // Project-specific instructions for the agent
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Ensure unique project-agent combinations
            $table->unique(['project_id', 'agent_id']);

            // Indexes for performance
            $table->index('project_id');
            $table->index('agent_id');
            $table->index(['project_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_agent');
    }
};
