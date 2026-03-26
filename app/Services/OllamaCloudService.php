<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Support\Facades\Config;
use App\Models\OllamaApiKey;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Services\SearchService;

class OllamaCloudService
{
    private ?OllamaApiKey $currentKey = null;
    private const REQUEST_LIMIT = 50;
    private array $tools = [];
    private string $apiEndpoint = 'https://ollama.com/api/chat';
    private string $modelsEndpoint = 'https://ollama.com/api/tags';
    private Client $client;
    private string $defaultLanguage = 'en';
    private SearchService $searchService;

    // Language-specific constants
    private const LANG_PATTERNS = [
        'ha' => '/\b(sannu|yaya|nagode|gaskiya|lafiya|barkan|ina|wane|yaushe|gobe|yanzu|kuma|amma)\b/ui',
        'yo' => '/\b(bawo|pele|jowo|ekaaro|ekasan|odabo|kaabo|seun|mogbe|omo|kini|nibo|nigba)\b/ui',
        'ig' => '/\b(kedu|biko|daalu|ndewo|maka|nnọọ|gịnị|olee|kedụ|ebee|onye)\b/ui'
    ];

    // Supported languages with their codes
    private const SUPPORTED_LANGUAGES = [
        'en' => 'English',
        'ha' => 'Hausa',
        'yo' => 'Yoruba',
        'ig' => 'Igbo'
    ];

    // Available Ollama Cloud models
    private const CLOUD_MODELS = [
        'deepseek-v3.1:671b-cloud' => [
            'name' => 'DeepSeek V3.1 671B Cloud',
            'supports_think' => true,
            'description' => 'Large 671B parameter model with strong reasoning capabilities'
        ],
        'gpt-oss:20b-cloud' => [
            'name' => 'GPT OSS 20B Cloud',
            'supports_think' => false,
            'description' => 'Open source GPT-style 20B parameter model'
        ],
        'gpt-oss:120b-cloud' => [
            'name' => 'GPT OSS 120B Cloud',
            'supports_think' => true,
            'description' => 'Large 120B parameter open source GPT model'
        ],
        'kimi-k2:1t-cloud' => [
            'name' => 'Kimi K2 1T Cloud',
            'supports_think' => true,
            'description' => 'Massive 1 trillion parameter model with advanced capabilities'
        ],
        'qwen3-coder:480b-cloud' => [
            'name' => 'Qwen3 Coder 480B Cloud',
            'supports_think' => true,
            'description' => 'Specialized 480B parameter model for coding tasks'
        ],
        'glm-4.6:cloud' => [
            'name' => 'GLM 4.6 Cloud',
            'supports_think' => false,
            'description' => 'General Language Model 4.6 with strong performance'
        ],
        'minimax-m2:cloud' => [
            'name' => 'Minimax M2 Cloud',
            'supports_think' => false,
            'description' => 'Minimax M2 model optimized for cloud deployment'
        ]
    ];

    private array $systemInstructions = [
        'parts' => [
            [
                'text' => "You are a highly knowledgeable and concise AI assistant. You are a helpful and friendly AI assistant named 'Kwati Ai', built by the Kwati Ai team. You love to use emojis in your responses to make conversations more engaging and expressive! 🌟😊

                **Tool Usage Guidelines:**

                You have access to web search tools. Use them when:
                - The user asks about recent events, news, or current affairs
                - You need up-to-date information beyond your training data
                - The question involves real-time data (prices, weather, stock markets)
                - You're asked about specific facts that might have changed
                - The user explicitly asks you to search for something

                Do NOT use tools for:
                - General knowledge questions within your training data
                - Mathematical calculations or programming help
                - Creative writing or brainstorming
                - Personal opinions or analysis

                When using tools, be concise and integrate the results naturally into your response.

                Here's what I can help you with:

                🌐 Multilingual Support:
                - I can communicate in English, Hausa, Yoruba, and Igbo
                - Feel free to chat with me in your preferred language
                - You can switch languages anytime by typing in your preferred language

                📝 Writing & Content Creation:
                - Generate stories, poems, scripts, and dialogue
                - Help brainstorm names, ideas, or plotlines
                - Create characters or world-building elements

                💻 Coding & Tech Help:
                - Write, debug, and explain code (Python, JavaScript, HTML/CSS, and more)
                - Help build websites or simple apps
                - Explain tech concepts and guide you through tools or APIs

                🧠 Learning & Studying:
                - Explain concepts in math, science, history, etc.
                - Create study guides or practice questions
                - Translate or simplify difficult topics

                📊 Data & Analysis:
                - Analyze or visualize data (CSV/Excel)
                - Perform statistical calculations
                - Generate charts and graphs

                🌍 Up-to-Date Info (Via Web Search):
                - Look up current events, prices, local news, or recent research
                - Find info about businesses, services, or events near you

                Try to be as helpful and engaging as possible! Let's get started! 🎉"
            ]
        ]
    ];

