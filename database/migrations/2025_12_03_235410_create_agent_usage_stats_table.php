<?php
// database/migrations/xxxx_xx_xx_000010_create_agent_usage_stats_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_usage_stats', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('agent_id')->constrained('ai_agents')->onDelete('cascade');

            // Date Tracking
            $table->date('date');

            // Conversation Metrics
            $table->integer('conversations_count')->default(0);
            $table->integer('messages_count')->default(0);
            $table->integer('users_count')->default(0);

            // Performance Metrics
            $table->decimal('avg_response_time', 8, 2)->nullable()->comment('in seconds');
            $table->decimal('satisfaction_score', 5, 2)->nullable()->comment('0-100 scale');

            // Analytics
            $table->json('common_questions')->nullable();
            $table->json('peak_hours')->nullable();
            $table->integer('knowledge_base_hits')->default(0);
            $table->json('tool_usage')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['agent_id', 'date']);
            $table->unique(['agent_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_usage_stats');
    }
};
