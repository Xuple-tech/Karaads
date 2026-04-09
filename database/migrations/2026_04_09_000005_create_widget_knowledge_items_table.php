<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('widget_knowledge_items', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('widget_id')->references('id')->on('widget_configs')->cascadeOnDelete();
            $table->uuid('user_id')->index();
            $table->string('name');
            $table->enum('type', ['text', 'url', 'pdf']);
            $table->longText('content');
            $table->string('source_url')->nullable();
            $table->enum('status', ['processing', 'ready', 'failed'])->default('ready');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('widget_knowledge_items');
    }
};
