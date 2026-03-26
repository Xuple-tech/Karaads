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
        Schema::create('agents', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('project_id')->constrained('projects')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('avatar_url')->nullable();
            $table->enum('type', ['automation', 'tool', 'responder'])->default('automation');
            $table->enum('status', ['active', 'inactive', 'paused'])->default('active');
            $table->json('configuration')->nullable(); // Stores agent settings
            $table->json('capabilities')->nullable(); // Array of capabilities/tools
            $table->integer('execution_count')->default(0);
            $table->dateTime('last_executed_at')->nullable();
            $table->timestamps();

            $table->index(['project_id', 'status']);
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
};
