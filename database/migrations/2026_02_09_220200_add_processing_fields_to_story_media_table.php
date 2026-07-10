<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('story_media', function (Blueprint $table) {
            $table->string('processed_file_path')->nullable()->after('file_path');
            $table->json('variants')->nullable()->after('thumbnail_path');
            $table->enum('processing_status', ['queued', 'processing', 'ready', 'failed', 'skipped'])
                ->default('queued')
                ->after('variants');
            $table->text('processing_error')->nullable()->after('processing_status');
            $table->timestamp('processed_at')->nullable()->after('processing_error');
        });
    }

    public function down(): void
    {
        Schema::table('story_media', function (Blueprint $table) {
            $table->dropColumn([
                'processed_file_path',
                'variants',
                'processing_status',
                'processing_error',
                'processed_at',
            ]);
        });
    }
};

