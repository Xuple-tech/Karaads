<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('ad_campaigns_v2') && ! Schema::hasColumn('ad_campaigns_v2', 'last_funded_at')) {
            Schema::table('ad_campaigns_v2', function (Blueprint $table) {
                $table->timestamp('last_funded_at')->nullable()->after('approved_at');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('ad_campaigns_v2') && Schema::hasColumn('ad_campaigns_v2', 'last_funded_at')) {
            Schema::table('ad_campaigns_v2', function (Blueprint $table) {
                $table->dropColumn('last_funded_at');
            });
        }
    }
};
