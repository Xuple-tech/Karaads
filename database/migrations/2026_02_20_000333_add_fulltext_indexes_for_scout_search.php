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
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('posts', function (Blueprint $table) {
            $table->fullText('content', 'posts_content_fulltext');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->fullText(['name', 'bio'], 'users_name_bio_fulltext');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        Schema::table('posts', function (Blueprint $table) {
            $table->dropFullText('posts_content_fulltext');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropFullText('users_name_bio_fulltext');
        });
    }
};
