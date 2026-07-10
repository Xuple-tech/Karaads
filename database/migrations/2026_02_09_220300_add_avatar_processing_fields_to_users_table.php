<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('avatar_variants')->nullable()->after('avatar');
            $table->enum('avatar_processing_status', ['queued', 'processing', 'ready', 'failed', 'skipped'])
                ->nullable()
                ->after('avatar_variants');
            $table->text('avatar_processing_error')->nullable()->after('avatar_processing_status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'avatar_variants',
                'avatar_processing_status',
                'avatar_processing_error',
            ]);
        });
    }
};

