<?php

namespace App\Console\Commands;

use App\Models\AdsV2\AdAccount;
use App\Models\AdsV2\AdCampaign;
use App\Models\AdsV2\AdCreative;
use App\Models\AdsV2\AdPlacement;
use App\Models\AdsV2\AdWallet;
use App\Models\Post;
use App\Models\PostMedia;
use App\Models\Recommendation\RecoEntityPerformanceDaily;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class RecoBootstrapSyntheticData extends Command
{
    protected $signature = 'reco:bootstrap-synthetic
        {--entity=both : ad|post|both}
        {--target=5000 : target row count per entity/surface}
        {--days=30 : days window for generated stats}';

    protected $description = 'Bootstrap synthetic recommendation data for ML training when production data is sparse.';

    public function handle(): int
    {
        $entity = (string) $this->option('entity');
        $target = max(100, (int) $this->option('target'));
        $days = max(1, (int) $this->option('days'));

        if (in_array($entity, ['post', 'both'], true)) {
            $this->bootstrapPosts($target, $days);
        }
        if (in_array($entity, ['ad', 'both'], true)) {
            $this->bootstrapAds($target, $days);
        }

        $this->info('Synthetic bootstrap completed.');

        return self::SUCCESS;
    }

    private function bootstrapPosts(int $target, int $days): void
    {
        $this->info("Bootstrapping post synthetic data (target={$target})...");
        $since = now()->subDays($days);
        $postCount = Post::count();
        if ($postCount < $target) {
            $missing = $target - $postCount;
            $users = User::query()->inRandomOrder()->limit(100)->pluck('id')->all();
            if ($users === []) {
                $users = User::factory()->count(20)->create()->pluck('id')->all();
            }

            for ($i = 0; $i < $missing; $i++) {
                $userId = $users[array_rand($users)];
                Post::create([
                    'id' => (string) Str::uuid(),
                    'user_id' => $userId,
                    'content' => 'Synthetic recommendation training post #' . ($i + 1),
                    'type' => 'post',
                    'visibility' => 'everyone',
                    'like_count' => random_int(0, 700),
                    'comment_count' => random_int(0, 120),
                    'repost_count' => random_int(0, 80),
                    'save_count' => random_int(0, 60),
                ]);
            }
            $this->line("Created {$missing} synthetic posts.");
        }

        $users = User::query()->inRandomOrder()->limit(100)->pluck('id')->all();
        if ($users === []) {
            $users = User::factory()->count(20)->create()->pluck('id')->all();
        }

        $requiredVideoRecent = (int) max(200, floor($target * 0.25));
        $currentVideoRecent = Post::query()
            ->where('created_at', '>=', $since)
            ->whereHas('media', fn ($q) => $q->where('file_type', 'video'))
            ->count();
        if ($currentVideoRecent < $requiredVideoRecent) {
            $toCreate = $requiredVideoRecent - $currentVideoRecent;
            for ($i = 0; $i < $toCreate; $i++) {
                $userId = $users[array_rand($users)];
                $post = Post::create([
                    'id' => (string) Str::uuid(),
                    'user_id' => $userId,
                    'content' => 'Synthetic moments video post #' . ($i + 1),
                    'type' => 'post',
                    'visibility' => 'everyone',
                    'like_count' => random_int(0, 700),
                    'comment_count' => random_int(0, 120),
                    'repost_count' => random_int(0, 80),
                    'save_count' => random_int(0, 60),
                    'created_at' => now()->subDays(random_int(0, max(0, $days - 1))),
                    'updated_at' => now(),
                ]);

                PostMedia::create([
                    'id' => (string) Str::uuid(),
                    'post_id' => $post->id,
                    'file_path' => 'synthetic/videos/' . Str::uuid() . '.mp4',
                    'file_type' => 'video',
                    'mime_type' => 'video/mp4',
                    'duration' => random_int(5, 90),
                    'thumbnail_path' => 'synthetic/videos/thumbs/' . Str::uuid() . '.jpg',
                    'order' => 0,
                ]);
            }
            $this->line("Created {$toCreate} recent video posts for moments training.");
        }

        $posts = Post::query()->inRandomOrder()->limit($target)->get(['id']);

        // Ensure a healthy pool of moments-compatible video posts.
        foreach ($posts->take((int) max(100, floor($target * 0.35))) as $post) {
            PostMedia::firstOrCreate(
                ['post_id' => $post->id, 'file_type' => 'video'],
                [
                    'id' => (string) Str::uuid(),
                    'file_path' => 'synthetic/videos/' . Str::uuid() . '.mp4',
                    'mime_type' => 'video/mp4',
                    'duration' => random_int(5, 90),
                    'thumbnail_path' => 'synthetic/videos/thumbs/' . Str::uuid() . '.jpg',
                    'order' => 0,
                ],
            );
        }

        $surfaces = ['feed', 'moments', 'profile'];
        foreach ($surfaces as $surface) {
            foreach ($posts as $post) {
                $date = now()->subDays(random_int(0, $days - 1))->toDateString();
                $impressions = random_int(80, 5000);
                $clicks = random_int(5, max(6, (int) floor($impressions * 0.25)));
                $completions = random_int(2, max(3, (int) floor($impressions * 0.20)));
                $views = random_int($clicks, max($clicks + 1, (int) floor($impressions * 0.60)));
                $dismissals = random_int(0, max(1, (int) floor($impressions * 0.25)));

                RecoEntityPerformanceDaily::updateOrCreate(
                    [
                        'date' => $date,
                        'entity_type' => 'post',
                        'entity_id' => $post->id,
                        'surface' => $surface,
                    ],
                    [
                        'impressions' => $impressions,
                        'views' => $views,
                        'clicks' => $clicks,
                        'completions' => $completions,
                        'dismissals' => $dismissals,
                        'ctr' => round($clicks / max(1, $impressions), 6),
                        'completion_rate' => round($completions / max(1, $impressions), 6),
                    ],
                );
            }
        }
    }

    private function bootstrapAds(int $target, int $days): void
    {
        $this->info("Bootstrapping ad synthetic data (target={$target})...");
        $owner = User::query()->first() ?? User::factory()->create();
        $account = AdAccount::firstOrCreate(
            ['user_id' => $owner->id, 'source_type' => 'internal'],
            ['name' => 'Synthetic ML Ads Account', 'status' => 'active'],
        );
        AdWallet::firstOrCreate(
            ['ad_account_id' => $account->id],
            ['currency' => 'USD', 'balance' => 100000, 'credit_limit' => 50000, 'credit_used' => 0, 'is_credit_approved' => true],
        );

        foreach (['feed', 'moments', 'profile'] as $surface) {
            AdPlacement::firstOrCreate(
                ['surface' => $surface, 'slot' => 'main'],
                ['name' => ucfirst($surface) . ' Main', 'source_type' => 'internal', 'status' => true],
            );
        }

        $creativeCount = AdCreative::count();
        if ($creativeCount < $target) {
            $missing = $target - $creativeCount;
            for ($i = 0; $i < $missing; $i++) {
                $campaign = AdCampaign::create([
                    'ad_account_id' => $account->id,
                    'user_id' => $owner->id,
                    'name' => 'Synthetic Campaign #' . ($i + 1),
                    'objective' => 'traffic',
                    'billing_model' => 'cpc',
                    'status' => 'active',
                    'budget_total' => 1000,
                    'budget_daily' => 100,
                    'spent' => random_int(0, 500),
                    'bid_amount' => random_int(10, 500) / 100,
                    'pacing_type' => random_int(0, 1) ? 'standard' : 'accelerated',
                    'targeting' => ['surface' => ['feed', 'moments', 'profile']],
                    'start_at' => now()->subDays(14),
                    'end_at' => now()->addDays(14),
                ]);

                AdCreative::create([
                    'campaign_id' => $campaign->id,
                    'source_type' => 'internal',
                    'status' => 'active',
                    'title' => 'Synthetic Creative #' . ($i + 1),
                    'description' => 'Synthetic ML training creative',
                    'media_url' => '/storage/ads/v2/synthetic.jpg',
                    'media_type' => random_int(0, 1) ? 'image' : 'video',
                    'target_url' => 'https://example.com',
                    'render_mode' => 'internal_asset',
                    'quality_score' => random_int(60, 100) / 100,
                ]);
            }
            $this->line("Created {$missing} synthetic creatives + campaigns.");
        }

        $creatives = AdCreative::query()->with('campaign')->inRandomOrder()->limit($target)->get(['id']);
        foreach (['feed', 'moments', 'profile'] as $surface) {
            foreach ($creatives as $creative) {
                $date = now()->subDays(random_int(0, $days - 1))->toDateString();
                $impressions = random_int(80, 5000);
                $clicks = random_int(5, max(6, (int) floor($impressions * 0.30)));
                $completions = random_int(2, max(3, (int) floor($impressions * 0.25)));
                $views = random_int($clicks, max($clicks + 1, (int) floor($impressions * 0.60)));
                $dismissals = random_int(0, max(1, (int) floor($impressions * 0.20)));

                RecoEntityPerformanceDaily::updateOrCreate(
                    [
                        'date' => $date,
                        'entity_type' => 'ad',
                        'entity_id' => $creative->id,
                        'surface' => $surface,
                    ],
                    [
                        'impressions' => $impressions,
                        'views' => $views,
                        'clicks' => $clicks,
                        'completions' => $completions,
                        'dismissals' => $dismissals,
                        'ctr' => round($clicks / max(1, $impressions), 6),
                        'completion_rate' => round($completions / max(1, $impressions), 6),
                    ],
                );
            }
        }
    }
}
