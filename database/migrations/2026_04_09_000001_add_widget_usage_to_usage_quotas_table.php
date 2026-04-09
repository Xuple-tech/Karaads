<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usage_quotas', function (Blueprint $table) {
            $table->integer('widget_requests_used')->default(0)->after('emails_processed');
        });
    }

    public function down(): void
    {
        Schema::table('usage_quotas', function (Blueprint $table) {
            $table->dropColumn('widget_requests_used');
        });
    }
};
