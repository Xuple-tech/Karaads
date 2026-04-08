<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('image_generations')) {
            return;
        }

        Schema::table('image_generations', function (Blueprint $table) {
            if (! Schema::hasColumn('image_generations', 'user_id')) {
                $table->string('user_id', 255)->nullable()->after('id');
            }

            if (! Schema::hasColumn('image_generations', 'prompt')) {
                $table->text('prompt')->nullable()->after('email');
            }

            if (! Schema::hasColumn('image_generations', 'revised_prompt')) {
                $table->text('revised_prompt')->nullable()->after('prompt');
            }

            if (! Schema::hasColumn('image_generations', 'image_url')) {
                $table->text('image_url')->nullable()->after('revised_prompt');
            }

            if (! Schema::hasColumn('image_generations', 'image_path')) {
                $table->string('image_path')->nullable()->after('image_url');
            }

            if (! Schema::hasColumn('image_generations', 'image_content')) {
                $table->longText('image_content')->nullable()->after('image_path');
            }

            if (! Schema::hasColumn('image_generations', 'model')) {
                $table->string('model')->nullable()->after('image_content');
            }

            if (! Schema::hasColumn('image_generations', 'provider')) {
                $table->string('provider')->nullable()->after('model');
            }

            if (! Schema::hasColumn('image_generations', 'size')) {
                $table->string('size')->nullable()->after('provider');
            }

            if (! Schema::hasColumn('image_generations', 'quality')) {
                $table->string('quality')->nullable()->after('size');
            }

            if (! Schema::hasColumn('image_generations', 'style')) {
                $table->string('style')->nullable()->after('quality');
            }

            if (! Schema::hasColumn('image_generations', 'background')) {
                $table->string('background')->nullable()->after('style');
            }

            if (! Schema::hasColumn('image_generations', 'output_format')) {
                $table->string('output_format')->nullable()->after('background');
            }

            if (! Schema::hasColumn('image_generations', 'operation')) {
                $table->string('operation')->default('generate')->after('output_format');
            }

            if (! Schema::hasColumn('image_generations', 'chat_id')) {
                $table->string('chat_id', 255)->nullable()->after('operation');
            }

            if (! Schema::hasColumn('image_generations', 'status')) {
                $table->string('status')->default('pending')->after('chat_id');
            }

            if (! Schema::hasColumn('image_generations', 'error_message')) {
                $table->text('error_message')->nullable()->after('status');
            }

            if (! Schema::hasColumn('image_generations', 'metadata')) {
                $table->json('metadata')->nullable()->after('error_message');
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('image_generations')) {
            return;
        }

        Schema::table('image_generations', function (Blueprint $table) {
            $columns = array_filter([
                Schema::hasColumn('image_generations', 'user_id') ? 'user_id' : null,
                Schema::hasColumn('image_generations', 'prompt') ? 'prompt' : null,
                Schema::hasColumn('image_generations', 'revised_prompt') ? 'revised_prompt' : null,
                Schema::hasColumn('image_generations', 'image_url') ? 'image_url' : null,
                Schema::hasColumn('image_generations', 'image_path') ? 'image_path' : null,
                Schema::hasColumn('image_generations', 'image_content') ? 'image_content' : null,
                Schema::hasColumn('image_generations', 'model') ? 'model' : null,
                Schema::hasColumn('image_generations', 'provider') ? 'provider' : null,
                Schema::hasColumn('image_generations', 'size') ? 'size' : null,
                Schema::hasColumn('image_generations', 'quality') ? 'quality' : null,
                Schema::hasColumn('image_generations', 'style') ? 'style' : null,
                Schema::hasColumn('image_generations', 'background') ? 'background' : null,
                Schema::hasColumn('image_generations', 'output_format') ? 'output_format' : null,
                Schema::hasColumn('image_generations', 'operation') ? 'operation' : null,
                Schema::hasColumn('image_generations', 'chat_id') ? 'chat_id' : null,
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
