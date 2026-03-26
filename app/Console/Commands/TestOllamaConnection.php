<?php

namespace App\Console\Commands;

use App\Services\OllamaCloudService;
use Illuminate\Console\Command;

class TestOllamaConnection extends Command
{
    protected $signature = 'ollama:test-connection';
    protected $description = 'Test connection to Ollama Cloud API';

    public function handle(OllamaCloudService $ollamaService)
    {
        $this->info('Testing Ollama Cloud connection...');

        try {
            $isConnected = $ollamaService->testConnection();

            if ($isConnected) {
                $this->info('✅ Successfully connected to Ollama Cloud API!');

                // Test available models
                $models = $ollamaService->getAvailableModels();
                $this->info('Available models: ' . count($models));

                foreach ($models as $modelId => $modelInfo) {
                    $this->line(" - {$modelInfo['name']} ({$modelId})");
                }
            } else {
                $this->error('❌ Failed to connect to Ollama Cloud API');
            }

            return $isConnected ? 0 : 1;

        } catch (\Exception $e) {
            $this->error('Connection test failed: ' . $e->getMessage());
            return 1;
        }
    }
}
