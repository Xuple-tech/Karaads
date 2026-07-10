<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('messages', 'reply_to_message_id')) {
            return;
        }

        Schema::table('messages', function (Blueprint $table) {
            $table->uuid('reply_to_message_id')->nullable()->after('user_id')->index();
            $table
                ->foreign('reply_to_message_id')
                ->references('id')
                ->on('messages')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('messages', 'reply_to_message_id')) {
            return;
        }

        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['reply_to_message_id']);
            $table->dropColumn('reply_to_message_id');
        });
    }
};
