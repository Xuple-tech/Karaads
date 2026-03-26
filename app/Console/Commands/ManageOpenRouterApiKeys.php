<?php

namespace App\Console\Commands;

use App\Models\OpenRouterApiKey;
use Illuminate\Console\Command;

class ManageOpenRouterApiKeys extends Command
{
    protected $signature = 'openrouter:keys
                          {action? : Action to perform (list, add, remove, reset)}
                          {--key= : API key to add or remove}
                          {--name= : Name for the API key}
                          {--model= : Model type for the API key}';

    protected $description = 'Manage OpenRouter API keys';

    public function handle()
    {
        $action = $this->argument('action') ?? 'list';

        switch ($action) {
            case 'list':
                $this->listKeys();
                break;
            case 'add':
                $this->addKey();
                break;
            case 'remove':
                $this->removeKey();
                break;
            case 'reset':
                $this->resetCounts();
                break;
            default:
                $this->error("Unknown action: {$action}");
                return 1;
        }

        return 0;
    }

    protected function listKeys()
    {
        $keys = OpenRouterApiKey::all();
        $this->table(
            ['Name', 'Key (partial)', 'Model', 'Request Count', 'Status', 'Last Used'],
            $keys->map(function ($key) {
                return [
                    $key->name ?? 'Unnamed',
                    substr($key->key, 0, 10) . '...',
                    $key->model ?? 'N/A',
                    $key->request_count,
                    $key->is_active ? 'Active' : 'Inactive',
                    $key->last_used_at ? $key->last_used_at->diffForHumans() : 'Never'
                ];
            })
        );
    }

    protected function addKey()
    {
        $key = $this->option('key');
        if (!$key) {
            $this->error('Please provide an API key with --key option');
            return;
        }

        $name = $this->option('name');
        $model = $this->option('model');

        try {
            OpenRouterApiKey::create([
                'key' => $key,
                'name' => $name,
                'model' => $model,
                'request_count' => 0,
                'is_active' => true,
                'last_used_at' => now()
            ]);

            $this->info('API key added successfully');
        } catch (\Exception $e) {
            $this->error('Failed to add API key: ' . $e->getMessage());
        }
    }

    protected function removeKey()
    {
        $key = $this->option('key');
        if (!$key) {
            $this->error('Please provide an API key with --key option');
            return;
        }

        $deleted = OpenRouterApiKey::where('key', $key)->delete();
        if ($deleted) {
            $this->info('API key removed successfully');
        } else {
            $this->error('API key not found');
        }
    }

    protected function resetCounts()
    {
        OpenRouterApiKey::resetAllCounts();
        $this->info('Request counts reset for all keys');
    }
}
