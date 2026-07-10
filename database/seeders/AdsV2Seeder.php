<?php

namespace Database\Seeders;

use App\Domain\Recommendation\RecommendationConfigService;
use App\Models\AdsV2\AdPlacement;
use App\Models\AdsV2\AdPolicyVersion;
use App\Models\AdsV2\AdRevenueSplit;
use Illuminate\Database\Seeder;

class AdsV2Seeder extends Seeder
{
    public function run(): void
    {
        $policy = AdPolicyVersion::firstOrCreate(
            ['name' => 'default-global', 'version' => 1],
            [
                'status' => 'active',
                'effective_at' => now(),
                'rules' => [
                    'fraud' => ['velocity_limit' => 20],
                    'rewarded' => ['daily_cap' => 20],
                ],
            ],
        );

        $placements = [
            ['name' => 'Feed Main', 'surface' => 'feed', 'slot' => 'main', 'source_type' => 'mixed'],
            ['name' => 'Moments Main', 'surface' => 'moments', 'slot' => 'main', 'source_type' => 'mixed'],
            ['name' => 'Moments Rewarded', 'surface' => 'moments', 'slot' => 'rewarded', 'source_type' => 'internal'],
            ['name' => 'Profile Header', 'surface' => 'profile', 'slot' => 'header', 'source_type' => 'mixed'],
        ];

        foreach ($placements as $placement) {
            $model = AdPlacement::firstOrCreate(
                ['surface' => $placement['surface'], 'slot' => $placement['slot']],
                [
                    'name' => $placement['name'],
                    'source_type' => $placement['source_type'],
                    'status' => true,
                    'constraints' => ['max_per_session' => 5],
                ],
            );

            AdRevenueSplit::firstOrCreate(
                ['policy_version_id' => $policy->id, 'placement_id' => $model->id, 'bucket' => 'platform'],
                ['percentage' => 40],
            );
            AdRevenueSplit::firstOrCreate(
                ['policy_version_id' => $policy->id, 'placement_id' => $model->id, 'bucket' => 'creator'],
                ['percentage' => 40],
            );
            AdRevenueSplit::firstOrCreate(
                ['policy_version_id' => $policy->id, 'placement_id' => $model->id, 'bucket' => 'referral'],
                ['percentage' => 10],
            );
            AdRevenueSplit::firstOrCreate(
                ['policy_version_id' => $policy->id, 'placement_id' => $model->id, 'bucket' => 'reward_pool'],
                ['percentage' => 10],
            );
        }

        app(RecommendationConfigService::class)->resetDefaults();
    }
}
