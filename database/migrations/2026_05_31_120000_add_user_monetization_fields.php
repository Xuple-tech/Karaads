<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'monetization_activated_at')) {
                $table->timestamp('monetization_activated_at')->nullable()->after('kara_verified_expires_at');
            }

            if (! Schema::hasColumn('users', 'monetization_paid_at')) {
                $table->timestamp('monetization_paid_at')->nullable()->after('monetization_activated_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'monetization_paid_at')) {
                $table->dropColumn('monetization_paid_at');
            }

            if (Schema::hasColumn('users', 'monetization_activated_at')) {
                $table->dropColumn('monetization_activated_at');
            }
        });
    }
};
