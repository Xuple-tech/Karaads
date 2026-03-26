<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Exception\ClientException;
use App\Services\SearchService;
use App\Services\ToolExecutorService;
use App\Models\Tool;
use App\Models\AIAgent;
use App\Models\AgentTool;

class WidgetGrokService
{
    private ?string $apiKey;
    private array $tools = [];
    private string $apiEndpoint = 'https://api.x.ai/v1/chat/completions';
    private Client $client;
    private SearchService $searchService;
    private ToolExecutorService $toolExecutorService;
    private $currentAgent;

    private const GROK_MODELS = [
        'grok-4' => [
            'name' => 'Grok 4',
            'supports_tools' => true,
            'supports_streaming' => true,
        ],
        'grok-4-fast-non-reasoning' => [
            'name' => 'Grok 4 Non Reasoning',
            'supports_tools' => true,
            'supports_streaming' => true,
        ],
        'grok-4-fast-reasoning' => [
            'name' => 'Grok 4 Reasoning',
            'supports_tools' => true,
            'supports_streaming' => true,
        ],
    ];

    public function __construct(SearchService $searchService, ToolExecutorService $toolExecutorService)
    {
        $this->searchService = $searchService;
        $this->toolExecutorService = $toolExecutorService;
        $this->apiKey = config('services.grok.api_key');

        if (empty($this->apiKey)) {
            throw new \Exception('Grok API key is not configured');
        }

        $this->client = new Client([
            'timeout' => 60,
            'connect_timeout' => 10,
            'verify' => false,
        ]);
    }

    /**
     * Validate and ensure tool parameters comply with Grok's JSON schema requirements
     */
    private function validateToolParameters(array $parameters): array
    {
        // Ensure base structure exists
        if (!isset($parameters['type'])) {
            $parameters['type'] = 'object';
        }

        // CRITICAL: properties MUST be a proper object structure
        if (!isset($parameters['properties']) || !is_array($parameters['properties'])) {
            $parameters['properties'] = [];
        }

        if (!isset($parameters['required'])) {
            $parameters['required'] = [];
        }

        // Check if it's an indexed array (which is invalid)
        if (!empty($parameters['properties']) && array_keys($parameters['properties']) === range(0, count($parameters['properties']) - 1)) {
            // It's an indexed array, which is invalid - convert to empty associative array
            $parameters['properties'] = [];
        }

        // Validate each property definition
        foreach ($parameters['properties'] as $propName => &$propDef) {
            if (!is_array($propDef)) {
                // If property is not an array, convert it
                $propDef = ['type' => 'string', 'description' => $propName];
            }

            // Ensure each property has a type
            if (!isset($propDef['type'])) {
                $propDef['type'] = 'string';
            }

            // Ensure each property has a description
            if (!isset($propDef['description'])) {
                $propDef['description'] = $propName;
            }

            // Validate type is one of the allowed JSON schema types
            $validTypes = ['string', 'number', 'integer', 'boolean', 'array', 'object'];
            if (!in_array($propDef['type'], $validTypes)) {
                $propDef['type'] = 'string';
            }
        }

        // Ensure required is an array
        if (!is_array($parameters['required'])) {
            $parameters['required'] = [];
        }

        // Add additionalProperties constraint for strict validation
        if (!isset($parameters['additionalProperties'])) {
            $parameters['additionalProperties'] = false;
        }

        return $parameters;
    }

    /**
     * Prepare tools for JSON encoding - ensures empty objects serialize correctly
     */
    private function prepareToolsForSerialization(array $tools): array
    {
        return array_map(function ($tool) {
            // Ensure properties is always a proper object (not an empty array)
            if (isset($tool['function']['parameters']['properties']) && $tool['function']['parameters']['properties'] === []) {
                // Convert empty array to object that will serialize as {}
                $tool['function']['parameters']['properties'] = new \stdClass();
            }
            return $tool;
        }, $tools);
    }

    /**
     * Sanitize tool name to comply with Grok API requirements
     * Must be lowercase, alphanumeric and underscores only
     */
    private function sanitizeToolName(string $name): string
    {
        // Convert to lowercase
        $name = strtolower($name);

        // Replace hyphens and spaces with underscores
        $name = preg_replace('/[-\s]+/', '_', $name);

        // Remove any characters that aren't alphanumeric or underscores
        $name = preg_replace('/[^a-z0-9_]/', '', $name);

        // Ensure it doesn't start with a number
        if (preg_match('/^[0-9]/', $name)) {
            $name = 'tool_' . $name;
        }

        return $name;
    }

