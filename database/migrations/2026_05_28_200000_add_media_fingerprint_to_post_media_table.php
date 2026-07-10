<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('post_media', function (Blueprint $table): void {
            if (! Schema::hasColumn('post_media', 'media_fingerprint')) {
                $table->string('media_fingerprint', 64)->nullable()->after('mime_type');
                $table->index('media_fingerprint');
            }
        });
    }

    public function down(): void
    {
        Schema::table('post_media', function (Blueprint $table): void {
            if (Schema::hasColumn('post_media', 'media_fingerprint')) {
                $table->dropIndex(['media_fingerprint']);
                $table->dropColumn('media_fingerprint');
            }
        });
    }
};
