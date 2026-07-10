<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('post_views', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('post_id');
            $table->uuid('user_id');
            $table->timestamps();

            $table->foreign('post_id')->references('id')->on('posts')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->unique(['post_id', 'user_id']);
            $table->index(['created_at']);
        });

        Schema::create('live_stream_joins', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('live_stream_id');
            $table->uuid('user_id');
            $table->timestamps();

            $table->foreign('live_stream_id')->references('id')->on('live_streams')->cascadeOnDelete();
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
            $table->unique(['live_stream_id', 'user_id']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('live_stream_joins');
        Schema::dropIfExists('post_views');
    }
};
