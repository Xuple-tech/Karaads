<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use RuntimeException;

class WebSearchService
{
    /**
     * @return array<int, array{title: string, url: string, snippet: string, published_at: string}>
     */
    public function search(string $query, int $limit = 5): array
    {
        $query = trim($query);

        if ($query === '') {
            return [];
        }

        $url = 'https://news.google.com/rss/search?' . http_build_query([
            'q' => $query,
            'hl' => 'en-US',
            'gl' => 'US',
            'ceid' => 'US:en',
        ]);

        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => implode("\r\n", [
                    'Accept: application/rss+xml,application/xml;q=0.9,*/*;q=0.8',
                    'User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0 Safari/537.36',
                ]),
                'timeout' => 20,
            ],
            'ssl' => [
                'verify_peer' => (bool) config('services.http_client.verify_ssl', true),
                'verify_peer_name' => (bool) config('services.http_client.verify_ssl', true),
            ],
        ]);

        try {
            $body = @file_get_contents($url, false, $context);
        } catch (\Throwable $exception) {
            Log::warning('web_search.connection_failed', [
                'query' => $query,
                'error' => $exception->getMessage(),
            ]);

            throw new RuntimeException('Live web search is temporarily unavailable.');
        }

        if ($body === false) {
            Log::warning('web_search.http_failed', [
                'query' => $query,
                'headers' => $http_response_header ?? [],
            ]);

            throw new RuntimeException('Live web search failed.');
        }

        return array_slice($this->parseResults($body), 0, max(1, $limit));
    }

    /**
     * @return array<int, array{title: string, url: string, snippet: string, published_at: string}>
     */
    private function parseResults(string $xml): array
    {
        libxml_use_internal_errors(true);
        $rss = simplexml_load_string($xml);
        libxml_clear_errors();

        if (! $rss || ! isset($rss->channel->item)) {
            return [];
        }

        $results = [];

        foreach ($rss->channel->item as $item) {
            $title = trim((string) ($item->title ?? ''));
            $url = trim((string) ($item->link ?? ''));
            $snippet = trim(strip_tags(html_entity_decode((string) ($item->description ?? ''), ENT_QUOTES | ENT_HTML5)));
            $publishedAt = trim((string) ($item->pubDate ?? ''));

            if ($title === '' || $url === '') {
                continue;
            }

            $results[] = [
                'title' => $title,
                'url' => $url,
                'snippet' => $snippet,
                'published_at' => $publishedAt,
            ];
        }

        return array_values(array_unique($results, SORT_REGULAR));
    }
}
