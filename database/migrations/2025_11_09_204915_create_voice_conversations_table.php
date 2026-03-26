<?php
// [file name]: 2025_11_10_000000_create_voice_conversations_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voice_conversations', function (Blueprint $table) {
            $table->id();
            $table->char('conversation_id', 255);
            $table->foreign('conversation_id')->references('id')->on('conversations')->onDelete('cascade');
            $table->uuid('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // Audio files storage paths
            $table->string('user_audio_path')->nullable()->comment('Path to user recorded audio file');
            $table->string('ai_audio_path')->nullable()->comment('Path to AI generated audio response');

            // Transcripts
            $table->text('user_transcription')->nullable()->comment('STT result of user audio');
            $table->text('ai_response_text')->nullable()->comment('AI text response before TTS');

            // Call metadata
            $table->integer('call_duration')->default(0)->comment('Total call duration in seconds');
            $table->string('language')->default('en')->comment('Language code for STT/TTS');
            $table->string('status')->default('active')->comment('active, completed, failed');

            // Voice settings
            $table->json('voice_settings')->nullable()->comment('TTS voice type, speed, pitch, etc.');
            $table->string('audio_format')->default('mp3')->comment('mp3, wav, ogg, etc.');
            $table->integer('sample_rate')->default(24000)->comment('Audio sample rate');

            $table->timestamps();

            // Indexes for performance
            $table->index('conversation_id');
            $table->index('user_id');
            $table->index('status');
            $table->index('created_at');
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('voice_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('voice_conversation_id')->constrained()->onDelete('cascade');
            $table->enum('speaker', ['user', 'ai'])->comment('Who is speaking');

            // Audio file reference
            $table->string('audio_file_path')->nullable();
            $table->integer('audio_duration')->default(0)->comment('Duration in seconds');

            // Text content
            $table->text('transcription')->nullable()->comment('STT result for user, original text for AI');
            $table->text('content')->nullable()->comment('Final text content');

            // Timing information
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();

            // Metadata
            $table->json('metadata')->nullable()->comment('STT confidence, TTS settings, etc.');

            $table->timestamps();

            // Indexes
            $table->index('voice_conversation_id');
            $table->index(['voice_conversation_id', 'speaker']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voice_messages');
        Schema::dropIfExists('voice_conversations');
    }
};
