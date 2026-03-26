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
        if (!Schema::hasTable('subscription_plans')) {
            return;
        }

        Schema::table('subscription_plans', function (Blueprint $table) {
            if (!Schema::hasColumn('subscription_plans', 'stripe_product_id')) {
                $table->string('stripe_product_id')->nullable()->after('description');
            }

            if (!Schema::hasColumn('subscription_plans', 'stripe_monthly_price_id')) {
                $table->string('stripe_monthly_price_id')->nullable()->after('stripe_product_id');
            }

            if (!Schema::hasColumn('subscription_plans', 'stripe_yearly_price_id')) {
                $table->string('stripe_yearly_price_id')->nullable()->after('stripe_monthly_price_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasTable('subscription_plans')) {
            return;
        }

        Schema::table('subscription_plans', function (Blueprint $table) {
            $columns = array_filter([
                Schema::hasColumn('subscription_plans', 'stripe_product_id') ? 'stripe_product_id' : null,
                Schema::hasColumn('subscription_plans', 'stripe_monthly_price_id') ? 'stripe_monthly_price_id' : null,
                Schema::hasColumn('subscription_plans', 'stripe_yearly_price_id') ? 'stripe_yearly_price_id' : null,
            ]);

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
