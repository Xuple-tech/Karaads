<?php

namespace App\Services\Grok;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatTransportService
{
    public function __construct(
        private RequestTelemetry $requestTelemetry,
        private StreamingProcessor $streamingProcessor,
        private NonStreamingProcessor $nonStreamingProcessor,
    ) {
    }

    public function generateStreamingChat(
        Client $client,
        string $apiEndpoint,
        string $apiKey,
        array $supportedModels,
        array $tools,
        string $prompt,
        array $messages,
        callable $callback,
        string $model = 'grok-4',
        ?array $format = null,
        array $files = [],
        ?string $chatId = null,
        ?string $detectedLanguage = null,
    ): void {
        $this->validateModel($model, $supportedModels);

        $payload = [
            'model' => $model,
            'messages' => $messages,
            'stream' => true,
        ];

        if (!empty($tools)) {
            $payload['tools'] = $tools;
            $payload['tool_choice'] = 'auto';
        }

        if ($format !== null) {
            $payload['response_format'] = $format;
        }

        $startTime = microtime(true);
        $inputTokens = $this->requestTelemetry->estimateTokens($messages);

        try {
            Log::info('Starting Grok API streaming request with tools: ' . (!empty($tools) ? 'enabled' : 'disabled'));
            Log::debug('Request Payload (sanitized): ' . json_encode($this->requestTelemetry->sanitizePayloadForLogging($payload)));

            // Reasoning models (e.g. grok-4-fast-reasoning, grok-4) can think silently
            // for several minutes before streaming any output — use a generous timeout.
            $isReasoningModel = str_contains($model, 'reasoning') || $model === 'grok-4';
            $streamTimeout = $isReasoningModel ? 600 : 180;

            $response = $client->post($apiEndpoint, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $apiKey,
                    'User-Agent' => 'KwatiAi/1.0',
                ],
                'json' => $payload,
                'stream' => true,
                'timeout' => $streamTimeout,
                'read_timeout' => $streamTimeout,
                'verify' => config('services.grok.verify_ssl', true),
            ]);

            $result = $this->streamingProcessor->process(
                client: $client,
                apiEndpoint: $apiEndpoint,
                apiKey: $apiKey,
                tools: $tools,
                response: $response,
                callback: $callback,
                messages: $messages,
                model: $model,
                chatId: $chatId ? (int) $chatId : null,
                files: $files,
            );

