<?php
// database/migrations/YYYY_MM_DD_hhmmss_add_voice_fields_to_chats.php

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
        Schema::table('chats', function (Blueprint $table) {
            // Voice message support
            $table->string('type')->default('text')->after('response'); // 'text' or 'audio'
            $table->boolean('is_voice')->default(false)->after('type'); // From voice mode
            $table->string('audio_path')->nullable()->after('is_voice'); // Path to audio file
            $table->integer('audio_duration')->nullable()->after('audio_path'); // Duration in seconds
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            $table->dropColumn(['type', 'is_voice', 'audio_path', 'audio_duration', 'metadata']);
        });
    }
};
