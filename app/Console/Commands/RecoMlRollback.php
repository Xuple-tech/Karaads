<?php

namespace App\Console\Commands;

use App\Models\Recommendation\RecoModelTrainingHistory;
use App\Models\Recommendation\RecoSurfaceConfig;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class RecoMlRollback extends Command
{
    protected $signature = 'reco:ml:rollback
        {--entity=* : ad|post (repeatable)}
        {--surface=* : feed|moments|profile (repeatable)}';

    protected $description = 'Rollback recommendation ML weights to pre-ML weights.';

    public function handle(): int
    {
        $entities = $this->option('entity') ?: ['ad', 'post'];
        $surfaces = $this->option('surface') ?: ['feed', 'moments', 'profile'];

        foreach ($entities as $entity) {
            foreach ($surfaces as $surface) {
                $config = RecoSurfaceConfig::query()
                    ->where('entity_type', $entity)
                    ->where('surface', $surface)
                    ->whereNull('slot')
                    ->first();

                if (! $config) {
                    $this->warn("No config found for {$entity}/{$surface}.");
                    continue;
                }

                $thresholds = (array) ($config->thresholds ?? []);
                $preMl = (array) ($thresholds['pre_ml_weights'] ?? []);
                if ($preMl === []) {
                    $this->warn("No pre_ml_weights available for {$entity}/{$surface}, skipping.");
                    continue;
                }

                $thresholds['ml_enabled'] = false;
                $thresholds['rolled_back_at'] = now()->toIso8601String();

                $config->update([
                    'weights' => $preMl,
                    'thresholds' => $thresholds,
                    'rollout_mode' => 'rules_only',
                    'canary_percentage' => 0,
                ]);

                RecoModelTrainingHistory::create([
                    'config_id' => $config->id,
                    'entity_type' => $entity,
                    'surface' => $surface,
                    'slot' => null,
                    'action' => 'rollback',
                    'model_version' => (string) ($thresholds['model_version'] ?? null),
                    'trained_at' => now(),
                    'weights' => $preMl,
                    'metrics' => (array) ($thresholds['model_metrics'] ?? []),
                ]);

                $this->info("Rolled back {$entity}/{$surface} to pre-ML weights.");
            }
        }

        Cache::flush();

        return self::SUCCESS;
    }
}

