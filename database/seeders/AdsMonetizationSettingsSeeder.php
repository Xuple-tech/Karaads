<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdsMonetizationSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            [
                'key' => 'cpm_base_rate_ngn',
                'value' => json_encode(['amount' => 2]),
                'description' => 'Base CPM rate (NGN) per 1000 impressions',
                'data_type' => 'json',
                'category' => 'ad_revenue',
                'min_value' => 0.01,
                'max_value' => 1000,
            ],
            [
                'key' => 'ad_video_view_rate_ngn',
                'value' => json_encode(['amount' => 5]),
                'description' => 'Charge per qualified video view (NGN)',
                'data_type' => 'json',
                'category' => 'ad_revenue',
                'min_value' => 0.01,
                'max_value' => 1000,
            ],
            [
                'key' => 'ad_image_view_rate_ngn',
                'value' => json_encode(['amount' => 3]),
                'description' => 'Charge per image impression view (NGN)',
                'data_type' => 'json',
                'category' => 'ad_revenue',
                'min_value' => 0.01,
                'max_value' => 1000,
            ],
            [
                'key' => 'ad_video_viewer_reward_ngn',
                'value' => json_encode(['amount' => 3]),
                'description' => 'Viewer reward per qualified video view (NGN)',
                'data_type' => 'json',
                'category' => 'ad_revenue',
                'min_value' => 0.01,
                'max_value' => 1000,
            ],
            [
                'key' => 'ad_image_viewer_reward_ngn',
                'value' => json_encode(['amount' => 2]),
                'description' => 'Viewer reward per image view (NGN)',
                'data_type' => 'json',
                'category' => 'ad_revenue',
                'min_value' => 0.01,
                'max_value' => 1000,
            ],
            [
                'key' => 'ad_video_view_threshold_ratio',
                'value' => json_encode(['ratio' => 0.5]),
                'description' => 'Minimum watch ratio required to count a video view',
                'data_type' => 'json',
                'category' => 'ad_revenue',
                'min_value' => 0.01,
                'max_value' => 1,
            ],
            [
                'key' => 'ad_video_max_duration_seconds',
                'value' => json_encode(['seconds' => 300]),
                'description' => 'Maximum allowed ad video duration in seconds',
                'data_type' => 'json',
                'category' => 'ad_revenue',
                'min_value' => 1,
                'max_value' => 600,
            ],
            [
                'key' => 'min_campaign_budget_ngn',
                'value' => json_encode(['amount' => 500]),
                'description' => 'Minimum total budget for campaigns (NGN)',
                'data_type' => 'json',
                'category' => 'ad_revenue',
                'min_value' => 0,
                'max_value' => null,
            ],
            [
                'key' => 'max_campaign_budget_ngn',
                'value' => json_encode(['amount' => 1000000]),
                'description' => 'Maximum total budget for campaigns (NGN)',
                'data_type' => 'json',
                'category' => 'ad_revenue',
                'min_value' => 0,
                'max_value' => null,
            ],
            [
                'key' => 'ad_targeting_options',
                'value' => json_encode([
                    'demographics' => ['18-24', '25-34', '35-44', '45-54', '55+'],
                    'interests' => ['fashion', 'tech', 'sports', 'music', 'gaming', 'food'],
                    'locations' => ['NG-LA', 'NG-FC', 'NG-KN', 'NG-RI', 'NG-EN', 'NG-OS'],
                ]),
                'description' => 'Allowed targeting options for ads',
                'data_type' => 'json',
                'category' => 'ad_revenue',
                'min_value' => null,
                'max_value' => null,
            ],
        ];

        foreach ($defaults as $setting) {
            $existing = DB::table('monetization_settings')->where('key', $setting['key'])->first();
            if ($existing) {
                DB::table('monetization_settings')
                    ->where('key', $setting['key'])
                    ->update([
                        'value' => $setting['value'],
                        'description' => $setting['description'],
                        'data_type' => $setting['data_type'],
                        'category' => $setting['category'],
                        'min_value' => $setting['min_value'],
                        'max_value' => $setting['max_value'],
                        'updated_at' => now(),
                    ]);
            } else {
                DB::table('monetization_settings')->insert([
                    'id' => Str::uuid(),
                    ...$setting,
                    'is_editable' => true,
                    'options' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
