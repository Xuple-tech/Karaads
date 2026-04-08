<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meta_broadcast_recipients', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('broadcast_id')->references('id')->on('meta_broadcasts')->cascadeOnDelete();
            $table->string('participant_id');
            $table->string('participant_name')->nullable();
            $table->string('conversation_id');
            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending');
            $table->string('error_message')->nullable();
            $table->timestamps();

            $table->index(['broadcast_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meta_broadcast_recipients');
    }
};
