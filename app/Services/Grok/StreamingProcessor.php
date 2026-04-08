<?php

namespace App\Services\Grok;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class StreamingProcessor
{
    public function __construct(
        private ToolExecutor $toolExecutor
    ) {
    }

    public function process(
        Client $client,
        string $apiEndpoint,
        string $apiKey,
        array $tools,
        $response,
        callable $callback,
        array $messages,
        string $model,
        ?int $chatId = null
    ): array {
        $stream = $response->getBody();
        $buffer = '';
        $fullResponse = '';
        $toolCalls = [];

        while (!$stream->eof()) {
            $chunk = $stream->read(1024);
            $buffer .= $chunk;
            $lines = explode("\n", $buffer);
            $buffer = array_pop($lines);

            foreach ($lines as $line) {
                $line = trim($line);
                if ($line === '') {
                    continue;
                }

                $data = str_starts_with($line, 'data: ') ? substr($line, 6) : $line;
                if ($data === '[DONE]') {
                    $callback(['done' => true], false);

                    return ['output_tokens' => $this->estimateTokens([$fullResponse])];
                }

                try {
                    $decoded = json_decode($data, true, 512, JSON_THROW_ON_ERROR);

                    if (isset($decoded['choices'][0]['delta']['tool_calls']) && !empty($decoded['choices'][0]['delta']['tool_calls'])) {
                        $toolCalls = array_merge($toolCalls, $decoded['choices'][0]['delta']['tool_calls']);
                        $callback(['tool_status' => 'tool_calls_detected', 'tool_calls' => $toolCalls], false);
                    }

                    if (($decoded['choices'][0]['finish_reason'] ?? null) === 'tool_calls' && !empty($toolCalls)) {
                        $this->executeAndContinueToolCalls(
                            client: $client,
                            apiEndpoint: $apiEndpoint,
                            apiKey: $apiKey,
                            tools: $tools,
                            toolCalls: $toolCalls,
                            messages: $messages,
                            model: $model,
                            callback: $callback,
                            chatId: $chatId
                        );

                        return ['output_tokens' => $this->estimateTokens([$fullResponse])];
                    }

                    if (isset($decoded['choices'][0]['delta']['content'])) {
                        $content = $decoded['choices'][0]['delta']['content'];
                        $fullResponse .= $content;
                        $callback(['content' => $content], false);
                    }

                    if (isset($decoded['choices'][0]['finish_reason'])) {
                        $callback(['done' => true], false);

                        return ['output_tokens' => $this->estimateTokens([$fullResponse])];
                    }
                } catch (\Throwable $e) {
                    Log::debug('Problematic streaming data: ' . $data);
                    throw $e;
                }
            }
        }

        if ($buffer !== '') {
            Log::debug('Processing remaining buffer: ' . $buffer);
        }

        return ['output_tokens' => $this->estimateTokens([$fullResponse])];
    }

    private function executeAndContinueToolCalls(
        Client $client,
        string $apiEndpoint,
        string $apiKey,
        array $tools,
        array $toolCalls,
        array $messages,
        string $model,
        callable $callback,
        ?int $chatId = null
    ): void {
        $shouldStopAfterTools = true;
        $callback(['tool_status' => 'executing_tools', 'count' => count($toolCalls)], false);

        $messages[] = [
            'role' => 'assistant',
            'tool_calls' => $toolCalls,
        ];

        foreach ($toolCalls as $toolCall) {
            $functionName = $toolCall['function']['name'] ?? 'unknown_tool';

            try {
                $arguments = json_decode($toolCall['function']['arguments'] ?? '{}', true, 512, JSON_THROW_ON_ERROR);

                $callback([
                    'tool_status' => 'executing_tool',
                    'tool_name' => $functionName,
                    'tool_executing_message' => $this->getToolExecutingMessage($functionName),
                    'tool_args' => $arguments,
                ], false);

                Log::info("Executing tool: {$functionName} with args: " . json_encode($arguments));
                $result = $this->toolExecutor->execute($functionName, $arguments, $chatId);

                $messages[] = [
                    'role' => 'tool',
                    'content' => json_encode($result),
                    'tool_call_id' => $toolCall['id'],
                ];

                $toolCompletedData = [
                    'tool_status' => 'tool_completed',
                    'tool_name' => $functionName,
                    'result_summary' => $this->getToolResultSummary($functionName, $result),
                    'tool_result' => $result,
                ];

                if ($functionName === 'generate_image' && isset($result['images']) && !empty($result['images'])) {
                    $toolCompletedData['generated_images'] = $result['images'];
                }

                if ($functionName === 'web_search' && isset($result['results']) && !empty($result['results'])) {
                    $toolCompletedData['search_results'] = $result['results'];
                    $toolCompletedData['search_query'] = $result['query'] ?? null;
                    $toolCompletedData['search_count'] = $result['result_count'] ?? count($result['results']);
                    $toolCompletedData['references'] = $this->formatSearchReferences($result['results']);
                }

                $callback($toolCompletedData, false);
            } catch (\Throwable $e) {
                $shouldStopAfterTools = false;

                if (!str_contains($e->getMessage(), 'SSL') && !str_contains($e->getMessage(), 'certificate') && !str_contains($e->getMessage(), 'cURL')) {
                    Log::error("Tool execution failed for {$functionName}: " . $e->getMessage());
                }

                $loginRequired = $this->requiresLogin($e->getMessage());

                $messages[] = [
                    'role' => 'tool',
                    'content' => json_encode(['error' => $e->getMessage()]),
                    'tool_call_id' => $toolCall['id'],
                ];

                $callback([
                    'tool_status' => 'tool_failed',
                    'tool_name' => $functionName,
                    'error' => $e->getMessage(),
                    'login_required' => $loginRequired,
                    'type' => $loginRequired ? 'unauthenticated' : 'error',
                ], false);
            }

            if (!in_array($functionName, ['generate_image', 'edit_image', 'generate_pdf_document', 'generate_word_document'], true)) {
                $shouldStopAfterTools = false;
            }
        }

        if ($shouldStopAfterTools) {
            $callback(['done' => true], false);
            return;
        }

        $this->continueConversationWithToolResults(
            client: $client,
            apiEndpoint: $apiEndpoint,
            apiKey: $apiKey,
            tools: $tools,
            messages: $messages,
            model: $model,
            callback: $callback,
            chatId: $chatId
        );
    }

