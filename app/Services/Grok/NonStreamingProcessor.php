<?php

namespace App\Services\Grok;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class NonStreamingProcessor
{
    public function __construct(
        private ToolExecutor $toolExecutor
    ) {
    }

    public function handleToolCalls(
        Client $client,
        string $apiEndpoint,
        string $apiKey,
        array $toolCalls,
        array $messages,
        string $model,
        array $tools,
        ?int $chatId = null,
        array $files = [],
    ): string {
        Log::info('Handling tool calls in non-streaming mode: ' . json_encode($toolCalls));

        $messages[] = [
            'role' => 'assistant',
            'content' => null,
            'tool_calls' => $toolCalls,
        ];

        foreach ($toolCalls as $toolCall) {
            $functionName = $toolCall['function']['name'];
            $arguments = json_decode($toolCall['function']['arguments'], true);
            $arguments = $this->withUploadedLogo($functionName, $arguments, $files);

            Log::info("Executing tool: {$functionName} with args: " . json_encode($arguments));

            try {
                $result = $this->toolExecutor->execute($functionName, $arguments, $chatId);
                $messages[] = [
                    'role' => 'tool',
                    'content' => json_encode($result),
                    'tool_call_id' => $toolCall['id'],
                ];
            } catch (\Exception $e) {
                if (!str_contains($e->getMessage(), 'SSL') && !str_contains($e->getMessage(), 'certificate') && !str_contains($e->getMessage(), 'cURL')) {
                    Log::error("Tool execution failed for {$functionName}: " . $e->getMessage());
                }

                $messages[] = [
                    'role' => 'tool',
                    'content' => json_encode(['error' => $e->getMessage()]),
                    'tool_call_id' => $toolCall['id'],
                ];
            }
        }

        $payload = [
            'model' => $model,
            'messages' => $messages,
            'stream' => false,
            'tools' => $tools,
            'tool_choice' => 'auto',
        ];

        $response = $client->post($apiEndpoint, [
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $apiKey,
            ],
            'json' => $payload,
        ]);

        $result = json_decode($response->getBody()->getContents(), true);

        return $result['choices'][0]['message']['content'] ?? 'Tool execution completed, but no final response received.';
    }

    private function withUploadedLogo(string $functionName, array $arguments, array $files): array
    {
        if ($functionName !== 'generate_powerpoint_presentation' || !empty($arguments['logo_image'])) {
            return $arguments;
        }

        foreach ($files as $file) {
            $type = (string) ($file['type'] ?? '');
            $data = (string) ($file['data'] ?? '');

            if (str_starts_with($type, 'image/') && $data !== '') {
                $arguments['logo_image'] = [
                    'name' => $file['name'] ?? 'logo',
                    'type' => $type,
                    'data' => $data,
                ];
                $arguments['logo_position'] ??= 'top_right';

                break;
            }
        }

        return $arguments;
    }
}
