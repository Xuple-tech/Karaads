<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('verification_requests', function (Blueprint $table): void {
            if (! Schema::hasColumn('verification_requests', 'payment_amount')) {
                $table->decimal('payment_amount', 15, 6)->nullable()->after('followers_count_snapshot');
            }

            if (! Schema::hasColumn('verification_requests', 'payment_status')) {
                $table->string('payment_status', 20)->nullable()->after('payment_amount');
            }

            if (! Schema::hasColumn('verification_requests', 'paid_at')) {
                $table->timestamp('paid_at')->nullable()->after('payment_status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('verification_requests', function (Blueprint $table): void {
            if (Schema::hasColumn('verification_requests', 'paid_at')) {
                $table->dropColumn('paid_at');
            }

            if (Schema::hasColumn('verification_requests', 'payment_status')) {
                $table->dropColumn('payment_status');
            }

            if (Schema::hasColumn('verification_requests', 'payment_amount')) {
                $table->dropColumn('payment_amount');
            }
        });
    }
};
