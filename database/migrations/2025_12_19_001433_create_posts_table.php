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
        Schema::create('posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->text('content');
            $table->enum('type', ['post', 'repost', 'quote'])->default('post');
            $table->uuid('original_post_id')->nullable();
            $table->text('quote_content')->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->boolean('comments_disabled')->default(false);
            $table->integer('like_count')->default(0);
            $table->integer('comment_count')->default(0);
            $table->integer('repost_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('original_post_id')->references('id')->on('posts')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
