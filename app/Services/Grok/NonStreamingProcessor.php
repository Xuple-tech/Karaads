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
        ?int $chatId = null
    ): string {
        Log::info('Handling tool calls in non-streaming mode: ' . json_encode($toolCalls));

        $messages[] = [
            'role' => 'assistant',
            'tool_calls' => $toolCalls,
        ];

        foreach ($toolCalls as $toolCall) {
            $functionName = $toolCall['function']['name'];
            $arguments = json_decode($toolCall['function']['arguments'], true);

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
}
