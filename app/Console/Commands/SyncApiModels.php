<?php

namespace App\Console\Commands;

use App\Models\ApiModel;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class SyncApiModels extends Command
{
    protected $signature = 'developer-api:sync-models
                            {--file=3rdp/models.json : Path to the models JSON file relative to storage/app}
                            {--dry-run : Preview changes without writing to the database}
                            {--deactivate-missing : Deactivate models not present in the JSON file}';

    protected $description = 'Sync API models and pricing from storage/app/3rdp/models.json into the database';

    private const RULES = [
        'public_id'                          => 'required|string|max:255',
        'name'                               => 'required|string|max:255',
        'description'                        => 'nullable|string',
        'model_type'                         => 'required|in:text,image',
        'upstream_provider'                  => 'required|string|max:255',
        'upstream_model'                     => 'required|string|max:255',
        'input_price_per_1m_tokens'          => 'required|numeric|min:0',
        'output_price_per_1m_tokens'         => 'required|numeric|min:0',
        'provider_input_price_per_1m_tokens' => 'nullable|numeric|min:0',
        'provider_output_price_per_1m_tokens'=> 'nullable|numeric|min:0',
        'price_per_image_usd'                => 'nullable|numeric|min:0',
        'provider_price_per_image_usd'       => 'nullable|numeric|min:0',
        'max_context_tokens'                 => 'nullable|integer|min:1',
        'supports_reasoning'                 => 'nullable|boolean',
        'supports_streaming'                 => 'nullable|boolean',
        'supports_tools'                     => 'nullable|boolean',
        'is_active'                          => 'nullable|boolean',
    ];

    public function handle(): int
    {
        $file = (string) $this->option('file');
        $dryRun = (bool) $this->option('dry-run');
        $deactivateMissing = (bool) $this->option('deactivate-missing');

        $filePath = storage_path('app/' . $file);

        if (!file_exists($filePath)) {
            $this->error("File not found: {$filePath}");
            return self::FAILURE;
        }

        $raw = file_get_contents($filePath);
        $definitions = json_decode((string) $raw, true);

        if (!is_array($definitions) || json_last_error() !== JSON_ERROR_NONE) {
            $this->error('Invalid JSON in ' . $file . ': ' . json_last_error_msg());
            return self::FAILURE;
        }

        $this->info('Parsing ' . count($definitions) . ' model(s) from ' . $file . ($dryRun ? ' [DRY RUN]' : ''));
        $this->newLine();

        $seenPublicIds = [];
        $created = 0;
        $updated = 0;
        $skipped = 0;
        $errors = 0;

        foreach ($definitions as $index => $definition) {
            $label = $definition['public_id'] ?? "entry #{$index}";

            $validator = Validator::make($definition, self::RULES);
            if ($validator->fails()) {
                $this->error("  [{$label}] Validation failed:");
                foreach ($validator->errors()->all() as $error) {
                    $this->line("    - {$error}");
                }
                $errors++;
                continue;
            }

            $data = $validator->validated();
            $seenPublicIds[] = $data['public_id'];

            $data = array_merge([
                'provider_input_price_per_1m_tokens'  => 0,
                'provider_output_price_per_1m_tokens' => 0,
                'supports_reasoning' => false,
                'supports_streaming' => true,
                'supports_tools'     => false,
                'is_active'          => true,
            ], $data);

            $existing = ApiModel::where('public_id', $data['public_id'])->first();

            if ($existing) {
                $changes = $this->detectChanges($existing, $data);
                if (empty($changes)) {
                    $this->line("  <fg=gray>~ {$label} — no changes</>");
                    $skipped++;
                } else {
                    $this->line("  <fg=yellow>↻ {$label} — updating:</>");
                    foreach ($changes as [$field, $old, $new]) {
                        $this->line("      {$field}: {$old} → {$new}");
                    }
                    if (!$dryRun) {
                        $existing->update($data);
                    }
                    $updated++;
                }
            } else {
                $this->line("  <fg=green>+ {$label} — creating ({$data['name']})</>");
                if (!$dryRun) {
                    ApiModel::create($data);
                }
                $created++;
            }
        }

        if ($deactivateMissing && !empty($seenPublicIds)) {
            $missedQuery = ApiModel::where('is_active', true)->whereNotIn('public_id', $seenPublicIds);
            $missedCount = $missedQuery->count();
            if ($missedCount > 0) {
                $missed = $missedQuery->pluck('public_id');
                $this->newLine();
                $this->line("  <fg=red>✕ Deactivating {$missedCount} model(s) not in JSON:</>");
                foreach ($missed as $pid) {
                    $this->line("    - {$pid}");
                }
                if (!$dryRun) {
                    $missedQuery->update(['is_active' => false]);
                }
            }
        }

        $this->newLine();
        $this->table(
            ['Created', 'Updated', 'Skipped', 'Errors'],
            [[$created, $updated, $skipped, $errors]]
        );

        if ($dryRun) {
            $this->warn('Dry run — no changes were written to the database.');
        }

        return $errors > 0 ? self::FAILURE : self::SUCCESS;
    }

    private function detectChanges(ApiModel $model, array $data): array
    {
        $tracked = [
            'name', 'description', 'upstream_provider', 'upstream_model', 'model_type',
            'input_price_per_1m_tokens', 'output_price_per_1m_tokens',
            'provider_input_price_per_1m_tokens', 'provider_output_price_per_1m_tokens',
            'price_per_image_usd', 'provider_price_per_image_usd',
            'max_context_tokens', 'supports_reasoning', 'supports_streaming',
            'supports_tools', 'is_active',
        ];

        $changes = [];
        foreach ($tracked as $field) {
            if (!array_key_exists($field, $data)) {
                continue;
            }
            $old = $model->{$field};
            $new = $data[$field];
            // Normalise decimal comparisons
            if (is_numeric($old) && is_numeric($new)) {
                if ((float) $old === (float) $new) {
                    continue;
                }
            } elseif ((string) $old === (string) $new) {
                continue;
            }
            $changes[] = [$field, $old ?? 'null', $new ?? 'null'];
        }

        return $changes;
    }
}
