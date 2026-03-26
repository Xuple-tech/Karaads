<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('type', ['per_site', 'per_agent', 'mixed'])->default('mixed');

            // Stripe Integration
            $table->string('stripe_product_id')->nullable();
            $table->string('stripe_monthly_price_id')->nullable();
            $table->string('stripe_yearly_price_id')->nullable();

            // Pricing
            $table->decimal('monthly_price', 10, 2)->default(0);
            $table->decimal('yearly_price', 10, 2)->nullable();

            // Limits
            $table->integer('max_sites')->nullable();
            $table->integer('max_agents_per_site')->nullable();
            $table->integer('max_total_agents')->nullable();
            $table->integer('max_monthly_conversations')->nullable();
            $table->integer('max_daily_conversations')->nullable();
            $table->integer('max_monthly_messages')->nullable();
            $table->integer('knowledge_base_size_mb')->nullable();
            $table->integer('max_file_uploads')->nullable();

            // Features
            $table->boolean('custom_domains_allowed')->default(false);
            $table->boolean('white_label_allowed')->default(false);
            $table->boolean('api_access')->default(false);
            $table->boolean('webhook_support')->default(false);
            $table->boolean('advanced_analytics')->default(false);
            $table->boolean('priority_support')->default(false);
            $table->boolean('custom_branding')->default(false);
            $table->boolean('sso_integration')->default(false);

            // JSON Fields
            $table->json('features')->nullable();
            $table->json('limits')->nullable();

            // Status
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_plans');
    }
};
