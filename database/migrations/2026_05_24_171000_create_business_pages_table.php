<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('business_pages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('owner_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->string('avatar_path')->nullable();
            $table->string('cover_path')->nullable();
            $table->unsignedBigInteger('follower_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['owner_user_id', 'created_at']);
        });

        Schema::create('business_page_followers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('business_page_id')->constrained('business_pages')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['business_page_id', 'user_id']);
            $table->index(['user_id', 'created_at']);
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->uuid('business_page_id')
                ->nullable()
                ->after('user_id')
                ->index();
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex(['business_page_id']);
            $table->dropColumn('business_page_id');
        });

        Schema::dropIfExists('business_page_followers');
        Schema::dropIfExists('business_pages');
    }
};
