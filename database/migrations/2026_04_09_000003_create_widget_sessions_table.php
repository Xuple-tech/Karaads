<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('widget_sessions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('widget_id')->references('id')->on('widget_configs')->cascadeOnDelete();
            $table->string('session_token', 64)->unique();
            $table->string('visitor_id')->nullable();
            $table->string('referrer_url')->nullable();
            $table->string('page_url')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('widget_sessions');
    }
};
