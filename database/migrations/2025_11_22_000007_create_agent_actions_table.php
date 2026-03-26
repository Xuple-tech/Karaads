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
        Schema::create('agent_actions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('agent_id')->constrained('agents')->onDelete('cascade');
            $table->enum('action_type', ['respond', 'summarize', 'execute_tool', 'generate_content', 'notify', 'escalate'])->default('respond');
            $table->json('action_config')->nullable(); // Specific configuration for the action
            $table->integer('sequence')->default(0);
            $table->json('parameters')->nullable(); // Dynamic parameters
            $table->timestamps();

            $table->index(['agent_id', 'sequence']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_actions');
    }
};
