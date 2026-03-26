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
        Schema::create('user_chat_preferences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->integer('tone_level')->default(5)->comment('1=Formal to 10=Casual');
            $table->integer('detail_level')->default(5)->comment('1=Brief to 10=Detailed');
            $table->integer('response_length')->default(5)->comment('1=Short to 10=Long');
            $table->unsignedBigInteger('preferred_ai_mode_id')->nullable();
            $table->text('custom_system_prompt')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('preferred_ai_mode_id')->references('id')->on('ai_modes')->onDelete('set null');
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_chat_preferences');
    }
};
