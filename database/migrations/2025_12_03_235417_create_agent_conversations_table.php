<?php
// database/migrations/xxxx_xx_xx_000011_create_agent_conversations_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('agent_id')->constrained('ai_agents')->onDelete('cascade');
            $table->foreignUuid('user_id')->nullable()->constrained()->nullOnDelete();

            // Conversation Info
            $table->string('session_id')->nullable();
            $table->string('visitor_id')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->string('referrer')->nullable();
            $table->string('page_url')->nullable();

            // Conversation Details
            $table->string('title')->nullable();
            $table->enum('status', ['active', 'closed', 'archived'])->default('active');

            // Analytics
            $table->integer('message_count')->default(0);
            $table->decimal('satisfaction_score', 5, 2)->nullable();
            $table->json('tags')->nullable();

            // Timestamps
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamp('closed_at')->nullable();

            // Metadata
            $table->json('metadata')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['agent_id', 'status']);
            $table->index(['agent_id', 'user_id']);
            $table->index('session_id');
            $table->index('visitor_id');
            $table->index('last_message_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_conversations');
    }
};
