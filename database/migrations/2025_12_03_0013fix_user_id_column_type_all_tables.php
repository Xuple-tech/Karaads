<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations - Fix user_id columns to match users table UUID type
     */
    public function up(): void
    {
        // Fix project_activities table
        if (Schema::hasTable('project_activities') && Schema::hasColumn('project_activities', 'user_id')) {
            Schema::table('project_activities', function (Blueprint $table) {
                // Drop foreign key if exists
                try {
                    $table->dropForeign(['user_id']);
                } catch (\Exception $e) {
                    // Foreign key doesn't exist
                }

                // Change user_id from ULID to UUID (36 chars)
                $table->uuid('user_id')->nullable()->change();
            });

            // Re-add foreign key
            Schema::table('project_activities', function (Blueprint $table) {
                $table->foreign('user_id')
                    ->references('id')
                    ->on('users')
                    ->cascadeOnDelete();
            });
        }

        // Fix project_members table
        if (Schema::hasTable('project_members') && Schema::hasColumn('project_members', 'user_id')) {
            Schema::table('project_members', function (Blueprint $table) {
                try {
                    $table->dropForeign(['user_id']);
                } catch (\Exception $e) {
                    // Foreign key doesn't exist
                }

                $table->uuid('user_id')->nullable()->change();
            });

            Schema::table('project_members', function (Blueprint $table) {
                $table->foreign('user_id')
                    ->references('id')
                    ->on('users')
                    ->cascadeOnDelete();
            });
        }

        // Fix project_file_shares table shared_with_user_id
        if (Schema::hasTable('project_file_shares') && Schema::hasColumn('project_file_shares', 'shared_with_user_id')) {
            Schema::table('project_file_shares', function (Blueprint $table) {
                try {
                    $table->dropForeign(['shared_with_user_id']);
                } catch (\Exception $e) {
                    // Foreign key doesn't exist
                }

                $table->uuid('shared_with_user_id')->nullable()->change();
            });

            Schema::table('project_file_shares', function (Blueprint $table) {
                $table->foreign('shared_with_user_id')
                    ->references('id')
                    ->on('users')
                    ->cascadeOnDelete();
            });
        }

        // Fix conversations table if user_id exists
        if (Schema::hasTable('conversations') && Schema::hasColumn('conversations', 'user_id')) {
            Schema::table('conversations', function (Blueprint $table) {
                try {
                    $table->dropForeign(['user_id']);
                } catch (\Exception $e) {
                    // Foreign key doesn't exist
                }

                $table->uuid('user_id')->nullable()->change();
            });

            Schema::table('conversations', function (Blueprint $table) {
                $table->foreign('user_id')
                    ->references('id')
                    ->on('users')
                    ->cascadeOnDelete();
            });
        }

        // Fix chats table user_id if exists and is ULID
        if (Schema::hasTable('chats') && Schema::hasColumn('chats', 'user_id')) {
            Schema::table('chats', function (Blueprint $table) {
                try {
                    $table->dropForeign(['user_id']);
                } catch (\Exception $e) {
                    // Foreign key doesn't exist
                }

                $table->uuid('user_id')->nullable()->change();
            });

            Schema::table('chats', function (Blueprint $table) {
                $table->foreign('user_id')
                    ->references('id')
                    ->on('users')
                    ->cascadeOnDelete();
            });
        }

        // Fix agents table user_id
        if (Schema::hasTable('agents') && Schema::hasColumn('agents', 'user_id')) {
            Schema::table('agents', function (Blueprint $table) {
                try {
                    $table->dropForeign(['user_id']);
                } catch (\Exception $e) {
                    // Foreign key doesn't exist
                }

                $table->uuid('user_id')->nullable()->change();
            });

            Schema::table('agents', function (Blueprint $table) {
                $table->foreign('user_id')
                    ->references('id')
                    ->on('users')
                    ->cascadeOnDelete();
            });
        }

        // Fix voice_conversations table user_id
        if (Schema::hasTable('voice_conversations') && Schema::hasColumn('voice_conversations', 'user_id')) {
            Schema::table('voice_conversations', function (Blueprint $table) {
                try {
                    $table->dropForeign(['user_id']);
                } catch (\Exception $e) {
                    // Foreign key doesn't exist
                }

                $table->uuid('user_id')->nullable()->change();
            });

            Schema::table('voice_conversations', function (Blueprint $table) {
                $table->foreign('user_id')
                    ->references('id')
                    ->on('users')
                    ->cascadeOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rollback would convert back to ULID - keeping it simple by not rolling back
        // In production, you'd want proper rollback logic
    }
};
