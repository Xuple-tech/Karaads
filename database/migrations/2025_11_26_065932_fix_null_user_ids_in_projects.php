<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, populate NULL user_ids from project activities
        // Find projects with NULL user_id and get the user_id from their creation activity
        DB::statement(
            "UPDATE projects p
             SET p.user_id = (
                 SELECT pa.user_id
                 FROM project_activities pa
                 WHERE pa.project_id = p.id
                 AND pa.action = 'project_created'
                 LIMIT 1
             )
             WHERE p.user_id IS NULL"
        );

        // If there are still NULL values (projects with no activity log), assign to first user
        // This is a fallback safety measure
        $firstUserId = DB::table('users')->first()?->id;
        if ($firstUserId) {
            DB::table('projects')
                ->whereNull('user_id')
                ->update(['user_id' => $firstUserId]);
        }

        // Now make user_id NOT NULL and ensure foreign key exists
        Schema::table('projects', function (Blueprint $table) {
            // Drop existing foreign key if it exists
            try {
                $table->dropForeign(['user_id']);
            } catch (\Exception $e) {
                // Foreign key might not exist
            }
        });

        // Modify column to NOT NULL
        Schema::table('projects', function (Blueprint $table) {
            $table->uuid('user_id')->nullable(false)->change();
        });

        // Re-add foreign key constraint
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
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->uuid('user_id')->nullable()->change();
        });
    }
};