            $responseTime = (microtime(true) - $startTime) * 1000;
            $this->requestTelemetry->logApiUsage([
                'provider' => 'grok',
                'model' => $model,
                'endpoint' => $apiEndpoint,
                'input_tokens' => $inputTokens,
                'output_tokens' => $result['output_tokens'] ?? 0,
                'tokens' => $inputTokens + ($result['output_tokens'] ?? 0),
                'response_time' => round($responseTime),
                'status' => 'success',
                'metadata' => [
                    'has_tools' => !empty($tools),
                    'language' => $detectedLanguage,
                    'files_count' => count($files),
                    'prompt_length' => strlen($prompt),
                ],
            ]);
        } catch (ClientException $e) {
            $responseTime = (microtime(true) - $startTime) * 1000;
            $responseBody = $e->getResponse()->getBody()->getContents();
            $statusCode = $e->getResponse()->getStatusCode();

            $this->requestTelemetry->logApiUsage([
                'provider' => 'grok',
                'model' => $model,
                'endpoint' => $apiEndpoint,
                'input_tokens' => $inputTokens,
                'output_tokens' => 0,
                'tokens' => $inputTokens,
                'response_time' => round($responseTime),
                'status' => 'error',
                'error' => "HTTP {$statusCode}: " . $e->getMessage(),
                'metadata' => [
                    'error_details' => $responseBody,
                    'has_tools' => !empty($tools),
                    'language' => $detectedLanguage,
                ],
            ]);

            Log::error("Grok API Error (Status: {$statusCode}): " . $e->getMessage());
            Log::error('Error Response Body: ' . $responseBody);
            throw new \Exception("Grok API error (HTTP {$statusCode}): Unable to process your request. Please try again.");
        } catch (\Exception $e) {
            $responseTime = (microtime(true) - $startTime) * 1000;

            $this->requestTelemetry->logApiUsage([
                'provider' => 'grok',
                'model' => $model,
                'endpoint' => $apiEndpoint,
                'input_tokens' => $inputTokens,
                'output_tokens' => 0,
                'tokens' => $inputTokens,
                'response_time' => round($responseTime),
                'status' => 'error',
                'error' => $e->getMessage(),
                'metadata' => [
                    'has_tools' => !empty($tools),
                    'language' => $detectedLanguage,
                ],
            ]);

            throw new \Exception($e->getMessage());
        }
    }

    public function generateChat(
        Client $client,
        string $apiEndpoint,
        string $apiKey,
        array $supportedModels,
        array $messages,
        array $toolsToUse,
        string $model = 'grok-4',
        ?array $format = null,
        ?int $chatId = null,
    ): string {
        $this->validateModel($model, $supportedModels);

        $payload = [
            'model' => $model,
            'messages' => $messages,
            'stream' => false,
        ];

        if (!empty($toolsToUse)) {
            $payload['tools'] = $toolsToUse;
            $payload['tool_choice'] = 'auto';
        }

        if ($format !== null) {
            $payload['response_format'] = $format;
        }

        try {
            $response = $client->post($apiEndpoint, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $apiKey,
                    'User-Agent' => 'KwatiAi/1.0',
                ],
                'json' => $payload,
                'stream' => true,
                'timeout' => 60,
                'read_timeout' => 60,
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            Log::debug('Non-streaming response received');

            if (isset($result['choices'][0]['message']['tool_calls']) && !empty($result['choices'][0]['message']['tool_calls'])) {
                Log::info('Tool calls detected in non-streaming response');

                return $this->nonStreamingProcessor->handleToolCalls(
                    client: $client,
                    apiEndpoint: $apiEndpoint,
                    apiKey: $apiKey,
                    toolCalls: $result['choices'][0]['message']['tool_calls'],
                    messages: $messages,
                    model: $model,
                    tools: $toolsToUse,
                    chatId: $chatId,
                    files: $this->extractFilesFromMessages($messages),
                );
            }

            return $result['choices'][0]['message']['content'] ?? 'Sorry, I received an unexpected response format.';
        } catch (\Exception $e) {
            Log::error('Grok Chat Error: ' . $e->getMessage());
            throw $e;
        }
    }

    private function extractFilesFromMessages(array $messages): array
    {
        $files = [];

        foreach ($messages as $message) {
            $content = $message['content'] ?? null;
            if (!is_array($content)) {
                continue;
            }

            foreach ($content as $item) {
                if (($item['type'] ?? null) !== 'image_url') {
                    continue;
                }

                $url = $item['image_url']['url'] ?? null;
                if (is_string($url) && str_starts_with($url, 'data:image/')) {
                    $mime = explode(';', substr($url, 5), 2)[0] ?? 'image/png';
                    $files[] = [
                        'name' => 'uploaded-logo',
                        'type' => $mime,
                        'data' => $url,
                    ];
                }
            }
        }

        return $files;
    }

    public function generateContent(
        Client $client,
        string $apiEndpoint,
        string $apiKey,
        array $supportedModels,
        string $prompt,
        string $language = 'plaintext',
        string $model = 'grok-4',
    ): string {
        $this->validateModel($model, $supportedModels);

        $payload = [
            'model' => $model,
            'messages' => [
                ['role' => 'system', 'content' => "Generate content for {$language}. Provide only the generated content without explanations or code blocks."],
                ['role' => 'user', 'content' => $prompt],
            ],
            'stream' => false,
            'temperature' => 0.7,
        ];

        try {
            $response = $client->post($apiEndpoint, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $apiKey,
                ],
                'json' => $payload,
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            return $result['choices'][0]['message']['content'] ?? '';
        } catch (\Exception $e) {
            Log::error('Generate content error: ' . $e->getMessage());
            throw $e;
        }
    }

    public function generateTitle(
        Client $client,
        string $apiEndpoint,
        string $apiKey,
        array $supportedModels,
        string $prompt,
        string $model = 'grok-4',
    ): string {
        $this->validateModel($model, $supportedModels);

        $payload = [
            'model' => $model,
            'messages' => [
                ['role' => 'system', 'content' => 'You are Grok, generate a short, descriptive title (2-6 words) for this message.'],
                ['role' => 'user', 'content' => $prompt],
            ],
            'stream' => false,
            'temperature' => 0.7,
        ];

        try {
            $response = $client->post($apiEndpoint, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $apiKey,
                ],
                'json' => $payload,
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            $title = $result['choices'][0]['message']['content'] ?? '';
            $title = trim($title, " \t\n\r\0\x0B\"'");
            $title = preg_replace('/^["\'](.*)["\']$/', '$1', $title);

            return $title ?: 'New Chat';
        } catch (\Exception $e) {
            Log::error('Grok Title Generation Error: ' . $e->getMessage());
            return 'New Chat';
        }
    }

    public function fetchAvailableModels(Client $client, string $modelsEndpoint, string $apiKey): array
    {
        try {
            $response = $client->get($modelsEndpoint, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $apiKey,
                ],
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            return $result['data'] ?? [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch Grok models: ' . $e->getMessage());
            return [];
        }
    }

    public function testConnection(Client $client, string $modelsEndpoint, string $apiKey): bool
    {
        try {
            $response = $client->get($modelsEndpoint, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $apiKey,
                ],
                'timeout' => 10,
            ]);

            return $response->getStatusCode() === 200;
        } catch (\Exception $e) {
            Log::error('Grok connection test failed: ' . $e->getMessage());
            return false;
        }
    }

    public function generateVoiceMessage(
        string $apiEndpoint,
        string $apiKey,
        array $supportedModels,
        string $prompt,
        array $messages,
        string $model = 'grok-4-fast-non-reasoning',
    ): string {
        $model = 'grok-4-fast-non-reasoning';
        $this->validateModel($model, $supportedModels);

        $payload = [
            'model' => $model,
            'messages' => $messages,
            'stream' => false,
            'max_tokens' => 500,
            'temperature' => 0.7,
        ];

        Log::info('Sending voice message to Grok API', [
            'model' => $model,
            'prompt_length' => strlen($prompt),
            'history_count' => max(count($messages) - 2, 0),
            'messages_count' => count($messages),
        ]);

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $apiKey,
            'User-Agent' => 'KwatiAi/1.0',
        ])->withoutVerifying()
            ->timeout(60)
            ->post($apiEndpoint, $payload);

        if ($response->failed()) {
            $errorBody = $response->body();
            $statusCode = $response->status();

            Log::error('Grok Voice Message API Error', [
                'status' => $statusCode,
                'response' => $errorBody,
                'payload' => $payload,
            ]);

            if ($statusCode === 422) {
                throw new \Exception('Grok API: Invalid request format. Please check the message structure.');
            }

            throw new \Exception("Grok API error ({$statusCode}): {$errorBody}");
        }

        $result = $response->json();

        Log::debug('Voice message response received', [
            'has_choices' => isset($result['choices']),
            'choices_count' => count($result['choices'] ?? []),
        ]);

        if (!isset($result['choices'][0]['message']['content'])) {
            Log::error('Unexpected Grok API response format', $result);
            throw new \Exception('Unexpected response format from Grok API');
        }

        $content = $result['choices'][0]['message']['content'];

        Log::info('Grok voice response generated', [
            'response_length' => strlen($content),
            'response_preview' => substr($content, 0, 100) . '...',
        ]);

        return $content;
    }

    private function validateModel(string $model, array $supportedModels): void
    {
        if (!isset($supportedModels[$model])) {
            throw new \InvalidArgumentException("Invalid Grok model: {$model}");
        }
    }
}
