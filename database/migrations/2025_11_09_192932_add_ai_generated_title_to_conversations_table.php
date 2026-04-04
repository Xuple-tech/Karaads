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
        if (! Schema::hasTable('conversations')) {
            return;
        }

        Schema::table('conversations', function (Blueprint $table) {
            if (! Schema::hasColumn('conversations', 'ai_generated_title')) {
                $table->boolean('ai_generated_title')->default(false)->after('canvas_mode');
            }
            if (! Schema::hasColumn('conversations', 'title_generated_at')) {
                $table->timestamp('title_generated_at')->nullable()->after('ai_generated_title');
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
                Schema::hasColumn('conversations', 'ai_generated_title') ? 'ai_generated_title' : null,
                Schema::hasColumn('conversations', 'title_generated_at') ? 'title_generated_at' : null,
            ]);

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
