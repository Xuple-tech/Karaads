<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('widget_website_source_pages', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('website_source_id')->references('id')->on('widget_website_sources')->cascadeOnDelete();
            $table->foreignUlid('knowledge_item_id')->nullable()->references('id')->on('widget_knowledge_items')->nullOnDelete();
            $table->string('url', 2048);
            $table->string('path', 1024);
            $table->string('title')->nullable();
            $table->enum('status', ['queued', 'crawling', 'ready', 'failed', 'skipped'])->default('queued');
            $table->string('content_hash', 64)->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamp('last_crawled_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['website_source_id', 'url'], 'widget_website_source_pages_source_url_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('widget_website_source_pages');
    }
};
