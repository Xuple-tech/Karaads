<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Support\Facades\Log;

class SearchService
{
    private Client $client;
    private ?string $apiKey;
    private ?string $searchEngineId;

    public function __construct()
    {
        $this->client = new Client([
            'verify' => false,
            'timeout' => 60,
            'connect_timeout' => 10
        ]);
        $this->apiKey = config('services.google.api_key');
        $this->searchEngineId = config('services.google.search_engine_id');
    }

    /**
     * Perform a web search using Google Custom Search API
     *
     * @param string $query
     * @param int $maxResults
     * @return array
     */
    public function search(string $query, int $maxResults = 5): array
    {
        // If API key or search engine ID is not configured, return empty results
        if (empty($this->apiKey) || empty($this->searchEngineId)) {
            Log::warning('Google API key or Search Engine ID not configured');
            return [
                'results' => [],
                'summary' => 'Search functionality is not configured. Please set up Google API credentials.',
                'result_count' => 0
            ];
        }

        try {
            $url = 'https://www.googleapis.com/customsearch/v1';

            $response = $this->client->get($url, [
                'query' => [
                    'key' => $this->apiKey,
                    'cx' => $this->searchEngineId,
                    'q' => $query,
                    'num' => min($maxResults, 10), // Google allows max 10 per request
                ]
                // Add more options here like safe search, etc.
            ]);

            $data = json_decode($response->getBody(), true);

            $results = [];
            $summary = "Based on Google search for '$query':\n\n";

            if (isset($data['items']) && is_array($data['items'])) {
                foreach ($data['items'] as $index => $item) {
                    $results[] = [
                        'title' => $item['title'] ?? '',
                        'url' => $item['link'] ?? '',
                        'content' => $item['snippet'] ?? '',
                    ];

                    $summary .= ($index + 1) . ". " . ($item['title'] ?? '') . "\n";
                    $summary .= "   " . ($item['snippet'] ?? '') . "\n";
                    $summary .= "   Source: " . ($item['link'] ?? '') . "\n\n";
                }
            } else {
                $summary .= "No results found for '$query'.\n";
            }

            return [
                'results' => $results,
                'summary' => $summary,
                'result_count' => count($results)
            ];
        } catch (ClientException $e) {
            Log::error('Google Search API error: ' . $e->getMessage());
            return [
                'results' => [],
                'summary' => "I encountered an error while searching for '$query'. Please try again later.",
                'result_count' => 0
            ];
        } catch (\Exception $e) {
            Log::error('Search service error: ' . $e->getMessage());
            return [
                'results' => [],
                'summary' => "I encountered an unexpected error while searching for '$query'. Please try again later.",
                'result_count' => 0
            ];
        }
    }

    /**
     * Fetch a webpage content by directly accessing the URL
     *
     * @param string $url
     * @return array
     */
    public function fetchWebpage(string $url): array
    {
        try {
            // Validate URL
            if (!filter_var($url, FILTER_VALIDATE_URL)) {
                return [
                    'title' => '',
                    'content' => 'Invalid URL provided.',
                    'links' => [],
                    'content_type' => 'invalid'
                ];
            }

            // First, make a HEAD request to check content type
            $headResponse = $this->client->head($url, [
                'timeout' => 10,
                'headers' => [
                    'User-Agent' => 'Mozilla/5.0 (compatible; WebScraper/1.0)'
                ]
            ]);

            $contentType = $headResponse->getHeaderLine('content-type');

            // Only fetch HTML or JSON content
            if (!preg_match('/^(text\/html|application\/json|text\/plain)/i', $contentType)) {
                if (preg_match('/application\/pdf/i', $contentType)) {
                    // For PDFs, return special handling
                    return [
                        'title' => 'PDF Document',
                        'content' => 'PDF content detected. Displaying PDF viewer.',
                        'content_type' => 'pdf',
                        'url' => $url,
                        'links' => []
                    ];
                } else {
                    return [
                        'title' => '',
                        'content' => 'Unsupported content type: ' . $contentType . '. Only HTML and JSON content can be fetched.',
                        'content_type' => $contentType,
                        'links' => []
                    ];
                }
            }

            $response = $this->client->get($url, [
                'timeout' => 10,
                'headers' => [
                    'User-Agent' => 'Mozilla/5.0 (compatible; WebScraper/1.0)'
                ]
            ]);

            $html = $response->getBody()->getContents();

            // Extract title
            $title = '';
            if (preg_match('/<title[^>]*>(.*?)<\/title>/is', $html, $matches)) {
                $title = strip_tags($matches[1]);
            }

            // Extract main content (simple approach: remove scripts, styles, and get body text)
            $content = preg_replace('/<script[^>]*>.*?<\/script>/is', '', $html);
            $content = preg_replace('/<style[^>]*>.*?<\/style>/is', '', $content);
            $content = strip_tags($content);
            $content = preg_replace('/\s+/', ' ', $content); // Normalize whitespace
            $content = trim($content);

            // Limit content length
            if (strlen($content) > 5000) {
                $content = substr($content, 0, 5000) . '...';
            }

            // Extract links (simple regex)
            $links = [];
            if (preg_match_all('/<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)<\/a>/is', $html, $matches)) {
                for ($i = 0; $i < count($matches[1]); $i++) {
                    $links[] = [
                        'url' => $matches[1][$i],
                        'text' => strip_tags($matches[2][$i])
                    ];
                }
            }

            return [
                'title' => $title,
                'content' => $content,
                'content_type' => $contentType,
                'links' => array_slice($links, 0, 10) // Limit to 10 links
            ];
        } catch (ClientException $e) {
            Log::error('Webpage fetch error: ' . $e->getMessage());
            return [
                'title' => '',
                'content' => "I encountered an error while fetching the webpage '{$url}'. Please try again later.",
                'content_type' => 'error',
                'links' => []
            ];
        } catch (\Exception $e) {
            Log::error('Fetch service error: ' . $e->getMessage());
            return [
                'title' => '',
                'content' => "I encountered an unexpected error while fetching the webpage '{$url}'. Please try again later.",
                'content_type' => 'error',
                'links' => []
            ];
        }
    }
}
