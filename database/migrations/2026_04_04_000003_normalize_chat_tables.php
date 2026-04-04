<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('conversations')) {
            Schema::table('conversations', function (Blueprint $table) {
                if (! Schema::hasColumn('conversations', 'type')) {
                    $table->string('type')->default('text')->after('context');
                }

                if (! Schema::hasColumn('conversations', 'canvas_mode')) {
                    $table->boolean('canvas_mode')->default(false)->after('context');
                }

                if (! Schema::hasColumn('conversations', 'ai_generated_title')) {
                    $table->boolean('ai_generated_title')->default(false)->after('canvas_mode');
                }

                if (! Schema::hasColumn('conversations', 'title_generated_at')) {
                    $table->timestamp('title_generated_at')->nullable()->after('ai_generated_title');
                }

                if (! Schema::hasColumn('conversations', 'description')) {
                    $table->text('description')->nullable()->after('title');
                }

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
    }

    public function down(): void
    {
    }
};
