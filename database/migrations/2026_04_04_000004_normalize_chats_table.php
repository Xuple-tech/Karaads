<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('chats')) {
            Schema::table('chats', function (Blueprint $table) {
                if (! Schema::hasColumn('chats', 'thinking')) {
                    $table->text('thinking')->nullable()->after('message');
                }

                if (! Schema::hasColumn('chats', 'type')) {
                    $table->string('type')->default('text')->after('response');
                }

                if (! Schema::hasColumn('chats', 'metadata')) {
                    $table->json('metadata')->nullable()->after('response');
                }

                if (! Schema::hasColumn('chats', 'reply_to_id')) {
                    $table->uuid('reply_to_id')->nullable()->after('role');
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
    }

    public function down(): void
    {
    }
};
