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
        Schema::create('tool_chain_steps', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('tool_chain_id')->index();
            $table->integer('sequence')->index();
            $table->string('tool_name'); // Name of the tool to execute
            $table->json('parameters'); // Parameters for the tool
            $table->string('next_step_on_success')->nullable(); // Which step to go to on success
            $table->string('next_step_on_failure')->nullable(); // Which step to go to on failure
            $table->boolean('is_conditional')->default(false);
            $table->json('condition_logic')->nullable(); // if/else condition
            $table->timestamps();

            $table->foreign('tool_chain_id')->references('id')->on('tool_chains')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tool_chain_steps');
    }
};
