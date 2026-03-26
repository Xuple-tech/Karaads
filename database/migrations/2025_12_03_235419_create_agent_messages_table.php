<?php
// database/migrations/2025_12_03_235412_create_agent_messages_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('conversation_id')->constrained('agent_conversations')->onDelete('cascade');
            $table->uuid('agent_id')->nullable();
            $table->uuid('user_id')->nullable();

            // Message Content
            $table->enum('sender_type', ['user', 'agent', 'system'])->default('user');
            $table->text('content');
            $table->json('content_parsed')->nullable();

            // AI Response Data
            $table->string('model')->nullable();
            $table->integer('tokens_used')->nullable();
            $table->decimal('processing_time', 8, 2)->nullable()->comment('in seconds');

            // Attachments
            $table->json('attachments')->nullable();

            // Message Status
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();

            // Feedback
            $table->enum('feedback', ['positive', 'negative', 'neutral'])->nullable();
            $table->text('feedback_comment')->nullable();

            // Metadata
            $table->json('metadata')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['conversation_id', 'created_at']);
            $table->index(['agent_id', 'sender_type']);
            $table->index(['user_id', 'created_at']);

            // Foreign keys
            $table->foreign('agent_id')->references('id')->on('ai_agents')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_messages');
    }
};
