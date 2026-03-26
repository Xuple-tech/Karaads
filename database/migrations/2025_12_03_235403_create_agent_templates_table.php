<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Basic Info
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('category', ['ecommerce', 'support', 'booking', 'education', 'healthcare', 'finance', 'real_estate', 'travel', 'food', 'general'])->default('general');
            $table->string('industry')->nullable();

            // Configuration
            $table->json('default_config')->nullable();
            $table->text('welcome_message')->nullable();
            $table->json('suggested_questions')->nullable();
            $table->json('tools_config')->nullable();
            $table->json('knowledge_base_structure')->nullable();
            $table->json('widget_settings')->nullable();

            // Pricing & Status
            $table->boolean('is_active')->default(true);
            $table->boolean('is_premium')->default(false);
            $table->decimal('price', 10, 2)->nullable();
            $table->foreignUuid('created_by_admin_id')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['category', 'is_active']);
            $table->index('is_premium');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_templates');
    }
};
