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
        if (! Schema::hasTable('chats')) {
            return;
        }

        Schema::table('chats', function (Blueprint $table) {
            if (! Schema::hasColumn('chats', 'type')) {
                $table->string('type')->default('text')->after('response');
            }
            if (! Schema::hasColumn('chats', 'is_voice')) {
                $table->boolean('is_voice')->default(false)->after('type');
            }
            if (! Schema::hasColumn('chats', 'audio_path')) {
                $table->string('audio_path')->nullable()->after('is_voice');
            }
            if (! Schema::hasColumn('chats', 'audio_duration')) {
                $table->integer('audio_duration')->nullable()->after('audio_path');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('chats')) {
            return;
        }

        Schema::table('chats', function (Blueprint $table) {
            $columns = array_filter([
                Schema::hasColumn('chats', 'type') ? 'type' : null,
                Schema::hasColumn('chats', 'is_voice') ? 'is_voice' : null,
                Schema::hasColumn('chats', 'audio_path') ? 'audio_path' : null,
                Schema::hasColumn('chats', 'audio_duration') ? 'audio_duration' : null,
            ]);

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
