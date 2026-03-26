<?php

namespace App\Console\Commands;

use App\Models\OllamaApiKey;
use Illuminate\Console\Command;

class ResetOllamaKeyCounts extends Command
{
    protected $signature = 'ollama:reset-counts
                            {--key= : Reset specific key by ID}
                            {--all : Reset all keys}';

    protected $description = 'Reset request counts for Ollama API keys';

    public function handle()
    {
        if ($this->option('key')) {
            $key = OllamaApiKey::find($this->option('key'));

            if (!$key) {
                $this->error('Key not found.');
                return 1;
            }

            $key->resetRequestCount();
            $this->info("✅ Reset request count for key: {$key->name}");

        } elseif ($this->option('all')) {
            $count = OllamaApiKey::active()->count();
            OllamaApiKey::resetAllCounts();
            $this->info("✅ Reset request counts for {$count} keys.");

        } else {
            $this->error('Please specify --key=ID or --all');
            return 1;
        }

        return 0;
    }
}
