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
        // Subscription Plans Table
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name'); // 'Free', 'Paid', 'Premium', 'Gold'
            $table->string('slug')->unique(); // 'free', 'paid', 'premium', 'gold'
            $table->text('description')->nullable();
            $table->string('stripe_product_id')->nullable();
            $table->string('stripe_monthly_price_id')->nullable();
            $table->string('stripe_yearly_price_id')->nullable();
            $table->decimal('monthly_price', 10, 2)->default(0); // 0 for free tier
            $table->decimal('yearly_price', 10, 2)->nullable();

            // Rate Limits
            $table->integer('requests_per_day')->nullable(); // null = unlimited
            $table->integer('requests_per_month')->nullable();
            $table->integer('tokens_per_day')->nullable();
            $table->integer('tokens_per_month')->nullable();

            // Features
            $table->json('features')->nullable(); // Features array ['web_search', 'image_generation', etc]
            $table->boolean('supports_api')->default(false);
            $table->boolean('supports_voice')->default(false);
            $table->boolean('supports_email_automation')->default(false);
            $table->boolean('supports_projects')->default(false);
            $table->boolean('priority_support')->default(false);

            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        // User Subscriptions Table
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('plan_id');

            $table->enum('status', ['active', 'cancelled', 'expired', 'pending_payment'])->default('active');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('renews_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            // Payment Info
            $table->string('payment_method')->nullable(); // 'stripe', 'paypal', etc
            $table->string('external_subscription_id')->nullable(); // Stripe sub ID, PayPal sub ID, etc
            $table->decimal('amount_paid', 10, 2)->default(0);

            // Trial Info
            $table->boolean('is_trial')->default(false);
            $table->timestamp('trial_ends_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('plan_id')->references('id')->on('subscription_plans')->onDelete('restrict');

            $table->index('status');
            $table->index('expires_at');
        });

        // Daily Usage Quota Table
        Schema::create('usage_quotas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('plan_id');
            $table->date('date');

            // Daily Counters
            $table->integer('requests_used')->default(0);
            $table->integer('tokens_used')->default(0);
            $table->integer('images_generated')->default(0);
            $table->integer('voice_messages')->default(0);
            $table->integer('emails_processed')->default(0);

            // Metadata
            $table->json('metadata')->nullable(); // Store detailed breakdown
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('plan_id')->references('id')->on('subscription_plans')->onDelete('restrict');
            $table->unique(['user_id', 'date']);
        });

        // Monthly Usage Summary
        Schema::create('usage_summaries', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('plan_id');
            $table->unsignedInteger('year');
            $table->unsignedTinyInteger('month');

            // Monthly Counters
            $table->integer('total_requests')->default(0);
            $table->integer('total_tokens')->default(0);
            $table->integer('total_images')->default(0);
            $table->integer('total_voice_messages')->default(0);
            $table->integer('total_emails')->default(0);

            // Metadata
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('plan_id')->references('id')->on('subscription_plans')->onDelete('restrict');
            $table->unique(['user_id', 'year', 'month']);
        });

        // Rate Limit Violations Log (for monitoring)
        Schema::create('rate_limit_violations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->uuid('plan_id');

            $table->enum('type', ['requests_per_day', 'requests_per_month', 'tokens_per_day', 'tokens_per_month', 'other'])->default('other');
            $table->integer('limit_value');
            $table->integer('attempted_value');

            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('plan_id')->references('id')->on('subscription_plans')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rate_limit_violations');
        Schema::dropIfExists('usage_summaries');
        Schema::dropIfExists('usage_quotas');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('subscription_plans');
    }
};
