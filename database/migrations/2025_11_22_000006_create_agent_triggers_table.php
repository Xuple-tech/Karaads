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
        Schema::create('agent_triggers', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('agent_id')->constrained('agents')->onDelete('cascade');
            $table->enum('trigger_type', ['keyword', 'pattern', 'schedule', 'event', 'manual'])->default('keyword');
            $table->string('trigger_value'); // keyword, regex pattern, cron, event name
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0);
            $table->json('conditions')->nullable(); // Additional conditions
            $table->timestamps();

            $table->index(['agent_id', 'is_active']);
            $table->index('trigger_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agent_triggers');
    }
};
