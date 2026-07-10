<?php

namespace App\Console\Commands;

use App\Models\AdsV2\AdCreative;
use App\Models\Post;
use App\Models\Recommendation\RecoEntityPerformanceDaily;
use App\Models\Recommendation\RecoModelTrainingHistory;
use App\Models\Recommendation\RecoSurfaceConfig;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\Process\Process;

class RecoMlTrain extends Command
{
    protected $signature = 'reco:ml:train
        {--entity=* : ad|post (repeatable)}
        {--surface=* : feed|moments|profile (repeatable)}
        {--days=30 : training window in days}
        {--python= : python executable (overrides RECO_ML_PYTHON env)}
        {--apply : apply learned weights into reco_surface_configs}';

    protected $description = 'Train recommendation model weights via Python pipeline and optionally deploy them.';

    public function handle(): int
    {
        $entities = $this->option('entity') ?: ['ad', 'post'];
        $surfaces = $this->option('surface') ?: ['feed', 'moments', 'profile'];
        $days = max(1, (int) $this->option('days'));
        $pythonOption = $this->option('python');
        $python = is_string($pythonOption) && trim($pythonOption) !== ''
            ? trim($pythonOption)
            : trim((string) env('RECO_ML_PYTHON', 'python'));
        if ($python === '') {
            $python = 'python';
        }
        $apply = (bool) $this->option('apply');

        $datasetDir = storage_path('app/reco/datasets');
        $modelDir = storage_path('app/reco/models');
        File::ensureDirectoryExists($datasetDir);
        File::ensureDirectoryExists($modelDir);
        $this->line("Using Python binary: {$python}");

        foreach ($entities as $entity) {
            foreach ($surfaces as $surface) {
                if (! in_array($entity, ['ad', 'post'], true)) {
                    $this->warn("Skipping unknown entity type: {$entity}");
                    continue;
                }
                if (! in_array($surface, ['feed', 'moments', 'profile'], true)) {
                    $this->warn("Skipping unknown surface: {$surface}");
                    continue;
                }

                $rows = $entity === 'ad'
                    ? $this->buildAdRows($surface, $days)
                    : $this->buildPostRows($surface, $days);

                if (count($rows) < 10) {
                    $this->warn("Skipping {$entity}/{$surface}: insufficient rows (" . count($rows) . ').');
                    continue;
                }

                $features = $entity === 'ad'
                    ? ['bid', 'quality', 'affinity', 'completion', 'ctr', 'pacing']
                    : ['recency', 'affinity', 'engagement_prior', 'completion', 'ctr', 'diversity'];

                $datasetPath = "{$datasetDir}/{$entity}_{$surface}.csv";
                $modelPath = "{$modelDir}/{$entity}_{$surface}.json";
                $this->writeCsv($datasetPath, $features, $rows);

                $process = new Process([
                    $python,
                    base_path('scripts/reco_ml/train.py'),
                    '--input',
                    $datasetPath,
                    '--output',
                    $modelPath,
                    '--features',
                    implode(',', $features),
                ]);
                $process->setTimeout(120);
                $process->run();

                if (! $process->isSuccessful()) {
                    $this->error("Training failed for {$entity}/{$surface}: " . $process->getErrorOutput());
                    continue;
                }

                $this->info("Trained {$entity}/{$surface}: " . trim($process->getOutput()));

                if ($apply) {
                    $model = json_decode((string) File::get($modelPath), true);
                    $weights = (array) ($model['deployed_weights'] ?? []);

                    if ($weights === []) {
                        $this->warn("No deployed weights found in model for {$entity}/{$surface}.");
                        continue;
                    }

                    $config = RecoSurfaceConfig::firstOrNew([
                        'entity_type' => $entity,
                        'surface' => $surface,
                        'slot' => null,
                    ]);

                    $thresholds = (array) ($config->thresholds ?? []);
                    if (! isset($thresholds['pre_ml_weights'])) {
                        $thresholds['pre_ml_weights'] = (array) ($config->weights ?? []);
                    }
                    $thresholds['ml_enabled'] = true;
                    $thresholds['model_version'] = (string) ($model['version'] ?? '1.0');
                    $thresholds['model_trained_at'] = now()->toIso8601String();
                    $thresholds['model_metrics'] = $model['metrics'] ?? [];

                    $config->fill([
                        'is_active' => true,
                        'rollout_mode' => $config->rollout_mode ?: 'big_bang',
                        'canary_percentage' => $config->canary_percentage ?? 100,
                        'weights' => $weights,
                        'thresholds' => $thresholds,
                    ]);
                    $config->save();

                    RecoModelTrainingHistory::create([
                        'config_id' => $config->id,
                        'entity_type' => $entity,
                        'surface' => $surface,
                        'slot' => null,
                        'action' => 'trained_applied',
                        'model_version' => (string) ($model['version'] ?? '1.0'),
                        'trained_at' => now(),
                        'weights' => $weights,
                        'metrics' => (array) ($model['metrics'] ?? []),
                    ]);

                    Cache::flush();
                    $this->info("Applied model weights for {$entity}/{$surface}.");
                }
            }
        }

        return self::SUCCESS;
    }

