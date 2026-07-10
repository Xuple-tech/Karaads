<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->createIfMissing('ad_accounts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('source_type', ['internal', 'external']);
            $table->string('name');
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['source_type', 'status']);
        });

        $this->createIfMissing('ad_wallets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('ad_account_id')->constrained('ad_accounts')->cascadeOnDelete();
            $table->string('currency', 3)->default('USD');
            $table->decimal('balance', 15, 6)->default(0);
            $table->decimal('credit_limit', 15, 6)->default(0);
            $table->decimal('credit_used', 15, 6)->default(0);
            $table->boolean('is_credit_approved')->default(false);
            $table->timestamps();

            $table->unique('ad_account_id');
        });

        $this->createIfMissing('ad_credit_lines', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('ad_account_id')->constrained('ad_accounts')->cascadeOnDelete();
            $table->decimal('requested_amount', 15, 6);
            $table->decimal('approved_amount', 15, 6)->default(0);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignUuid('reviewed_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->text('review_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });

        $this->createIfMissing('ad_wallet_ledger', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('ad_wallet_id')->constrained('ad_wallets')->cascadeOnDelete();
            $table->enum('direction', ['debit', 'credit']);
            $table->enum('entry_type', ['reserve', 'commit', 'release', 'deposit', 'adjustment', 'payout_accrual', 'invalidated_refund']);
            $table->decimal('amount', 15, 6);
            $table->string('reference_type')->nullable();
            $table->uuid('reference_id')->nullable();
            $table->string('idempotency_key')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->unique('idempotency_key');
            $table->index(['ad_wallet_id', 'entry_type']);
            $table->index(['reference_type', 'reference_id']);
        });

        $this->createIfMissing('ad_campaigns_v2', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('ad_account_id')->constrained('ad_accounts')->cascadeOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->enum('objective', ['awareness', 'traffic', 'conversions', 'rewarded'])->default('traffic');
            $table->enum('billing_model', ['cpm', 'cpc', 'cpv', 'cpa'])->default('cpm');
            $table->enum('status', ['draft', 'in_review', 'approved', 'active', 'paused', 'completed', 'rejected', 'archived'])->default('draft');
            $table->decimal('budget_total', 15, 6);
            $table->decimal('budget_daily', 15, 6)->nullable();
            $table->decimal('spent', 15, 6)->default(0);
            $table->decimal('bid_amount', 12, 6)->default(0);
            $table->enum('pacing_type', ['standard', 'accelerated'])->default('standard');
            $table->json('targeting')->nullable();
            $table->timestamp('start_at');
            $table->timestamp('end_at')->nullable();
            $table->timestamp('review_submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->foreignUuid('approved_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->index(['status', 'start_at', 'end_at']);
            $table->index(['objective', 'billing_model']);
        });

        $this->createIfMissing('ad_adsets_v2', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('campaign_id')->constrained('ad_campaigns_v2')->cascadeOnDelete();
            $table->string('name');
            $table->enum('status', ['draft', 'in_review', 'approved', 'active', 'paused', 'completed', 'rejected', 'archived'])->default('draft');
            $table->decimal('budget_total', 15, 6)->nullable();
            $table->decimal('budget_daily', 15, 6)->nullable();
            $table->decimal('bid_amount', 12, 6)->default(0);
            $table->json('placement_scope')->nullable();
            $table->json('targeting')->nullable();
            $table->timestamp('start_at')->nullable();
            $table->timestamp('end_at')->nullable();
            $table->timestamps();

            $table->index(['campaign_id', 'status']);
        });

        $this->createIfMissing('ad_provider_adapters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('provider_key')->unique();
            $table->enum('adapter_type', ['script_tag', 'iframe_embed', 'server_response']);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->json('config')->nullable();
            $table->json('secrets')->nullable();
            $table->timestamps();

            $table->index(['adapter_type', 'status']);
        });

        $this->createIfMissing('ad_placements_v2', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->enum('surface', ['feed', 'moments', 'profile']);
            $table->string('slot');
            $table->enum('source_type', ['internal', 'external', 'mixed'])->default('mixed');
            $table->boolean('status')->default(true);
            $table->foreignUuid('adapter_id')->nullable()->constrained('ad_provider_adapters')->nullOnDelete();
            $table->foreignUuid('fallback_placement_id')->nullable()->constrained('ad_placements_v2')->nullOnDelete();
            $table->json('constraints')->nullable();
            $table->timestamps();

            $table->unique(['surface', 'slot']);
            $table->index(['status', 'source_type']);
        });

        $this->createIfMissing('ad_creatives_v2', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('campaign_id')->constrained('ad_campaigns_v2')->cascadeOnDelete();
            $table->foreignUuid('adset_id')->nullable()->constrained('ad_adsets_v2')->nullOnDelete();
            $table->enum('source_type', ['internal', 'external']);
            $table->enum('status', ['draft', 'in_review', 'approved', 'active', 'paused', 'completed', 'rejected', 'archived'])->default('draft');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('media_url')->nullable();
            $table->enum('media_type', ['image', 'video', 'html'])->nullable();
            $table->string('target_url')->nullable();
            $table->enum('render_mode', ['internal_asset', 'script_tag', 'iframe_embed', 'server_response'])->default('internal_asset');
            $table->json('external_payload')->nullable();
            $table->decimal('quality_score', 8, 4)->default(1);
            $table->json('policy_flags')->nullable();
            $table->foreignUuid('approved_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->index(['campaign_id', 'status']);
            $table->index(['source_type', 'render_mode']);
        });

        $this->createIfMissing('ad_external_mappings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('creative_id')->constrained('ad_creatives_v2')->cascadeOnDelete();
            $table->foreignUuid('adapter_id')->constrained('ad_provider_adapters')->cascadeOnDelete();
            $table->string('external_campaign_id')->nullable();
            $table->string('external_creative_id')->nullable();
            $table->string('external_placement_key')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['adapter_id', 'status']);
        });

        $this->createIfMissing('ad_targeting_rules_v2', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('placement_id')->nullable()->constrained('ad_placements_v2')->cascadeOnDelete();
            $table->foreignUuid('campaign_id')->nullable()->constrained('ad_campaigns_v2')->cascadeOnDelete();
            $table->string('rule_type');
            $table->string('operator');
            $table->json('rule_value');
            $table->unsignedInteger('priority')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'priority']);
        });

        $this->createIfMissing('ad_deliveries_v2', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('placement_id')->constrained('ad_placements_v2')->cascadeOnDelete();
            $table->foreignUuid('campaign_id')->nullable()->constrained('ad_campaigns_v2')->nullOnDelete();
            $table->foreignUuid('creative_id')->nullable()->constrained('ad_creatives_v2')->nullOnDelete();
            $table->foreignUuid('viewer_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('source_type', ['internal', 'external']);
            $table->enum('status', ['served', 'blocked', 'expired', 'invalidated'])->default('served');
            $table->decimal('score', 10, 4)->default(0);
            $table->string('session_id')->nullable();
            $table->string('fingerprint')->nullable();
            $table->timestamp('served_at');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('invalidated_at')->nullable();
            $table->string('blocked_reason')->nullable();
            $table->string('signature', 128)->nullable();
            $table->timestamps();

            $table->index(['status', 'served_at']);
            $table->index(['session_id', 'fingerprint']);
        });

        $this->createIfMissing('ad_events_v2', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('delivery_id')->nullable()->constrained('ad_deliveries_v2')->nullOnDelete();
            $table->foreignUuid('placement_id')->nullable()->constrained('ad_placements_v2')->nullOnDelete();
            $table->foreignUuid('campaign_id')->nullable()->constrained('ad_campaigns_v2')->nullOnDelete();
            $table->foreignUuid('creative_id')->nullable()->constrained('ad_creatives_v2')->nullOnDelete();
            $table->foreignUuid('viewer_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('event_type', ['impression', 'view_start', 'view_complete', 'click', 'dismiss', 'conversion', 'invalidated']);
            $table->timestamp('occurred_at');
            $table->string('session_id')->nullable();
            $table->string('fingerprint')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->string('idempotency_key')->nullable();
            $table->json('meta')->nullable();
            $table->boolean('is_billable')->default(false);
            $table->decimal('billed_amount', 15, 6)->default(0);
            $table->boolean('invalidated')->default(false);
            $table->string('invalid_reason')->nullable();
            $table->timestamps();

            $table->unique('idempotency_key');
            $table->index(['event_type', 'occurred_at']);
            $table->index(['fingerprint', 'session_id']);
        });

        $this->createIfMissing('ad_conversions_v2', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('event_id')->nullable()->constrained('ad_events_v2')->nullOnDelete();
            $table->foreignUuid('delivery_id')->nullable()->constrained('ad_deliveries_v2')->nullOnDelete();
            $table->foreignUuid('campaign_id')->nullable()->constrained('ad_campaigns_v2')->nullOnDelete();
            $table->foreignUuid('creative_id')->nullable()->constrained('ad_creatives_v2')->nullOnDelete();
            $table->string('conversion_type')->default('purchase');
            $table->decimal('value', 15, 6)->default(0);
            $table->string('currency', 3)->default('USD');
            $table->timestamp('occurred_at');
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['occurred_at', 'conversion_type']);
        });

        $this->createIfMissing('ad_policy_versions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->unsignedInteger('version');
            $table->enum('status', ['draft', 'active', 'archived'])->default('draft');
            $table->json('rules')->nullable();
            $table->timestamp('effective_at')->nullable();
            $table->timestamps();

            $table->unique(['name', 'version']);
            $table->index(['status', 'effective_at']);
        });

        $this->createIfMissing('ad_revenue_splits', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('policy_version_id')->constrained('ad_policy_versions')->cascadeOnDelete();
            $table->foreignUuid('placement_id')->nullable()->constrained('ad_placements_v2')->nullOnDelete();
            $table->enum('bucket', ['platform', 'creator', 'referral', 'reward_pool']);
            $table->decimal('percentage', 5, 2);
            $table->timestamps();

            $table->index(['policy_version_id', 'placement_id']);
        });

        $this->createIfMissing('ad_payout_batches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->dateTime('period_start');
            $table->dateTime('period_end');
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->decimal('total_amount', 15, 6)->default(0);
            $table->string('currency', 3)->default('USD');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'period_start', 'period_end']);
        });

        $this->createIfMissing('ad_payout_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('batch_id')->nullable()->constrained('ad_payout_batches')->nullOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('source', ['creator', 'referral', 'rewarded']);
            $table->decimal('amount', 15, 6);
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->string('reference_type')->nullable();
            $table->uuid('reference_id')->nullable();
            $table->json('meta')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'source', 'status']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    private function createIfMissing(string $tableName, \Closure $callback): void
    {
        if (! Schema::hasTable($tableName)) {
            Schema::create($tableName, $callback);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ad_payout_items');
        Schema::dropIfExists('ad_payout_batches');
        Schema::dropIfExists('ad_revenue_splits');
        Schema::dropIfExists('ad_policy_versions');
        Schema::dropIfExists('ad_conversions_v2');
        Schema::dropIfExists('ad_events_v2');
        Schema::dropIfExists('ad_deliveries_v2');
        Schema::dropIfExists('ad_targeting_rules_v2');
        Schema::dropIfExists('ad_external_mappings');
        Schema::dropIfExists('ad_creatives_v2');
        Schema::dropIfExists('ad_placements_v2');
        Schema::dropIfExists('ad_provider_adapters');
        Schema::dropIfExists('ad_adsets_v2');
        Schema::dropIfExists('ad_campaigns_v2');
        Schema::dropIfExists('ad_wallet_ledger');
        Schema::dropIfExists('ad_credit_lines');
        Schema::dropIfExists('ad_wallets');
        Schema::dropIfExists('ad_accounts');
    }
};

