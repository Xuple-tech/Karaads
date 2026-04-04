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
        if (! Schema::hasTable('image_generations')) {
            return;
        }

        Schema::table('image_generations', function (Blueprint $table) {
            $table->uuid('id')->change();
            if (!Schema::hasColumn('image_generations', 'user_id')) {
                $table->uuid('user_id')->nullable()->after('id');
            }
            if (!Schema::hasColumn('image_generations', 'prompt')) {
                $table->text('prompt')->nullable()->after('id');
            }
            if (!Schema::hasColumn('image_generations', 'chat_id')) {
                $table->uuid('chat_id')->nullable()->after('id');
            }
            if (!Schema::hasColumn('image_generations', 'revised_prompt')) {
                $table->text('revised_prompt')->nullable()->after('id');
            }
            if (!Schema::hasColumn('image_generations', 'image_url')) {
                $table->string('image_url')->nullable();
            }
            if (!Schema::hasColumn('image_generations', 'image_path')) {
                $table->string('image_path')->nullable()->after('image_url');
            }
            if (!Schema::hasColumn('image_generations', 'image_content')) {
                $table->longText('image_content')->nullable();
            }
            if (!Schema::hasColumn('image_generations', 'model')) {
                $table->string('model')->nullable()->after('image_content');
            }
            if (!Schema::hasColumn('image_generations', 'provider')) {
                $table->string('provider')->default('openai')->after('model');
            }
            if (!Schema::hasColumn('image_generations', 'size')) {
                $table->string('size')->default('1024x1024')->after('provider');
            }
            if (!Schema::hasColumn('image_generations', 'quality')) {
                $table->string('quality')->default('standard')->after('size');
            }
            if (!Schema::hasColumn('image_generations', 'style')) {
                $table->string('style')->nullable()->after('quality');
            }
            if (!Schema::hasColumn('image_generations', 'operation')) {
                $table->string('operation')->default('generate')->after('style');
            }
            if (!Schema::hasColumn('image_generations', 'status')) {
                $table->string('status')->default('pending')->after('operation');
            }
            if (!Schema::hasColumn('image_generations', 'error_message')) {
                $table->text('error_message')->nullable()->after('status');
            }
            if (!Schema::hasColumn('image_generations', 'metadata')) {
                $table->json('metadata')->nullable()->after('error_message');
            }
            // dropping all indexes and re-adding them later
            // $table->dropIndex(['user_id', 'status']);
            // $table->dropIndex(['chat_id', 'created_at']);
            // $table->dropIndex(['provider', 'model']);
            // Add indexes for better performance
            $table->index(['user_id', 'status']);
            $table->index(['chat_id', 'created_at']);
            $table->index(['provider', 'model']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('image_generations')) {
            return;
        }

        Schema::table('image_generations', function (Blueprint $table) {
            $columns = array_filter([
                Schema::hasColumn('image_generations', 'revised_prompt') ? 'revised_prompt' : null,
                Schema::hasColumn('image_generations', 'image_path') ? 'image_path' : null,
                Schema::hasColumn('image_generations', 'image_content') ? 'image_content' : null,
                Schema::hasColumn('image_generations', 'model') ? 'model' : null,
                Schema::hasColumn('image_generations', 'provider') ? 'provider' : null,
                Schema::hasColumn('image_generations', 'size') ? 'size' : null,
                Schema::hasColumn('image_generations', 'quality') ? 'quality' : null,
                Schema::hasColumn('image_generations', 'style') ? 'style' : null,
                Schema::hasColumn('image_generations', 'operation') ? 'operation' : null,
                Schema::hasColumn('image_generations', 'status') ? 'status' : null,
                Schema::hasColumn('image_generations', 'error_message') ? 'error_message' : null,
                Schema::hasColumn('image_generations', 'metadata') ? 'metadata' : null,
            ]);

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
