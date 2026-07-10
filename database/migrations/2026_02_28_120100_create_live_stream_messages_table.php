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
        Schema::create('live_stream_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('live_stream_id');
            $table->uuid('user_id');
            $table->text('message');
            $table->timestamps();

            $table->foreign('live_stream_id')->references('id')->on('live_streams')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['live_stream_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('live_stream_messages');
    }
};
