<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('widget_website_sources', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('widget_id')->references('id')->on('widget_configs')->cascadeOnDelete();
            $table->uuid('user_id')->index();
            $table->enum('source_type', ['wordpress_url', 'wordpress_plugin']);
            $table->string('site_name')->nullable();
            $table->string('site_url', 2048);
            $table->string('site_host')->index();
            $table->boolean('is_wordpress')->default(false);
            $table->enum('verification_method', ['meta_tag', 'file'])->nullable();
            $table->string('verification_token', 80);
            $table->enum('verification_status', ['pending', 'verified', 'failed'])->default('pending');
            $table->string('connection_token', 80)->unique()->nullable();
            $table->string('connection_secret', 120)->nullable();
            $table->timestamp('plugin_connected_at')->nullable();
            $table->enum('crawl_status', ['idle', 'queued', 'crawling', 'completed', 'failed'])->default('idle');
            $table->json('include_paths')->nullable();
            $table->json('exclude_paths')->nullable();
            $table->json('seed_urls')->nullable();
            $table->json('settings')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('last_verified_at')->nullable();
            $table->timestamp('last_crawled_at')->nullable();
            $table->timestamp('last_sync_at')->nullable();
            $table->timestamp('next_recrawl_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('widget_website_sources');
    }
};
