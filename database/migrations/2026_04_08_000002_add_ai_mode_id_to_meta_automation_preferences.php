<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('meta_automation_preferences', function (Blueprint $table) {
            if (! Schema::hasColumn('meta_automation_preferences', 'ai_mode_id')) {
                $table->unsignedBigInteger('ai_mode_id')->nullable()->after('reply_tone');
                $table->foreign('ai_mode_id')->references('id')->on('ai_modes')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('meta_automation_preferences', function (Blueprint $table) {
            if (Schema::hasColumn('meta_automation_preferences', 'ai_mode_id')) {
                $table->dropForeign(['ai_mode_id']);
                $table->dropColumn('ai_mode_id');
            }
        });
    }
};
