<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('cover')->nullable()->after('avatar_processing_error');
            $table->json('cover_variants')->nullable()->after('cover');
            $table->enum('cover_processing_status', ['queued', 'processing', 'ready', 'failed', 'skipped'])
                ->nullable()
                ->after('cover_variants');
            $table->text('cover_processing_error')->nullable()->after('cover_processing_status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'cover',
                'cover_variants',
                'cover_processing_status',
                'cover_processing_error',
            ]);
        });
    }
};
