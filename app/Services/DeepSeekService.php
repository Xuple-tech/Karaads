<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Support\Facades\Config;
use App\Models\DeepSeekApiKey;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class DeepSeekService
{
    private ?DeepSeekApiKey $currentKey = null;
    private const REQUEST_LIMIT = 100;
    private array $tools = [];
    private string $apiEndpoint = 'https://api.deepseek.com/v1/chat/completions';
    private string $modelsEndpoint = 'https://api.deepseek.com/v1/models';
    private Client $client;
    private string $defaultLanguage = 'en';

    // Available DeepSeek models
    private const DEEPSEEK_MODELS = [
        'deepseek-chat' => [
            'name' => 'DeepSeek Chat',
            'supports_tools' => true,
            'supports_code' => true,
            'description' => 'General purpose conversational AI with strong reasoning'
        ],
        'deepseek-coder' => [
            'name' => 'DeepSeek Coder',
            'supports_tools' => true,
            'supports_code' => true,
            'description' => 'Specialized model for coding and software development'
        ],
        'deepseek-reasoner' => [
            'name' => 'DeepSeek Reasoner',
            'supports_tools' => true,
            'supports_code' => true,
            'description' => 'Advanced reasoning model for complex problem solving'
        ]
    ];

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

    private array $systemInstructions = [
        'coding' => "You are DeepSeek Coder, an advanced AI coding assistant. You excel at:

        🚀 **Code Generation & Development:**
        - Writing clean, efficient, and well-documented code
        - Creating full-stack applications and components
        - Following best practices and design patterns
        - Generating tests and documentation

        🔧 **Technical Expertise:**
        - Frontend: React, Vue, Angular, TypeScript, JavaScript
        - Backend: PHP (Laravel), Python, Node.js, Java
        - Databases: MySQL, PostgreSQL, MongoDB, Redis
        - DevOps: Docker, CI/CD, Cloud deployment

        🎯 **Project Management:**
        - Breaking down complex requirements into manageable tasks
        - Creating project structures and file organizations
        - Implementing features with proper error handling
        - Code review and optimization suggestions

        Always provide complete, working code with explanations.",

        'analytics' => "You are DeepSeek Analytics, specialized in data analysis and Python code generation. You excel at:

        📊 **Data Analysis:**
        - Statistical analysis and data visualization
        - Machine learning model development
        - Data cleaning and preprocessing
        - Performance metrics and KPI tracking

        🐍 **Python Expertise:**
        - Pandas, NumPy, Matplotlib, Seaborn
        - Scikit-learn, TensorFlow, PyTorch
        - Jupyter notebooks and data pipelines
        - API integration and data collection

        📈 **Business Intelligence:**
        - Creating dashboards and reports
        - Trend analysis and forecasting
        - A/B testing and experimentation
        - Data-driven decision making

        Always generate complete, executable Python code with proper documentation.",

        'general' => "You are DeepSeek AI, a helpful and knowledgeable assistant. You can help with:

        💬 **General Assistance:**
        - Answering questions and providing explanations
        - Problem-solving and brainstorming
        - Research and information gathering
        - Creative writing and content generation

        🌐 **Multilingual Support:**
        - English, Hausa, Yoruba, and Igbo languages
        - Cultural context and localization
        - Translation and interpretation

        🎯 **Specialized Tasks:**
        - Project planning and management
        - Technical documentation
        - Educational content creation
        - Business strategy and analysis

        Always provide helpful, accurate, and contextually appropriate responses."
    ];

    public function __construct()
    {
        $this->initializeApiKeys();
        $this->client = new Client([
            'timeout' => 120,
            'connect_timeout' => 30,
        ]);
        $this->defaultLanguage = $this->getUserLanguage();
    }

    /**
     * Get available tools for coding tasks
     */
    public function getCodingTools(): array
    {
        return [
            [
                'type' => 'function',
                'function' => [
                    'name' => 'generate_code',
                    'description' => 'Generate code files for a project based on requirements',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'project_type' => [
                                'type' => 'string',
                                'description' => 'Type of project (web, mobile, api, etc.)',
                                'enum' => ['web', 'mobile', 'api', 'desktop', 'library']
                            ],
                            'framework' => [
                                'type' => 'string',
                                'description' => 'Framework to use (react, laravel, vue, etc.)'
                            ],
                            'features' => [
                                'type' => 'array',
                                'items' => ['type' => 'string'],
                                'description' => 'List of features to implement'
                            ]
                        ],
                        'required' => ['project_type', 'framework', 'features']
                    ]
                ]
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'analyze_code',
                    'description' => 'Analyze existing code for improvements, bugs, or optimizations',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'code' => [
                                'type' => 'string',
                                'description' => 'The code to analyze'
                            ],
                            'language' => [
                                'type' => 'string',
                                'description' => 'Programming language of the code'
                            ],
                            'analysis_type' => [
                                'type' => 'string',
                                'description' => 'Type of analysis to perform',
                                'enum' => ['bugs', 'performance', 'security', 'style', 'all']
                            ]
                        ],
                        'required' => ['code', 'language']
                    ]
                ]
            ]
        ];
    }

    /**
     * Get available tools for data analytics
     */
    public function getAnalyticsTools(): array
    {
        return [
            [
                'type' => 'function',
                'function' => [
                    'name' => 'generate_python_analysis',
                    'description' => 'Generate Python code for data analysis tasks',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'data_source' => [
                                'type' => 'string',
                                'description' => 'Source of data (csv, database, api, etc.)'
                            ],
                            'analysis_type' => [
                                'type' => 'string',
                                'description' => 'Type of analysis to perform',
                                'enum' => ['descriptive', 'predictive', 'clustering', 'classification', 'visualization']
                            ],
                            'requirements' => [
                                'type' => 'string',
                                'description' => 'Specific requirements for the analysis'
                            ]
                        ],
                        'required' => ['data_source', 'analysis_type', 'requirements']
                    ]
                ]
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'create_dashboard',
                    'description' => 'Create interactive dashboard code for data visualization',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'dashboard_type' => [
                                'type' => 'string',
                                'description' => 'Type of dashboard to create',
                                'enum' => ['streamlit', 'plotly_dash', 'jupyter', 'web']
                            ],
                            'metrics' => [
                                'type' => 'array',
                                'items' => ['type' => 'string'],
                                'description' => 'Metrics to display on the dashboard'
                            ],
                            'data_format' => [
                                'type' => 'string',
                                'description' => 'Format of input data'
                            ]
                        ],
                        'required' => ['dashboard_type', 'metrics']
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
                'name' => 'DeepSeek API Key',
                'key' => config('services.deepseek.api_key'),
                'model' => 'deepseek-chat',
            ],
        ];

        foreach ($defaultKeys as $key) {
            if (!empty($key['key'])) {
                DeepSeekApiKey::firstOrCreate(
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
            if (DeepSeekApiKey::allKeysReachedLimit(self::REQUEST_LIMIT)) {
                DeepSeekApiKey::resetAllCounts();
            }

            // Get the key with the lowest request count
            $this->currentKey = DeepSeekApiKey::getNextAvailableKey();

            if (!$this->currentKey) {
                throw new \Exception('No available DeepSeek API keys found');
            }

            Log::info('Selected new DeepSeek API key: ' . ($this->currentKey->name ?? 'Unnamed Key'));
        });
    }

    /**
     * Enhanced streaming chat for coding tasks
     */
    public function generateCodingResponse(
        string $prompt,
        callable $callback,
        string $model = 'deepseek-coder',
        array $history = [],
        array $tools = [],
        array $context = []
    ): void {
        $this->validateModel($model);

        // Use coding tools if none provided
        $this->tools = !empty($tools) ? $tools : $this->getCodingTools();

        $messages = $this->formatMessages($prompt, $history, 'coding', $context);

        $this->executeStreamingRequest($messages, $callback, $model);
    }

    /**
     * Enhanced streaming chat for analytics tasks
     */
    public function generateAnalyticsResponse(
        string $prompt,
        callable $callback,
        string $model = 'deepseek-chat',
        array $history = [],
        array $tools = [],
        array $context = []
    ): void {
        $this->validateModel($model);

        // Use analytics tools if none provided
        $this->tools = !empty($tools) ? $tools : $this->getAnalyticsTools();

        $messages = $this->formatMessages($prompt, $history, 'analytics', $context);

        $this->executeStreamingRequest($messages, $callback, $model);
    }

    /**
     * General purpose streaming chat
     */
    public function generateStreamingChat(
        string $prompt,
        callable $callback,
        string $model = 'deepseek-chat',
        array $history = [],
        array $tools = [],
        array $context = []
    ): void {
        $this->validateModel($model);

        $this->tools = $tools;

        $messages = $this->formatMessages($prompt, $history, 'general', $context);

        $this->executeStreamingRequest($messages, $callback, $model);
    }

    /**
     * Execute streaming request to DeepSeek API
     */
    private function executeStreamingRequest(array $messages, callable $callback, string $model): void
    {
        $payload = [
            'model' => $model,
            'messages' => $messages,
            'stream' => true,
            'temperature' => 0.7,
            'max_tokens' => 4000
        ];

        if (!empty($this->tools)) {
            $payload['tools'] = $this->tools;
            $payload['tool_choice'] = 'auto';
        }

        try {
            Log::info('Starting DeepSeek API streaming request', [
                'model' => $model,
                'tools_enabled' => !empty($this->tools)
            ]);

            $response = $this->client->post($this->apiEndpoint, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $this->getCurrentApiKey(),
                    'User-Agent' => 'RheaApp/1.0'
                ],
                'json' => $payload,
                'stream' => true,
                'timeout' => 120,
                'read_timeout' => 120,
            ]);

            $this->processStreamingResponse($response, $callback, $messages, $model);
        } catch (ClientException $e) {
            $responseBody = $e->getResponse()->getBody()->getContents();
            $statusCode = $e->getResponse()->getStatusCode();
            Log::error("DeepSeek API Error (Status: {$statusCode}): " . $e->getMessage());
            Log::error('Error Response Body: ' . $responseBody);
            throw new \Exception("DeepSeek API error: " . $e->getMessage(), $statusCode, $e);
        } catch (\Exception $e) {
            Log::error('DeepSeek Streaming Error: ' . $e->getMessage());
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
        $toolCalls = [];
        $currentToolCall = null;

        while (!$stream->eof()) {
            $chunk = $stream->read(1024);
            $buffer .= $chunk;

            $lines = explode("\n", $buffer);
            $buffer = array_pop($lines);

            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line) || !str_starts_with($line, 'data: ')) {
                    continue;
                }

                $data = substr($line, 6);
                if ($data === '[DONE]') {
                    break;
                }

                try {
                    $json = json_decode($data, true);
                    if (!$json || !isset($json['choices'][0])) {
                        continue;
                    }

                    $choice = $json['choices'][0];
                    $delta = $choice['delta'] ?? [];

                    // Handle content
                    if (isset($delta['content'])) {
                        $content = $delta['content'];
                        $fullResponse .= $content;
                        $callback([
                            'type' => 'content',
                            'content' => $content,
                            'full_content' => $fullResponse
                        ]);
                    }

                    // Handle tool calls
                    if (isset($delta['tool_calls'])) {
                        foreach ($delta['tool_calls'] as $toolCall) {
                            if (isset($toolCall['id'])) {
                                $currentToolCall = $toolCall;
                                $toolCalls[] = $currentToolCall;
                            } elseif ($currentToolCall && isset($toolCall['function'])) {
                                if (isset($toolCall['function']['arguments'])) {
                                    $currentToolCall['function']['arguments'] =
                                        ($currentToolCall['function']['arguments'] ?? '') .
                                        $toolCall['function']['arguments'];
                                }
                            }
                        }
                    }

                    // Handle completion
                    if (isset($choice['finish_reason']) && $choice['finish_reason'] === 'tool_calls') {
                        $this->handleToolCalls($toolCalls, $callback, $messages, $model);
                    }

                } catch (\JsonException $e) {
                    Log::warning('Failed to parse DeepSeek streaming response: ' . $e->getMessage());
                    continue;
                }
            }
        }

        $callback([
            'type' => 'complete',
            'full_content' => $fullResponse
        ]);
    }

    /**
     * Handle tool calls from DeepSeek
     */
    private function handleToolCalls(array $toolCalls, callable $callback, array $messages, string $model): void
    {
        foreach ($toolCalls as $toolCall) {
            $functionName = $toolCall['function']['name'] ?? '';
            $arguments = json_decode($toolCall['function']['arguments'] ?? '{}', true);

            $callback([
                'type' => 'tool_call',
                'tool_name' => $functionName,
                'arguments' => $arguments
            ]);

            try {
                $result = $this->executeToolCall($functionName, $arguments);

                $callback([
                    'type' => 'tool_result',
                    'tool_name' => $functionName,
                    'result' => $result
                ]);

                // Continue conversation with tool result
                $messages[] = [
                    'role' => 'assistant',
                    'tool_calls' => [$toolCall]
                ];
                $messages[] = [
                    'role' => 'tool',
                    'tool_call_id' => $toolCall['id'],
                    'content' => json_encode($result)
                ];

                // Make follow-up request
                $this->executeStreamingRequest($messages, $callback, $model);

            } catch (\Exception $e) {
                $callback([
                    'type' => 'tool_error',
                    'tool_name' => $functionName,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    /**
     * Execute a tool call
     */
    private function executeToolCall(string $functionName, array $arguments): array
    {
        switch ($functionName) {
            case 'generate_code':
                return $this->generateCodeFiles($arguments);
            case 'analyze_code':
                return $this->analyzeCode($arguments);
            case 'generate_python_analysis':
                return $this->generatePythonAnalysis($arguments);
            case 'create_dashboard':
                return $this->createDashboard($arguments);
            default:
                throw new \Exception("Unknown tool function: {$functionName}");
        }
    }

    /**
     * Generate code files based on requirements
     */
    private function generateCodeFiles(array $arguments): array
    {
        // This would contain the logic to generate actual code files
        // For now, return a structured response
        return [
            'project_type' => $arguments['project_type'],
            'framework' => $arguments['framework'],
            'files_generated' => [
                // This would be populated with actual generated files
            ],
            'instructions' => 'Code generation completed successfully'
        ];
    }

    /**
     * Analyze code for improvements
     */
    private function analyzeCode(array $arguments): array
    {
        // This would contain actual code analysis logic
        return [
            'language' => $arguments['language'],
            'analysis_type' => $arguments['analysis_type'] ?? 'all',
            'findings' => [
                // This would be populated with actual analysis results
            ],
            'recommendations' => []
        ];
    }

    /**
     * Generate Python analysis code
     */
    private function generatePythonAnalysis(array $arguments): array
    {
        // This would generate actual Python code for data analysis
        return [
            'data_source' => $arguments['data_source'],
            'analysis_type' => $arguments['analysis_type'],
            'python_code' => '# Generated Python analysis code would go here',
            'requirements' => ['pandas', 'numpy', 'matplotlib', 'seaborn']
        ];
    }

    /**
     * Create dashboard code
     */
    private function createDashboard(array $arguments): array
    {
        // This would generate actual dashboard code
        return [
            'dashboard_type' => $arguments['dashboard_type'],
            'metrics' => $arguments['metrics'],
            'code' => '# Generated dashboard code would go here',
            'dependencies' => []
        ];
    }

    /**
     * Format messages for DeepSeek API
     */
    private function formatMessages(string $prompt, array $history, string $type = 'general', array $context = []): array
    {
        $messages = [];

        // Add system message based on type
        $systemMessage = $this->systemInstructions[$type] ?? $this->systemInstructions['general'];

        if (!empty($context)) {
            $systemMessage .= "\n\n**Context:**\n" . json_encode($context, JSON_PRETTY_PRINT);
        }

        $messages[] = [
            'role' => 'system',
            'content' => $systemMessage
        ];

        // Add conversation history
        foreach ($history as $message) {
            $messages[] = [
                'role' => $message['role'] ?? 'user',
                'content' => $message['content'] ?? ''
            ];
        }

        // Add current prompt
        $messages[] = [
            'role' => 'user',
            'content' => $prompt
        ];

        return $messages;
    }

    /**
     * Validate model availability
     */
    private function validateModel(string $model): void
    {
        if (!isset(self::DEEPSEEK_MODELS[$model])) {
            throw new \Exception("Model {$model} is not supported");
        }
    }

    /**
     * Get user's preferred language
     */
    private function getUserLanguage(): string
    {
        if (Auth::check()) {
            return Auth::user()->language ?? 'en';
        }
        return 'en';
    }

    /**
     * Detect language from text
     */
    private function detectLanguage(string $text): string
    {
        foreach (self::LANG_PATTERNS as $lang => $pattern) {
            if (preg_match($pattern, $text)) {
                return $lang;
            }
        }
        return 'en';
    }

    /**
     * Get available models
     */
    public function getAvailableModels(): array
    {
        return self::DEEPSEEK_MODELS;
    }

    /**
     * Get supported languages
     */
    public function getSupportedLanguages(): array
    {
        return self::SUPPORTED_LANGUAGES;
    }
}
