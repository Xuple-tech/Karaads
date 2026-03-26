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
        // Create AI Modes table
        Schema::create('ai_modes', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // 'cool', 'calm', 'formal'
            $table->text('system_prompt'); // Custom system prompt for the mode
            $table->text('description')->nullable(); // Description of the mode
            $table->string('emoji')->default('🤖'); // Emoji representation
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0); // Display order
            $table->timestamps();
        });

        // Add ai_mode_id and call_by_name to users table
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('ai_mode_id')->nullable()->after('language');
            $table->boolean('call_by_name')->default(false)->after('ai_mode_id');

            $table->foreign('ai_mode_id')
                ->references('id')
                ->on('ai_modes')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['ai_mode_id']);
            $table->dropColumn(['ai_mode_id', 'call_by_name']);
        });

        Schema::dropIfExists('ai_modes');
    }
};