    public function __construct(SearchService $searchService)
    {
        $this->searchService = $searchService;
        $this->initializeApiKeys();
        $this->client = new Client([
            'timeout' => 60,
            'connect_timeout' => 10,
        ]);
        $this->defaultLanguage = $this->getUserLanguage();
        // Log::info('OllamaCloudService initialized with default language: ' . self::SUPPORTED_LANGUAGES[$this->defaultLanguage]);
    }

    /**
     * Get available tools for tool calling
     */
    public function getTools(): array
    {
        return [
            [
                'type' => 'function',
                'function' => [
                    'name' => 'web_search',
                    'description' => 'Search the web for current information, news, facts, or any up-to-date data. Use this when you need recent information beyond your training data.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'query' => [
                                'type' => 'string',
                                'description' => 'The search query to find relevant, current information'
                            ],
                            'max_results' => [
                                'type' => 'integer',
                                'description' => 'Maximum number of results to return (default 3, max 5)',
                                'default' => 3
                            ]
                        ],
                        'required' => ['query']
                    ]
                ]
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'web_fetch',
                    'description' => 'Fetch the content of a specific webpage by URL when you need detailed information from a particular source.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'url' => [
                                'type' => 'string',
                                'description' => 'The URL of the webpage to fetch'
                            ]
                        ],
                        'required' => ['url']
                    ]
                ]
            ]
        ];
    }

    /**
     * Initialize API keys in the database
     */
    private function initializeApiKeys(): void
    {
        $defaultKeys = [
            [
                'name' => 'Ollama Cloud API Key',
                'key' => config('services.ollama.api_key'),
                'model' => 'gpt-oss:120b-cloud',
            ],
        ];

        foreach ($defaultKeys as $key) {
            if (!empty($key['key'])) {
                OllamaApiKey::firstOrCreate(
                    ['key' => $key['key']],
                    [
                        'name' => $key['name'] ?? null,
                        'model' => $key['model'] ?? null,
                        'request_count' => 0,
                        'last_used_at' => now(),
                        'is_active' => true,
                        'rate_limit' => self::REQUEST_LIMIT
                    ]
                );
            }
        }
    }

    /**
     * Get the current API key and handle rotation if needed
     */
    private function getCurrentApiKey(): string
    {
        // Get or select a new key
        if (!$this->currentKey || $this->currentKey->request_count >= self::REQUEST_LIMIT) {
            $this->selectNewKey();
        }

        // Increment the request count in a transaction
        DB::transaction(function () {
            $this->currentKey->incrementRequestCount();
        });

        return $this->currentKey->key;
    }

    /**
     * Select a new API key based on usage
     */
    private function selectNewKey(): void
    {
        DB::transaction(function () {
            // Check if all keys have reached the limit
            if (OllamaApiKey::allKeysReachedLimit(self::REQUEST_LIMIT)) {
                OllamaApiKey::resetAllCounts();
            }

            // Get the key with the lowest request count
            $this->currentKey = OllamaApiKey::getNextAvailableKey();

            if (!$this->currentKey) {
                throw new \Exception('No available API keys found');
            }

            Log::info('Selected new API key: ' . ($this->currentKey->name ?? 'Unnamed Key'));
        });
    }

    /**
     * Enhanced streaming chat with automatic tool calling
     */
    public function generateStreamingChat(
        string $prompt,
        callable $callback,
        string $model = 'gpt-oss:120b-cloud',
        array $history = [],
        bool $useThinking = false,
        array $tools = [],
        array $format = null,
        bool $autoTools = true,
        ?int $chatId = null
    ): void {
        $this->validateModel($model);

        // Ensure tools is always an array and store it in the class
        $this->tools = is_array($tools) && !empty($tools) ? $tools : ($autoTools ? $this->getTools() : []);

        if ($useThinking && !$this->modelSupportsThinking($model)) {
            Log::warning("Model {$model} does not support thinking capability, proceeding without it.");
            $useThinking = false;
        }

        // Check for language switch in the current prompt
        $detectedLanguage = $this->detectLanguage($prompt);
        if ($detectedLanguage !== $this->defaultLanguage && isset(self::SUPPORTED_LANGUAGES[$detectedLanguage])) {
            $this->setLanguage($detectedLanguage);
            Log::info("Temporarily switching from " . self::SUPPORTED_LANGUAGES[$this->defaultLanguage] . " to " . self::SUPPORTED_LANGUAGES[$detectedLanguage] . " for this message");
        }

        $messages = $this->formatMessages($prompt, $history, $useThinking);

        $payload = [
            'model' => $model,
            'messages' => $messages,
            'stream' => true
        ];

        if (!empty($this->tools)) {
            $payload['tools'] = $this->tools;
        }

        if ($format !== null) {
            $payload['format'] = $format;
        }

        try {
            Log::info('Starting Ollama Cloud API streaming request with tools: ' . (!empty($this->tools) ? 'enabled' : 'disabled'));
            Log::debug('Request Payload: ' . json_encode($payload));

            $response = $this->client->post($this->apiEndpoint, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $this->getCurrentApiKey(),
                    'User-Agent' => 'KwatiAi/1.0'
                ],
                'json' => $payload,
                'stream' => true,
                'timeout' => 60,
                'read_timeout' => 60,
            ]);

            $this->processStreamingResponse($response, $callback, $messages, $model);
        } catch (ClientException $e) {
            $responseBody = $e->getResponse()->getBody()->getContents();
            $statusCode = $e->getResponse()->getStatusCode();
            Log::error("Ollama Cloud API Error (Status: {$statusCode}): " . $e->getMessage());
            Log::error('Error Response Body: ' . $responseBody);
            throw new \Exception("Ollama Cloud API error: " . $e->getMessage(), $statusCode, $e);
        } catch (\Exception $e) {
            Log::error('Ollama Cloud Streaming Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Process streaming response with tool calling support
     */
    private function processStreamingResponse($response, callable $callback, array $messages, string $model): void
    {
        $stream = $response->getBody();
        $buffer = '';
        $fullResponse = '';
        $thinkingResponse = '';
        $toolCalls = [];
        $currentToolCall = null;

        while (!$stream->eof()) {
            $chunk = $stream->read(1024);
            $buffer .= $chunk;

            $lines = explode("\n", $buffer);
            $buffer = array_pop($lines);
            // Keep incomplete line in buffer
            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line)) continue;

                // if (str_starts_with($line, 'data: ')) {
                $data = ($line);

                Log::info('Seen Data' . $data);
                if ($data === '[DONE]') {
                    $callback(['done' => true], false);
                    return;
                }

                try {
                    $decoded = json_decode($data, true);
                    Log::info('decoded Message: ' . json_encode($decoded));
                    // Handle tool calls
                    if (isset($decoded['message']['tool_calls']) && !empty($decoded['message']['tool_calls'])) {
                        $toolCalls = $decoded['message']['tool_calls'];
                        $callback(['tool_status' => 'tool_calls_detected', 'tool_calls' => $toolCalls], false);

                        // Execute tool calls and continue
                        $this->executeAndContinueToolCalls($toolCalls, $messages, $model, $callback, $chatId);
                        return;
                    }

                    // Handle content
                    if (isset($decoded['message']['content']) || isset($decoded['message']['thinking'])) {
                        $content = $decoded['message']['content'];
                        $thinking = $decoded['message']['thinking'] ?? '';

                        $fullResponse .= $content;
                        $thinkingResponse .= $thinking;

                        $chunkData = [
                            'content' => $content,
                            'thinking' => $thinking
                        ];

                        // Check for canvas mode data
                        if (isset($decoded['message']['canvas_sections'])) {
                            $chunkData['canvas_sections'] = $decoded['message']['canvas_sections'];
                        }
                        if (isset($decoded['message']['canvas_summary'])) {
                            $chunkData['canvas_summary'] = $decoded['message']['canvas_summary'];
                        }

                        $callback($chunkData, false);
                    }

                    // Handle completion
                    if (isset($decoded['done']) && $decoded['done'] === true) {
                        $callback(['done' => true], false);
                        return;
                    }
                } catch (\Exception $e) {
                    Log::warning('Failed to parse streaming data: ' . $e->getMessage());
                    Log::debug('Problematic data: ' . $data);
                }
                // }
            }
        }

        // Handle any remaining buffer
        if (!empty($buffer)) {
            Log::debug('Processing remaining buffer: ' . $buffer);
        }
    }

    /**
     * Execute tool calls and continue conversation
     */
    private function executeAndContinueToolCalls(array $toolCalls, array $messages, string $model, callable $callback, ?int $chatId = null): void
    {
        $callback(['tool_status' => 'executing_tools', 'count' => count($toolCalls)], false);

        // Add the assistant's tool call message to history
        $messages[] = [
            'role' => 'assistant',
            'tool_calls' => $toolCalls
        ];

        // Execute each tool call
        foreach ($toolCalls as $toolCall) {
            try {
                $functionName = $toolCall['function']['name'];
                $arguments = is_string($toolCall['function']['arguments']) ? json_decode($toolCall['function']['arguments'], true) : $toolCall['function']['arguments'];

                $callback([
                    'tool_status' => 'executing_tool',
                    'tool_name' => $functionName,
                    'tool_args' => $arguments
                ], false);

                Log::info("Executing tool: {$functionName} with args: " . json_encode($arguments));

                $result = $this->executeTool($functionName, $arguments, $chatId);

                // Add tool result to messages
                $messages[] = [
                    'role' => 'tool',
                    'content' => json_encode($result),
                    'tool_call_id' => $toolCall['id']
                ];

                $callback([
                    'tool_status' => 'tool_completed',
                    'tool_name' => $functionName,
                    'result_summary' => $this->getToolResultSummary($functionName, $result)
                ], false);
            } catch (\Exception $e) {
                Log::error("Tool execution failed for {$functionName}: " . $e->getMessage());

                $messages[] = [
                    'role' => 'tool',
                    'content' => json_encode(['error' => $e->getMessage()]),
                    'tool_call_id' => $toolCall['id']
                ];

                $callback([
                    'tool_status' => 'tool_failed',
                    'tool_name' => $functionName,
                    'error' => $e->getMessage()
                ], false);
            }
        }

        // Continue conversation with tool results
        $this->continueConversationWithToolResults($messages, $model, $callback);
    }

    /**
     * Continue conversation after tool execution
     */
    private function continueConversationWithToolResults(array $messages, string $model, callable $callback): void
    {
        $callback(['tool_status' => 'continuing_conversation'], false);

        $payload = [
            'model' => $model,
            'messages' => $messages,
            'stream' => true
        ];

        try {
            $response = $this->client->post($this->apiEndpoint, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $this->getCurrentApiKey()
                ],
                'json' => $payload,
                'stream' => true,
                'timeout' => 60,
            ]);

            $this->processStreamingResponse($response, $callback, $messages, $model);
        } catch (\Exception $e) {
            Log::error('Error continuing conversation after tools: ' . $e->getMessage());
            $callback(['error' => 'Failed to continue after tool execution: ' . $e->getMessage()], false);
        }
    }

    /**
     * Execute a specific tool
     */
    private function executeTool(string $functionName, array $arguments, ?int $chatId = null)
    {
        switch ($functionName) {
            case 'web_search':
                $query = $arguments['query'];
                $maxResults = min($arguments['max_results'] ?? 3, 5); // Limit to 5 max

                Log::info("Executing web search: {$query} (max: {$maxResults})");

                $results = $this->searchService->search($query, $maxResults);

                // Format results for the AI
                return [
                    'query' => $query,
                    'summary' => $results['summary'] ?? 'No results found',
                    'results' => array_slice($results['results'] ?? [], 0, $maxResults),
                    'result_count' => $results['result_count'] ?? 0,
                    'timestamp' => now()->toISOString()
                ];

            case 'web_fetch':
                $url = $arguments['url'];
                Log::info("Fetching webpage: {$url}");

                // Validate URL
                if (!filter_var($url, FILTER_VALIDATE_URL)) {
                    throw new \Exception("Invalid URL: {$url}");
                }

                $content = $this->searchService->fetchWebpage($url);
                return [
                    'url' => $url,
                    'title' => $content['title'] ?? '',
                    'content' => $content['content'] ?? 'Failed to fetch content',
                    'links' => $content['links'] ?? [],
                    'fetch_timestamp' => now()->toISOString()
                ];

            case 'generate_image':
                $prompt = $arguments['prompt'] ?? '';
                $model = $arguments['model'] ?? 'dall-e-3';
                $numberOfImages = min($arguments['number_of_images'] ?? 1, 4);

                Log::info("Executing image generation via GrokApiService", [
                    'prompt' => substr($prompt, 0, 100),
                    'model' => $model,
                    'count' => $numberOfImages,
                    'chat_id' => $chatId
                ]);

                // Use GrokApiService for image generation with chat_id
                $grokService = app(\App\Services\GrokApiService::class);
                return $grokService->handleImageGeneration([
                    'prompt' => $prompt,
                    'model' => $model,
                    'number_of_images' => $numberOfImages
                ], $chatId);

            default:
                throw new \Exception("Unknown tool: {$functionName}");
        }
    }

    /**
     * Get summary of tool result for status updates
     */
    private function getToolResultSummary(string $toolName, array $result): string
    {
        switch ($toolName) {
            case 'web_search':
                $count = $result['result_count'] ?? 0;
                return "Found {$count} search results";

            case 'web_fetch':
                $title = $result['title'] ?? 'Unknown';
                return "Fetched: " . (strlen($title) > 30 ? substr($title, 0, 30) . '...' : $title);

            default:
                return "Tool execution completed";
        }
    }

    /**
     * Generate a non-streaming chat response using Ollama Cloud
     */
    public function generateChat(string $prompt, string $model = 'gpt-oss:120b-cloud', array $history = [], bool $useThinking = false, array $tools = [], array $format = null): string
    {
        $this->validateModel($model);

        if ($useThinking && !$this->modelSupportsThinking($model)) {
            Log::warning("Model {$model} does not support thinking capability, proceeding without it.");
            $useThinking = false;
        }

        // Check for language switch in the current prompt
        $detectedLanguage = $this->detectLanguage($prompt);
        if ($detectedLanguage !== $this->defaultLanguage && isset(self::SUPPORTED_LANGUAGES[$detectedLanguage])) {
            $this->setLanguage($detectedLanguage);
            Log::info("Temporarily switching from " . self::SUPPORTED_LANGUAGES[$this->defaultLanguage] . " to " . self::SUPPORTED_LANGUAGES[$detectedLanguage] . " for this message");
        }

        $messages = $this->formatMessages($prompt, $history, $useThinking);

        $payload = [
            'model' => $model,
            'messages' => $messages,
            'stream' => false
        ];

        $toolsToUse = is_array($tools) && !empty($tools) ? $tools : $this->getTools();
        if (!empty($toolsToUse)) {
            $payload['tools'] = $toolsToUse;
        }

        if ($format !== null) {
            $payload['format'] = $format;
        }

        try {
            $response = $this->client->post($this->apiEndpoint, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $this->getCurrentApiKey()
                ],
                'json' => $payload,
                'timeout' => 30,
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            Log::debug('Non-streaming response received');

            // Check for tool calls first
            if (isset($result['message']['tool_calls']) && !empty($result['message']['tool_calls'])) {
                Log::info('Tool calls detected in non-streaming response');
                return $this->handleToolCallsNonStreaming($result['message']['tool_calls'], $messages, $model, $toolsToUse);
            }

            // Ollama Cloud format
            if (isset($result['message']['content'])) {
                return $result['message']['content'];
            }
            // Alternative format
            elseif (isset($result['content'])) {
                return $result['content'];
            }
            // Fallback
            elseif (isset($result['message']) && is_string($result['message'])) {
                return $result['message'];
            }

            Log::error('Unexpected response format from Ollama Cloud:', $result);
            return 'Sorry, I received an unexpected response format.';
        } catch (\Exception $e) {
            Log::error('Ollama Cloud Chat Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Handle tool calls for non-streaming responses
     */
    private function handleToolCallsNonStreaming(array $toolCalls, array $messages, string $model, array $tools): string
    {
        Log::info('Handling tool calls in non-streaming mode: ' . json_encode($toolCalls));

        // Add the assistant's tool call message to history
        $messages[] = [
            'role' => 'assistant',
            'tool_calls' => $toolCalls
        ];

        // Execute each tool call
        foreach ($toolCalls as $toolCall) {
            $functionName = $toolCall['function']['name'];
            $arguments = json_decode($toolCall['function']['arguments'], true);

            Log::info("Executing tool: {$functionName} with args: " . json_encode($arguments));

            try {
                $result = $this->executeTool($functionName, $arguments);

                // Add tool result to messages
                $messages[] = [
                    'role' => 'tool',
                    'content' => json_encode($result),
                    'tool_call_id' => $toolCall['id']
                ];
            } catch (\Exception $e) {
                Log::error("Tool execution failed for {$functionName}: " . $e->getMessage());
                $messages[] = [
                    'role' => 'tool',
                    'content' => json_encode(['error' => $e->getMessage()]),
                    'tool_call_id' => $toolCall['id']
                ];
            }
        }

        // Continue the conversation with tool results
        $payload = [
            'model' => $model,
            'messages' => $messages,
            'stream' => false
        ];

        if (!empty($tools)) {
            $payload['tools'] = $tools;
        }

        $response = $this->client->post($this->apiEndpoint, [
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->getCurrentApiKey()
            ],
            'json' => $payload
        ]);

        $result = json_decode($response->getBody()->getContents(), true);
        return $result['message']['content'] ?? 'Tool execution completed, but no final response received.';
    }

    /**
     * Format messages for the API request
     */
    private function formatMessages(string $prompt, array $history = [], bool $useThinking = false): array
    {
        $messages = [];

        // Add system instructions with language support
        $messages[] = [
            'role' => 'system',
            'content' => $this->getLanguageInstructions($this->defaultLanguage)
        ];

        // Add conversation history
        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg['role'],
                'content' => $msg['content']
            ];
        }

        // Add system message for thinking capability if needed
        if ($useThinking) {
            $messages[] = [
                'role' => 'system',
                'content' => 'Please think through this step by step before providing your final answer.'
            ];
        }

        // Add the current prompt
        $messages[] = [
            'role' => 'user',
            'content' => $prompt
        ];

        return $messages;
    }

    /**
     * Generate a title for a chat conversation
     */
    public function generateTitle(string $prompt, string $model = 'gpt-oss:120b-cloud'): string
    {
        $this->validateModel($model);

        $systemMessage = "You are a helpful AI that generates short, descriptive titles. Generate a clear and concise title (2-6 words) that captures the essence of this message: " . $prompt;

        $messages = [
            [
                'role' => 'system',
                'content' => $systemMessage
            ],
            [
                'role' => 'user',
                'content' => $prompt
            ]
        ];

        $payload = [
            'model' => $model,
            'messages' => $messages,
            'stream' => false,
            'options' => [
                'temperature' => 0.7,
            ]
        ];

        try {
            $response = $this->client->post($this->apiEndpoint, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $this->getCurrentApiKey()
                ],
                'json' => $payload
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            $title = $result['message']['content'] ?? '';

            // Clean up the title
            $title = trim($title, " \t\n\r\0\x0B\"'");
            $title = preg_replace('/^["\'](.*)["\']$/', '$1', $title); // Remove surrounding quotes
            return $title ?: 'New Chat';
        } catch (\Exception $e) {
            Log::error('Ollama Cloud Title Generation Error: ' . $e->getMessage());
            return 'New Chat';
        }
    }

    /**
     * Get available cloud models from Ollama API
     */
    public function fetchAvailableModels(): array
    {
        try {
            $response = $this->client->get($this->modelsEndpoint, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->getCurrentApiKey()
                ]
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            return $result['models'] ?? [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch Ollama Cloud models: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get all available cloud models
     */
    public function getAvailableModels(): array
    {
        return self::CLOUD_MODELS;
    }

    /**
     * Check if a model supports thinking capability
     */
    public function modelSupportsThinking(string $model): bool
    {
        return self::CLOUD_MODELS[$model]['supports_think'] ?? false;
    }

    /**
     * Get the friendly name of a model
     */
    public function getModelName(string $model): string
    {
        return self::CLOUD_MODELS[$model]['name'] ?? $model;
    }

    /**
     * Get model description
     */
    public function getModelDescription(string $model): string
    {
        return self::CLOUD_MODELS[$model]['description'] ?? 'No description available';
    }

    /**
     * Validate if a model exists
     */
    private function validateModel(string $model): void
    {
        if (!isset(self::CLOUD_MODELS[$model])) {
            throw new \InvalidArgumentException("Invalid Ollama Cloud model: {$model}");
        }
    }

    /**
     * Set the language for responses
     */
    public function setLanguage(string $language): void
    {
        if (isset(self::SUPPORTED_LANGUAGES[$language])) {
            $this->defaultLanguage = $language;
            Log::info('Language set to: ' . self::SUPPORTED_LANGUAGES[$language]);
        } else {
            Log::warning("Attempted to set unsupported language: {$language}");
        }
    }

    /**
     * Detect language from input text
     */
    private function detectLanguage(string $text): string
    {
        $text = strtolower(trim($text));

        // Check each language's patterns
        foreach (self::LANG_PATTERNS as $lang => $pattern) {
            if (preg_match($pattern, $text)) {
                return $lang;
            }
        }

        return 'en'; // Default to English if no specific language is detected
    }

    /**
     * Get language-specific system instructions
     */
    private function getLanguageInstructions(string $language): string
    {
        $baseInstructions = $this->systemInstructions['parts'][0]['text'];

        $languageInstructions = [
            'ha' => "\n\nYa kamata in amsa da Hausa. Ni mai taimako ne mai horo da kuma aboki, wanda Xuple ya kirkira. Zan iya taimaka maka da duk abin da aka ambata a sama! Ina farin cikin taimaka maka.",
            'yo' => "\n\nJọwọ dahun ni Yoruba. Emi ni oluranlọwọ ọlọgbọn ati ọrẹ rere kan, ti Xuple ṣẹda. Mo le ran ọ lọwọ pẹlu gbogbo ohun ti a darukọ loke! Mo dunnu lati ran ọ lọwọ.",
            'ig' => "\n\nBiko zaa m n'asụsụ Igbo. Abụ m onye nkwado maara ihe na enyi, nke Xuple kere. Enwere m ike inyere gị aka na ihe niile e kwuru na elu! Ọṅụ dị m ịnyere gị aka.",
            'en' => "" // No additional instructions needed for English
        ];

        return $baseInstructions . ($languageInstructions[$language] ?? "");
    }

    /**
     * Get user's preferred language or default to English
     */
    private function getUserLanguage(): string
    {
        if (Auth::check()) {
            $userLanguage = strtolower(Auth::user()->language ?? '');
            if ($userLanguage && isset(self::SUPPORTED_LANGUAGES[$userLanguage])) {
                return $userLanguage;
            }
        }
        return 'en'; // Default to English if no user or unsupported language
    }

    /**
     * Test API connectivity
     */
    public function testConnection(): bool
    {
        try {
            $response = $this->client->get($this->modelsEndpoint, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->getCurrentApiKey()
                ],
                'timeout' => 10
            ]);

            return $response->getStatusCode() === 200;
        } catch (\Exception $e) {
            Log::error('Ollama Cloud connection test failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get current API key usage information
     */
    public function getApiKeyInfo(): array
    {
        if (!$this->currentKey) {
            $this->selectNewKey();
        }

        return [
            'name' => $this->currentKey->name ?? 'Unknown',
            'requests_used' => $this->currentKey->request_count ?? 0,
            'request_limit' => self::REQUEST_LIMIT,
            'remaining_requests' => self::REQUEST_LIMIT - ($this->currentKey->request_count ?? 0),
            'last_used' => $this->currentKey->last_used_at ?? null
        ];
    }

    /**
     * Reset API key usage (for testing or maintenance)
     */
    public function resetApiKeyUsage(): void
    {
        OllamaApiKey::resetAllCounts();
        $this->currentKey = null;
        Log::info('API key usage counters reset');
    }
}
