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
        Schema::create('agent_execution_logs', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('agent_id')->constrained('agents')->onDelete('cascade');
            $table->foreignUlid('conversation_id')->nullable()->constrained('conversations')->onDelete('cascade');
            $table->enum('status', ['pending', 'running', 'success', 'failed', 'error'])->default('pending');
            $table->string('trigger_type')->nullable();
            $table->text('trigger_data')->nullable();
            $table->json('input_data')->nullable();
            $table->json('output_data')->nullable();
            $table->text('error_message')->nullable();
            $table->float('execution_time_ms')->nullable();
            $table->timestamps();

            $table->index(['agent_id', 'status']);
            $table->index(['conversation_id', 'status']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_execution_logs');
    }
};
