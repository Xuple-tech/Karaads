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
        Schema::create('schedule_executions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('agent_schedule_id')->index();
            $table->enum('status', ['pending', 'running', 'success', 'failed', 'timeout'])->default('pending')->index();
            $table->json('input_data')->nullable();
            $table->json('output_data')->nullable();
            $table->text('error_message')->nullable();
            $table->integer('duration_ms')->nullable(); // How long it took
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('agent_schedule_id')->references('id')->on('agent_schedules')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedule_executions');
    }
};
