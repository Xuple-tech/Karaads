<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sites', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');

            // Basic Info
            $table->string('name');
            $table->string('domain')->nullable();
            $table->string('subdomain')->nullable()->unique();
            $table->string('url');
            $table->enum('site_type', ['website', 'web_app', 'mobile_app', 'ecommerce', 'saas', 'landing_page'])->default('website');
            $table->string('industry')->nullable();
            $table->text('description')->nullable();

            // Branding
            $table->string('logo_url')->nullable();
            $table->string('favicon_url')->nullable();
            $table->string('primary_color')->nullable();
            $table->string('secondary_color')->nullable();

            // Settings
            $table->string('language')->default('en');
            $table->string('timezone')->default('UTC');
            $table->boolean('is_active')->default(true);
            $table->boolean('widget_enabled')->default(false);

            // Agent Limits
            $table->integer('max_agents')->default(1);
            $table->integer('current_agents_count')->default(0);

            // Verification
            $table->string('verification_token')->nullable();
            $table->timestamp('verified_at')->nullable();

            // JSON Fields
            $table->json('site_settings')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['user_id', 'is_active']);
            $table->index('domain');
            $table->index('verified_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sites');
    }
};
