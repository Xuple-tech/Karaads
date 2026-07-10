<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            if (! Schema::hasColumn('posts', 'primary_category')) {
                $table->string('primary_category', 64)->nullable()->after('save_count');
                $table->index('primary_category');
            }
            if (! Schema::hasColumn('posts', 'category_confidence')) {
                $table->decimal('category_confidence', 6, 4)->nullable()->after('primary_category');
            }
            if (! Schema::hasColumn('posts', 'category_scores')) {
                $table->json('category_scores')->nullable()->after('category_confidence');
            }
            if (! Schema::hasColumn('posts', 'hashtags')) {
                $table->json('hashtags')->nullable()->after('category_scores');
            }
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            if (Schema::hasColumn('posts', 'hashtags')) {
                $table->dropColumn('hashtags');
            }
            if (Schema::hasColumn('posts', 'category_scores')) {
                $table->dropColumn('category_scores');
            }
            if (Schema::hasColumn('posts', 'category_confidence')) {
                $table->dropColumn('category_confidence');
            }
            if (Schema::hasColumn('posts', 'primary_category')) {
                $table->dropIndex(['primary_category']);
                $table->dropColumn('primary_category');
            }
        });
    }
};

