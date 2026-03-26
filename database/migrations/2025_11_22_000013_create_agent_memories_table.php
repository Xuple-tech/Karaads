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
        Schema::create('agent_memories', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('agent_id')->index();
            $table->ulid('project_id')->index();
            $table->ulid('chat_id')->nullable()->index(); // Which chat this memory came from
            $table->text('content'); // The actual memory content
            $table->json('metadata')->nullable(); // Tags, importance, context
            $table->integer('relevance_score')->default(0); // How relevant to recent queries
            $table->timestamps();

            $table->foreign('agent_id')->references('id')->on('agents')->onDelete('cascade');
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
            $table->foreign('chat_id')->references('id')->on('chats')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_memories');
    }
};
