<?php
// database/migrations/xxxx_xx_xx_000003_create_ai_agents_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        Schema::dropIfExists('ai_agents');
        Schema::create('ai_agents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('site_id')->constrained()->onDelete('cascade');

            // Basic Info
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->enum('agent_type', ['widget', 'api', 'full_site', 'mobile_app', 'chatbot', 'voice_bot'])->default('widget');
            $table->string('behavior_profile')->nullable();

            // Messaging
            $table->text('welcome_message')->nullable();

            // Branding
            $table->string('primary_color')->nullable();
            $table->string('secondary_color')->nullable();
            $table->string('logo_url')->nullable();

            // Status
            $table->boolean('is_active')->default(true);

            // AI Configuration
            $table->integer('max_context_length')->default(4000);
            $table->decimal('response_temperature', 3, 2)->default(0.7);

            // Features
            $table->boolean('knowledge_base_enabled')->default(false);
            $table->boolean('web_search_enabled')->default(false);
            $table->boolean('file_upload_enabled')->default(false);
            $table->boolean('voice_enabled')->default(false);

            // Language
            $table->string('default_language')->default('en');
            $table->json('supported_languages')->nullable();

            // Availability
            $table->json('working_hours')->nullable();
            $table->text('offline_message')->nullable();

            // Widget Settings
            $table->enum('widget_position', ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'center', 'custom'])->default('bottom-right');
            $table->string('widget_icon')->nullable();

            // Admin Control
            $table->boolean('created_by_admin')->default(false);
            $table->foreignUuid('template_id')->nullable()->constrained('agent_templates')->nullOnDelete();

            // Customization
            $table->text('custom_css')->nullable();
            $table->text('custom_js')->nullable();

            // Metadata
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['user_id', 'site_id']);
            $table->index('slug');
            $table->unique(['site_id', 'slug']);
            $table->index(['is_active', 'agent_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_agents');
    }
};