    /**
     * Get widget-specific tools based on agent settings
     */
    public function getTools($agent): array
    {
        $tools = [];

        // Always add knowledge base tool if enabled
        if ($agent->knowledge_base_enabled) {
            $tools[] = [
                'type' => 'function',
                'function' => [
                    'name' => 'query_knowledge_base',
                    'description' => 'Query the agent\'s knowledge base for information about products, services, policies, FAQs, and other company-specific information. ALWAYS use this FIRST before using web search.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'query' => [
                                'type' => 'string',
                                'description' => 'The search query to find relevant information in the knowledge base'
                            ]
                        ],
                        'required' => ['query'],
                        'additionalProperties' => false
                    ]
                ]
            ];
        }

        // Add web search if enabled
        if ($agent->web_search_enabled) {
            $tools[] = [
                'type' => 'function',
                'function' => [
                    'name' => 'web_search',
                    'description' => 'Search the web for current information, news, facts, or up-to-date data. Use this ONLY when the knowledge base does not have the answer.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'query' => [
                                'type' => 'string',
                                'description' => 'The search query to find relevant information'
                            ],
                            'max_results' => [
                                'type' => 'integer',
                                'description' => 'Maximum number of results (default 3, max 5)'
                            ]
                        ],
                        'required' => ['query'],
                        'additionalProperties' => false
                    ]
                ]
            ];

            $tools[] = [
                'type' => 'function',
                'function' => [
                    'name' => 'web_fetch',
                    'description' => 'Fetch the content of a specific webpage by URL when you need detailed information from a source.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'url' => [
                                'type' => 'string',
                                'description' => 'The URL of the webpage to fetch'
                            ]
                        ],
                        'required' => ['url'],
                        'additionalProperties' => false
                    ]
                ]
            ];
        }

        // Add agent's custom tools
        if ($agent instanceof AIAgent) {
            $agentTools = $agent->tools()->where('is_active', true)->get();

            foreach ($agentTools as $tool) {
                if (in_array($tool->name, ['web_search', 'web_fetch', 'query_knowledge_base'])) {
                    continue;
                }

                // Validate and sanitize parameters
                $parameters = $this->validateToolParameters(
                    $tool->configuration['parameters'] ?? ['type' => 'object', 'properties' => [], 'required' => []]
                );

                $tools[] = [
                    'type' => 'function',
                    'function' => [
                        'name' => $this->sanitizeToolName($tool->name),
                        'description' => $tool->description ?? 'Custom tool',
                        'parameters' => $parameters,
                    ]
                ];
            }
        } elseif (!empty($agent->available_tools)) {
            // Fallback for legacy Agent model
            $agentTools = Tool::whereIn('name', $agent->available_tools)->where('is_active', true)->get();

            foreach ($agentTools as $tool) {
                if (in_array($tool->name, ['web_search', 'web_fetch', 'query_knowledge_base'])) {
                    continue;
                }

                // Validate and sanitize parameters
                $parameters = $this->validateToolParameters(
                    $tool->parameters ?? ['type' => 'object', 'properties' => [], 'required' => []]
                );

                $tools[] = [
                    'type' => 'function',
                    'function' => [
                        'name' => $this->sanitizeToolName($tool->name),
                        'description' => $tool->description ?? 'Tool',
                        'parameters' => $parameters,
                    ]
                ];
            }
        }

        return $tools;
    }

    /**
     * Build system instruction from agent settings
     */
    private function buildSystemInstruction($agent): array
    {
        $agentName = $agent->name ?? 'AI Assistant';
        $agentType = $agent->type ?? 'general';

        // Start with identity
        $instruction = "You are {$agentName}";

        // Add description if available
        if (!empty($agent->description)) {
            $instruction .= ", {$agent->description}";
        }

        $instruction .= ".\n\n";

        // Use agent's behavior profile if available
        if (!empty($agent->behavior_profile)) {
            $instruction .= $agent->behavior_profile;
        } else {
            // Default instruction based on agent type
            $instruction .= $this->getDefaultInstructionByType($agent);
        }

        // Add identity reminder
        $instruction .= "\n\nIMPORTANT: When asked who you are, always respond that you are {$agentName}";
        if (!empty($agent->description)) {
            $instruction .= " - {$agent->description}";
        }
        $instruction .= ".";

        // Add knowledge base information
        if ($agent->knowledge_base_enabled && $agent->hasKnowledgeBase()) {
            $kbSummary = $agent->getKnowledgeBaseSummary();
            if (!empty($kbSummary)) {
                $instruction .= "\n\n" . $kbSummary;
            }
        }

        // Add tool usage guidelines based on enabled features
        $instruction .= "\n\nTool Usage Guidelines:\n";

        if ($agent->knowledge_base_enabled) {
            $instruction .= "- CRITICAL: ALWAYS query the knowledge base FIRST using query_knowledge_base for ANY question about products, services, policies, pricing, features, or company information.\n";
            $instruction .= "- Answer ONLY from the knowledge base. If the knowledge base has the information, DO NOT use web search.\n";
            $instruction .= "- If the knowledge base doesn't have the answer, politely inform the user.\n";
        }

        if ($agent->web_search_enabled) {
            $instruction .= "- Use web_search ONLY when the knowledge base does not have the answer AND the user asks for current information, news, or real-time data.\n";
            $instruction .= "- Use web_fetch when you need to read content from a specific URL.\n";
        }

        $instruction .= "- Do not use tools for general knowledge, calculations, or creative tasks.\n";
        $instruction .= "- Always integrate search results naturally and cite sources.\n";
        $instruction .= "- For complex multi-part questions, consider breaking them down and using the most relevant tool for each part.\n";

        return [
            'role' => 'system',
            'content' => $instruction
        ];
    }

    /**
     * Get default instruction based on agent type
     */
    private function getDefaultInstructionByType($agent): string
    {
        $agentType = $agent->type ?? 'general';
        $agentName = $agent->name ?? 'AI Assistant';

        $instructions = [
            'customer_support' => "Your goal is to assist customers with their questions, resolve issues, and provide accurate information about products and services. Be professional, empathetic, and solution-oriented. Always maintain a helpful and understanding tone.",

            'sales' => "Your goal is to help potential customers understand products/services, answer their questions, and guide them through their purchase journey. Be persuasive but not pushy, focus on value, and build trust with customers.",

            'technical' => "Your goal is to help users troubleshoot technical issues, provide step-by-step guidance, and explain technical concepts clearly. Be precise, methodical, and patient in your explanations.",

            'general' => "Your goal is to assist users with their questions and tasks. Be friendly, informative, concise, and helpful in all interactions.",

            'educational' => "Your goal is to help learners understand concepts, answer questions, and provide clear explanations. Be patient, encouraging, and adapt your explanations to the user's level of understanding.",

            'medical' => "Your goal is to provide general health information and guidance. IMPORTANT: Always remind users that your information is for educational purposes only and they should consult healthcare professionals for medical advice. Never diagnose or prescribe.",
        ];

        return $instructions[$agentType] ?? $instructions['general'];
    }

    /**
     * Generate streaming chat with tool support
     */
    public function generateStreamingChat(
        string $prompt,
        callable $callback,
        $agent,
        string $model = 'grok-4-non-reasoning',
        array $history = [],
        bool $enableTools = true
    ): void {
        $this->validateModel($model);
        $this->currentAgent = $agent;

        // Build system instruction from agent settings
        $systemInstruction = $this->buildSystemInstruction($agent);

        // Prepare messages
        $messages = [$systemInstruction];

        // Add history
        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg['role'],
                'content' => $msg['content']
            ];
        }

        // Add current prompt
        $messages[] = [
            'role' => 'user',
            'content' => $prompt
        ];

        // Prepare payload
        $payload = [
            'model' => $model,
            'messages' => $messages,
            'stream' => true,
            'temperature' => (float)($agent->response_temperature ?? 0.7),
        ];

        // Add max tokens if specified
        if (!empty($agent->max_context_length)) {
            $payload['max_tokens'] = (int)$agent->max_context_length;
        }

        // Add tools if enabled
        if ($enableTools) {
            $this->tools = $this->getTools($agent);
            if (!empty($this->tools)) {
                // Prepare tools for proper JSON serialization
                $this->tools = $this->prepareToolsForSerialization($this->tools);
                $payload['tools'] = $this->tools;
                $payload['tool_choice'] = 'auto';
            }
            Log::info('Agent Tools Found', ['tools_count' => count($this->tools), 'tools' => $this->tools]);
        }

        try {
            Log::info('Widget Grok API Request', [
                'model' => $model,
                'agent_id' => $agent->id ?? null,
                'has_tools' => $enableTools,
                'message_count' => count($messages),
                'tools_count' => count($this->tools ?? []),
            ]);

            // Log the payload for debugging (sanitize API key)
            $debugPayload = $payload;
            Log::debug('Grok API Payload (sanitized)', [
                'model' => $debugPayload['model'],
                'message_count' => count($debugPayload['messages']),
                'has_tools' => isset($debugPayload['tools']),
                'tools_schemas' => isset($debugPayload['tools']) ? array_map(fn($t) => [
                    'name' => $t['function']['name'] ?? 'unknown',
                    'has_parameters' => isset($t['function']['parameters']),
                    'parameters_type' => $t['function']['parameters']['type'] ?? 'undefined',
                    'properties_is_object' => $t['function']['parameters']['properties'] instanceof \stdClass ? 'yes' : 'no'
                ], $debugPayload['tools']) : []
            ]);

            $response = $this->client->post($this->apiEndpoint, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'User-Agent' => 'WidgetAI/1.0'
                ],
                'json' => $payload,
                'stream' => true,
            ]);

            // Process streaming response
            $this->processStreamingResponse($response, $callback, $messages, $model);
        } catch (ClientException $e) {
            $statusCode = $e->getResponse()->getStatusCode();
            $responseBody = $e->getResponse()->getBody()->getContents();

            Log::error("Widget Grok API Error (Status: {$statusCode})", [
                'error' => $e->getMessage(),
                'response' => $responseBody
            ]);

            throw new \Exception("API Error: {$statusCode}");
        } catch (\Exception $e) {
            Log::error('Widget Grok Streaming Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Process streaming response with tool calling
     */
    private function processStreamingResponse($response, callable $callback, array $messages, string $model): void
    {
        $stream = $response->getBody();
        $buffer = '';
        $fullResponse = '';
        $toolCalls = [];

        Log::debug('Starting stream processing', ['model' => $model]);

        while (!$stream->eof()) {
            $chunk = $stream->read(1024);
            $buffer .= $chunk;
            $lines = explode("\n", $buffer);
            $buffer = array_pop($lines);

            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line)) continue;

                $data = str_starts_with($line, 'data: ') ? substr($line, 6) : $line;

                if ($data === '[DONE]') {
                    Log::debug('Stream completed [DONE] received');
                    $callback(['done' => true], false);
                    return;
                }

                try {
                    $decoded = json_decode($data, true);

                    // Handle tool calls
                    if (isset($decoded['choices'][0]['delta']['tool_calls'])) {
                        $newToolCalls = $decoded['choices'][0]['delta']['tool_calls'];
                        Log::debug('Tool calls detected in stream', [
                            'count' => count($newToolCalls),
                            'tool_calls' => $newToolCalls
                        ]);
                        $toolCalls = array_merge($toolCalls, $newToolCalls);
                        $callback(['tool_status' => 'tool_calls_detected'], false);
                    }

                    // Execute tools if finish_reason is tool_calls
                    if (
                        isset($decoded['choices'][0]['finish_reason']) &&
                        $decoded['choices'][0]['finish_reason'] === 'tool_calls' &&
                        !empty($toolCalls)
                    ) {
                        Log::info('Tool calls finish reason detected, executing tools', [
                            'tool_calls_count' => count($toolCalls),
                            'tool_names' => array_map(fn($tc) => $tc['function']['name'], $toolCalls)
                        ]);
                        $this->executeAndContinueToolCalls($toolCalls, $messages, $model, $callback, $this->currentAgent);
                        return;
                    }

                    // Handle content
                    if (isset($decoded['choices'][0]['delta']['content'])) {
                        $content = $decoded['choices'][0]['delta']['content'];
                        $fullResponse .= $content;
                        $callback(['content' => $content], false);
                    }

                    // Handle completion
                    if (
                        isset($decoded['choices'][0]['finish_reason']) &&
                        $decoded['choices'][0]['finish_reason'] === 'stop'
                    ) {
                        Log::debug('Stream stop finish reason', ['response_length' => strlen($fullResponse)]);
                        $callback(['done' => true], false);
                        return;
                    }
                } catch (\Exception $e) {
                    Log::debug('Stream parse error: ' . $e->getMessage(), ['line' => $line]);
                }
            }
        }
    }

    /**
     * Execute tool calls and continue conversation
     */
    private function executeAndContinueToolCalls(array $toolCalls, array $messages, string $model, callable $callback, $agent = null): void
    {
        Log::info('=== TOOL EXECUTION START ===', [
            'total_tools' => count($toolCalls),
            'agent_id' => $agent->id ?? 'unknown'
        ]);

        $callback(['tool_status' => 'executing_tools', 'count' => count($toolCalls)], false);

        // Add assistant message with tool calls
        $messages[] = [
            'role' => 'assistant',
            'tool_calls' => $toolCalls
        ];

        foreach ($toolCalls as $index => $toolCall) {
            try {
                $functionName = $toolCall['function']['name'];
                $rawArguments = $toolCall['function']['arguments'];
                $arguments = json_decode($rawArguments, true);
                $toolNumber = $index + 1;

                Log::info("Tool Call #{$toolNumber}", [
                    'tool_name' => $functionName,
                    'tool_id' => $toolCall['id'],
                    'arguments_raw' => $rawArguments,
                    'arguments_parsed' => $arguments,
                ]);

                $callback([
                    'tool_status' => 'executing_tool',
                    'tool_name' => $functionName,
                    'tool_executing_message' => $this->getToolExecutingMessage($functionName)
                ], false);

                // Execute the tool
                $startTime = microtime(true);
                Log::debug("Executing: {$functionName}", $arguments);

                $result = $this->executeTool($functionName, $arguments, $agent);

                $executionTime = microtime(true) - $startTime;

                Log::info("Tool Execution Successful", [
                    'tool_name' => $functionName,
                    'execution_time_ms' => round($executionTime * 1000, 2),
                    'result_keys' => array_keys($result),
                ]);

                // Add tool result to messages
                $messages[] = [
                    'role' => 'tool',
                    'content' => json_encode($result),
                    'tool_call_id' => $toolCall['id']
                ];

                // Send tool completion with enhanced formatting
                $toolData = [
                    'tool_status' => 'tool_completed',
                    'tool_name' => $functionName,
                    'result_summary' => $this->getToolResultSummary($functionName, $result),
                    'execution_time_ms' => round($executionTime * 1000, 2)
                ];

                // Format results with citations and metadata
                if ($functionName === 'query_knowledge_base' && isset($result['results'])) {
                    $toolData['kb_results'] = $this->formatKnowledgeBaseResults($result['results']);
                    Log::debug('KB Results Formatted', [
                        'count' => count($result['results']),
                        'items' => array_map(fn($r) => $r['title'] ?? 'untitled', $result['results'])
                    ]);
                } elseif ($functionName === 'web_search' && isset($result['results'])) {
                    $toolData['references'] = $this->formatWebSearchResults($result['results']);
                    Log::debug('Web Search Results Formatted', [
                        'count' => count($result['results']),
                        'urls' => array_map(fn($r) => $r['url'] ?? 'unknown', $result['results'])
                    ]);
                } elseif ($functionName === 'web_fetch' && isset($result['url'])) {
                    $toolData['webpage'] = $this->formatWebFetchResult($result['url'], $result);
                    Log::debug('Web Fetch Formatted', [
                        'url' => $result['url'],
                        'content_length' => strlen($result['content'] ?? ''),
                        'word_count' => $result['word_count'] ?? 0
                    ]);
                }

                $callback($toolData, false);
            } catch (\Exception $e) {
                $functionName = $toolCall['function']['name'] ?? 'unknown';
                $executionTime = isset($startTime) ? microtime(true) - $startTime : 0;

                Log::error("Tool Execution Failed", [
                    'tool_name' => $functionName,
                    'tool_id' => $toolCall['id'],
                    'error' => $e->getMessage(),
                    'execution_time_ms' => round($executionTime * 1000, 2),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ]);

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

        Log::info('=== TOOL EXECUTION COMPLETE ===', [
            'tools_executed' => count($toolCalls)
        ]);

        // Continue conversation with tool results
        $this->continueConversationWithToolResults($messages, $model, $callback);
    }

    /**
     * Continue conversation after tool execution
     */
    private function continueConversationWithToolResults(array $messages, string $model, callable $callback): void
    {
        $callback(['tool_status' => 'continuing_conversation'], false);

        // Prepare tools for serialization
        $preparedTools = $this->prepareToolsForSerialization($this->tools);

        $payload = [
            'model' => $model,
            'messages' => $messages,
            'stream' => true,
            'tools' => $preparedTools,
            'tool_choice' => 'auto'
        ];

        try {
            $response = $this->client->post($this->apiEndpoint, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $this->apiKey
                ],
                'json' => $payload,
                'stream' => true,
            ]);

            $this->processStreamingResponse($response, $callback, $messages, $model);
        } catch (\Exception $e) {
            Log::error('Continue conversation error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Execute a tool
     */
    private function executeTool(string $functionName, array $arguments, $agent = null): array
    {
        $startTime = microtime(true);
        
        Log::info("🔧 TOOL EXECUTION STARTED", [
            'tool_name' => $functionName,
            'agent_id' => $agent->id ?? 'unknown',
            'arguments_count' => count($arguments),
            'arguments_keys' => array_keys($arguments),
        ]);

        Log::debug("📋 Tool Arguments Detail", [
            'tool_name' => $functionName,
            'arguments' => $arguments
        ]);

        try {
            $result = null;

            switch ($functionName) {
                case 'query_knowledge_base':
                    Log::info("📚 EXECUTING: Knowledge Base Query", [
                        'query' => $arguments['query'] ?? 'empty'
                    ]);
                    $result = $this->handleKnowledgeBaseQuery($arguments, $agent);
                    Log::info("📚 KB Query Result", [
                        'found_results' => $result['result_count'] ?? 0,
                        'items' => is_array($result['results'] ?? []) ? array_map(fn($r) => $r['title'] ?? 'untitled', $result['results']) : []
                    ]);
                    break;

                case 'web_search':
                    Log::info("🔍 EXECUTING: Web Search", [
                        'query' => $arguments['query'] ?? 'empty',
                        'max_results' => $arguments['max_results'] ?? 3
                    ]);
                    $result = $this->handleWebSearch($arguments);
                    Log::info("🔍 Web Search Result", [
                        'found_results' => $result['result_count'] ?? 0,
                        'urls' => is_array($result['results'] ?? []) ? array_map(fn($r) => $r['url'] ?? 'unknown', $result['results']) : []
                    ]);
                    break;

                case 'web_fetch':
                    Log::info("📄 EXECUTING: Web Fetch", [
                        'url' => $arguments['url'] ?? 'empty'
                    ]);
                    $result = $this->handleWebFetch($arguments);
                    Log::info("📄 Web Fetch Result", [
                        'url' => $result['url'] ?? 'unknown',
                        'content_length' => strlen($result['full_content'] ?? ''),
                        'word_count' => $result['word_count'] ?? 0
                    ]);
                    break;

                default:
                    Log::info("🔎 LOOKING FOR CUSTOM TOOL", [
                        'tool_name' => $functionName,
                        'agent_type' => $agent ? get_class($agent) : 'none',
                        'agent_id' => $agent->id ?? 'unknown'
                    ]);

                    // Check if it's an AgentTool (AIAgent)
                    if ($agent instanceof AIAgent) {
                        Log::debug('🔍 Searching AgentTools for: ' . $functionName);
                        $agentTool = $agent->tools()->where('name', $functionName)->where('is_active', true)->first();
                        if ($agentTool) {
                            Log::info("✅ FOUND AGENT TOOL", [
                                'tool_id' => $agentTool->id,
                                'tool_name' => $agentTool->name,
                                'tool_type' => $agentTool->tool_type,
                                'is_active' => $agentTool->is_active,
                                'configuration_keys' => array_keys($agentTool->configuration ?? [])
                            ]);
                            $result = $this->executeAgentTool($agentTool, $arguments);
                            Log::info("✅ Agent Tool Execution Complete", [
                                'tool_name' => $functionName,
                                'result_keys' => is_array($result) ? array_keys($result) : 'not-array'
                            ]);
                            break;
                        }
                        Log::warning("❌ AGENT TOOL NOT FOUND", [
                            'tool_name' => $functionName,
                            'agent_id' => $agent->id,
                            'available_tools' => $agent->tools()->pluck('name')->toArray()
                        ]);
                    }

                    // Delegate to ToolExecutorService
                    Log::info("🔌 DELEGATING TO ToolExecutorService", [
                        'tool_name' => $functionName,
                        'agent_type' => $agent ? get_class($agent) : 'null'
                    ]);

                    $executorAgent = ($agent instanceof \App\Models\Agent) ? $agent : null;
                    $result = $this->toolExecutorService->execute($functionName, $arguments, $executorAgent);

                    Log::info("🔌 ToolExecutorService Result", [
                        'tool_name' => $functionName,
                        'result_status' => $result['status'] ?? 'unknown',
                        'has_data' => isset($result['data']),
                        'result_keys' => is_array($result) ? array_keys($result) : 'not-array'
                    ]);

                    if (isset($result['status']) && $result['status'] === 'error') {
                        throw new \Exception($result['message'] ?? 'Unknown error from ToolExecutorService');
                    }

                    $result = $result['data'] ?? $result;
            }

            $executionTime = microtime(true) - $startTime;

            Log::info("✅ TOOL EXECUTION SUCCESS", [
                'tool_name' => $functionName,
                'execution_time_ms' => round($executionTime * 1000, 2),
                'result_type' => gettype($result),
                'result_keys' => is_array($result) ? array_keys($result) : 'not-array',
                'result_size' => strlen(json_encode($result)) . ' bytes'
            ]);

            if (config('app.debug')) {
                Log::debug("📦 FULL TOOL RESULT", [
                    'tool_name' => $functionName,
                    'result' => $result
                ]);
            }

            return $result;
        } catch (\Exception $e) {
            $executionTime = microtime(true) - $startTime;

            Log::error("❌ TOOL EXECUTION FAILED", [
                'tool_name' => $functionName,
                'execution_time_ms' => round($executionTime * 1000, 2),
                'error_message' => $e->getMessage(),
                'error_code' => $e->getCode(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'arguments_count' => count($arguments)
            ]);

            if (config('app.debug')) {
                Log::debug("📋 Error Context - Arguments", [
                    'arguments' => $arguments
                ]);
                Log::debug("📋 Error Stack Trace", [
                    'trace' => $e->getTraceAsString()
                ]);
            }

            throw $e;
        }
    }

                if (isset($result['status']) && $result['status'] === 'error') {
                    Log::error('ToolExecutorService returned error', [
                        'tool_name' => $functionName,
                        'error' => $result['message'] ?? 'Unknown error'
                    ]);
                    throw new \Exception($result['message'] ?? 'Unknown error');
                }

                Log::debug('ToolExecutorService returned result', [
                    'result_keys' => array_keys($result['data'] ?? $result)
                ]);

                return $result['data'] ?? $result;
        }
    }

    /**
     * Execute an AgentTool (custom tool defined by owner)
     */
    private function executeAgentTool(AgentTool $tool, array $arguments): array
    {
        $config = $tool->configuration;
        $type = $tool->tool_type ?? 'custom';

        Log::info('Executing AgentTool', [
            'tool_id' => $tool->id,
            'tool_name' => $tool->name,
            'tool_type' => $type,
            'arguments' => $arguments
        ]);

        // Handle API calls (most common)
        if (isset($config['api']) || isset($config['url']) || $type === 'api_call') {
            Log::debug('Tool is API-based, calling executeAgentApiTool');
            return $this->executeAgentApiTool($tool, $arguments);
        }

        // Handle other types if needed (e.g., 'calculator', 'booking')
        // For now, we'll assume everything else is handled via API or custom logic

        Log::error('Tool type not implemented', ['tool_type' => $type]);
        throw new \Exception("Tool execution not implemented for type: {$type}");
    }
    /**
     * Execute an API-based AgentTool
     */
    private function executeAgentApiTool(AgentTool $tool, array $arguments): array
    {
        $config = $tool->configuration;

        // Extract API details
        $url = $config['api']['url'] ?? $config['url'] ?? null;
        $method = strtoupper($config['api']['method'] ?? $config['method'] ?? 'GET');
        $headers = $config['api']['headers'] ?? $config['headers'] ?? [];
        $bodyTemplate = $config['api']['body'] ?? $config['body'] ?? [];

        Log::info('Executing API Tool', [
            'tool_name' => $tool->name,
            'url' => $url,
            'method' => $method,
            'headers_count' => count($headers),
            'arguments' => $arguments
        ]);

        if (empty($url)) {
            Log::error('API Tool misconfigured: Missing URL', ['tool_name' => $tool->name]);
            throw new \Exception("Misconfigured tool: Missing API URL");
        }

        // Replace path parameters in URL (e.g., /users/{id})
        $originalUrl = $url;
        foreach ($arguments as $key => $value) {
            if (is_scalar($value)) {
                $url = str_replace("{{$key}}", $value, $url);
            }
        }

        if ($url !== $originalUrl) {
            Log::debug('URL path parameters replaced', [
                'original' => $originalUrl,
                'replaced' => $url
            ]);
        }

        // Prepare body/query parameters
        $body = [];
        if ($method === 'GET') {
            // For GET, append arguments to query string if not already in URL
            $query = http_build_query($arguments);
            if (!empty($query)) {
                $url .= (strpos($url, '?') === false ? '?' : '&') . $query;
            }
            Log::debug('GET request', ['final_url' => $url]);
        } else {
            // For POST/PUT, use arguments as body or merge with template
            if (!empty($bodyTemplate)) {
                // If body template exists, replace placeholders
                $body = $this->replacePlaceholders($bodyTemplate, $arguments);
            } else {
                // Otherwise use arguments as body
                $body = $arguments;
            }
            Log::debug('Request body', ['body' => $body]);
        }

        // Execute API call using ToolExecutorService's logic
        $apiParams = [
            'url' => $url,
            'method' => $method,
            'headers' => $headers,
            'body' => $body,
            'timeout' => 30
        ];

        Log::debug('API Params', $apiParams);

        // We can use the 'api_call' tool from ToolExecutorService
        $result = $this->toolExecutorService->execute('api_call', $apiParams);

        if (isset($result['status']) && $result['status'] === 'error') {
            Log::error('API Tool execution failed', [
                'tool_name' => $tool->name,
                'url' => $url,
                'error' => $result['message'] ?? 'Unknown error'
            ]);
            throw new \Exception($result['message'] ?? 'API call failed');
        }

        Log::info('API Tool execution successful', [
            'tool_name' => $tool->name,
            'url' => $url,
            'result_keys' => array_keys($result['data'] ?? $result)
        ]);

        return $result['data'] ?? $result;
    }

    /**
     * Recursively replace placeholders in array
     */
    private function replacePlaceholders(array $template, array $data): array
    {
        $result = [];
        foreach ($template as $key => $value) {
            if (is_array($value)) {
                $result[$key] = $this->replacePlaceholders($value, $data);
            } elseif (is_string($value) && str_starts_with($value, '{') && str_ends_with($value, '}')) {
                $paramName = substr($value, 1, -1);
                $result[$key] = $data[$paramName] ?? $value;
            } else {
                $result[$key] = $value;
            }
        }
        return $result;
    }

    /**
     * Handle knowledge base query with relevance scoring
     */
    private function handleKnowledgeBaseQuery(array $arguments, $agent): array
    {
        $query = $arguments['query'] ?? '';

        if (empty($query)) {
            throw new \Exception('Query is required');
        }

        if (!$agent) {
            throw new \Exception('Agent not provided');
        }

        Log::info("Knowledge base query: {$query} for agent: {$agent->id}");

        // Split query into possible title search terms
        $searchTerms = $this->splitIntoSentenceVariations($query);
        $queryLower = strtolower($query);
        $queryWords = preg_split('/\s+/', $queryLower, -1, PREG_SPLIT_NO_EMPTY);

        // Search knowledge base - first try exact title matches
        $dbResults = \App\Models\AgentKnowledgeBase::where('agent_id', $agent->id)
            ->where('is_active', true)
            ->where(function ($q) use ($searchTerms, $queryLower) {
                // First try to match against split title variations
                foreach ($searchTerms as $term) {
                    $termLower = strtolower($term);
                    $q->orWhereRaw('LOWER(title) LIKE ?', ["%{$termLower}%"]);
                }

                // If no title matches, fall back to original content search
                $q->orWhereRaw('LOWER(content) LIKE ?', ["%{$queryLower}%"]);
            })
            ->orderByRaw('
            CASE
                WHEN LOWER(title) LIKE ? THEN 1
                WHEN LOWER(title) LIKE ? THEN 2
                WHEN LOWER(title) LIKE ? THEN 3
                ELSE 4
            END
        ', array_merge(
                ["%" . strtolower($searchTerms[0]) . "%"],
                isset($searchTerms[1]) ? ["%" . strtolower($searchTerms[1]) . "%"] : ["%{$queryLower}%"],
                isset($searchTerms[2]) ? ["%" . strtolower($searchTerms[2]) . "%"] : ["%{$queryLower}%"]
            ))
            ->orderBy('order')
            ->limit(10)
            ->get();

        // Calculate relevance scores for each result
        $results = $dbResults->map(function ($item) use ($queryLower, $queryWords) {
            $relevanceScore = $this->calculateRelevanceScore(
                $item->title,
                $item->content,
                $queryLower,
                $queryWords
            );

            return [
                'id' => $item->id,
                'title' => $item->title,
                'content' => $item->content,
                'content_type' => $item->content_type ?? 'text',
                'source_url' => $item->source_url,
                'relevance_score' => $relevanceScore,
                'content_preview' => $this->getContentPreview($item->content, 150),
            ];
        })
            ->sort(function ($a, $b) {
                // Sort by relevance score descending
                return $b['relevance_score'] <=> $a['relevance_score'];
            })
            ->values()
            ->slice(0, 5)
            ->toArray();

        if (empty($results)) {
            return [
                'query' => $query,
                'result_count' => 0,
                'results' => [],
                'message' => 'No information found in the knowledge base.'
            ];
        }

        return [
            'query' => $query,
            'result_count' => count($results),
            'results' => $results
        ];
    }

    /**
     * Calculate relevance score for KB items (0-100)
     */
    private function calculateRelevanceScore(string $title, string $content, string $queryLower, array $queryWords): float
    {
        $score = 0;
        $titleLower = strtolower($title);
        $contentLower = strtolower($content);

        // Exact title match (highest priority)
        if ($titleLower === $queryLower) {
            $score += 100;
        }
        // Title contains full query
        elseif (strpos($titleLower, $queryLower) !== false) {
            $score += 80;
        }
        // Title starts with query
        elseif (strpos($titleLower, $queryLower) === 0) {
            $score += 85;
        }

        // Count word matches in title (higher weight)
        foreach ($queryWords as $word) {
            if (strlen($word) > 2) { // Only count words longer than 2 chars
                $titleMatches = substr_count($titleLower, $word);
                $score += min(15, $titleMatches * 10); // Max 15 points per word
            }
        }

        // Count word matches in content (lower weight)
        foreach ($queryWords as $word) {
            if (strlen($word) > 2) {
                $contentMatches = substr_count($contentLower, $word);
                if ($contentMatches > 0) {
                    $score += min(5, round($contentMatches / 2)); // Max 5 points per word
                }
            }
        }

        // Normalize score to 0-100 range
        return min(100, $score);
    }

    /**
     * Get content preview with smart truncation
     */
    private function getContentPreview(string $content, int $maxLength = 150): string
    {
        if (strlen($content) <= $maxLength) {
            return $content;
        }

        $preview = substr($content, 0, $maxLength);

        // Try to cut at word boundary
        $lastSpace = strrpos($preview, ' ');
        if ($lastSpace > $maxLength - 50) {
            $preview = substr($preview, 0, $lastSpace);
        }

        return trim($preview) . '...';
    }

    /**
     * Split query into 2-3 sentence variations for title search
     */
    private function splitIntoSentenceVariations(string $query): array
    {
        $query = trim($query);
        $variations = [];

        // Remove trailing punctuation for cleaner splits
        $query = rtrim($query, '.?!');

        // Try to split by natural sentence boundaries first
        if (strlen($query) > 40) {
            // Try to split by common conjunctions and separators
            $splitPatterns = [' but ', ' and ', ' or ', ' however ', ' therefore ', ';', ','];

            foreach ($splitPatterns as $pattern) {
                if (stripos($query, $pattern) !== false) {
                    $parts = explode($pattern, $query, 2);
                    $variations = array_filter(array_map('trim', $parts));
                    if (count($variations) >= 2) {
                        // Take first 2 parts as title candidates
                        $variations = array_slice($variations, 0, 2);
                        break;
                    }
                }
            }

            // If no natural split found, split by approximate halves
            if (empty($variations)) {
                $words = explode(' ', $query);
                if (count($words) > 3) {
                    $midPoint = floor(count($words) / 2);
                    $variations[] = implode(' ', array_slice($words, 0, $midPoint));
                    $variations[] = implode(' ', array_slice($words, $midPoint));
                }
            }
        }

        // If we couldn't split meaningfully or query is short, use the whole query
        if (empty($variations)) {
            $variations = [$query];
        }

        // Always include the full query as a search term
        if (!in_array($query, $variations)) {
            array_unshift($variations, $query);
        }

        // Limit to 3 variations max
        return array_slice($variations, 0, 3);
    }

    /**
     * Handle web search
     */
    private function handleWebSearch(array $arguments): array
    {
        $query = $arguments['query'] ?? '';
        $maxResults = min($arguments['max_results'] ?? 3, 5);

        if (empty($query)) {
            throw new \Exception('Search query is required');
        }

        Log::info("Web search: {$query}");

        $results = $this->searchService->search($query, $maxResults);

        return [
            'query' => $query,
            'result_count' => count($results),
            'results' => $results
        ];
    }

    /**
     * Handle web fetch with retry logic and enhanced formatting
     */
    private function handleWebFetch(array $arguments): array
    {
        $url = $arguments['url'] ?? '';
        $maxRetries = 2;
        $retryDelay = 1; // seconds

        if (empty($url)) {
            throw new \Exception('URL is required');
        }

        Log::info("Web fetch: {$url}");

        $lastError = null;
        for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
            try {
                $fetchResult = $this->searchService->fetchWebpage($url);

                if ($fetchResult['content_type'] === 'error') {
                    $lastError = $fetchResult['content'];
                    if ($attempt < $maxRetries) {
                        sleep($retryDelay);
                        continue;
                    }
                    throw new \Exception($lastError);
                }

                // Format and enhance the fetched content
                return $this->formatWebFetchResult($url, $fetchResult);
            } catch (\Exception $e) {
                $lastError = $e->getMessage();
                if ($attempt < $maxRetries) {
                    sleep($retryDelay);
                }
            }
        }

        throw new \Exception("Failed to fetch webpage after {$maxRetries} attempts: {$lastError}");
    }

    /**
     * Format web fetch result with enhanced metadata and content
     */
    private function formatWebFetchResult(string $url, array $fetchResult): array
    {
        $content = $fetchResult['content'] ?? '';
        $title = $fetchResult['title'] ?? '';
        $links = $fetchResult['links'] ?? [];

        // Estimate reading time (average 200 words per minute)
        $wordCount = str_word_count($content);
        $readingTimeMinutes = max(1, round($wordCount / 200));

        // Create a summary of the first 500 characters for better context
        $summary = substr($content, 0, 500);
        if (strlen($content) > 500) {
            // Find the last sentence boundary
            $lastDot = strrpos(substr($summary, 0, -1), '.');
            if ($lastDot !== false) {
                $summary = substr($summary, 0, $lastDot + 1);
            }
            $summary .= '...';
        }

        return [
            'url' => $url,
            'title' => $title,
            'summary' => $summary,
            'full_content' => $content,
            'content_length' => strlen($content),
            'word_count' => $wordCount,
            'estimated_reading_time_minutes' => $readingTimeMinutes,
            'content_type' => $fetchResult['content_type'] ?? 'html',
            'links' => array_slice($links, 0, 5) // Limit related links
        ];
    }

    /**
     * Get tool executing message
     */
    private function getToolExecutingMessage(string $toolName): string
    {
        $messages = [
            'query_knowledge_base' => '📚 Searching knowledge base...',
            'web_search' => '🔍 Searching the web...',
            'web_fetch' => '📄 Fetching webpage content...',
        ];

        return $messages[$toolName] ?? 'Processing...';
    }

    /**
     * Get tool result summary
     */
    private function getToolResultSummary(string $toolName, array $result): string
    {
        switch ($toolName) {
            case 'query_knowledge_base':
                $count = $result['result_count'] ?? 0;
                return $count > 0 ? "Found {$count} items in knowledge base" : "No results in knowledge base";

            case 'web_search':
                $count = $result['result_count'] ?? 0;
                return "Found {$count} web results";

            case 'web_fetch':
                $wordCount = $result['word_count'] ?? 0;
                $readTime = $result['estimated_reading_time_minutes'] ?? 1;
                return "Fetched {$wordCount} words (~{$readTime} min read)";

            default:
                return 'Completed';
        }
    }

    /**
     * Format knowledge base results with citations and metadata
     */
    private function formatKnowledgeBaseResults(array $results): array
    {
        return array_map(function ($item, $index) {
            return [
                'index' => $index + 1,
                'title' => $item['title'] ?? 'Untitled',
                'preview' => $item['content_preview'] ?? '',
                'full_content' => $item['content'] ?? '',
                'content_type' => $item['content_type'] ?? 'text',
                'source_url' => $item['source_url'] ?? null,
                'relevance_score' => $item['relevance_score'] ?? 0,
                'relevance_label' => $this->getRelevanceLabel($item['relevance_score'] ?? 0),
                'citation' => "[KB " . ($index + 1) . "] {$item['title']}",
            ];
        }, $results, array_keys($results));
    }

    /**
     * Format web search results with proper citations
     */
    private function formatWebSearchResults(array $results): array
    {
        return array_map(function ($item, $index) {
            return [
                'index' => $index + 1,
                'title' => $item['title'] ?? 'Untitled',
                'url' => $item['url'] ?? '#',
                'snippet' => $item['content'] ?? $item['snippet'] ?? '',
                'domain' => $this->extractDomain($item['url'] ?? ''),
                'citation' => '[' . ($index + 1) . '] ' . ($item['title'] ?? 'Untitled') . ' - ' . $this->extractDomain($item['url'] ?? ''),
            ];
        }, $results, array_keys($results));
    }

    /**
     * Get human-readable relevance label
     */
    private function getRelevanceLabel(float $score): string
    {
        if ($score >= 85) {
            return 'Highly relevant';
        } elseif ($score >= 70) {
            return 'Relevant';
        } elseif ($score >= 50) {
            return 'Somewhat relevant';
        }
        return 'Low relevance';
    }

    /**
     * Extract domain from URL
     */
    private function extractDomain(string $url): string
    {
        $parsed = parse_url($url);
        $host = $parsed['host'] ?? '';

        // Remove www. prefix for cleaner display
        if (strpos($host, 'www.') === 0) {
            $host = substr($host, 4);
        }

        return $host ?: 'Unknown';
    }

    /**
     * Validate model
     */
    private function validateModel(string $model): void
    {
        if (!isset(self::GROK_MODELS[$model])) {
            throw new \InvalidArgumentException("Invalid model: {$model}");
        }
    }

    /**
     * Get available models
     */
    public function getAvailableModels(): array
    {
        return self::GROK_MODELS;
    }
}
