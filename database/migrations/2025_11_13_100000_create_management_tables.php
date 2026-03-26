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
        // System configuration table
        Schema::create('system_configs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('key')->unique();
            $table->longText('value')->nullable();
            $table->string('type')->default('string'); // string, boolean, json, encrypted
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Grok API configuration
        Schema::create('grok_api_configs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('created_by')->nullable();
            $table->string('api_key')->encrypted();
            $table->string('model')->default('grok-3');
            $table->boolean('is_active')->default(true);
            $table->integer('rate_limit')->default(1000);
            $table->json('allowed_features')->nullable(); // json: which features can use this key
            $table->text('notes')->nullable();
            $table->timestamp('last_verified_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });

        // System audit logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable();
            $table->string('action');
            $table->string('model')->nullable();
            $table->uuid('model_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->text('description')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['user_id', 'created_at']);
            $table->index(['action', 'created_at']);
        });

        // API usage logs
        Schema::create('api_usage_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable();
            $table->uuid('saas_owner_id')->nullable();
            $table->string('api_provider')->default('grok'); // grok, openrouter, ollama
            $table->string('model');
            $table->string('endpoint');
            $table->integer('tokens_used')->default(0);
            $table->integer('input_tokens')->default(0);
            $table->integer('output_tokens')->default(0);
            $table->float('response_time_ms')->default(0);
            $table->string('status')->default('success'); // success, error, rate_limit
            $table->text('error_message')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('saas_owner_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['user_id', 'created_at']);
            $table->index(['api_provider', 'created_at']);
            $table->index(['saas_owner_id', 'created_at']);
        });

        // System alerts and errors
        Schema::create('system_alerts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('severity')->default('info'); // info, warning, critical
            $table->string('category')->default('system'); // system, api, auth, performance
            $table->string('title');
            $table->longText('message');
            $table->json('data')->nullable();
            $table->boolean('is_resolved')->default(false);
            $table->uuid('resolved_by')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->foreign('resolved_by')->references('id')->on('users')->onDelete('set null');
            $table->index(['severity', 'created_at']);
            $table->index(['is_resolved', 'created_at']);
        });

        // Login activity logs
        Schema::create('login_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable();
            $table->string('email')->nullable();
            $table->string('ip_address');
            $table->string('user_agent')->nullable();
            $table->string('status')->default('success'); // success, failed, blocked
            $table->text('failure_reason')->nullable();
            $table->string('location')->nullable(); // from IP geolocation
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['user_id', 'created_at']);
            $table->index(['status', 'created_at']);
        });

        // AI prompt templates (for SaaS owners and admins)
        Schema::create('ai_prompt_templates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->nullable(); // null = system-wide, set = saas owner specific
            $table->string('name');
            $table->longText('prompt');
            $table->text('description')->nullable();
            $table->string('category')->nullable(); // support, general, technical, creative
            $table->json('variables')->nullable(); // dynamic variables in prompt
            $table->integer('usage_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['user_id', 'name']);
        });

        // SaaS instance settings
        Schema::create('saas_instance_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('saas_owner_id');
            $table->string('instance_name');
            $table->text('description')->nullable();
            $table->json('custom_prompts')->nullable();
            $table->json('conversation_settings')->nullable(); // context length, temperature, etc
            $table->json('features_enabled')->nullable(); // which features are available
            $table->bigInteger('monthly_message_limit')->default(100000);
            $table->bigInteger('current_month_messages')->default(0);
            $table->string('subscription_plan')->default('basic'); // basic, pro, enterprise
            $table->timestamp('subscription_expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('saas_owner_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique('saas_owner_id');
        });

        // SaaS team members
        Schema::create('saas_team_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('saas_owner_id');
            $table->uuid('user_id');
            $table->string('role')->default('member'); // member, manager, admin
            $table->json('permissions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('saas_owner_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['saas_owner_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saas_team_members');
        Schema::dropIfExists('saas_instance_settings');
        Schema::dropIfExists('ai_prompt_templates');
        Schema::dropIfExists('login_logs');
        Schema::dropIfExists('system_alerts');
        Schema::dropIfExists('api_usage_logs');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('grok_api_configs');
        Schema::dropIfExists('system_configs');
    }
};
