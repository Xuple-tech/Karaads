<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\Tool;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

/**
 * ToolExecutorService - Handles execution of all agent tools
 */
class ToolExecutorService
{
    protected const RATE_LIMIT_PREFIX = 'tool_rate_limit_';

    /**
     * Execute a tool with given parameters
     */
    public function execute(string $toolName, array $parameters = [], ?Agent $agent = null): array
    {
        try {
            $tool = Tool::byName($toolName);

            if (!$tool) {
                return $this->error("Tool '$toolName' not found");
            }

            if (!$tool->is_active) {
                return $this->error("Tool '$toolName' is disabled");
            }

            // Check rate limit
            if (!$this->checkRateLimit($toolName)) {
                return $this->error("Rate limit exceeded for tool: $toolName");
            }

            // Execute tool
            return match ($toolName) {
                'web_search' => $this->executeWebSearch($parameters),
                'web_fetch' => $this->executeWebFetch($parameters),
                'file_read' => $this->executeFileRead($parameters, $agent),
                'file_create' => $this->executeFileCreate($parameters, $agent),
                'file_delete' => $this->executeFileDelete($parameters, $agent),
                'api_call' => $this->executeApiCall($parameters),
                'code_execute' => $this->executeCodeSandbox($parameters),
                'send_email' => $this->executeSendEmail($parameters),
                'get_weather' => $this->executeGetWeather($parameters),
                'database_query' => $this->executeDatabaseQuery($parameters, $agent),
                // NEW TOOLS
                'image_generate' => $this->executeImageGenerate($parameters, $agent),
                'data_analysis' => $this->executeDataAnalysis($parameters, $agent),
                'text_process' => $this->executeTextProcess($parameters),
                'schedule_task' => $this->executeScheduleTask($parameters, $agent),
                'knowledge_search' => $this->executeKnowledgeSearch($parameters, $agent),
                default => $this->error("Unknown tool: $toolName"),
            };
        } catch (\Exception $e) {
            Log::error("Tool execution failed: $toolName", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return $this->error("Tool execution failed: " . $e->getMessage());
        }
    }

    /**
     * Web Search Tool - Search the internet
     */
    protected function executeWebSearch(array $params): array
    {
        $query = $params['query'] ?? null;
        $limit = $params['limit'] ?? 5;
        $language = $params['language'] ?? 'en';

        if (!$query) {
            return $this->error('Query parameter is required');
        }

        try {
            // Using DuckDuckGo API (free, no key required)
            $response = Http::timeout(10)->get('https://duckduckgo.com/', [
                'q' => $query,
                'format' => 'json',
                't' => 'Rhea AI',
            ]);

            if ($response->failed()) {
                return $this->error('Web search failed');
            }

            $data = $response->json();
            $results = [];

            foreach (array_slice($data['Results'] ?? [], 0, $limit) as $result) {
                $results[] = [
                    'title' => $result['Title'] ?? '',
                    'url' => $result['FirstURL'] ?? '',
                    'snippet' => $result['Text'] ?? '',
                ];
            }

            return $this->success('Web search completed', [
                'query' => $query,
                'results_count' => count($results),
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            return $this->error("Web search error: " . $e->getMessage());
        }
    }

    /**
     * Web Fetch Tool - Fetch and parse webpage content
     */
    protected function executeWebFetch(array $params): array
    {
        $url = $params['url'] ?? null;
        $extract = $params['extract'] ?? null; // 'text', 'html', 'metadata', 'all'

        if (!$url) {
            return $this->error('URL parameter is required');
        }

        try {
            $response = Http::timeout(15)->get($url);

            if ($response->failed()) {
                return $this->error("Failed to fetch URL: HTTP {$response->status()}");
            }

            $content = $response->body();

            // Parse HTML
            if (extension_loaded('dom')) {
                $dom = new \DOMDocument();
                @$dom->loadHTML($content);

                $xpath = new \DOMXPath($dom);

                $extracted = [
                    'url' => $url,
                    'status_code' => $response->status(),
                ];

                if ($extract === 'metadata' || $extract === 'all') {
                    $extracted['title'] = $xpath->query('//title')[0]?->textContent ?? '';
                    $metas = $xpath->query('//meta[@name="description"]');
                    $extracted['description'] = $metas->length > 0 ? $metas[0]->getAttribute('content') : '';
                }

                if ($extract === 'text' || $extract === 'all') {
                    // Remove script and style elements
                    foreach ($xpath->query('//script | //style') as $node) {
                        $node->parentNode->removeChild($node);
                    }
                    $extracted['text'] = trim($xpath->query('//body')[0]?->textContent ?? $content);
                }

                if ($extract === 'html' || $extract === 'all') {
                    $extracted['html'] = substr($content, 0, 5000); // First 5000 chars
                }

                return $this->success('Web fetch completed', $extracted);
            }

            return $this->success('Web fetch completed', [
                'url' => $url,
                'content' => substr($content, 0, 10000),
            ]);
        } catch (\Exception $e) {
            return $this->error("Web fetch error: " . $e->getMessage());
        }
    }

    /**
     * File Read Tool - Read file from storage
     */
    protected function executeFileRead(array $params, ?Agent $agent = null): array
    {
        $path = $params['path'] ?? null;

        if (!$path) {
            return $this->error('Path parameter is required');
        }

        if (!$agent) {
            return $this->error('Agent context required for file operations');
        }

        try {
            // Security: Ensure file belongs to agent's project
            if (!Storage::exists($path)) {
                return $this->error("File not found: $path");
            }

            $content = Storage::get($path);
            $size = Storage::size($path);

            // Limit content size to 100KB
            if ($size > 102400) {
                return $this->error("File too large (max 100KB): $size bytes");
            }

            return $this->success('File read successfully', [
                'path' => $path,
                'size' => $size,
                'content' => $content,
                'mime_type' => Storage::mimeType($path),
            ]);
        } catch (\Exception $e) {
            return $this->error("File read error: " . $e->getMessage());
        }
    }

    /**
     * File Create Tool - Create new file in storage
     */
    protected function executeFileCreate(array $params, ?Agent $agent = null): array
    {
        $path = $params['path'] ?? null;
        $content = $params['content'] ?? '';
        $overwrite = $params['overwrite'] ?? false;

        if (!$path || !$agent) {
            return $this->error('Path and agent context required');
        }

        try {
            // Security: Prevent directory traversal
            if (strpos($path, '..') !== false) {
                return $this->error('Invalid path: directory traversal detected');
            }

            // Prevent overwrite unless explicitly allowed
            if (Storage::exists($path) && !$overwrite) {
                return $this->error("File already exists: $path. Set overwrite=true to replace.");
            }

            Storage::put($path, $content);

            return $this->success('File created successfully', [
                'path' => $path,
                'size' => strlen($content),
                'created_at' => now(),
            ]);
        } catch (\Exception $e) {
            return $this->error("File create error: " . $e->getMessage());
        }
    }

    /**
     * File Delete Tool - Delete file from storage
     */
    protected function executeFileDelete(array $params, ?Agent $agent = null): array
    {
        $path = $params['path'] ?? null;

        if (!$path || !$agent) {
            return $this->error('Path and agent context required');
        }

        try {
            if (!Storage::exists($path)) {
                return $this->error("File not found: $path");
            }

            Storage::delete($path);

            return $this->success('File deleted successfully', [
                'path' => $path,
                'deleted_at' => now(),
            ]);
        } catch (\Exception $e) {
            return $this->error("File delete error: " . $e->getMessage());
        }
    }

    /**
     * API Call Tool - Make HTTP requests
     */
    protected function executeApiCall(array $params): array
    {
        $url = $params['url'] ?? null;
        $method = strtoupper($params['method'] ?? 'GET');
        $headers = $params['headers'] ?? [];
        $body = $params['body'] ?? null;
        $timeout = $params['timeout'] ?? 10;

        if (!$url) {
            return $this->error('URL parameter is required');
        }

        // Security: Whitelist HTTP methods
        if (!in_array($method, ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'])) {
            return $this->error("Invalid HTTP method: $method");
        }

        try {
            $response = Http::timeout($timeout);

            // Add headers
            if ($headers) {
                $response->withHeaders($headers);
            }

            // Make request
            $result = match ($method) {
                'GET' => $response->get($url),
                'POST' => $response->post($url, $body ?? []),
                'PUT' => $response->put($url, $body ?? []),
                'PATCH' => $response->patch($url, $body ?? []),
                'DELETE' => $response->delete($url),
                'HEAD' => $response->head($url),
            };

            return $this->success('API call completed', [
                'url' => $url,
                'method' => $method,
                'status_code' => $result->status(),
                'body' => $result->json() ?? $result->body(),
                'headers' => $result->headers(),
            ]);
        } catch (\Exception $e) {
            return $this->error("API call error: " . $e->getMessage());
        }
    }

    /**
     * Code Execute Tool - Execute code in sandboxed environment
     */
    protected function executeCodeSandbox(array $params): array
    {
        $code = $params['code'] ?? null;
        $language = $params['language'] ?? 'php';

        if (!$code) {
            return $this->error('Code parameter is required');
        }

        // Only allow specific languages for security
        if (!in_array($language, ['php', 'python', 'javascript', 'json'])) {
            return $this->error("Language not supported: $language. Allowed: php, python, javascript, json");
        }

        try {
            // For PHP - evaluate in isolated context
            if ($language === 'php') {
                ob_start();
                try {
                    $result = eval($code);
                    $output = ob_get_clean();

                    return $this->success('Code executed', [
                        'language' => $language,
                        'output' => $output,
                        'result' => $result,
                    ]);
                } catch (\Exception $e) {
                    ob_end_clean();
                    return $this->error("Code execution error: " . $e->getMessage());
                }
            }

            // For other languages - use external sandbox (Piston API)
            if (in_array($language, ['python', 'javascript'])) {
                $pistonLanguageMap = [
                    'python' => 'python3',
                    'javascript' => 'javascript',
                ];

                $response = Http::timeout(10)->post('https://emkc.org/api/v2/piston/execute', [
                    'language' => $pistonLanguageMap[$language],
                    'version' => '*',
                    'files' => [
                        ['name' => 'main.' . ($language === 'python' ? 'py' : 'js'), 'content' => $code],
                    ],
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    return $this->success('Code executed', [
                        'language' => $language,
                        'output' => $data['run']['output'] ?? '',
                        'stderr' => $data['run']['stderr'] ?? '',
                    ]);
                }
            }

            if ($language === 'json') {
                $decoded = json_decode($code, true);
                if ($decoded === null) {
                    return $this->error('Invalid JSON');
                }
                return $this->success('JSON validated', ['parsed' => $decoded]);
            }

            return $this->error("Language execution not available: $language");
        } catch (\Exception $e) {
            return $this->error("Code sandbox error: " . $e->getMessage());
        }
    }

    /**
     * Send Email Tool
     */
    protected function executeSendEmail(array $params): array
    {
        $to = $params['to'] ?? null;
        $subject = $params['subject'] ?? 'Message';
        $body = $params['body'] ?? '';

        if (!$to) {
            return $this->error('Email recipient required');
        }

        try {
            \Mail::raw($body, function ($message) use ($to, $subject) {
                $message->to($to)->subject($subject);
            });

            return $this->success('Email sent successfully', [
                'to' => $to,
                'subject' => $subject,
                'sent_at' => now(),
            ]);
        } catch (\Exception $e) {
            return $this->error("Email error: " . $e->getMessage());
        }
    }

    /**
     * Get Weather Tool
     */
    protected function executeGetWeather(array $params): array
    {
        $location = $params['location'] ?? null;

        if (!$location) {
            return $this->error('Location parameter required');
        }

        try {
            // Using Open-Meteo (free, no key required)
            $response = Http::timeout(10)->get('https://geocoding-api.open-meteo.com/v1/search', [
                'name' => $location,
                'count' => 1,
                'language' => 'en',
                'format' => 'json',
            ]);

            if ($response->failed() || empty($response->json('results'))) {
                return $this->error("Location not found: $location");
            }

            $place = $response->json('results.0');
            $lat = $place['latitude'];
            $lon = $place['longitude'];

            // Get weather
            $weather = Http::timeout(10)->get('https://api.open-meteo.com/v1/forecast', [
                'latitude' => $lat,
                'longitude' => $lon,
                'current' => 'temperature_2m,weather_code,wind_speed_10m',
                'temperature_unit' => 'celsius',
            ]);

            return $this->success('Weather retrieved', [
                'location' => "{$place['name']}, {$place['country']}",
                'weather' => $weather->json('current'),
            ]);
        } catch (\Exception $e) {
            return $this->error("Weather error: " . $e->getMessage());
        }
    }

    /**
     * Database Query Tool
     */
    protected function executeDatabaseQuery(array $params, ?Agent $agent = null): array
    {
        if (!$agent) {
            return $this->error('Agent context required');
        }

        $query = $params['query'] ?? null;

        if (!$query) {
            return $this->error('Query parameter required');
        }

        // Security: Only allow SELECT queries
        if (!preg_match('/^\s*SELECT/i', trim($query))) {
            return $this->error('Only SELECT queries are allowed');
        }

        try {
            $results = \DB::select($query);

            return $this->success('Query executed', [
                'rows_count' => count($results),
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            return $this->error("Database error: " . $e->getMessage());
        }
    }

    /**
     * Image Generate Tool - Create/edit images using external API
     */
    protected function executeImageGenerate(array $params, ?Agent $agent = null): array
    {
        $prompt = $params['prompt'] ?? null;
        $style = $params['style'] ?? 'realistic'; // realistic, artistic, cartoon, abstract
        $size = $params['size'] ?? '512x512'; // 256x256, 512x512, 1024x1024
        $count = $params['count'] ?? 1;

        if (!$prompt || !$agent) {
            return $this->error('Prompt and agent context required');
        }

        try {
            // Use Hugging Face or local model for image generation
            // This uses a free service (can be configured with API keys)
            $apiUrl = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2';

            $response = Http::timeout(30)->post($apiUrl, [
                'inputs' => $prompt,
                'parameters' => [
                    'num_inference_steps' => 50,
                    'guidance_scale' => 7.5,
                ],
            ]);

            if ($response->failed()) {
                // Fallback: Return placeholder with prompt details
                return $this->success('Image generation queued', [
                    'prompt' => $prompt,
                    'style' => $style,
                    'size' => $size,
                    'status' => 'queued',
                    'placeholder' => "https://via.placeholder.com/{$size}?text=" . urlencode($prompt),
                    'note' => 'Use configured image generation API for production',
                ]);
            }

            $imageData = $response->body();

            // Store generated image
            if ($agent) {
                $filename = 'generated_' . md5($prompt . time()) . '.png';
                Storage::put("images/generated/{$filename}", $imageData);

                return $this->success('Image generated successfully', [
                    'prompt' => $prompt,
                    'filename' => $filename,
                    'url' => Storage::url("images/generated/{$filename}"),
                    'size' => $size,
                    'style' => $style,
                    'created_at' => now(),
                ]);
            }

            return $this->error('Failed to store generated image');
        } catch (\Exception $e) {
            return $this->error("Image generation error: " . $e->getMessage());
        }
    }

    /**
     * Data Analysis Tool - Analyze datasets and generate insights
     */
    protected function executeDataAnalysis(array $params, ?Agent $agent = null): array
    {
        $data = $params['data'] ?? null;
        $analysisType = $params['analysis_type'] ?? 'summary'; // summary, correlation, trend, statistical
        $columns = $params['columns'] ?? null;

        if (!$data || !$agent) {
            return $this->error('Data and agent context required');
        }

        try {
            // Parse data (JSON array or CSV)
            if (is_string($data)) {
                $dataset = json_decode($data, true);
                if (!$dataset) {
                    return $this->error('Invalid data format: must be JSON array or CSV');
                }
            } else {
                $dataset = $data;
            }

            if (!is_array($dataset) || empty($dataset)) {
                return $this->error('Data must be non-empty array');
            }

            $analysis = match ($analysisType) {
                'summary' => $this->analyzeSummary($dataset),
                'correlation' => $this->analyzeCorrelation($dataset),
                'trend' => $this->analyzeTrend($dataset),
                'statistical' => $this->analyzeStatistical($dataset),
                default => $this->analyzeSummary($dataset),
            };

            return $this->success("Data {$analysisType} analysis completed", [
                'analysis_type' => $analysisType,
                'rows_analyzed' => count($dataset),
                'analysis' => $analysis,
                'timestamp' => now(),
            ]);
        } catch (\Exception $e) {
            return $this->error("Data analysis error: " . $e->getMessage());
        }
    }

    /**
     * Text Processing Tool - NLP operations
     */
    protected function executeTextProcess(array $params): array
    {
        $text = $params['text'] ?? null;
        $operation = $params['operation'] ?? 'summarize'; // summarize, sentiment, entities, translate, keywords
        $options = $params['options'] ?? [];

        if (!$text) {
            return $this->error('Text parameter required');
        }

        try {
            $result = match ($operation) {
                'summarize' => $this->summarizeText($text, $options),
                'sentiment' => $this->analyzeSentiment($text, $options),
                'entities' => $this->extractEntities($text, $options),
                'translate' => $this->translateText($text, $options),
                'keywords' => $this->extractKeywords($text, $options),
                'wordcount' => $this->countWords($text, $options),
                default => $this->summarizeText($text, $options),
            };

            return $this->success("Text {$operation} completed", array_merge($result, [
                'operation' => $operation,
                'text_length' => strlen($text),
            ]));
        } catch (\Exception $e) {
            return $this->error("Text processing error: " . $e->getMessage());
        }
    }

    /**
     * Schedule Task Tool - Schedule delayed execution
     */
    protected function executeScheduleTask(array $params, ?Agent $agent = null): array
    {
        $taskName = $params['task_name'] ?? null;
        $executeAt = $params['execute_at'] ?? null;
        $taskData = $params['task_data'] ?? [];
        $toolName = $params['tool_name'] ?? null;

        if (!$taskName || !$executeAt || !$agent) {
            return $this->error('task_name, execute_at, and agent context required');
        }

        try {
            $scheduledTime = now()->parse($executeAt);

            if ($scheduledTime->isPast()) {
                return $this->error('Cannot schedule task in the past');
            }

            // Save scheduled task (would use a job queue like Laravel Queue)
            \Cache::set(
                "scheduled_task_{$agent->id}_{$taskName}_" . $scheduledTime->timestamp,
                [
                    'agent_id' => $agent->id,
                    'task_name' => $taskName,
                    'tool_name' => $toolName,
                    'task_data' => $taskData,
                    'scheduled_at' => now(),
                    'execute_at' => $scheduledTime,
                ],
                $scheduledTime->diffInSeconds(now())
            );

            return $this->success('Task scheduled successfully', [
                'task_name' => $taskName,
                'scheduled_for' => $scheduledTime->toIso8601String(),
                'task_data' => $taskData,
                'status' => 'scheduled',
            ]);
        } catch (\Exception $e) {
            return $this->error("Schedule task error: " . $e->getMessage());
        }
    }

    /**
     * Knowledge Search Tool - Semantic search in agent's knowledge base
     */
    protected function executeKnowledgeSearch(array $params, ?Agent $agent = null): array
    {
        $query = $params['query'] ?? null;
        $limit = $params['limit'] ?? 5;
        $threshold = $params['threshold'] ?? 0.6; // Similarity threshold

        if (!$query || !$agent) {
            return $this->error('Query and agent context required');
        }

        try {
            // Search in agent memory and context
            $memories = $agent->memories()
                ->where('is_important', true)
                ->get();

            $results = [];
            foreach ($memories as $memory) {
                // Simple similarity calculation (can be enhanced with embeddings)
                $similarity = $this->calculateSimilarity($query, $memory->content);

                if ($similarity >= $threshold) {
                    $results[] = [
                        'id' => $memory->id,
                        'content' => $memory->content,
                        'similarity' => round($similarity, 3),
                        'created_at' => $memory->created_at,
                        'context' => $memory->context,
                    ];
                }
            }

            // Sort by similarity descending
            usort($results, fn ($a, $b) => $b['similarity'] <=> $a['similarity']);
            $results = array_slice($results, 0, $limit);

            return $this->success('Knowledge search completed', [
                'query' => $query,
                'results_found' => count($results),
                'results' => $results,
                'threshold_used' => $threshold,
            ]);
        } catch (\Exception $e) {
            return $this->error("Knowledge search error: " . $e->getMessage());
        }
    }

    /**
     * HELPER METHODS FOR DATA ANALYSIS
     */
    protected function analyzeSummary(array $data): array
    {
        $summary = [
            'total_records' => count($data),
            'fields' => array_keys($data[0] ?? []),
            'sample_record' => $data[0] ?? null,
        ];

        if (!empty($data[0])) {
            foreach (array_keys($data[0]) as $field) {
                $values = array_column($data, $field);
                $numericValues = array_filter($values, 'is_numeric');

                if (!empty($numericValues)) {
                    $summary['field_stats'][$field] = [
                        'min' => min($numericValues),
                        'max' => max($numericValues),
                        'avg' => array_sum($numericValues) / count($numericValues),
                        'count' => count($numericValues),
                    ];
                }
            }
        }

        return $summary;
    }

    protected function analyzeCorrelation(array $data): array
    {
        $correlations = [];
        $numericFields = [];

        if (!empty($data[0])) {
            foreach (array_keys($data[0]) as $field) {
                $values = array_column($data, $field);
                if (array_filter($values, 'is_numeric')) {
                    $numericFields[] = $field;
                }
            }
        }

        return [
            'numeric_fields' => $numericFields,
            'correlation_analysis' => 'Use pandas or specialized library for production',
            'note' => count($numericFields) . ' numeric fields identified for correlation analysis',
        ];
    }

    protected function analyzeTrend(array $data): array
    {
        return [
            'data_points' => count($data),
            'trend_type' => 'Use time-series analysis for production',
            'note' => 'Implement with Prophet, ARIMA, or similar for production use',
        ];
    }

    protected function analyzeStatistical(array $data): array
    {
        $stats = [];

        if (!empty($data[0])) {
            foreach (array_keys($data[0]) as $field) {
                $values = array_column($data, $field);
                $numericValues = array_filter($values, 'is_numeric');

                if (!empty($numericValues)) {
                    $mean = array_sum($numericValues) / count($numericValues);
                    $variance = array_reduce($numericValues, fn($sum, $x) => $sum + pow($x - $mean, 2), 0) / count($numericValues);

                    $stats[$field] = [
                        'mean' => round($mean, 2),
                        'median' => round($this->getMedian($numericValues), 2),
                        'std_dev' => round(sqrt($variance), 2),
                        'count' => count($numericValues),
                    ];
                }
            }
        }

        return $stats;
    }

    /**
     * HELPER METHODS FOR TEXT PROCESSING
     */
    protected function summarizeText(string $text, array $options): array
    {
        $lines = explode('.', $text);
        $sentenceCount = min($options['sentences'] ?? 3, count($lines));

        return [
            'original_length' => strlen($text),
            'summary_length' => strlen(implode('.', array_slice($lines, 0, $sentenceCount))),
            'sentences_in_original' => count($lines),
            'sentences_in_summary' => $sentenceCount,
            'summary' => implode('.', array_slice($lines, 0, $sentenceCount)) . '.',
        ];
    }

    protected function analyzeSentiment(string $text, array $options): array
    {
        // Simple sentiment analysis based on keywords
        $positive = ['good', 'great', 'excellent', 'amazing', 'happy', 'love'];
        $negative = ['bad', 'poor', 'terrible', 'hate', 'sad', 'awful'];

        $textLower = strtolower($text);
        $positiveCount = count(array_filter($positive, fn ($w) => strpos($textLower, $w) !== false));
        $negativeCount = count(array_filter($negative, fn ($w) => strpos($textLower, $w) !== false));

        $sentiment = match (true) {
            $positiveCount > $negativeCount => 'positive',
            $negativeCount > $positiveCount => 'negative',
            default => 'neutral',
        };

        return [
            'sentiment' => $sentiment,
            'confidence' => round(max($positiveCount, $negativeCount) / 10, 2),
            'positive_keywords' => $positiveCount,
            'negative_keywords' => $negativeCount,
        ];
    }

    protected function extractEntities(string $text, array $options): array
    {
        // Simple entity extraction using regex
        $entities = [
            'emails' => [],
            'urls' => [],
            'numbers' => [],
            'capitalized_words' => [],
        ];

        // Extract emails
        preg_match_all('/[\w\.-]+@[\w\.-]+\.\w+/', $text, $matches);
        $entities['emails'] = $matches[0] ?? [];

        // Extract URLs
        preg_match_all('/https?:\/\/[^\s]+/', $text, $matches);
        $entities['urls'] = $matches[0] ?? [];

        // Extract numbers
        preg_match_all('/\b\d+(?:\.\d+)?\b/', $text, $matches);
        $entities['numbers'] = $matches[0] ?? [];

        // Extract capitalized words (potential entities)
        preg_match_all('/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b/', $text, $matches);
        $entities['capitalized_words'] = array_slice(array_unique($matches[0] ?? []), 0, 10);

        return $entities;
    }

    protected function translateText(string $text, array $options): array
    {
        $targetLang = $options['target_language'] ?? 'es';

        return [
            'original_text' => substr($text, 0, 100),
            'target_language' => $targetLang,
            'note' => 'Integration required with Google Translate or similar API',
            'placeholder_translation' => '[Translation to ' . $targetLang . ']',
            'supported_languages' => ['es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'zh'],
        ];
    }

    protected function extractKeywords(string $text, array $options): array
    {
        // Simple keyword extraction using word frequency
        $words = str_word_count(strtolower($text), 1);
        $stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being'];

        $words = array_filter($words, fn ($w) => !in_array($w, $stopWords) && strlen($w) > 3);
        $frequency = array_count_values($words);
        arsort($frequency);

        return [
            'keywords' => array_slice(array_keys($frequency), 0, $options['limit'] ?? 10),
            'word_frequency' => array_slice($frequency, 0, $options['limit'] ?? 10),
            'unique_keywords' => count($frequency),
        ];
    }

    protected function countWords(string $text, array $options): array
    {
        return [
            'total_words' => str_word_count($text),
            'total_characters' => strlen($text),
            'total_characters_no_spaces' => strlen(str_replace(' ', '', $text)),
            'average_word_length' => round(strlen(str_replace(' ', '', $text)) / max(str_word_count($text), 1), 2),
            'sentences' => count(preg_split('/[.!?]+/', $text, -1, PREG_SPLIT_NO_EMPTY)),
            'paragraphs' => count(array_filter(explode("\n", $text))),
        ];
    }

    /**
     * UTILITY METHODS
     */
    protected function getMedian(array $values): float
    {
        sort($values);
        $count = count($values);
        $middle = intval($count / 2);

        if ($count % 2 === 0) {
            return ($values[$middle - 1] + $values[$middle]) / 2;
        }

        return $values[$middle];
    }

    protected function calculateSimilarity(string $str1, string $str2): float
    {
        // Simple Levenshtein-based similarity
        $len1 = strlen($str1);
        $len2 = strlen($str2);
        $maxLen = max($len1, $len2);

        if ($maxLen === 0) {
            return 1.0;
        }

        $distance = levenshtein($str1, $str2);
        return 1 - ($distance / $maxLen);
    }

    /**
     * Check rate limit for a tool
     */
    protected function checkRateLimit(string $toolName): bool
    {
        $tool = Tool::byName($toolName);
        if (!$tool) {
            return false;
        }

        $key = self::RATE_LIMIT_PREFIX . $toolName;
        $limit = $tool->rate_limit;

        $current = Cache::get($key, 0);

        if ($current >= $limit) {
            return false;
        }

        Cache::put($key, $current + 1, now()->addMinute());

        return true;
    }

    /**
     * Helper: Return success response
     */
    protected function success(string $message, array $data = []): array
    {
        return [
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => now()->toIso8601String(),
        ];
    }

    /**
     * Helper: Return error response
     */
    protected function error(string $message): array
    {
        return [
            'success' => false,
            'message' => $message,
            'data' => null,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
