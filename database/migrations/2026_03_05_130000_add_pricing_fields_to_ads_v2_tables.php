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
                if (! Schema::hasColumn('ad_campaigns_v2', 'pricing_media_type')) {
                    $table->string('pricing_media_type', 16)->default('image')->after('billing_model');
                }

                if (! Schema::hasColumn('ad_campaigns_v2', 'daily_target_views')) {
                    $table->unsignedInteger('daily_target_views')->default(1)->after('budget_daily');
                }
            });
        }

        if (Schema::hasTable('ad_creatives_v2')) {
            Schema::table('ad_creatives_v2', function (Blueprint $table) {
                if (! Schema::hasColumn('ad_creatives_v2', 'duration_seconds')) {
                    $table->decimal('duration_seconds', 8, 2)->nullable()->after('media_type');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('ad_creatives_v2')) {
            Schema::table('ad_creatives_v2', function (Blueprint $table) {
                if (Schema::hasColumn('ad_creatives_v2', 'duration_seconds')) {
                    $table->dropColumn('duration_seconds');
                }
            });
        }

        if (Schema::hasTable('ad_campaigns_v2')) {
            Schema::table('ad_campaigns_v2', function (Blueprint $table) {
                if (Schema::hasColumn('ad_campaigns_v2', 'daily_target_views')) {
                    $table->dropColumn('daily_target_views');
                }

                if (Schema::hasColumn('ad_campaigns_v2', 'pricing_media_type')) {
                    $table->dropColumn('pricing_media_type');
                }
            });
        }
    }
};
