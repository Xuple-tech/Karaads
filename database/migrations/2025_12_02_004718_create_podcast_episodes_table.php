<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('podcast_episodes');
        Schema::create('podcast_episodes', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('topic');
            $table->text('script');
            $table->string('audio_path');
            $table->string('audio_url');
            $table->integer('duration')->default(5); // in minutes
            $table->string('genre')->default('news');
            $table->string('format')->default('solo');
            $table->string('voice')->default('nova');
            $table->string('status')->default('completed');
            $table->json('metadata')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index('genre');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('podcast_episodes');
    }
};
