<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'monetization_payment_provider')) {
                $table->string('monetization_payment_provider')->nullable()->after('monetization_paid_at');
            }

            if (! Schema::hasColumn('users', 'monetization_payment_reference')) {
                $table->string('monetization_payment_reference')->nullable()->after('monetization_payment_provider')->index();
            }

            if (! Schema::hasColumn('users', 'monetization_payment_status')) {
                $table->string('monetization_payment_status')->nullable()->after('monetization_payment_reference');
            }

            if (! Schema::hasColumn('users', 'monetization_payment_amount')) {
                $table->decimal('monetization_payment_amount', 12, 2)->nullable()->after('monetization_payment_status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'monetization_payment_reference')) {
                $table->dropIndex(['monetization_payment_reference']);
            }

            foreach ([
                'monetization_payment_amount',
                'monetization_payment_status',
                'monetization_payment_reference',
                'monetization_payment_provider',
            ] as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
