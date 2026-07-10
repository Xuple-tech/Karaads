<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table): void {
            $table->string('music_path')->nullable()->after('hashtags');
            $table->string('music_title')->nullable()->after('music_path');
            $table->string('music_mime_type')->nullable()->after('music_title');
            $table->decimal('music_duration_seconds', 8, 2)->nullable()->after('music_mime_type');
        });

        Schema::table('stories', function (Blueprint $table): void {
            $table->string('music_path')->nullable()->after('expires_at');
            $table->string('music_title')->nullable()->after('music_path');
            $table->string('music_mime_type')->nullable()->after('music_title');
            $table->decimal('music_duration_seconds', 8, 2)->nullable()->after('music_mime_type');
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table): void {
            $table->dropColumn([
                'music_path',
                'music_title',
                'music_mime_type',
                'music_duration_seconds',
            ]);
        });

        Schema::table('stories', function (Blueprint $table): void {
            $table->dropColumn([
                'music_path',
                'music_title',
                'music_mime_type',
                'music_duration_seconds',
            ]);
        });
    }
};
