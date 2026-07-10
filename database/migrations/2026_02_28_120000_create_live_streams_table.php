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
        Schema::create('live_streams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('title', 140);
            $table->text('description')->nullable();
            $table->enum('visibility', ['everyone', 'followers'])->default('everyone');
            $table->enum('status', ['draft', 'live', 'ended'])->default('draft');
            $table->unsignedInteger('max_viewers')->default(8);
            $table->unsignedInteger('viewer_count')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->uuid('replay_post_id')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('replay_post_id')->references('id')->on('posts')->nullOnDelete();
            $table->index(['status', 'started_at']);
            $table->index(['user_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('live_streams');
    }
};
