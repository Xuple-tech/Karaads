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
        if (! Schema::hasTable('conversations') || Schema::hasColumn('conversations', 'canvas_mode')) {
            return;
        }

        Schema::table('conversations', function (Blueprint $table) {
            $table->boolean('canvas_mode')->default(false)->after('context');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('conversations') || ! Schema::hasColumn('conversations', 'canvas_mode')) {
            return;
        }

        Schema::table('conversations', function (Blueprint $table) {
            $table->dropColumn('canvas_mode');
        });
    }
};
