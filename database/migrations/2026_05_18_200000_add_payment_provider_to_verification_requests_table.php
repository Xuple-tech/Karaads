<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('verification_requests', function (Blueprint $table): void {
            if (! Schema::hasColumn('verification_requests', 'payment_provider')) {
                $table->string('payment_provider', 40)->nullable()->after('payment_status');
            }

            if (! Schema::hasColumn('verification_requests', 'payment_reference')) {
                $table->string('payment_reference', 120)->nullable()->after('payment_provider')->index();
            }
        });
    }

    public function down(): void
    {
        Schema::table('verification_requests', function (Blueprint $table): void {
            if (Schema::hasColumn('verification_requests', 'payment_reference')) {
                $table->dropColumn('payment_reference');
            }

            if (Schema::hasColumn('verification_requests', 'payment_provider')) {
                $table->dropColumn('payment_provider');
            }
        });
    }
};
