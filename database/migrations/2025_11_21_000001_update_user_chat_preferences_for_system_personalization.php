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
        Schema::table('user_chat_preferences', function (Blueprint $table) {
            // Add system personalization reference
            $table->uuid('system_personalization_id')->nullable()->after('user_id');
            $table->foreign('system_personalization_id')
                ->references('id')
                ->on('system_personalizations')
                ->onDelete('set null');

            // Add template reference
            $table->uuid('personalization_template_id')->nullable()->after('system_personalization_id');
            $table->foreign('personalization_template_id')
                ->references('id')
                ->on('personalization_templates')
                ->onDelete('set null');

            // Store applied constraints for this user
            // These are read-only and enforced by system
            $table->integer('applied_min_tone')->default(1)->after('tone_level');
            $table->integer('applied_max_tone')->default(10)->after('applied_min_tone');
            $table->integer('applied_min_detail')->default(1)->after('applied_max_tone');
            $table->integer('applied_max_detail')->default(10)->after('applied_min_detail');
            $table->integer('applied_min_length')->default(1)->after('applied_max_detail');
            $table->integer('applied_max_length')->default(10)->after('applied_min_length');

            // Add index for system personalization
            $table->index('system_personalization_id');
            $table->index('personalization_template_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_chat_preferences', function (Blueprint $table) {
            $table->dropForeign(['system_personalization_id']);
            $table->dropForeign(['personalization_template_id']);
            $table->dropColumn([
                'system_personalization_id',
                'personalization_template_id',
                'applied_min_tone',
                'applied_max_tone',
                'applied_min_detail',
                'applied_max_detail',
                'applied_min_length',
                'applied_max_length',
            ]);
        });
    }
};
