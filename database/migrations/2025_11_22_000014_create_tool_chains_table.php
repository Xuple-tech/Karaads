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
        Schema::create('tool_chains', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('agent_id')->index();
            $table->ulid('project_id')->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('execution_mode', ['sequential', 'parallel', 'conditional'])->default('sequential');
            $table->boolean('is_active')->default(true)->index();
            $table->integer('execution_count')->default(0);
            $table->timestamp('last_executed_at')->nullable();
            $table->timestamps();

            $table->foreign('agent_id')->references('id')->on('agents')->onDelete('cascade');
            $table->foreign('project_id')->references('id')->on('projects')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tool_chains');
    }
};
