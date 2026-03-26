<?php

namespace App\Console\Commands;

use App\Models\OllamaApiKey;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class AddOllamaApiKey extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ollama:add-key
                            {key? : The Ollama API key}
                            {--name= : Name for the API key}
                            {--model= : Default model for this key}
                            {--limit=50 : Rate limit for this key}
                            {--interactive : Run in interactive mode}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Add a new Ollama Cloud API key to the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $key = $this->argument('key');
        $name = $this->option('name');
        $model = $this->option('model');
        $limit = $this->option('limit');
        $interactive = $this->option('interactive');

        // Interactive mode
        if ($interactive || !$key) {
            $this->info('Adding a new Ollama Cloud API key...');

            $key = $this->ask('Enter your Ollama API key');
            $name = $this->ask('Enter a name for this key (optional)', 'Primary Ollama Key');
            $model = $this->ask('Enter default model (optional)', 'gpt-oss:120b-cloud');
            $limit = $this->ask('Enter rate limit (optional)', 50);
        }

        // Validate the API key
        $validator = Validator::make([
            'key' => $key,
            'name' => $name,
            'model' => $model,
            'limit' => $limit
        ], [
            'key' => 'required|string|min:10',
            'name' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'limit' => 'nullable|integer|min:1|max:1000'
        ]);

        if ($validator->fails()) {
            $this->error('Validation failed:');
            foreach ($validator->errors()->all() as $error) {
                $this->error("- $error");
            }
            return 1;
        }

        try {
            // Check if key already exists
            if (OllamaApiKey::where('key', $key)->exists()) {
                $this->warn('This API key already exists in the database.');
                if (!$this->confirm('Do you want to update the existing key?')) {
                    $this->info('Operation cancelled.');
                    return 0;
                }

                // Update existing key
                OllamaApiKey::where('key', $key)->update([
                    'name' => $name,
                    'model' => $model,
                    'rate_limit' => $limit,
                    'is_active' => true,
                    'updated_at' => now()
                ]);

                $this->info('✅ API key updated successfully!');
            } else {
                // Create new key
                OllamaApiKey::create([
                    'name' => $name,
                    'key' => $key,
                    'model' => $model,
                    'rate_limit' => $limit,
                    'request_count' => 0,
                    'is_active' => true,
                    'notes' => 'Added via artisan command'
                ]);

                $this->info('✅ API key added successfully!');
            }

            // Display key info
            $this->newLine();
            $this->info('Key Information:');
            $this->line("Name: {$name}");
            $this->line("Model: {$model}");
            $this->line("Rate Limit: {$limit} requests");
            $this->line("Status: Active");

            // Show total active keys
            $activeKeys = OllamaApiKey::active()->count();
            $this->newLine();
            $this->info("Total active keys: {$activeKeys}");

            return 0;

        } catch (\Exception $e) {
            $this->error('Failed to add API key: ' . $e->getMessage());
            return 1;
        }
    }
}
