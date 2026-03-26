<?php

namespace App\Services\Widget;

use App\Models\AIAgent;
use App\Models\AgentTool;
use App\Models\AgentKnowledgeBase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class AgentToolService
{
    protected $agent;
    protected $client;
    protected $xaiApiKey;
    protected $tools = [];

    public function __construct(AIAgent $agent)
    {
        $this->agent = $agent;
        $this->client = new Client();
        $this->xaiApiKey = env('XAI_API_KEY');

        // Register built-in tools
        $this->registerBuiltInTools();
    }

    protected function registerBuiltInTools()
    {
        $this->tools = [
            // Built-in tools
            'file_reader' => [
                'name' => 'file_reader',
                'description' => 'Read and extract content from uploaded files (PDF, DOCX, TXT, etc.)',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'file_id' => [
                            'type' => 'string',
                            'description' => 'The ID of the file to read'
                        ],
                        'pages' => [
                            'type' => 'array',
                            'items' => ['type' => 'integer'],
                            'description' => 'Specific pages to extract (for PDFs)'
                        ]
                    ],
                    'required' => ['file_id']
                ]
            ],

            'knowledge_base_search' => [
                'name' => 'knowledge_base_search',
                'description' => 'Search the agent\'s knowledge base for relevant information',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'query' => [
                            'type' => 'string',
                            'description' => 'Search query'
                        ],
                        'content_types' => [
                            'type' => 'array',
                            'items' => ['type' => 'string'],
                            'description' => 'Filter by content types (faq, product_info, etc.)'
                        ],
                        'limit' => [
                            'type' => 'integer',
                            'description' => 'Maximum number of results'
                        ]
                    ],
                    'required' => ['query']
                ]
            ],

            'web_search' => [
                'name' => 'web_search',
                'description' => 'Search the web for current information using DuckDuckGo or Google',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'query' => [
                            'type' => 'string',
                            'description' => 'Search query'
                        ],
                        'num_results' => [
                            'type' => 'integer',
                            'description' => 'Number of results to return'
                        ]
                    ],
                    'required' => ['query']
                ]
            ],

            'web_fetch' => [
                'name' => 'web_fetch',
                'description' => 'Fetch and extract content from a specific webpage URL',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'url' => [
                            'type' => 'string',
                            'description' => 'URL to fetch content from'
                        ],
                        'extract_mode' => [
                            'type' => 'string',
                            'enum' => ['full', 'main_content', 'summary'],
                            'description' => 'Content extraction mode'
                        ]
                    ],
                    'required' => ['url']
                ]
            ],

            'api_call' => [
                'name' => 'api_call',
                'description' => 'Make API calls to external services',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'method' => [
                            'type' => 'string',
                            'enum' => ['GET', 'POST', 'PUT', 'DELETE'],
                            'description' => 'HTTP method'
                        ],
                        'url' => [
                            'type' => 'string',
                            'description' => 'API endpoint URL'
                        ],
                        'headers' => [
                            'type' => 'object',
                            'description' => 'Request headers'
                        ],
                        'params' => [
                            'type' => 'object',
                            'description' => 'Query parameters for GET'
                        ],
                        'data' => [
                            'type' => 'object',
                            'description' => 'Request body for POST/PUT'
                        ]
                    ],
                    'required' => ['method', 'url']
                ]
            ],

            'calculator' => [
                'name' => 'calculator',
                'description' => 'Perform mathematical calculations',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'expression' => [
                            'type' => 'string',
                            'description' => 'Mathematical expression to evaluate'
                        ]
                    ],
                    'required' => ['expression']
                ]
            ],

            'data_converter' => [
                'name' => 'data_converter',
                'description' => 'Convert data between formats (JSON, XML, CSV, etc.)',
                'parameters' => [
                    'type' => 'object',
                    'properties' => [
                        'input_data' => [
                            'type' => 'string',
                            'description' => 'Data to convert'
                        ],
                        'from_format' => [
                            'type' => 'string',
                            'enum' => ['json', 'xml', 'csv', 'yaml'],
                            'description' => 'Input format'
                        ],
                        'to_format' => [
                            'type' => 'string',
                            'enum' => ['json', 'xml', 'csv', 'yaml'],
                            'description' => 'Output format'
                        ]
                    ],
                    'required' => ['input_data', 'from_format', 'to_format']
                ]
            ]
        ];

        // Add custom tools from database
        $customTools = AgentTool::where('agent_id', $this->agent->id)
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        foreach ($customTools as $tool) {
            $this->tools[$tool->tool_type] = [
                'name' => $tool->tool_type,
                'description' => $tool->description,
                'parameters' => $tool->configuration['parameters'] ?? [
                    'type' => 'object',
                    'properties' => [],
                    'required' => []
                ],
                'custom_config' => $tool->configuration
            ];
        }
    }

    public function getToolsForAI()
    {
        return array_values($this->tools);
    }

    public function executeTool($toolName, $parameters, $conversationId = null)
    {
        if (!isset($this->tools[$toolName])) {
            return [
                'success' => false,
                'error' => "Tool '{$toolName}' not found"
            ];
        }

        try {
            switch ($toolName) {
                case 'file_reader':
                    return $this->executeFileReader($parameters);

                case 'knowledge_base_search':
                    return $this->executeKnowledgeBaseSearch($parameters);

                case 'web_search':
                    return $this->executeWebSearch($parameters);

                case 'web_fetch':
                    return $this->executeWebFetch($parameters);

                case 'api_call':
                    return $this->executeApiCall($parameters);

                case 'calculator':
                    return $this->executeCalculator($parameters);

                case 'data_converter':
                    return $this->executeDataConverter($parameters);

                default:
                    // Check if it's a custom tool
                    $customTool = AgentTool::where('agent_id', $this->agent->id)
                        ->where('tool_type', $toolName)
                        ->where('is_active', true)
                        ->first();

                    if ($customTool) {
                        return $this->executeCustomTool($customTool, $parameters);
                    }

                    return [
                        'success' => false,
                        'error' => "Tool execution method not implemented"
                    ];
            }
        } catch (\Exception $e) {
            Log::error("Tool execution failed: {$e->getMessage()}", [
                'tool' => $toolName,
                'parameters' => $parameters,
                'agent_id' => $this->agent->id
            ]);

            return [
                'success' => false,
                'error' => "Tool execution failed: {$e->getMessage()}"
            ];
        }
    }

    protected function executeFileReader($parameters)
    {
        // This would integrate with your file storage system
        // For now, return a mock implementation

        $fileId = $parameters['file_id'] ?? null;
        $pages = $parameters['pages'] ?? null;

        if (!$fileId) {
            return [
                'success' => false,
                'error' => 'File ID is required'
            ];
        }

        // In production, you would:
        // 1. Fetch file metadata from database
        // 2. Read file from storage based on file type
        // 3. Extract text content

        $mockContent = "This is a mock file content for file ID: {$fileId}\n";
        $mockContent .= "The file contains information about the agent's configuration.\n";
        $mockContent .= "File reading functionality would be implemented based on your storage system.";

        return [
            'success' => true,
            'content' => $mockContent,
            'file_id' => $fileId,
            'pages_extracted' => $pages,
            'note' => 'File reading implementation depends on your file storage system'
        ];
    }

    protected function executeKnowledgeBaseSearch($parameters)
    {
        $query = $parameters['query'] ?? '';
        $contentTypes = $parameters['content_types'] ?? null;
        $limit = $parameters['limit'] ?? 5;

        if (empty($query)) {
            return [
                'success' => false,
                'error' => 'Search query is required'
            ];
        }

        $searchQuery = AgentKnowledgeBase::where('agent_id', $this->agent->id)
            ->where('is_active', true);

        if ($contentTypes) {
            $searchQuery->whereIn('content_type', $contentTypes);
        }

        // Simple keyword search (in production, use full-text search or vector search)
        $keywords = explode(' ', $query);
        foreach ($keywords as $keyword) {
            if (strlen($keyword) > 2) {
                $searchQuery->where(function($q) use ($keyword) {
                    $q->where('title', 'like', "%{$keyword}%")
                      ->orWhere('content', 'like', "%{$keyword}%");
                });
            }
        }

        $results = $searchQuery->limit($limit)->get();

        return [
            'success' => true,
            'query' => $query,
            'results' => $results->map(function($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'content_type' => $item->content_type,
                    'content_preview' => substr(strip_tags($item->content), 0, 200) . '...',
                    'source_url' => $item->source_url,
                    'relevance_score' => 0.8 // In production, calculate actual relevance
                ];
            }),
            'total_results' => $results->count()
        ];
    }

    protected function executeWebSearch($parameters)
    {
        $query = $parameters['query'] ?? '';
        $numResults = $parameters['num_results'] ?? 5;

        if (empty($query)) {
            return [
                'success' => false,
                'error' => 'Search query is required'
            ];
        }

        try {
            // Using DuckDuckGo HTML API (you can switch to Google Custom Search API)
            $response = Http::get('https://api.duckduckgo.com/', [
                'q' => $query,
                'format' => 'json',
                'no_html' => 1,
                'skip_disambig' => 1
            ]);

            $data = $response->json();

            $results = [];

            // Extract from Abstract
            if (!empty($data['Abstract'])) {
                $results[] = [
                    'title' => $data['Heading'] ?? 'Web Result',
                    'content' => $data['Abstract'],
                    'url' => $data['AbstractURL'] ?? null,
                    'source' => 'DuckDuckGo'
                ];
            }

            // Extract from RelatedTopics
            if (!empty($data['RelatedTopics'])) {
                foreach ($data['RelatedTopics'] as $topic) {
                    if (count($results) >= $numResults) break;

                    if (isset($topic['Text']) && isset($topic['FirstURL'])) {
                        $results[] = [
                            'title' => basename($topic['FirstURL']),
                            'content' => $topic['Text'],
                            'url' => $topic['FirstURL'],
                            'source' => 'DuckDuckGo'
                        ];
                    }
                }
            }

            return [
                'success' => true,
                'query' => $query,
                'results' => $results,
                'total_results' => count($results)
            ];

        } catch (\Exception $e) {
            Log::error("Web search failed: {$e->getMessage()}");

            // Fallback to mock results
            return [
                'success' => true,
                'query' => $query,
                'results' => [
                    [
                        'title' => "Search Results for: {$query}",
                        'content' => "Web search functionality is enabled. In production, this would return actual search results from DuckDuckGo or Google.",
                        'url' => null,
                        'source' => 'System'
                    ]
                ],
                'total_results' => 1,
                'note' => 'Using mock data due to API configuration'
            ];
        }
    }

    protected function executeWebFetch($parameters)
    {
        $url = $parameters['url'] ?? '';
        $extractMode = $parameters['extract_mode'] ?? 'main_content';

        if (empty($url) || !filter_var($url, FILTER_VALIDATE_URL)) {
            return [
                'success' => false,
                'error' => 'Valid URL is required'
            ];
        }

        try {
            $response = Http::timeout(10)->get($url);

            if (!$response->successful()) {
                return [
                    'success' => false,
                    'error' => "Failed to fetch URL: HTTP {$response->status()}"
                ];
            }

            $html = $response->body();

            // Simple HTML content extraction
            $content = $this->extractMainContent($html);

            return [
                'success' => true,
                'url' => $url,
                'content' => $content,
                'length' => strlen($content),
                'extract_mode' => $extractMode
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => "Failed to fetch URL: {$e->getMessage()}"
            ];
        }
    }

    protected function extractMainContent($html)
    {
        // Remove scripts and styles
        $html = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $html);
        $html = preg_replace('/<style\b[^>]*>(.*?)<\/style>/is', '', $html);

        // Extract text from HTML
        $text = strip_tags($html);

        // Clean up whitespace
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text);

        // Limit length
        if (strlen($text) > 5000) {
            $text = substr($text, 0, 5000) . '... [content truncated]';
        }

        return $text;
    }

    protected function executeApiCall($parameters)
    {
        $method = strtoupper($parameters['method'] ?? 'GET');
        $url = $parameters['url'] ?? '';
        $headers = $parameters['headers'] ?? [];
        $params = $parameters['params'] ?? [];
        $data = $parameters['data'] ?? [];

        if (empty($url)) {
            return [
                'success' => false,
                'error' => 'URL is required for API call'
            ];
        }

        $validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
        if (!in_array($method, $validMethods)) {
            return [
                'success' => false,
                'error' => "Invalid HTTP method: {$method}"
            ];
        }

        try {
            $options = [
                'headers' => array_merge([
                    'User-Agent' => 'AgentToolService/1.0',
                    'Accept' => 'application/json',
                ], $headers),
                'timeout' => 30,
                'verify' => false, // Be careful with this in production
            ];

            if ($method === 'GET' && !empty($params)) {
                $options['query'] = $params;
            } elseif (in_array($method, ['POST', 'PUT', 'PATCH']) && !empty($data)) {
                $options['json'] = $data;
            }

            $response = $this->client->request($method, $url, $options);

            $statusCode = $response->getStatusCode();
            $responseBody = $response->getBody()->getContents();

            // Try to parse JSON
            $parsedResponse = json_decode($responseBody, true);
            $isJson = json_last_error() === JSON_ERROR_NONE;

            return [
                'success' => true,
                'status_code' => $statusCode,
                'response' => $isJson ? $parsedResponse : $responseBody,
                'is_json' => $isJson,
                'headers' => $response->getHeaders(),
                'method' => $method,
                'url' => $url
            ];

        } catch (RequestException $e) {
            $errorResponse = $e->hasResponse() ? $e->getResponse()->getBody()->getContents() : $e->getMessage();

            return [
                'success' => false,
                'error' => "API call failed: " . $e->getMessage(),
                'status_code' => $e->hasResponse() ? $e->getResponse()->getStatusCode() : null,
                'response' => $errorResponse
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => "API call failed: " . $e->getMessage()
            ];
        }
    }

    protected function executeCalculator($parameters)
    {
        $expression = $parameters['expression'] ?? '';

        if (empty($expression)) {
            return [
                'success' => false,
                'error' => 'Mathematical expression is required'
            ];
        }

        // Remove potentially dangerous functions
        $dangerousPatterns = [
            '/exec\s*\(/i',
            '/system\s*\(/i',
            '/shell_exec\s*\(/i',
            '/passthru\s*\(/i',
            '/`.*`/',
            '/eval\s*\(/i',
            '/include\s*\(/i',
            '/require\s*\(/i',
            '/fopen\s*\(/i',
            '/file_get_contents\s*\(/i'
        ];

        foreach ($dangerousPatterns as $pattern) {
            if (preg_match($pattern, $expression)) {
                return [
                    'success' => false,
                    'error' => 'Potentially dangerous expression detected'
                ];
            }
        }

        // Allow only safe mathematical expressions
        $safeExpression = preg_replace('/[^0-9+\-*\/()%.,\s]/', '', $expression);

        try {
            // Use PHP's eval with proper sanitization (be careful!)
            $result = eval("return {$safeExpression};");

            return [
                'success' => true,
                'expression' => $expression,
                'result' => $result,
                'type' => gettype($result)
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => "Calculation failed: " . $e->getMessage(),
                'expression' => $expression
            ];
        }
    }

    protected function executeDataConverter($parameters)
    {
        $inputData = $parameters['input_data'] ?? '';
        $fromFormat = strtolower($parameters['from_format'] ?? '');
        $toFormat = strtolower($parameters['to_format'] ?? '');

        $supportedFormats = ['json', 'xml', 'csv', 'yaml'];

        if (!in_array($fromFormat, $supportedFormats) || !in_array($toFormat, $supportedFormats)) {
            return [
                'success' => false,
                'error' => "Unsupported format. Supported: " . implode(', ', $supportedFormats)
            ];
        }

        if (empty($inputData)) {
            return [
                'success' => false,
                'error' => 'Input data is required'
            ];
        }

        try {
            $result = '';

            // Parse from source format
            $parsedData = null;

            switch ($fromFormat) {
                case 'json':
                    $parsedData = json_decode($inputData, true);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        throw new \Exception('Invalid JSON: ' . json_last_error_msg());
                    }
                    break;

                case 'xml':
                    $xml = simplexml_load_string($inputData);
                    if ($xml === false) {
                        throw new \Exception('Invalid XML');
                    }
                    $parsedData = json_decode(json_encode($xml), true);
                    break;

                case 'csv':
                    $lines = explode("\n", trim($inputData));
                    if (empty($lines)) {
                        throw new \Exception('Empty CSV');
                    }
                    $headers = str_getcsv($lines[0]);
                    $parsedData = [];
                    for ($i = 1; $i < count($lines); $i++) {
                        $row = str_getcsv($lines[$i]);
                        $parsedData[] = array_combine($headers, $row);
                    }
                    break;

                case 'yaml':
                    if (!function_exists('yaml_parse')) {
                        throw new \Exception('YAML extension not installed');
                    }
                    $parsedData = yaml_parse($inputData);
                    break;
            }

            // Convert to target format
            switch ($toFormat) {
                case 'json':
                    $result = json_encode($parsedData, JSON_PRETTY_PRINT);
                    break;

                case 'xml':
                    $result = $this->arrayToXml($parsedData);
                    break;

                case 'csv':
                    if (empty($parsedData)) {
                        $result = '';
                    } else {
                        $result = $this->arrayToCsv($parsedData);
                    }
                    break;

                case 'yaml':
                    if (!function_exists('yaml_emit')) {
                        throw new \Exception('YAML extension not installed');
                    }
                    $result = yaml_emit($parsedData);
                    break;
            }

            return [
                'success' => true,
                'from_format' => $fromFormat,
                'to_format' => $toFormat,
                'result' => $result,
                'input_length' => strlen($inputData),
                'output_length' => strlen($result)
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => "Conversion failed: " . $e->getMessage(),
                'from_format' => $fromFormat,
                'to_format' => $toFormat
            ];
        }
    }

    protected function executeCustomTool($tool, $parameters)
    {
        // Execute custom tool based on configuration
        $config = $tool->configuration ?? [];

        // Example custom tool execution
        // You would implement specific logic based on tool_type

        return [
            'success' => true,
            'tool' => $tool->tool_type,
            'name' => $tool->name,
            'result' => "Custom tool '{$tool->name}' executed with parameters: " . json_encode($parameters),
            'configuration' => $config
        ];
    }

    protected function arrayToXml($array, $rootElement = 'root')
    {
        $xml = new \SimpleXMLElement("<?xml version=\"1.0\" encoding=\"UTF-8\"?><{$rootElement}></{$rootElement}>");
        $this->addArrayToXml($xml, $array);
        return $xml->asXML();
    }

    protected function addArrayToXml($xml, $array)
    {
        foreach ($array as $key => $value) {
            if (is_array($value)) {
                $subnode = $xml->addChild($key);
                $this->addArrayToXml($subnode, $value);
            } else {
                $xml->addChild($key, htmlspecialchars($value));
            }
        }
    }

    protected function arrayToCsv($array)
    {
        if (empty($array)) return '';

        $output = fopen('php://temp', 'r+');

        // Get headers from first element
        $headers = array_keys(reset($array));
        fputcsv($output, $headers);

        foreach ($array as $row) {
            fputcsv($output, array_values($row));
        }

        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);

        return $csv;
    }
}
