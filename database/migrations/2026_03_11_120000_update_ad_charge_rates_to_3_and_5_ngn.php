<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $this->upsertRateSetting(
            'ad_image_view_rate_ngn',
            3.0,
            'Charge per image impression view (NGN)',
        );

        $this->upsertRateSetting(
            'ad_video_view_rate_ngn',
            5.0,
            'Charge per qualified video view (NGN)',
        );
    }

    public function down(): void
    {
        $this->upsertRateSetting(
            'ad_image_view_rate_ngn',
            2.0,
            'Charge per image impression view (NGN)',
        );

        $this->upsertRateSetting(
            'ad_video_view_rate_ngn',
            3.0,
            'Charge per qualified video view (NGN)',
        );
    }

    private function upsertRateSetting(string $key, float $amount, string $description): void
    {
        $exists = DB::table('monetization_settings')->where('key', $key)->exists();

        if ($exists) {
            DB::table('monetization_settings')
                ->where('key', $key)
                ->update([
                    'value' => json_encode(['amount' => $amount], JSON_THROW_ON_ERROR),
                    'description' => $description,
                    'updated_at' => now(),
                ]);

            return;
        }

        DB::table('monetization_settings')->insert([
            'id' => (string) Str::uuid(),
            'key' => $key,
            'value' => json_encode(['amount' => $amount], JSON_THROW_ON_ERROR),
            'description' => $description,
            'data_type' => 'json',
            'category' => 'ad_revenue',
            'is_editable' => true,
            'min_value' => 0.01,
            'max_value' => 1000,
            'options' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
};
