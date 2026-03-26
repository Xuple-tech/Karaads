<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subscription_plans', function (Blueprint $table) {
            // Add image generation limits
            $table->integer('images_per_day')->nullable()->after('tokens_per_month'); // null = unlimited
            $table->integer('images_per_month')->nullable()->after('images_per_day');
        });
    }

    public function down(): void
    {
        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->dropColumn(['images_per_day', 'images_per_month']);
        });
    }
};