    private function continueConversationWithToolResults(
        Client $client,
        string $apiEndpoint,
        string $apiKey,
        array $tools,
        array $messages,
        string $model,
        callable $callback,
        ?int $chatId = null
    ): void {
        $callback(['tool_status' => 'continuing_conversation'], false);

        $payload = [
            'model' => $model,
            'messages' => $messages,
            'stream' => true,
        ];

        try {
            $response = $client->post($apiEndpoint, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $apiKey,
                ],
                'json' => $payload,
                'stream' => true,
                'timeout' => 60,
                'read_timeout' => 60,
            ]);

            $this->process(
                client: $client,
                apiEndpoint: $apiEndpoint,
                apiKey: $apiKey,
                tools: $tools,
                response: $response,
                callback: $callback,
                messages: $messages,
                model: $model,
                chatId: $chatId
            );
        } catch (\Throwable $e) {
            Log::error('Error continuing conversation after tools: ' . $e->getMessage());
            $callback(['error' => 'Failed to continue after tool execution: ' . $e->getMessage()], false);
        }
    }

    private function requiresLogin(string $errorMessage): bool
    {
        if (Auth::check()) {
            return false;
        }

        $error = strtolower($errorMessage);
        $hasLimitKeyword = str_contains($error, 'limit')
            || str_contains($error, 'exceeded')
            || str_contains($error, 'not authenticated')
            || str_contains($error, 'unauthorized');
        $hasAuthKeyword = str_contains($error, 'not authenticated')
            || str_contains($error, 'unauthorized')
            || str_contains($error, 'please login')
            || str_contains($error, 'please sign in');

        Log::info("Tool error analysis for login requirement: hasLimitKeyword={$hasLimitKeyword}, hasAuthKeyword={$hasAuthKeyword}");

        return $hasLimitKeyword || $hasAuthKeyword;
    }

    private function formatSearchReferences(array $results): array
    {
        $references = [];

        foreach ($results as $index => $item) {
            $references[] = [
                'index' => $index + 1,
                'title' => $item['title'] ?? 'Untitled',
                'url' => $item['url'] ?? '#',
                'snippet' => $item['snippet'] ?? '',
            ];
        }

        return $references;
    }

    private function estimateTokens(array $messages): int
    {
        $totalTokens = 0;

        foreach ($messages as $message) {
            if (is_string($message)) {
                $totalTokens += (int) ceil(strlen($message) / 4);
                continue;
            }

            if (!is_array($message) || !isset($message['content'])) {
                continue;
            }

            $content = $message['content'];
            if (is_string($content)) {
                $totalTokens += (int) ceil(strlen($content) / 4);
                continue;
            }

            if (!is_array($content)) {
                continue;
            }

            foreach ($content as $item) {
                if (isset($item['text'])) {
                    $totalTokens += (int) ceil(strlen($item['text']) / 4);
                }
            }
        }

        return max(1, $totalTokens);
    }

    private function getToolExecutingMessage(string $toolName): string
    {
        return match ($toolName) {
            'web_search' => 'Searching the web...',
            'web_fetch' => 'Fetching webpage...',
            'generate_image' => 'Generating images...',
            'edit_image' => 'Editing images...',
            'generate_pdf_document' => 'Creating PDF document...',
            'generate_word_document' => 'Creating Word document...',
            default => 'Processing...',
        };
    }

    private function getToolResultSummary(string $toolName, array $result): string
    {
        return match ($toolName) {
            'web_search' => 'Found ' . ($result['result_count'] ?? 0) . ' search results',
            'web_fetch' => 'Fetched: ' . $this->truncate($result['title'] ?? 'Unknown'),
            'generate_image' => 'Generated ' . ($result['images_count'] ?? 0) . ' image' . (($result['images_count'] ?? 0) !== 1 ? 's' : ''),
            'edit_image' => 'Edited ' . ($result['output_images_count'] ?? 0) . ' image' . (($result['output_images_count'] ?? 0) !== 1 ? 's' : ''),
            'generate_pdf_document', 'generate_word_document' => 'Created ' . ($result['format'] ?? ($toolName === 'generate_pdf_document' ? 'PDF' : 'Word')) . ': ' . $this->truncate($result['title'] ?? 'Document'),
            default => 'Tool execution completed',
        };
    }

    private function truncate(string $value, int $limit = 30): string
    {
        return strlen($value) > $limit ? substr($value, 0, $limit) . '...' : $value;
    }
}