    /**
     * @return array<int, array<string, float>>
     */
    private function buildAdRows(string $surface, int $days): array
    {
        $rows = [];
        if (! Schema::hasTable('reco_entity_performance_daily')) {
            return $rows;
        }
        $fromDate = now()->subDays($days)->toDateString();
        $creatives = AdCreative::query()
            ->with('campaign')
            ->where('status', 'active')
            ->limit(5000)
            ->get();

        foreach ($creatives as $creative) {
            $campaign = $creative->campaign;
            if (! $campaign) {
                continue;
            }

            $perf = RecoEntityPerformanceDaily::query()
                ->where('entity_type', 'ad')
                ->where('entity_id', $creative->id)
                ->where('surface', $surface)
                ->where('date', '>=', $fromDate)
                ->selectRaw('SUM(impressions) as impressions, SUM(clicks) as clicks, SUM(completions) as completions')
                ->first();

            $impressions = max(1, (int) ($perf?->impressions ?? 0));
            $ctr = ((int) ($perf?->clicks ?? 0)) / $impressions;
            $completion = ((int) ($perf?->completions ?? 0)) / $impressions;

            $budgetTotal = max(0.000001, (float) $campaign->budget_total);
            $spent = max(0, (float) $campaign->spent);
            $remainingRatio = max(0.0, min(1.0, ($budgetTotal - $spent) / $budgetTotal));
            $pacing = $campaign->pacing_type === 'accelerated'
                ? (0.8 + $remainingRatio * 0.2)
                : (0.5 + $remainingRatio * 0.5);

            $rows[] = [
                'bid' => $this->clamp(((float) $campaign->bid_amount) / 10),
                'quality' => $this->clamp(((float) ($creative->quality_score ?? 1.0)) / 2),
                'affinity' => 0.5,
                'completion' => $this->clamp($completion),
                'ctr' => $this->clamp($ctr),
                'pacing' => $this->clamp($pacing),
                'label' => $this->clamp(($ctr * 0.6) + ($completion * 0.4)),
            ];
        }

        return $rows;
    }

    /**
     * @return array<int, array<string, float>>
     */
    private function buildPostRows(string $surface, int $days): array
    {
        $rows = [];
        if (! Schema::hasTable('reco_entity_performance_daily')) {
            return $rows;
        }
        $fromDate = now()->subDays($days)->toDateString();
        $posts = Post::query()
            ->with('media')
            ->whereDate('created_at', '>=', $fromDate)
            ->limit(5000)
            ->get();

        foreach ($posts as $post) {
            if ($surface === 'moments') {
                $hasVideo = $post->media->contains(fn ($m) => in_array($m->file_type, ['video'], true) || str_starts_with((string) $m->mime_type, 'video/'));
                if (! $hasVideo) {
                    continue;
                }
            }

            $perf = RecoEntityPerformanceDaily::query()
                ->where('entity_type', 'post')
                ->where('entity_id', $post->id)
                ->where('surface', $surface === 'profile' ? 'feed' : $surface)
                ->where('date', '>=', $fromDate)
                ->selectRaw('SUM(impressions) as impressions, SUM(clicks) as clicks, SUM(completions) as completions')
                ->first();

            $impressions = max(1, (int) ($perf?->impressions ?? 0));
            $ctr = ((int) ($perf?->clicks ?? 0)) / $impressions;
            $completion = ((int) ($perf?->completions ?? 0)) / $impressions;

            $ageMinutes = max(1, now()->diffInMinutes($post->created_at));
            $recency = $this->clamp(exp(-$ageMinutes / 7200));
            $engagementPrior = $this->clamp((((float) $post->like_count) + ((float) $post->comment_count * 1.5) + ((float) $post->repost_count * 2.0)) / 500);

            $rows[] = [
                'recency' => $recency,
                'affinity' => 0.5,
                'engagement_prior' => $engagementPrior,
                'completion' => $this->clamp($completion),
                'ctr' => $this->clamp($ctr),
                'diversity' => 0.5,
                'label' => $this->clamp(($ctr * 0.4) + ($completion * 0.4) + ($engagementPrior * 0.2)),
            ];
        }

        return $rows;
    }

    /**
     * @param  array<int, string>  $features
     * @param  array<int, array<string, float>>  $rows
     */
    private function writeCsv(string $path, array $features, array $rows): void
    {
        $handle = fopen($path, 'wb');
        fputcsv($handle, array_merge($features, ['label']));
        foreach ($rows as $row) {
            $line = [];
            foreach ($features as $feature) {
                $line[] = $row[$feature] ?? 0.0;
            }
            $line[] = $row['label'] ?? 0.0;
            fputcsv($handle, $line);
        }
        fclose($handle);
    }

    private function clamp(float $value): float
    {
        return max(0.0, min(1.0, $value));
    }
}
