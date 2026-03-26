<?php
// database/migrations/YYYY_MM_DD_hhmmss_add_voice_fields_to_conversations.php

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
        Schema::table('conversations', function (Blueprint $table) {
            // Voice mode support
            $table->string('mode')->default('text')->after('type'); // 'text' or 'voice'
            $table->string('language')->default('en')->after('mode'); // Language code
            $table->json('voice_settings')->nullable()->after('language'); // Voice preferences
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('conversations', function (Blueprint $table) {
            $table->dropColumn(['mode', 'language', 'voice_settings']);
        });
    }
};
