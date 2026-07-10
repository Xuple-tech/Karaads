<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('ad_campaigns_v2')) {
            Schema::table('ad_campaigns_v2', function (Blueprint $table) {
                if (! Schema::hasColumn('ad_campaigns_v2', 'promotion_type')) {
                    $table->enum('promotion_type', ['standard', 'boosted'])->default('standard')->after('billing_model');
                }
                if (! Schema::hasColumn('ad_campaigns_v2', 'post_id')) {
                    $table->foreignUuid('post_id')->nullable()->after('promotion_type');
                }
                if (! Schema::hasColumn('ad_campaigns_v2', 'reach_estimate')) {
                    $table->unsignedBigInteger('reach_estimate')->default(0)->after('spent');
                }
                if (! Schema::hasColumn('ad_campaigns_v2', 'currency')) {
                    $table->string('currency', 3)->default('NGN')->after('budget_total');
                }
            });
        }

        if (! Schema::hasTable('ad_payments')) {
            Schema::create('ad_payments', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->foreignUuid('ad_wallet_id')->constrained('ad_wallets')->cascadeOnDelete();
                $table->decimal('amount', 15, 6);
                $table->string('currency', 3)->default('NGN');
                $table->string('provider')->default('paystack');
                $table->string('reference')->unique();
                $table->enum('status', ['pending', 'successful', 'failed'])->default('pending');
                $table->decimal('fees', 15, 6)->default(0);
                $table->json('meta')->nullable();
                $table->json('raw_payload')->nullable();
                $table->timestamps();

                $table->index(['ad_wallet_id', 'status']);
            });
        }

        if (Schema::hasTable('ad_events_v2') && ! Schema::hasColumn('ad_events_v2', 'currency')) {
            Schema::table('ad_events_v2', function (Blueprint $table) {
                $table->string('currency', 3)->default('NGN')->after('billed_amount');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('ad_campaigns_v2')) {
            Schema::table('ad_campaigns_v2', function (Blueprint $table) {
                if (Schema::hasColumn('ad_campaigns_v2', 'promotion_type')) {
                    $table->dropColumn('promotion_type');
                }
                if (Schema::hasColumn('ad_campaigns_v2', 'post_id')) {
                    $table->dropColumn('post_id');
                }
                if (Schema::hasColumn('ad_campaigns_v2', 'reach_estimate')) {
                    $table->dropColumn('reach_estimate');
                }
                if (Schema::hasColumn('ad_campaigns_v2', 'currency')) {
                    $table->dropColumn('currency');
                }
            });
        }

        Schema::dropIfExists('ad_payments');

        if (Schema::hasTable('ad_events_v2') && Schema::hasColumn('ad_events_v2', 'currency')) {
            Schema::table('ad_events_v2', function (Blueprint $table) {
                $table->dropColumn('currency');
            });
        }
    }
};
