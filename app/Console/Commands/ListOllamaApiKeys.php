<?php

namespace App\Console\Commands;

use App\Models\OllamaApiKey;
use Illuminate\Console\Command;

class ListOllamaApiKeys extends Command
{
    protected $signature = 'ollama:list-keys';
    protected $description = 'List all Ollama API keys in the database';

    public function handle()
    {
        $keys = OllamaApiKey::all();

        if ($keys->isEmpty()) {
            $this->info('No API keys found in the database.');
            return 0;
        }

        $this->info('Ollama API Keys:');
        $this->newLine();

        $headers = ['ID', 'Name', 'Model', 'Requests', 'Limit', 'Usage %', 'Status', 'Last Used'];
        $rows = [];

        foreach ($keys as $key) {
            $rows[] = [
                $key->id,
                $key->name ?? 'Unnamed',
                $key->model,
                $key->request_count,
                $key->rate_limit,
                round($key->usage_percentage, 1) . '%',
                $key->is_active ? '✅ Active' : '❌ Inactive',
                $key->last_used_at ? $key->last_used_at->diffForHumans() : 'Never'
            ];
        }

        $this->table($headers, $rows);
        return 0;
    }
}
