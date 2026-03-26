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
        Schema::create('system_personalizations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique(); // e.g., "Professional", "Educational", "Casual"
            $table->text('description')->nullable();
            $table->text('system_prompt'); // Mandatory system prompt that cannot be overridden

            // System-level constraints that users cannot change
            $table->integer('min_tone_level')->default(1)->unsigned();
            $table->integer('max_tone_level')->default(10)->unsigned();
            $table->integer('min_detail_level')->default(1)->unsigned();
            $table->integer('max_detail_level')->default(10)->unsigned();
            $table->integer('min_response_length')->default(1)->unsigned();
            $table->integer('max_response_length')->default(10)->unsigned();

            // Whether this is the global default
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->index(['is_default', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_personalizations');
    }
};
