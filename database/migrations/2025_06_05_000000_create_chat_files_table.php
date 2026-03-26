<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('chat_files');
        Schema::create('chat_files', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('chat_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('filename');              // Original filename
            $table->string('filepath');             // Storage path
            $table->string('mime_type');           // File MIME type
            $table->bigInteger('file_size');       // File size in bytes
            $table->string('hash')->nullable();    // File hash for deduplication
            $table->json('metadata')->nullable();  // Additional metadata (dimensions, duration, etc.)
            $table->string('status')->default('pending'); // pending, processing, processed, failed
            $table->json('processing_results')->nullable(); // Results from AI processing
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes for better performance
            $table->index(['status', 'created_at']);
            $table->index('hash');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_files');
    }
};
