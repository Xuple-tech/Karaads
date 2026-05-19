<?php

namespace App\Services\Grok;

use App\Services\SearchService;
use App\Services\Widget\WidgetToolExecutionContext;
use Illuminate\Support\Facades\Log;

class ToolExecutor
{
    public function __construct(
        private SearchService $searchService,
        private AssetWorkflowService $assetWorkflowService,
        private WidgetToolExecutionContext $widgetToolContext
    ) {
    }

    public function execute(string $functionName, array $arguments, ?int $chatId = null): array
    {
        try {
            return match ($functionName) {
                'web_search' => $this->executeWebSearch($arguments),
                'web_fetch' => $this->executeWebFetch($arguments),
                'generate_image' => $this->assetWorkflowService->handleImageGeneration($arguments, $chatId),
                'edit_image' => $this->assetWorkflowService->handleImageEdit($arguments, $chatId),
                'generate_pdf_document' => $this->assetWorkflowService->generatePdfDocument($arguments, $chatId),
                'generate_word_document' => $this->assetWorkflowService->generateWordDocument($arguments, $chatId),
                'generate_powerpoint_presentation' => $this->assetWorkflowService->generatePowerPointPresentation($arguments, $chatId),
                default => $this->executeDynamicTool($functionName, $arguments),
            };
        } catch (\Throwable $e) {
            Log::error("Tool execution failed for {$functionName}: " . $e->getMessage(), [
                'arguments' => $arguments,
                'chat_id' => $chatId,
                'trace' => $e->getTraceAsString(),
            ]);

            throw new \Exception($e->getMessage());
        }
    }

    private function executeDynamicTool(string $functionName, array $arguments): array
    {
        if ($this->widgetToolContext->hasHandler($functionName)) {
            return $this->widgetToolContext->execute($functionName, $arguments);
        }

        throw new \Exception("This feature isn't available right now.");
    }

    private function executeWebSearch(array $arguments): array
    {
        $query = $arguments['query'];
        $maxResults = min($arguments['max_results'] ?? 3, 5);

        Log::info("Executing web search: {$query} (max: {$maxResults})");

        $results = $this->searchService->search($query, $maxResults);

        return [
            'query' => $query,
            'summary' => $results['summary'] ?? 'No results found',
            'results' => array_slice($results['results'] ?? [], 0, $maxResults),
            'result_count' => $results['result_count'] ?? 0,
            'timestamp' => now()->toISOString(),
        ];
    }

    private function executeWebFetch(array $arguments): array
    {
        $url = $arguments['url'];
        Log::info("Fetching webpage: {$url}");

        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            throw new \Exception("Invalid URL: {$url}");
        }

        $content = $this->searchService->fetchWebpage($url);
        $result = [
            'url' => $url,
            'title' => $content['title'] ?? '',
            'content' => $content['content'] ?? 'Failed to fetch content',
            'content_type' => $content['content_type'] ?? 'unknown',
            'links' => $content['links'] ?? [],
            'fetch_timestamp' => now()->toISOString(),
        ];

        if (($content['content_type'] ?? '') === 'pdf') {
            $result['display_type'] = 'pdf_viewer';
            $result['pdf_url'] = $url;
        }

        return $result;
    }
}
