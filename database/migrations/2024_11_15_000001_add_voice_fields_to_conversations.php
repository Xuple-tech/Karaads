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
        if (! Schema::hasTable('conversations')) {
            return;
        }

        Schema::table('conversations', function (Blueprint $table) {
            if (! Schema::hasColumn('conversations', 'mode')) {
                $table->string('mode')->default('text')->after('type');
            }
            if (! Schema::hasColumn('conversations', 'language')) {
                $table->string('language')->default('en')->after('mode');
            }
            if (! Schema::hasColumn('conversations', 'voice_settings')) {
                $table->json('voice_settings')->nullable()->after('language');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('conversations')) {
            return;
        }

        Schema::table('conversations', function (Blueprint $table) {
            $columns = array_filter([
                Schema::hasColumn('conversations', 'mode') ? 'mode' : null,
                Schema::hasColumn('conversations', 'language') ? 'language' : null,
                Schema::hasColumn('conversations', 'voice_settings') ? 'voice_settings' : null,
            ]);

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
