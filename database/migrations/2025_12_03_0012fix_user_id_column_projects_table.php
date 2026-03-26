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
        Schema::table('projects', function (Blueprint $table) {
            // Drop the existing user_id if it exists and has wrong definition
            if (Schema::hasColumn('projects', 'user_id')) {
                // Drop foreign key first if it exists
                try {
                    $table->dropForeign(['user_id']);
                } catch (\Exception $e) {
                    // Foreign key doesn't exist, continue
                }
            }

            // Change/modify user_id to be properly sized for ULID
            $table->uuid('user_id')->nullable()->change();
        });

        // Re-add the foreign key constraint
        Schema::table('projects', function (Blueprint $table) {
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            try {
                $table->dropForeign(['user_id']);
            } catch (\Exception $e) {
                // Ignore if foreign key doesn't exist
            }

            $table->string('user_id')->nullable()->change();
        });
    }
};
