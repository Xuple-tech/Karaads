<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class KwatiAiService
{
    public function __construct(
        private readonly WebSearchService $webSearchService,
    ) {}

    public function chat(array $messages, bool $useWebSearch = false): array
    {
        $baseUrl = rtrim((string) config('services.kwati_ai.base_url'), '/');
        $apiKey = (string) config('services.kwati_ai.api_key');
        $model = (string) config('services.kwati_ai.model');

        if ($baseUrl === '' || $apiKey === '' || $model === '') {
            throw new RuntimeException('Kwati AI is not configured.');
        }

        $normalizedMessages = array_values(array_filter(array_map(
            fn (array $message): array => [
                'role' => (string) ($message['role'] ?? 'user'),
                'content' => (string) ($message['content'] ?? ''),
            ],
            $messages
        ), fn (array $message): bool => $message['content'] !== ''));

        $sources = [];
        $searchedAt = null;

        if ($useWebSearch) {
            $latestUserMessage = $this->latestUserMessage($normalizedMessages);
            $sources = $this->webSearchService->search($latestUserMessage, 5);
            $searchedAt = now()->toIso8601String();
            $normalizedMessages = $this->prependWebSearchContext($normalizedMessages, $sources, $latestUserMessage, $searchedAt);
        }

        $payload = [
            'model' => $model,
            'messages' => $normalizedMessages,
        ];

        if ($payload['messages'] === []) {
            throw new RuntimeException('A message is required.');
        }

        try {
            $response = Http::acceptJson()
                ->asJson()
                ->withToken($apiKey)
                ->timeout((int) config('services.kwati_ai.timeout', 45))
                ->connectTimeout((int) config('services.kwati_ai.connect_timeout', 10))
                ->post($baseUrl . '/chat/completions', $payload);
        } catch (ConnectionException $exception) {
            Log::warning('kwati_ai.chat.connection_failed', [
                'error' => $exception->getMessage(),
            ]);

            throw new RuntimeException('Kwati AI is temporarily unavailable.');
        }

        if (! $response->successful()) {
            Log::warning('kwati_ai.chat.http_failed', [
                'status' => $response->status(),
                'body' => $this->truncateBody($response),
            ]);

            throw new RuntimeException($this->errorMessage($response));
        }

        $content = $this->extractAssistantContent($response);

        if ($content === '') {
            Log::warning('kwati_ai.chat.empty_response', [
                'body' => $this->truncateBody($response),
            ]);

            throw new RuntimeException('Kwati AI returned an empty response.');
        }

        return [
            'message' => $content,
            'model' => (string) ($response->json('model') ?? $model),
            'sources' => $sources,
            'searched_at' => $searchedAt,
            'web_search_enabled' => $useWebSearch,
        ];
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return array<int, array{role: string, content: string}>
     */
    private function prependWebSearchContext(array $messages, array $sources, string $query, string $searchedAt): array
    {
        $context = [
            "Live web search is enabled.",
            "Search query: {$query}",
            "Searched at: {$searchedAt}",
            "Use the search results below as fresh context when relevant.",
            "If you rely on them, mention the source titles naturally and keep claims grounded in those results.",
        ];

        if ($sources !== []) {
            $context[] = 'Search results:';

            foreach ($sources as $index => $source) {
                $position = $index + 1;
                $context[] = "[{$position}] {$source['title']}";
                $context[] = "URL: {$source['url']}";

                if ($source['snippet'] !== '') {
                    $context[] = "Snippet: {$source['snippet']}";
                }
            }
        } else {
            $context[] = 'No live results were returned. Be honest that fresh web results were not available.';
        }

        array_unshift($messages, [
            'role' => 'system',
            'content' => implode("\n", $context),
        ]);

        return $messages;
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    private function latestUserMessage(array $messages): string
    {
        for ($index = count($messages) - 1; $index >= 0; $index--) {
            if (($messages[$index]['role'] ?? '') === 'user') {
                return trim((string) $messages[$index]['content']);
            }
        }

        return '';
    }

    private function extractAssistantContent(Response $response): string
    {
        $content = $response->json('choices.0.message.content');

        if (is_string($content)) {
            return trim($content);
        }

        if (is_array($content)) {
            $parts = [];

            foreach ($content as $item) {
                if (is_string($item)) {
                    $parts[] = $item;
                    continue;
                }

                if (is_array($item) && is_string($item['text'] ?? null)) {
                    $parts[] = $item['text'];
                }
            }

            return trim(implode("\n", array_filter($parts)));
        }

        $fallbacks = [
            $response->json('message'),
            $response->json('response'),
            $response->json('output_text'),
        ];

        foreach ($fallbacks as $fallback) {
            if (is_string($fallback) && trim($fallback) !== '') {
                return trim($fallback);
            }
        }

        return '';
    }

    private function errorMessage(Response $response): string
    {
        $message = $response->json('error.message')
            ?? $response->json('message')
            ?? 'Kwati AI request failed.';

        return is_string($message) && trim($message) !== ''
            ? trim($message)
            : 'Kwati AI request failed.';
    }

    private function truncateBody(Response $response): string
    {
        return mb_substr((string) $response->body(), 0, 1000);
    }
}
