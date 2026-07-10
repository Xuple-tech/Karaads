<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('monetization_settings')) {
            return;
        }

        $key = 'min_campaign_budget_ngn';
        $value = json_encode(['amount' => 500]);

        $existing = DB::table('monetization_settings')->where('key', $key)->first();

        if ($existing) {
            DB::table('monetization_settings')
                ->where('key', $key)
                ->update([
                    'value' => $value,
                    'updated_at' => now(),
                ]);

            return;
        }

        DB::table('monetization_settings')->insert([
            'id' => (string) Str::uuid(),
            'key' => $key,
            'value' => $value,
            'description' => 'Minimum total budget for campaigns (NGN)',
            'data_type' => 'json',
            'category' => 'ad_revenue',
            'is_editable' => true,
            'options' => null,
            'min_value' => 0,
            'max_value' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        if (! Schema::hasTable('monetization_settings')) {
            return;
        }

        DB::table('monetization_settings')
            ->where('key', 'min_campaign_budget_ngn')
            ->update([
                'value' => json_encode(['amount' => 1000]),
                'updated_at' => now(),
            ]);
    }
};
