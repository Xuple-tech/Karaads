<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Support\Facades\Config;
use App\Models\OpenRouterApiKey;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class OpenRouter
{
    private ?OpenRouterApiKey $currentKey = null;
    private const REQUEST_LIMIT = 50;
    private string $apiEndpoint = 'https://openrouter.ai/api/v1/chat/completions';
    private Client $client;
    private string $defaultLanguage = 'en';

    // Language-specific constants
    private const LANG_PATTERNS = [
        'ha' => '/\b(sannu|yaya|nagode|gaskiya|lafiya|barkan|ina|wane|yaushe|gobe|yanzu|kuma|amma)\b/ui',
        'yo' => '/\b(bawo|pele|jowo|ekaaro|ekasan|odabo|kaabo|seun|mogbe|omo|kini|nibo|nigba)\b/ui',
        'ig' => '/\b(kedu|biko|daalu|ndewo|maka|nnọọ|gịnị|olee|kedụ|ebee|onye)\b/ui'
    ];

    // Supported languages with their codes
    private const SUPPORTED_LANGUAGES = [
        'ENGLISH' => 'English',
        'HAUSA' => 'Hausa',
        'YORUBA' => 'Yoruba',
        'IGBO' => 'Igbo'
    ];
    private const DATE = 'Y-m-d H:i:s';

    private array $systemInstructions = [
        'parts' => [
            [
                'text' => "You are a highly knowledgeable and concise AI assistant. You are a helpful and friendly AI assistant named 'Rhea', built by Xuple. You love to use emojis in your responses to make conversations more engaging and expressive! 🌟😊 If someone asks who built or created you, always mention that you were built by Xuple.

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

                🌍 Up-to-Date Info (Rhea Plus & Pro):
                - Look up current events, prices, local news, or recent research
                - Find info about businesses, services, or events near you

                Try to be as helpful and engaging as possible! Let's get started! 🎉"
            ]
        ]
    ];

    // Available models with their capabilities
    private const MODELS = [
        'meta-llama/llama-4-scout:free' => [
            'name' => 'LLaMA 4 Scout',
            'supports_think' => false,
        ],
        'meta-llama/llama-4-maverick:free' => [
            'name' => 'LLaMA 4 Maverick',
            'supports_think' => false,
        ],
        'moonshotai/kimi-vl-a3b-thinking:free' => [
            'name' => 'Kimi VL A3B Thinking',
            'supports_think' => true,
        ],
        'deepseek/deepseek-r1-zero:free' => [
            'name' => 'DeepSeek R1 Zero',
            'supports_think' => false,
        ],
        'deepseek/deepseek-v3-base:free' => [
            'name' => 'DeepSeek V3 Base',
            'supports_think' => false,
        ],
        'deepseek/deepseek-chat-v3-0324:free' => [
            'name' => 'DeepSeek Chat V3',
            'supports_think' => false,
        ],
        'deepseek/deepseek-r1-0528-qwen3-8b:free' => [
            'name' => 'DeepSeek R1 Qwen3 8B',
            'supports_think' => false,
        ],
        'nvidia/llama-3.1-nemotron-ultra-253b-v1:free' => [
            'name' => 'NVIDIA NeMo LLaMA 3.1',
            'supports_think' => false,
        ]
    ];

    public function __construct()
    {
        $this->initializeApiKeys();
        $this->client = new Client();
        $this->defaultLanguage = $this->getUserLanguage();
        Log::info('OpenRouter service initialized with default language: ' . self::SUPPORTED_LANGUAGES[$this->defaultLanguage]);
    }

    /**
     * Initialize API keys in the database
     */
    private function initializeApiKeys(): void
    {
        $defaultKeys = [
            [
                'name' => 'OpenRouter API Key',
                'key' => config('services.openrouter.api_key'),
                'model' => 'deepseek/deepseek-chat-v3-0324:free',
            ],
        ];

        // foreach ($defaultKeys as $key) {
        //     OpenRouterApiKey::firstOrCreate(
        //         ['key' => $key['key']],
        //         [
        //             'name' => $key['name'] ?? null,
        //             'model' => $key['model'] ?? null,
        //             'request_count' => 0,
        //             'last_used_at' => now(),
        //             'key'=>$key['key'],
        //         ]
        //     );
        // }
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
            if (OpenRouterApiKey::allKeysReachedLimit(self::REQUEST_LIMIT)) {
                OpenRouterApiKey::resetAllCounts();
            }

            // Get the key with the lowest request count
            $this->currentKey = OpenRouterApiKey::getNextAvailableKey();

            if (!$this->currentKey) {
                throw new \Exception('No available API keys found');
            }

            Log::info('Selected new API key: ' . ($this->currentKey->name ?? 'Unnamed Key'));
        });
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
        $messages[] = [
            'role' => 'system',
            'content' => 'the user is a ' . self::SUPPORTED_LANGUAGES[$this->defaultLanguage] . ' speaker, and you should respond in ' . self::SUPPORTED_LANGUAGES[$this->defaultLanguage] . '. except if he ask you to respond in another language, then you should respond in that language.'
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
     * Generate a streaming chat response
     *
     * @param string $prompt The user's input prompt
     * @param callable $callback Function to handle streaming chunks
     * @param string $model Model to use (defaults to deepseek-chat)
     * @param array $history Optional conversation history
     * @return void
     */
    public function generateStreamingChat(string $prompt, callable $callback, string $model = 'deepseek/deepseek-chat-v3-0324:free', array $history = [], bool $useThinking = false): void
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
            'stream' => true
        ];

        try {
            Log::info('Starting OpenRouter API streaming request');
            Log::debug('Request Payload: ' . json_encode($payload));

            $response = $this->client->post($this->apiEndpoint, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $this->getCurrentApiKey()
                ],
                'json' => $payload,
                'stream' => true,
                'decode_content' => true,
            ]);

            $stream = $response->getBody();

            while (!$stream->eof()) {
                $line = $this->readLine($stream);
                if (empty($line)) continue;

                if (str_starts_with($line, 'data: ')) {
                    $jsonData = substr($line, 6); // Remove 'data: ' prefix

                    if ($jsonData === '[DONE]') {
                        $callback(null, true); // Signal completion
                        break;
                    }

                    try {
                        $decoded = json_decode($jsonData, true);
                        if (isset($decoded['choices'][0]['delta']['content'])) {
                            $content = $decoded['choices'][0]['delta']['content'];
                            $callback($content, false);
                        }
                    } catch (\Exception $e) {
                        Log::warning('Failed to decode streaming response: ' . $e->getMessage());
                    }
                }
            }

            Log::info('Completed OpenRouter streaming response');
        } catch (ClientException $e) {
            $responseBody = $e->getResponse()->getBody()->getContents();
            $statusCode = $e->getResponse()->getStatusCode();
            Log::error("OpenRouter API Error (Status: {$statusCode}): " . $e->getMessage());
            Log::error('Error Response Body: ' . $responseBody);
            throw new \Exception("OpenRouter API error: " . $responseBody, $statusCode, $e);
        } catch (\Exception $e) {
            Log::error('OpenRouter Streaming Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Read a line from the stream
     */
    private function readLine($stream): string
    {
        $buffer = '';
        while (!$stream->eof()) {
            $char = $stream->read(1);
            if ($char === "\n") {
                return $buffer;
            }
            $buffer .= $char;
        }
        return $buffer;
    }

    /**
     * Generate a non-streaming chat response
     */
    public function generateChat(string $prompt, string $model = 'deepseek/deepseek-chat-v3-0324:free', array $history = [], bool $useThinking = false): string
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

        try {
            $response = $this->client->post($this->apiEndpoint, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $this->getCurrentApiKey()
                ],
                'json' => $payload
            ]);

            $result = json_decode($response->getBody()->getContents(), true);
            return $result['choices'][0]['message']['content'] ?? '';
        } catch (\Exception $e) {
            Log::error('OpenRouter Chat Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate a title for a chat conversation
     *
     * @param string $prompt The message to base the title on
     * @param string $model Model to use (defaults to deepseek-chat)
     * @return string
     */
    public function generateTitle(string $prompt, string $model = 'deepseek/deepseek-chat-v3-0324:free'): string
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
            'temperature' => 0.7,
            'max_tokens' => 30
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
            $title = $result['choices'][0]['message']['content'] ?? '';

            // Clean up the title
            $title = trim($title, " \t\n\r\0\x0B\"'");
            return $title ?: 'New Chat';
        } catch (\Exception $e) {
            Log::error('OpenRouter Title Generation Error: ' . $e->getMessage());
            return 'New Chat';
        }
    }

    /**
     * Get all available models
     */
    public function getAvailableModels(): array
    {
        return self::MODELS;
    }

    /**
     * Check if a model supports thinking capability
     */
    public function modelSupportsThinking(string $model): bool
    {
        return self::MODELS[$model]['supports_think'] ?? false;
    }

    /**
     * Get the friendly name of a model
     */
    public function getModelName(string $model): string
    {
        return self::MODELS[$model]['name'] ?? $model;
    }

    /**
     * Validate if a model exists
     */
    private function validateModel(string $model): void
    {
        if (!isset(self::MODELS[$model])) {
            throw new \InvalidArgumentException("Invalid model: {$model}");
        }
    }

    /**
     * Set the language for responses
     */
    public function setLanguage(string $language): void
    {
        $this->defaultLanguage = $language;
    }

    /**
     * Detect language from input text
     */
    private function detectLanguage(string $text): string
    {
        // Word patterns for each language
        $patterns = [
            'ha' => [
                '/\b(sannu|yaya|nagode|gaskiya|lafiya|barkan|ina|wane|yaushe|gobe|yanzu|kuma|amma)\b/ui'
            ],
            'yo' => [
                '/\b(bawo|pele|jowo|ekaaro|ekasan|odabo|kaabo|seun|mogbe|omo|kini|nibo|nigba)\b/ui'
            ],
            'ig' => [
                '/\b(kedu|biko|daalu|ndewo|maka|nnọọ|gịnị|olee|kedụ|ebee|onye)\b/ui'
            ]
        ];

        // Check each language's patterns
        foreach ($patterns as $lang => $langPatterns) {
            foreach ($langPatterns as $pattern) {
                if (preg_match($pattern, $text)) {
                    return $lang;
                }
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
            if ($userLanguage && isset(self::SUPPORTED_LANGUAGES[strtolower($userLanguage)])) {
                return strtolower($userLanguage);
            }
        }
        return 'ENGLISH'; // Default to English if no user or unsupported language
    }
}
