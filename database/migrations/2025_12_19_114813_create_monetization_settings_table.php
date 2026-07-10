<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monetization_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('key')->unique();
            $table->json('value')->nullable();
            $table->text('description')->nullable();
            $table->enum('data_type', ['string', 'integer', 'float', 'boolean', 'json', 'array'])->default('string');
            $table->enum('category', ['ad_revenue', 'user_payout', 'content_creator', 'admin', 'platform'])->default('platform');
            $table->boolean('is_editable')->default(true);
            $table->decimal('min_value', 10, 4)->nullable();
            $table->decimal('max_value', 10, 4)->nullable();
            $table->json('options')->nullable();
            $table->timestamps();
        });

        // Seed default monetization settings
        DB::table('monetization_settings')->insert([
            [
                'id' => Str::uuid(),
                'key' => 'ad_revenue_split_content_creator',
                'value' => json_encode(['percentage' => 60]),
                'description' => 'Percentage of ad revenue that goes to content creator',
                'data_type' => 'json',
                'category' => 'ad_revenue',
                'min_value' => 0,
                'max_value' => 100,
            ],
            [
                'id' => Str::uuid(),
                'key' => 'ad_revenue_split_viewer',
                'value' => json_encode(['percentage' => 10]),
                'description' => 'Percentage of ad revenue that goes to viewer',
                'data_type' => 'json',
                'category' => 'ad_revenue',
                'min_value' => 0,
                'max_value' => 100,
            ],
            [
                'id' => Str::uuid(),
                'key' => 'ad_revenue_split_platform',
                'value' => json_encode(['percentage' => 30]),
                'description' => 'Percentage of ad revenue that goes to platform',
                'data_type' => 'json',
                'category' => 'ad_revenue',
                'min_value' => 0,
                'max_value' => 100,
            ],
            [
                'id' => Str::uuid(),
                'key' => 'minimum_payout_amount',
                'value' => json_encode(['amount' => 10.00]),
                'description' => 'Minimum amount required for payout',
                'data_type' => 'json',
                'category' => 'user_payout',
                'min_value' => 0,
                'max_value' => 1000,
            ],
            [
                'id' => Str::uuid(),
                'key' => 'cpm_base_rate',
                'value' => json_encode(['amount' => 0.50]),
                'description' => 'Base CPM rate per 1000 impressions',
                'data_type' => 'json',
                'category' => 'ad_revenue',
                'min_value' => 0.01,
                'max_value' => 100,
            ],
            [
                'id' => Str::uuid(),
                'key' => 'cpc_base_rate',
                'value' => json_encode(['amount' => 0.05]),
                'description' => 'Base CPC rate per click',
                'data_type' => 'json',
                'category' => 'ad_revenue',
                'min_value' => 0.001,
                'max_value' => 10,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('monetization_settings');
    }
};