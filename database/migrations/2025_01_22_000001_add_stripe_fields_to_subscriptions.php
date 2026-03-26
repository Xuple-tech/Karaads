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
        Schema::table('subscriptions', function (Blueprint $table) {
            // Stripe IDs
            $table->string('stripe_customer_id')->nullable()->index();
            $table->string('stripe_subscription_id')->nullable()->unique();
            $table->string('stripe_invoice_id')->nullable();
            $table->string('stripe_payment_method_id')->nullable();

            // Payment tracking
            $table->decimal('stripe_amount', 12, 2)->nullable(); // Amount in cents
            $table->string('stripe_currency')->default('usd');
            $table->string('stripe_status')->nullable(); // active, past_due, canceled, etc.

            // Auto-renewal settings
            $table->boolean('auto_renew')->default(true);
            $table->timestamp('last_payment_at')->nullable();
            $table->timestamp('next_payment_at')->nullable();

            // Billing cycle
            $table->string('billing_cycle')->default('monthly'); // monthly or yearly

            // Failure handling
            $table->integer('payment_failure_count')->default(0);
            $table->timestamp('last_payment_failure_at')->nullable();
            $table->text('last_payment_failure_reason')->nullable();
        });

        // Create Stripe customer records table
        Schema::create('stripe_customers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique();
            $table->string('stripe_customer_id')->unique()->index();
            $table->string('email')->nullable();
            $table->json('metadata')->nullable(); // Store additional Stripe data
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Create payment transactions table for audit trail
        Schema::create('stripe_payment_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('subscription_id');
            $table->string('stripe_invoice_id')->nullable();
            $table->string('stripe_charge_id')->nullable();
            $table->string('type'); // charge, refund, adjustment
            $table->decimal('amount', 12, 2);
            $table->string('currency')->default('usd');
            $table->string('status'); // succeeded, failed, pending
            $table->text('description')->nullable();
            $table->text('failure_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('subscription_id')->references('id')->on('subscriptions')->onDelete('cascade');
            $table->index(['subscription_id', 'created_at']);
        });

        // Webhook event logs for debugging
        Schema::create('stripe_webhook_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('stripe_event_id')->unique();
            $table->string('event_type'); // invoice.payment_succeeded, etc.
            $table->json('payload');
            $table->string('status')->default('received'); // received, processed, failed
            $table->text('error_message')->nullable();
            $table->integer('retry_count')->default(0);
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['event_type', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn([
                'stripe_customer_id',
                'stripe_subscription_id',
                'stripe_invoice_id',
                'stripe_payment_method_id',
                'stripe_amount',
                'stripe_currency',
                'stripe_status',
                'auto_renew',
                'last_payment_at',
                'next_payment_at',
                'billing_cycle',
                'payment_failure_count',
                'last_payment_failure_at',
                'last_payment_failure_reason',
            ]);
        });

        Schema::dropIfExists('stripe_customers');
        Schema::dropIfExists('stripe_payment_transactions');
        Schema::dropIfExists('stripe_webhook_events');
    }
};
