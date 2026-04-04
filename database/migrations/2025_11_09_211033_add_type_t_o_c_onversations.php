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
        if (! Schema::hasTable('conversations') || Schema::hasColumn('conversations', 'type')) {
            return;
        }

        Schema::table('conversations', function (Blueprint $table) {
            $table->enum('type', ['text', 'voice', 'video'])->default('text');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('conversations') && Schema::hasColumn('conversations', 'type')) {
            Schema::dropColumns('conversations', ['type']);
        }
    }
};
