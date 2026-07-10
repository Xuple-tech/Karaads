<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('story_media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('story_id');
            $table->string('file_path');
            $table->string('thumbnail_path')->nullable();
            $table->enum('file_type', ['image', 'video']);
            $table->string('mime_type', 100)->nullable();
            $table->decimal('duration_seconds', 8, 2)->nullable();
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();

            $table->foreign('story_id')->references('id')->on('stories')->onDelete('cascade');
            $table->index(['story_id', 'display_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('story_media');
    }
};