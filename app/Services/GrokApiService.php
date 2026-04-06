<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Support\Facades\Config;
use App\Models\User;
use Illuminate\Support\Facades\Http;

use Illuminate\Support\Facades\Auth;
use App\Services\SearchService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Torann\GeoIP\Facades\GeoIP;
use App\Models\ApiUsageLog;
use App\Models\ImageGeneration;
use App\Services\ChatPersonalizationService;
use App\Services\LimitResponseService;
use App\Services\PythonDocumentGenerationService;
use Illuminate\Support\Str;

use function Pest\Laravel\json;

class GrokApiService
{
    private ?string $apiKey;
    private array $tools = [];
    private string $apiEndpoint = 'https://api.x.ai/v1/chat/completions';
    private string $modelsEndpoint = 'https://api.x.ai/v1/models';
    private Client $client;
    private string $defaultLanguage = 'en';
    private SearchService $searchService;
    private ?User $currentUser = null;
    private ?SubscriptionService $subscriptionService = null;
    private PythonDocumentGenerationService $documentGenerationService;
    public StabilityAIImageService $stabilityImageService; // Add OpenAI image service

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

    // Available Grok models based on xAI API documentation
    private const GROK_MODELS = [
        'grok-4' => [
            'name' => 'Grok 4',
            'supports_tools' => true,
            'supports_vision' => true,
            'supports_streaming' => true,
            'description' => 'Advanced reasoning, coding, and visual processing capabilities'
        ],
        'grok-4-fast-non-reasoning' => [
            'name' => 'Grok 4 Non Reasoning',
            'supports_tools' => true,
            'supports_vision' => false,
            'supports_streaming' => true,
            'description' => 'General purpose model with strong performance'
        ],
        'grok-4-fast-reasoning' => [
            'name' => 'Grok 4 Reasoning',
            'supports_tools' => true,
            'supports_vision' => false,
            'supports_streaming' => true,
            'description' => 'General purpose model with strong performance'
        ],
        // Add more models as per future updates from https://docs.x.ai/docs/models
    ];


    private array $systemInstructions = [
        'role' => 'system',
        'content' => "
    🔴 CRITICAL - IMAGE TOOL STOP INSTRUCTION:
    
    When you execute generate_image OR edit_image tools:
    1. Make the tool call
    2. STOP - Do not write ANY response text
    3. Never add comments, descriptions, emojis, suggestions, links
    4. Never write 'Here's your image', 'I generated', or any dialogue
    5. If tool fails with error - explain error only, then STOP
    6. System displays images automatically - your output must be EMPTY for successful image operations
    
    IMAGE TOOL RULES:
    • generate_image: Use when user requests create/draw/make any image/picture/art/photo
    • edit_image: Use when user uploads image and asks edit/modify/enhance/transform/remove background
    • Requirement: Images must be uploaded BEFORE editing - if not, respond: \"📸 Please upload an image first, then tell me how you want it edited!\"
    • Use user's EXACT prompt without modification
    • For editing, provide detailed instructions in edit_prompt

    🔴 CRITICAL - DOCUMENT TOOL STOP INSTRUCTION:
    
    When you execute generate_pdf_document OR generate_word_document tools:
    1. Make the tool call with properly formatted markdown content
    2. STOP - Do not write ANY response text
    3. Never add comments like 'Here's your document', 'I created', or any dialogue
    4. If tool fails with error - explain error only, then STOP
    5. System provides download link automatically - your output must be EMPTY for successful document operations
    
    DOCUMENT TOOL RULES:
    • generate_pdf_document: DEFAULT for ALL document requests. Creates professional PDFs with beautiful formatting.
    • generate_word_document: Use ONLY when user specifically asks for \"Word\", \".docx\", or \"Microsoft Word\" format.
    • When user asks for any document/report/letter/resume/proposal: Use generate_pdf_document by default
    • Content formatting: Use markdown in the content parameter:
      - # Main Title, ## Section Header, ### Subsection
      - **bold text** for emphasis
      - *italic text* for emphasis
      - * or - for bullet lists (• in output)
      - 1., 2., 3. for numbered lists
      - > for blockquotes
      - `code` for inline code
      - Separate sections with clear headers
    • Document creation workflow:
      1. User requests a document (e.g., \"Create a business report\")
      2. You create the full document content with proper structure using markdown
      3. You provide a descriptive title based on the content
      4. You call the appropriate document tool with title and content
      5. STOP - System handles the rest
    • If user provides content: Use their exact content with markdown formatting
    • If user asks you to write/create: Generate professional content first, then use tool
    • Document quality: Ensure professional tone, proper grammar, logical flow, and clear structure

    You are a highly knowledgeable and concise AI assistant named Kwati Ai. Built By KwatiAi Team. You reply with a friendly and expressive tone and may use emojis.

    Safety Requirements:
    • Decline any request involving explicit sexual content, graphic violence, illegal activities, political persuasion, hateful behavior, or personal data extraction.
    • If a request falls into those categories, give a gentle and brief refusal.
    • Keep all content safe, non-graphic, and suitable for general audiences.

    Tool Usage:
    • Use web search only when the user asks for current, real-time, or recently updated information.
    • Do not use tools for general knowledge, math, programming help, or creative tasks.
    • Integrate search results naturally and concisely.

    Capabilities:
    • Communicate in English, Hausa, Yoruba, and Igbo depending on user input.
    • Help with writing tasks such as stories, poems, dialogue, and brainstorming, as long as they remain safe.
    • Explain technical topics, assist with coding, and guide through APIs.
    • Help with studying, simplifying concepts, translations, and generating practice questions.
    • Analyze user-provided data in a safe and non-sensitive context.
    
    TOOL EXECUTION SUMMARY:
    1. IMAGES: generate_image/edit_image → Call tool → STOP (system shows images)
    2. DOCUMENTS: generate_pdf_document/generate_word_document → Call tool → STOP (system provides download)
    3. WEB SEARCH: web_search/web_fetch → Call tool → Continue conversation with results
    4. All tools except web search: Your response ends after tool call

    You must always follow the Safety Requirements above when interacting with user content.
    "
    ];

    private array $voiceSystemInstruction = [
        'role' => 'system',
        'content' => "You are Kwati AI, built by the KwatiAi Labs team. You are a helpful, calm, and friendly voice assistant.

            Your responses are heard, not read. Speak naturally and conversationally. Keep sentences short and simple. Avoid technical jargon unless needed.

            Never use emojis, symbols, markdown, code blocks, asterisks, or any formatting. Only plain spoken text.

            User messages come from speech, so they may have errors or be casual. Understand the intent behind their words.

            Keep answers brief and to the point. One or two sentences is often enough. Only give longer explanations if asked.

            You have web search tools. Use them only when the user asks about:
            - Current events or news
            - Live data like weather, prices, or sports scores
            - Recent facts that change over time
            For everything else like general knowledge, math, coding help, creative writing, or analysis, answer directly without searching.

            You speak multiple languages including English, Hausa, Yoruba, and Igbo. Match the language the user is speaking.

            You help with:
            - Answering everyday questions
            - Explaining ideas simply
            - Helping with writing
            - Coding assistance
            - Translation
            - Friendly conversation

            If asked who made you or what powers you, say you were built by KwatiAi Labs. Do not mention other companies, APIs, or platforms.

            Be warm and human. Think of yourself as a knowledgeable friend having a conversation. Keep it simple and clear."
    ];


    public function __construct(
        SearchService $searchService,
        PythonDocumentGenerationService $documentGenerationService,
        ?SubscriptionService $subscriptionService = null
    )
    {
        $this->searchService = $searchService;
        $this->subscriptionService = $subscriptionService;
        $this->documentGenerationService = $documentGenerationService;
        // CHANGE THIS LINE:
        // $this->hfImageService = $hfImageService ?? app(HfImageService::class); // Old line
        $this->stabilityImageService = app(StabilityAIImageService::class); // New line
        // Also update the property declaration at the top of the class
        // Add this property: public StabilityAIImageService $stabilityImageService;

        $this->apiKey = config('services.grok.api_key');
        if (empty($this->apiKey)) {
            throw new \Exception('Grok API key is not configured');
        }
        $this->client = new Client([
            'timeout' => 60,
            'connect_timeout' => 10,
            'verify' => true,
        ]);
        $this->defaultLanguage = $this->getUserLanguage();
    }

    // Update getTools() method for Hugging Face models
    public function getTools(): array
    {
        return [
            [
                'type' => 'function',
                'function' => [
                    'name' => 'web_search',
                    'description' => 'Search the web for current information, news, facts, or any up-to-date data. Use this when you need recent information beyond your knowledge cutoff.',
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
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'generate_image',
                    'description' => 'Generate an image when the user explicitly asks to create images. Use Stability AI models for generation.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'user_prompt' => [
                                'type' => 'string',
                                'description' => 'The user\'s EXACT original prompt for image generation. Do not modify, enhance, or interpret it. Use it verbatim.'
                            ],
                            'number_of_images' => [
                                'type' => 'integer',
                                'description' => 'Number of images to generate (1-10)',
                                'default' => 1,
                                'minimum' => 1,
                                'maximum' => 10
                            ],
                            'model' => [
                                'type' => 'string',
                                'description' => 'Stability AI model to use for generation',
                                'enum' => ['sd3.5', 'sd3', 'sd3-turbo', 'sd-xl', 'stable-image-core', 'stable-image-ultra'],
                                'default' => 'sd3.5'
                            ],
                            'size' => [
                                'type' => 'string',
                                'description' => 'Size of generated images',
                                'enum' => ['512x512', '768x768', '1024x1024', '2048x2048'],
                                'default' => '1024x1024'
                            ]
                        ],
                        'required' => ['user_prompt']
                    ]
                ]
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'edit_image',
                    'description' => 'Edit or modify existing images when user uploads images and provides editing instructions.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'edit_prompt' => [
                                'type' => 'string',
                                'description' => 'Detailed instructions for how to edit the uploaded images'
                            ],
                            'model' => [
                                'type' => 'string',
                                'description' => 'Stability AI model for editing',
                                'enum' => ['sd3.5', 'sd3', 'stable-image-ultra'],
                                'default' => 'sd3.5'
                            ]
                        ],
                        'required' => ['edit_prompt']
                    ]
                ]
            ],
            // Add these to getTools() array:
            [
                'type' => 'function',
                'function' => [
                    'name' => 'generate_pdf_document',
                    'description' => 'Generate a PDF document with formatted content. Use when the user asks to create a PDF, report, or any document that needs to be easily readable and printable.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'title' => [
                                'type' => 'string',
                                'description' => 'Title of the document'
                            ],
                            'content' => [
                                'type' => 'string',
                                'description' => 'Main content of the document (can include markdown formatting like **bold**, *italic*, # headers, and lists)'
                            ],
                            'document_type' => [
                                'type' => 'string',
                                'description' => 'Type of document to generate',
                                'enum' => ['report', 'letter', 'essay', 'resume', 'business', 'academic', 'proposal', 'general'],
                                'default' => 'general'
                            ],
                            'include_header' => [
                                'type' => 'boolean',
                                'description' => 'Whether to include a header with title and date',
                                'default' => true
                            ],
                            'include_page_numbers' => [
                                'type' => 'boolean',
                                'description' => 'Whether to include page numbers',
                                'default' => true
                            ]
                        ],
                        'required' => ['title', 'content']
                    ]
                ]
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'generate_word_document',
                    'description' => 'Generate a Microsoft Word (.docx) document with formatted content. Use when the user specifically requests a Word document.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'title' => [
                                'type' => 'string',
                                'description' => 'Title of the document'
                            ],
                            'content' => [
                                'type' => 'string',
                                'description' => 'Main content of the document (can include markdown formatting - will be converted to Word formatting)'
                            ],
                            'document_type' => [
                                'type' => 'string',
                                'description' => 'Type of document to generate',
                                'enum' => ['report', 'letter', 'essay', 'resume', 'business', 'academic', 'proposal', 'general'],
                                'default' => 'general'
                            ]
                        ],
                        'required' => ['title', 'content']
                    ]
                ]
            ]
        ];
    }

    /**
     * Set the current user for personalization context
     *
     * @deprecated Chat personalization is disabled. This method is no longer used.
     */
    public function setUser(?User $user): self
    {
        // Personalization disabled - this method does nothing
        return $this;
    }

    /**
     * Get the current user
     *
     * @deprecated Chat personalization is disabled. This method is no longer used.
     */
    public function getUser(): ?User
    {
        return null; // Personalization disabled
    }

    /**
     * Log API usage to the database
     */
    private function logApiUsage(array $data): void
    {
        try {
            ApiUsageLog::logUsage($data);
        } catch (\Exception $e) {
            Log::error('Failed to log API usage: ' . $e->getMessage());
        }
    }

    /**
     * Estimate token count for messages (rough approximation)
     */
    private function estimateTokens(array $messages): int
    {
        $totalTokens = 0;

        foreach ($messages as $message) {
            if (is_string($message)) {
                // For simple string responses
                $totalTokens += ceil(strlen($message) / 4); // Rough approximation: 1 token ≈ 4 characters
            } elseif (is_array($message) && isset($message['content'])) {
                $content = $message['content'];
                if (is_string($content)) {
                    $totalTokens += ceil(strlen($content) / 4);
                } elseif (is_array($content)) {
                    // Handle multimodal content
                    foreach ($content as $item) {
                        if (isset($item['text'])) {
                            $totalTokens += ceil(strlen($item['text']) / 4);
                        }
                    }
                }
            }
        }

        return max(1, $totalTokens); // At least 1 token
    }


    /**
     * Get the API key (single key, no rotation)
     */
    private function getCurrentApiKey(): string
    {
        return $this->apiKey;
    }

    /**
     * Check if the current user can make a chat request
     * Returns null if allowed, or a structured limit response if not allowed
     */
    public function checkChatLimits(?User $user = null): ?array
    {
        if (!$this->subscriptionService) {
            return null; // Limit checking disabled if no subscription service
        }

        $userToCheck = $user ?? Auth::user();

        if (!$userToCheck) {
            // Unauthenticated user
            return LimitResponseService::unauthenticated();
        }

        // Check if user can make a request
        $canMakeRequest = $this->subscriptionService->canMakeRequest($userToCheck);

        if (!$canMakeRequest['allowed']) {
            return LimitResponseService::fromSubscriptionCheck($canMakeRequest, 'rate_limit_exceeded');
        }

        return null; // Allowed
    }

    /**
     * Check if the current user can generate images
     * Returns null if allowed, or a structured limit response if not allowed
     */
    private function checkImageAuthentication(): void
    {
        if (!Auth::check()) {
            throw new \Exception(
                '🔒 You must be logged in to generate images. ' .
                    'Please sign in to use this feature.'
            );
        }
    }


    /**
     * Check if the current user can use tokens
     * Returns null if allowed, or a structured limit response if not allowed
     */
    public function checkTokenLimits(int $tokensNeeded = 1, ?User $user = null): ?array
    {
        if (!$this->subscriptionService) {
            return null; // Limit checking disabled if no subscription service
        }

        $userToCheck = $user ?? Auth::user();

        if (!$userToCheck) {
            // Unauthenticated user
            return LimitResponseService::unauthenticated();
        }

        // Check if user can use tokens
        $canUseTokens = $this->subscriptionService->canUseTokens($userToCheck, $tokensNeeded);

        if (!$canUseTokens['allowed']) {
            return LimitResponseService::limitExceeded('token_limit_exceeded', $canUseTokens);
        }

        return null; // Allowed
    }

    /**
     * Enhanced streaming chat with automatic function (tool) calling
     */
    public function generateStreamingChat(
        string $prompt,
        callable $callback,
        string $model = 'grok-4',
        array $history = [],
        array $tools = [],
        ?array $format = null,
        bool $autoTools = true,
        array $files = [],
        ?string $customSystemPrompt = null,
        ?bool $callByName = false,
        ?string $userName = null,
        ?string $chatId = null
    ): void {
        $this->validateModel($model);
        $this->tools = is_array($tools) && !empty($tools) ? $tools : ($autoTools ? $this->getTools() : []);
        $detectedLanguage = $this->detectLanguage($prompt);
        if ($detectedLanguage !== $this->defaultLanguage && isset(self::SUPPORTED_LANGUAGES[$detectedLanguage])) {
            $this->setLanguage($detectedLanguage);
            Log::info("Temporarily switching from " . self::SUPPORTED_LANGUAGES[$this->defaultLanguage] . " to " . self::SUPPORTED_LANGUAGES[$detectedLanguage] . " for this message");
        }

        Log::info('reach endpint 1');
        // Chat personalization is enabled. Custom system prompt from user preferences is used if provided.
        // Default system prompt is used only if no custom prompt is provided.

        $messages = $this->formatMessages($prompt, $history, $files, 'text', $customSystemPrompt);
        Log::info('reach endpint 2');

        $payload = [
            'model' => $model,
            'messages' => $messages,
            'stream' => true
        ];
        Log::info('reach endpint 3');

        if (!empty($this->tools)) {
            $payload['tools'] = $this->tools;
            $payload['tool_choice'] = 'auto'; // As per xAI API docs for automatic tool calling
        }
        Log::info('reach endpint 4');

        if ($format !== null) {
            $payload['response_format'] = $format; // Adjusted to xAI/OpenAI-compatible key
        }

        Log::info('reach endpint5');

        $startTime = microtime(true);
        $inputTokens = $this->estimateTokens($messages);

        try {
            Log::info('Starting Grok API streaming request with tools: ' . (!empty($this->tools) ? 'enabled' : 'disabled'));
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
                'verify' => false,
            ]);

            // Process the streaming response and get token counts
            $result = $this->processStreamingResponse($response, $callback, $messages, $model, $chatId);
            $responseTime = (microtime(true) - $startTime) * 1000; // Convert to milliseconds

            // Log successful API usage
            $this->logApiUsage([
                'provider' => 'grok',
                'model' => $model,
                'endpoint' => $this->apiEndpoint,
                'input_tokens' => $inputTokens,
                'output_tokens' => $result['output_tokens'] ?? 0,
                'tokens' => $inputTokens + ($result['output_tokens'] ?? 0),
                'response_time' => round($responseTime),
                'status' => 'success',
                'metadata' => [
                    'has_tools' => !empty($this->tools),
                    'language' => $detectedLanguage,
                    'files_count' => count($files ?? [])
                ]
            ]);
        } catch (ClientException $e) {
            $responseTime = (microtime(true) - $startTime) * 1000;
            $responseBody = $e->getResponse()->getBody()->getContents();
            $statusCode = $e->getResponse()->getStatusCode();

            // Log error API usage
            $this->logApiUsage([
                'provider' => 'grok',
                'model' => $model,
                'endpoint' => $this->apiEndpoint,
                'input_tokens' => $inputTokens,
                'output_tokens' => 0,
                'tokens' => $inputTokens,
                'response_time' => round($responseTime),
                'status' => 'error',
                'error' => "HTTP {$statusCode}: " . $e->getMessage(),
                'metadata' => [
                    'error_details' => $responseBody,
                    'has_tools' => !empty($this->tools),
                    'language' => $detectedLanguage
                ]
            ]);

            Log::error("Grok API Error (Status: {$statusCode}): " . $e->getMessage());
            Log::error('Error Response Body: ' . $responseBody);
            throw new \Exception("its not you its me there was an issue");
        } catch (\Exception $e) {
            $responseTime = (microtime(true) - $startTime) * 1000;

            // Log general error API usage
            $this->logApiUsage([
                'provider' => 'grok',
                'model' => $model,
                'endpoint' => $this->apiEndpoint,
                'input_tokens' => $inputTokens,
                'output_tokens' => 0,
                'tokens' => $inputTokens,
                'response_time' => round($responseTime),
                'status' => 'error',
                'error' => $e->getMessage(),
                'metadata' => [
                    'has_tools' => !empty($this->tools),
                    'language' => $detectedLanguage
                ]
            ]);

            // Only log actual errors, not SSL warnings or certificate issues
            // if (!strpos($e->getMessage(), 'SSL') && !strpos($e->getMessage(), 'certificate') && !strpos($e->getMessage(), 'cURL')) {
            //     Log::error('Grok Streaming Error: ' . $e->getMessage());
            // }
            throw new \Exception($e->getMessage());

            // throw new \Exception("its not you its me there was an issue");
        }
    }

    /**
     * Process streaming response with function calling support
     */
    private function processStreamingResponse($response, callable $callback, array $messages, string $model, ?string $chatId = null): array
    {
        $stream = $response->getBody();
        $buffer = '';
        $fullResponse = '';
        $toolCalls = [];
        $outputTokens = 0;

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
                    $callback(['done' => true], false);
                    return ['output_tokens' => $this->estimateTokens([$fullResponse])];
                }
                try {
                    $decoded = json_decode($data, true);
                    // Log::debug('Decoded chunk: ' . json_encode($decoded));
                    // Handle tool calls (function calls in xAI API)
                    if (isset($decoded['choices'][0]['delta']['tool_calls']) && !empty($decoded['choices'][0]['delta']['tool_calls'])) {
                        $toolCalls = array_merge($toolCalls, $decoded['choices'][0]['delta']['tool_calls']);
                        $callback(['tool_status' => 'tool_calls_detected', 'tool_calls' => $toolCalls], false);
                    }
                    // If tool calls are complete, execute
                    if (isset($decoded['choices'][0]['finish_reason']) && $decoded['choices'][0]['finish_reason'] === 'tool_calls' && !empty($toolCalls)) {
                        $this->executeAndContinueToolCalls($toolCalls, $messages, $model, $callback, $chatId ? (int)$chatId : null);
                        return ['output_tokens' => $this->estimateTokens([$fullResponse])];
                    }
                    // Handle content
                    if (isset($decoded['choices'][0]['delta']['content'])) {
                        $content = $decoded['choices'][0]['delta']['content'];
                        $fullResponse .= $content;
                        $chunkData = ['content' => $content];
                        $callback($chunkData, false);
                    }
                    // Handle completion
                    if (isset($decoded['choices'][0]['finish_reason'])) {
                        $callback(['done' => true], false);
                        return ['output_tokens' => $this->estimateTokens([$fullResponse])];
                    }
                } catch (\Exception $e) {
                    throw new \Exception($e);

                    Log::debug('Problematic data: ' . $data);
                }
            }
        }
        if (!empty($buffer)) {
            Log::debug('Processing remaining buffer: ' . $buffer);
        }

        return ['output_tokens' => $this->estimateTokens([$fullResponse])];
    }

    /**
     * Execute tool calls and continue conversation
     */
    private function executeAndContinueToolCalls(array $toolCalls, array $messages, string $model, callable $callback, ?int $chatId = null): void
    {
        $shouldStopAfterTools = true;
        $callback(['tool_status' => 'executing_tools', 'count' => count($toolCalls)], false);
        $messages[] = [
            'role' => 'assistant',
            'tool_calls' => $toolCalls
        ];
        foreach ($toolCalls as $toolCall) {
            try {
                $functionName = $toolCall['function']['name'];
                $arguments = json_decode($toolCall['function']['arguments'], true);

                // Send tool-specific executing message
                $executingMessage = $this->getToolExecutingMessage($functionName);
                $callback([
                    'tool_status' => 'executing_tool',
                    'tool_name' => $functionName,
                    'tool_executing_message' => $executingMessage,
                    'tool_args' => $arguments
                ], false);
                Log::info("Executing tool: {$functionName} with args: " . json_encode($arguments));
                $result = $this->executeTool($functionName, $arguments, $chatId);
                $messages[] = [
                    'role' => 'tool',
                    'content' => json_encode($result),
                    'tool_call_id' => $toolCall['id']
                ];

                // Prepare tool completion data
                $toolCompletedData = [
                    'tool_status' => 'tool_completed',
                    'tool_name' => $functionName,
                    'result_summary' => $this->getToolResultSummary($functionName, $result),
                    'tool_result' => $result // Send full result for storage and display
                ];

                // For image generation, send image data to client
                if ($functionName === 'generate_image' && isset($result['images']) && !empty($result['images'])) {
                    $toolCompletedData['generated_images'] = $result['images'];
                }

                // For web search, send search results and references
                if ($functionName === 'web_search' && isset($result['results']) && !empty($result['results'])) {
                    $toolCompletedData['search_results'] = $result['results'];
                    $toolCompletedData['search_query'] = $result['query'];
                    $toolCompletedData['search_count'] = $result['result_count'];

                    // Send references as structured data
                    $references = [];
                    foreach ($result['results'] as $index => $item) {
                        $references[] = [
                            'index' => $index + 1,
                            'title' => $item['title'] ?? 'Untitled',
                            'url' => $item['url'] ?? '#',
                            'snippet' => $item['snippet'] ?? ''
                        ];
                    }
                    $toolCompletedData['references'] = $references;
                }

                $callback($toolCompletedData, false);
            } catch (\Exception $e) {
                $shouldStopAfterTools = false;
                // Only log actual errors, not SSL/certificate issues
                if (!strpos($e->getMessage(), 'SSL') && !strpos($e->getMessage(), 'certificate') && !strpos($e->getMessage(), 'cURL')) {
                    Log::error("Tool execution failed for {$functionName}: " . $e->getMessage());
                }

                // Check if this is a limit-related error that requires login
                $errorMsg = strtolower($e->getMessage());
                $isLimitError = false;
                $loginRequired = false;

                // Check for unauthenticated user errors or limit errors
                $hasLimitKeyword = strpos($errorMsg, 'limit') !== false || strpos($errorMsg, 'exceeded') !== false || strpos($errorMsg, 'not authenticated') !== false || strpos($errorMsg, 'unauthorized') !== false;
                $hasAuthKeyword = strpos($errorMsg, 'not authenticated') !== false || strpos($errorMsg, 'unauthorized') !== false || strpos($errorMsg, 'please login') !== false || strpos($errorMsg, 'please sign in') !== false;
                Log::info("Tool error analysis for login requirement: hasLimitKeyword={$hasLimitKeyword}, hasAuthKeyword={$hasAuthKeyword}");
                if ($hasLimitKeyword) {
                    $isLimitError = true;
                }

                // If it's a limit error AND user is not authenticated, set login_required
                if ($isLimitError && !Auth::check()) {
                    $loginRequired = true;
                } elseif ($hasAuthKeyword && !Auth::check()) {
                    // Even if not a limit error, if it mentions auth and user is not logged in
                    $loginRequired = true;
                }

                $messages[] = [
                    'role' => 'tool',
                    'content' => json_encode(['error' => $e->getMessage()]),
                    'tool_call_id' => $toolCall['id']
                ];
                $failedData = [
                    'tool_status' => 'tool_failed',
                    'tool_name' => $functionName,
                    'error' => $e->getMessage(),
                    'login_required' => $loginRequired,
                    'type' => $loginRequired ? 'unauthenticated' : 'error'
                ];

                $callback($failedData, false);
            }

            if (!in_array($functionName, ['generate_image', 'edit_image', 'generate_pdf_document', 'generate_word_document'], true)) {
                $shouldStopAfterTools = false;
            }
        }

        if ($shouldStopAfterTools) {
            $callback(['done' => true], false);
            return;
        }

        $this->continueConversationWithToolResults($messages, $model, $callback, $chatId);
    }

    /**
     * Continue conversation after tool execution
     */
    private function continueConversationWithToolResults(array $messages, string $model, callable $callback, ?int $chatId = null): void
    {
        $callback(['tool_status' => 'continuing_conversation'], false);
        $payload = [
            'model' => $model,
            'messages' => $messages,
            'stream' => true,
            'tools' => $this->tools,
            'tool_choice' => 'auto'
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
            $this->processStreamingResponse($response, $callback, $messages, $model, $chatId);
        } catch (\Exception $e) {
            Log::error('Error continuing conversation after tools: ' . $e->getMessage());
            $callback(['error' => 'Failed to continue after tool execution: ' . $e->getMessage()], false);
        }
    }

    // Update executeTool method for Hugging Face
    private function executeTool(string $functionName, array $arguments, ?int $chatId = null)
    {
        try {
            switch ($functionName) {
                case 'web_search':
                    $query = $arguments['query'];
                    $maxResults = min($arguments['max_results'] ?? 3, 5);
                    Log::info("Executing web search: {$query} (max: {$maxResults})");
                    $results = $this->searchService->search($query, $maxResults);
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
                        'fetch_timestamp' => now()->toISOString()
                    ];

                    if (($content['content_type'] ?? '') === 'pdf') {
                        $result['display_type'] = 'pdf_viewer';
                        $result['pdf_url'] = $url;
                    }

                    return $result;

                case 'generate_image':
                    return $this->handleImageGeneration($arguments, $chatId);

                case 'edit_image':
                    return $this->handleImageEdit($arguments, $chatId);
                case 'generate_pdf_document':
                    return $this->generatePdfDocument($arguments, $chatId);

                case 'generate_word_document':
                    return $this->generateWordDocument($arguments, $chatId);

                default:
                    throw new \Exception("This feature isn't available right now. 🛠️");
            }
        } catch (\Throwable $e) {
            Log::error("Tool execution failed for {$functionName}: " . $e->getMessage(), [
                'arguments' => $arguments,
                'chat_id' => $chatId,
                'trace' => $e->getTraceAsString()
            ]);

            // Re-throw user-friendly message
            throw new \Exception($e->getMessage());
        }
    }








    private function getToolExecutingMessage(string $toolName): string
    {
        switch ($toolName) {
            case 'web_search':
                return '🔍 Searching the web...';
            case 'web_fetch':
                return '📄 Fetching webpage...';
            case 'generate_image':
                return '🎨 Generating images...';
            case 'edit_image':
                return '✏️ Editing images...';
            case 'generate_pdf_document':
                return '📄 Creating PDF document...';
            case 'generate_word_document':
                return '📝 Creating Word document...';
            default:
                return '⚙️ Processing...';
        }
    }

    private function getToolResultSummary(string $toolName, array $result): string
    {
        switch ($toolName) {
            case 'web_search':
                $count = $result['result_count'] ?? 0;
                return "Found {$count} search results";
            case 'web_fetch':
                $title = $result['title'] ?? 'Unknown';
                return "Fetched: " . (strlen($title) > 30 ? substr($title, 0, 30) . '...' : $title);
            case 'generate_image':
                $count = $result['images_count'] ?? 0;
                return "Generated {$count} image" . ($count !== 1 ? 's' : '');
            case 'edit_image':
                $count = $result['output_images_count'] ?? 0;
                return "Edited {$count} image" . ($count !== 1 ? 's' : '');
            case 'generate_pdf_document':
            case 'generate_word_document':
                $title = $result['title'] ?? 'Document';
                $format = $result['format'] ?? ($toolName === 'generate_pdf_document' ? 'PDF' : 'Word');
                return "Created {$format}: " . (strlen($title) > 30 ? substr($title, 0, 30) . '...' : $title);
            default:
                return "Tool execution completed";
        }
    }


    /**
     * Generate a non-streaming chat response using Grok API
     */
    public function generateChat(string $prompt, string $model = 'grok-4', array $history = [], array $tools = [], ?array $format = null, array $files = [], ?string $customSystemPrompt = null, ?bool $callByName = false, ?string $userName = null, ?int $chatId = null): string
    {
        $this->validateModel($model);
        $detectedLanguage = $this->detectLanguage($prompt);
        if ($detectedLanguage !== $this->defaultLanguage && isset(self::SUPPORTED_LANGUAGES[$detectedLanguage])) {
            $this->setLanguage($detectedLanguage);
            Log::info("Temporarily switching from " . self::SUPPORTED_LANGUAGES[$this->defaultLanguage] . " to " . self::SUPPORTED_LANGUAGES[$detectedLanguage] . " for this message");
        }

        // Chat personalization is enabled. Custom system prompt from user preferences is used if provided.
        // Default system prompt is used only if no custom prompt is provided.

        $messages = $this->formatMessages($prompt, $history, $files, 'text', $customSystemPrompt);
        $payload = [
            'model' => $model,
            'messages' => $messages,
            'stream' => false
        ];
        $toolsToUse = is_array($tools) && !empty($tools) ? $tools : $this->getTools();
        if (!empty($toolsToUse)) {
            $payload['tools'] = $toolsToUse;
            $payload['tool_choice'] = 'auto';
        }
        if ($format !== null) {
            $payload['response_format'] = $format;
        }
        try {
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
            $result = json_decode($response->getBody()->getContents(), true);
            Log::debug('Non-streaming response received');
            if (isset($result['choices'][0]['message']['tool_calls']) && !empty($result['choices'][0]['message']['tool_calls'])) {
                Log::info('Tool calls detected in non-streaming response');
                return $this->handleToolCallsNonStreaming($result['choices'][0]['message']['tool_calls'], $messages, $model, $toolsToUse, $chatId);
            }
            return $result['choices'][0]['message']['content'] ?? 'Sorry, I received an unexpected response format.';
        } catch (\Exception $e) {
            Log::error('Grok Chat Error: ' . $e->getMessage());
            throw $e;
        }
    }


    /**
     * Handle tool calls for non-streaming responses
     */
    private function handleToolCallsNonStreaming(array $toolCalls, array $messages, string $model, array $tools, ?int $chatId = null): string
    {
        Log::info('Handling tool calls in non-streaming mode: ' . json_encode($toolCalls));
        $messages[] = [
            'role' => 'assistant',
            'tool_calls' => $toolCalls
        ];
        foreach ($toolCalls as $toolCall) {
            $functionName = $toolCall['function']['name'];
            $arguments = json_decode($toolCall['function']['arguments'], true);
            Log::info("Executing tool: {$functionName} with args: " . json_encode($arguments));
            try {
                $result = $this->executeTool($functionName, $arguments, $chatId);
                $messages[] = [
                    'role' => 'tool',
                    'content' => json_encode($result),
                    'tool_call_id' => $toolCall['id']
                ];
            } catch (\Exception $e) {
                // Only log actual errors, not SSL/certificate issues
                if (!strpos($e->getMessage(), 'SSL') && !strpos($e->getMessage(), 'certificate') && !strpos($e->getMessage(), 'cURL')) {
                    Log::error("Tool execution failed for {$functionName}: " . $e->getMessage());
                }
                $messages[] = [
                    'role' => 'tool',
                    'content' => json_encode(['error' => $e->getMessage()]),
                    'tool_call_id' => $toolCall['id']
                ];
            }
        }
        $payload = [
            'model' => $model,
            'messages' => $messages,
            'stream' => false,
            'tools' => $tools,
            'tool_choice' => 'auto'
        ];
        $response = $this->client->post($this->apiEndpoint, [
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->getCurrentApiKey()
            ],
            'json' => $payload
        ]);
        $result = json_decode($response->getBody()->getContents(), true);
        return $result['choices'][0]['message']['content'] ?? 'Tool execution completed, but no final response received.';
    }

    /**
     * Format messages for the API request
     */
    private function formatMessages(string $prompt, array $history = [], array $files = [], string $mode = 'text', ?string $customSystemPrompt = null): array
    {
        $messages = [];

        // Use custom system prompt if provided (from user's AI mode), otherwise use default
        if ($customSystemPrompt) {
            $messages[] = [
                'role' => 'system',
                'content' =>  $customSystemPrompt
            ];
        } else {
            $messages[] = $this->getSystemInstruction($mode);
        }
        $message[] = [
            'role' => 'system',
            'content' =>  'This current year is '  . date('Y') . 'the current month is '  . date('F') . ' and the current day is '  . date('d') . '.',
        ];

        $messages[] = $this->getLanguageMessage($this->defaultLanguage);
        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg['role'],
                'content' => $msg['content']
            ];
        }

        // Prepare user content with files if any
        $textContent = $prompt;
        $hasImages = false;
        if (!empty($files)) {
            foreach ($files as $file) {
                if (str_starts_with($file['type'], 'image/')) {
                    $hasImages = true;
                } else {
                    // Decode base64 data
                    $base64Data = str_replace('data:' . $file['type'] . ';base64,', '', $file['data']);
                    $decodedData = base64_decode($base64Data);
                    if (str_starts_with($file['type'], 'text/')) {
                        $content = $decodedData;
                    } elseif (in_array($file['type'], ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])) {
                        // Load Excel and extract text
                        $spreadsheet = IOFactory::loadFromString($decodedData);
                        $content = '';
                        foreach ($spreadsheet->getWorksheetIterator() as $worksheet) {
                            foreach ($worksheet->getRowIterator() as $row) {
                                $cellIterator = $row->getCellIterator();
                                $cellIterator->setIterateOnlyExistingCells(false);
                                foreach ($cellIterator as $cell) {
                                    $content .= $cell->getValue() . ' ';
                                }
                                $content .= "\n";
                            }
                        }
                    } else {
                        $content = $decodedData; // Fallback
                    }
                    $textContent .= "\n\nFile: " . $file['name'] . "\n" . $content;
                }
            }
        }
        if ($hasImages) {
            $userContent = [
                ['type' => 'text', 'text' => $textContent]
            ];
            foreach ($files as $file) {
                if (str_starts_with($file['type'], 'image/')) {
                    $userContent[] = [
                        'type' => 'image_url',
                        'image_url' => [
                            'url' => $file['data']
                        ]
                    ];
                }
            }
        } else {
            $userContent = $textContent;
        }

        $messages[] = [
            'role' => 'user',
            'content' => $userContent
        ];
        return $messages;
    }

    private function getSystemInstruction(string $mode = 'text'): array
    {
        if ($mode === 'voice') {
            return $this->voiceSystemInstruction;
        }

        return [
            'role' => 'system',
            'content' => "CRITICAL - IMAGE TOOL STOP INSTRUCTION:

When you execute generate_image or edit_image tools:
1. Make the tool call
2. Stop and do not write any response text
3. If the tool fails, explain the error briefly and stop
4. Never add extra commentary after a successful image tool call

CRITICAL - DOCUMENT TOOL STOP INSTRUCTION:

When a user asks for a document, report, proposal, letter, resume, PDF, DOCX, or Word file:
1. You must use a document tool
2. Generate the complete document content before the tool call
3. Pass the complete content as markdown in the content field
4. After a successful document tool call, stop immediately
5. Do not output the raw document text in chat after success
6. Do not add comments like 'Here is your document' or 'I created this for you'
7. If the tool fails, explain the error briefly and stop

DOCUMENT TOOL RULES:
- generate_pdf_document is the default for document requests unless the user explicitly asks for Word or DOCX
- generate_word_document is only for explicit Word or DOCX requests
- Always provide complete, professional, well-structured markdown content
- Preserve user-provided content while formatting it cleanly

You are a highly knowledgeable and concise AI assistant named Kwati Ai. Built By KwatiAi Team. You reply with a friendly and expressive tone and may use emojis.

Safety Requirements:
- Decline any request involving explicit sexual content, graphic violence, illegal activities, political persuasion, hateful behavior, or personal data extraction
- If a request falls into those categories, give a gentle and brief refusal
- Keep all content safe, non-graphic, and suitable for general audiences

Tool Usage:
- Use web search only when the user asks for current, real-time, or recently updated information
- Do not use tools for general knowledge, math, programming help, or creative tasks
- Integrate search results naturally and concisely

TOOL EXECUTION SUMMARY:
1. Images: generate_image/edit_image -> call tool -> stop
2. Documents: generate_pdf_document/generate_word_document -> call tool -> stop
3. Web search: web_search/web_fetch -> call tool -> continue with results
4. All tools except web search end the response after the tool call",
        ];
    }

    /**
     * Generate content for canvas editor
     */
    public function generateContent(string $prompt, string $language = 'plaintext', string $model = 'grok-4'): string
    {
        $this->validateModel($model);
        $systemMessage = "Generate content for $language. Provide only the generated content without explanations or code blocks.";
        $messages = [
            ['role' => 'system', 'content' => $systemMessage],
            ['role' => 'user', 'content' => $prompt]
        ];
        $payload = [
            'model' => $model,
            'messages' => $messages,
            'stream' => false,
            'temperature' => 0.7,
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
            Log::error('Generate content error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate a title for a chat conversation
     */
    public function generateTitle(string $prompt, string $model = 'grok-4'): string
    {
        $this->validateModel($model);
        $systemMessage = "You are Grok, generate a short, descriptive title (2-6 words) for this message.";
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
            $title = trim($title, " \t\n\r\0\x0B\"'");
            $title = preg_replace('/^["\'](.*)["\']$/', '$1', $title);
            return $title ?: 'New Chat';
        } catch (\Exception $e) {
            Log::error('Grok Title Generation Error: ' . $e->getMessage());
            return 'New Chat';
        }
    }

    /**
     * Get available models from Grok API
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
            return $result['data'] ?? []; // Adjusted for xAI API response format
        } catch (\Exception $e) {
            Log::error('Failed to fetch Grok models: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get all available Grok models
     */
    public function getAvailableModels(): array
    {
        return self::GROK_MODELS;
    }

    /**
     * Validate if a model exists
     */
    private function validateModel(string $model): void
    {
        if (!isset(self::GROK_MODELS[$model])) {
            throw new \InvalidArgumentException("Invalid Grok model: {$model}");
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
        foreach (self::LANG_PATTERNS as $lang => $pattern) {
            if (preg_match($pattern, $text)) {
                return $lang;
            }
        }
        return 'en';
    }

    /**
     * Get language-specific message
     */
    private function getLanguageMessage(string $language): array
    {
        $languageInstructions = [
            'ha' => "Ya kamata in amsa da Hausa.",
            'yo' => "Jọwọ dahun ni Yoruba.",
            'ig' => "Biko zaa m n'asụsụ Igbo.",
            'en' => ""
        ];
        return [
            'role' => 'system',
            'content' => $languageInstructions[$language] ?? ""
        ];
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
        return 'en';
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
            Log::error('Grok connection test failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get API key usage information (no limits with single key)
     */
    public function getApiKeyInfo(): array
    {
        return [
            'name' => 'Primary Grok API Key',
            'requests_used' => 'N/A (No rotation or limits enforced)',
            'request_limit' => 'Unlimited',
            'remaining_requests' => 'Unlimited',
            'last_used' => null // Could add tracking if needed
        ];
    }

    /**
     * Reset API key usage (not applicable with single key)
     */
    public function resetApiKeyUsage(): void
    {
        Log::info('API key usage reset not applicable for single key mode');
    }



    /**
     * Generate image and save to file system - MODIFIED to use OpenAI
     */

    public function generateVoiceMessage(string $prompt, array $history = [], string $model = 'grok-4-fast-non-reasoning'): string
    {
        $model = 'grok-4-fast-non-reasoning'; // Force voice-optimized model
        try {
            $this->validateModel($model);
            $detectedLanguage = $this->detectLanguage($prompt);

            if ($detectedLanguage !== $this->defaultLanguage && isset(self::SUPPORTED_LANGUAGES[$detectedLanguage])) {
                $this->setLanguage($detectedLanguage);
                Log::info("Temporarily switching from " . self::SUPPORTED_LANGUAGES[$this->defaultLanguage] . " to " . self::SUPPORTED_LANGUAGES[$detectedLanguage] . " for voice message");
            }

            // Format messages for voice mode
            $messages = $this->formatVoiceMessages($prompt, $history);

            $payload = [
                'model' => $model,
                'messages' => $messages,
                'stream' => false,
                'max_tokens' => 500, // Limit response length for voice
                'temperature' => 0.7,
            ];

            Log::info('Sending voice message to Grok API', [
                'model' => $model,
                'prompt_length' => strlen($prompt),
                'history_count' => count($history),
                'messages_count' => count($messages)
            ]);

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->getCurrentApiKey(),
                'User-Agent' => 'KwatiAi/1.0'
            ])->withoutVerifying()
                ->timeout(60)
                ->post($this->apiEndpoint, $payload);

            if ($response->failed()) {
                $errorBody = $response->body();
                $statusCode = $response->status();

                Log::error('Grok Voice Message API Error', [
                    'status' => $statusCode,
                    'response' => $errorBody,
                    'payload' => $payload
                ]);

                if ($statusCode === 422) {
                    throw new \Exception('Grok API: Invalid request format. Please check the message structure.');
                }

                throw new \Exception("Grok API error ($statusCode): " . $errorBody);
            }

            $result = $response->json();

            Log::debug('Voice message response received', [
                'has_choices' => isset($result['choices']),
                'choices_count' => count($result['choices'] ?? [])
            ]);

            if (!isset($result['choices'][0]['message']['content'])) {
                Log::error('Unexpected Grok API response format', $result);
                throw new \Exception('Unexpected response format from Grok API');
            }

            $content = $result['choices'][0]['message']['content'];

            Log::info("Grok voice response generated", [
                'response_length' => strlen($content),
                'response_preview' => substr($content, 0, 100) . '...'
            ]);

            return $content;
        } catch (\Exception $e) {
            Log::error('Grok Voice Message Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Format messages specifically for voice mode
     */
    private function formatVoiceMessages(string $prompt, array $history = []): array
    {
        $messages = [];

        // Use voice system instruction
        $messages[] = $this->voiceSystemInstruction;

        // Add language instruction
        $messages[] = $this->getLanguageMessage($this->defaultLanguage);

        // Add conversation history
        foreach ($history as $msg) {
            // Ensure history messages have the correct format
            if (is_array($msg) && isset($msg['role']) && isset($msg['content'])) {
                $messages[] = [
                    'role' => $msg['role'],
                    'content' => (string) $msg['content']
                ];
            }
        }

        // Add current user message
        $messages[] = [
            'role' => 'user',
            'content' => $prompt
        ];

        // Log the final message structure for debugging
        Log::debug('Formatted voice messages', [
            'total_messages' => count($messages),
            'last_message' => end($messages)
        ]);

        return $messages;
    }
    private function handleImageGeneration(array $arguments, ?int $chatId = null): array
    {
        try {
            $prompt = $arguments['user_prompt'];
            $numberOfImages = min(max($arguments['number_of_images'] ?? 1, 1), 10);
            $model = $arguments['model'] ?? 'sd3.5';
            $size = $arguments['size'] ?? '1024x1024';

            Log::info("Stability AI image generation requested", [
                'prompt' => substr($prompt, 0, 100),
                'count' => $numberOfImages,
                'model' => $model,
                'size' => $size,
                'chat_id' => $chatId
            ]);

            // Check if user can generate images
            $limitCheck = $this->checkImageLimits($numberOfImages);
            if ($limitCheck !== null) {
                throw new \Exception($limitCheck['message'] ?? 'Image generation limit exceeded');
            }

            // Use Stability AI image service
            $sizeParts = explode('x', $size);
            $width = $sizeParts[0] ?? 1024;
            $height = $sizeParts[1] ?? 1024;

            $imageResult = $this->stabilityImageService->generateImage(
                prompt: $prompt,
                model: $model,
                n: $numberOfImages,
                options: [
                    'width' => $width,
                    'height' => $height,
                    'steps' => 50,
                    'cfg_scale' => 7.0
                ]
            );

            if (!$imageResult['success'] || empty($imageResult['images'])) {
                throw new \Exception('Image generation failed. Please try again with a different prompt. 🎨');
            }

            // Save generated images
            $directory = 'user-content/generated/' . date('Y/m/d');
            $savedImages = $this->stabilityImageService->saveImagesToStorage(
                images: $imageResult['images'],
                directory: $directory,
                prompt: $prompt,
                chatId: $chatId,
                model: $model,
                operation: 'generate'
            );

            // Store images in chat
            if ($chatId) {
                $this->storeImagesInChat($chatId, array_merge($imageResult, ['saved_images' => $savedImages]), $prompt);
            }

            return [
                'success' => true,
                'prompt' => $prompt,
                'number_of_images' => $numberOfImages,
                'model' => $model,
                'size' => $size,
                'images' => $savedImages,
                'timestamp' => now()->toISOString(),
                'provider' => 'stability_ai',
                'type' => 'image_generation',
                'message' => 'Images generated successfully! 🎨',
                'user_message' => 'Here are your generated images!',
                'stop_generation' => true
            ];
        } catch (\Exception $e) {
            Log::error('Stability AI image generation error: ' . $e->getMessage(), [
                'arguments' => $arguments,
                'chat_id' => $chatId
            ]);

            throw new \Exception($e->getMessage());
        }
    }

    private function handleImageEdit(array $arguments, ?int $chatId = null): array
    {
        try {
            $editPrompt = $arguments['edit_prompt'];
            $model = $arguments['model'] ?? 'stable-image-ultra';

            Log::info("Stability AI image edit requested", [
                'edit_prompt' => substr($editPrompt, 0, 100),
                'model' => $model,
                'chat_id' => $chatId
            ]);

            // Check if user can generate images
            $limitCheck = $this->checkImageLimits(1);
            if ($limitCheck !== null) {
                throw new \Exception($limitCheck['message'] ?? 'Image editing limit exceeded');
            }

            // Get uploaded files
            $uploadedFiles = request()->input('files', []);
            if (empty($uploadedFiles)) {
                throw new \Exception('📸 Please upload images first, then tell me how you want them edited!');
            }

            // Process uploaded files
            $processedFiles = $this->stabilityImageService->processUploadedFiles($uploadedFiles);
            if (empty($processedFiles)) {
                throw new \Exception('No valid images were uploaded. Please upload PNG, JPEG, or WebP images under 10MB. 📁');
            }

            // Extract temp paths
            $imagePaths = array_column($processedFiles, 'temp_path');

            // Edit images using Stability AI
            $editResult = $this->stabilityImageService->editImages(
                imagePaths: $imagePaths,
                prompt: $editPrompt,
                model: $model,
                options: [
                    'strength' => 0.8,
                    'steps' => 50,
                    'cfg_scale' => 7.0,
                    // ADD THIS:
                    'search_prompt' => 'original image' // or extract from user input if available
                ]
            );

            // Clean up temp files
            $this->stabilityImageService->cleanupTempFiles($processedFiles);

            if (!$editResult['success'] || empty($editResult['images'])) {
                throw new \Exception('Image editing failed. Please try again with different instructions. ✏️');
            }

            // Save edited images
            $directory = 'user-content/edited/' . date('Y/m/d');
            $savedImages = $this->stabilityImageService->saveImagesToStorage(
                images: $editResult['images'],
                directory: $directory,
                prompt: $editPrompt,
                chatId: $chatId,
                model: $model,
                operation: 'edit',
                metadata: [
                    'original_images' => array_map('basename', $imagePaths),
                    'input_count' => count($imagePaths)
                ]
            );

            // Store in chat
            $this->storeEditedImagesInChat($chatId, $savedImages, $editPrompt, 'edit');

            return [
                'success' => true,
                'edit_prompt' => $editPrompt,
                'input_images_count' => count($imagePaths),
                'output_images_count' => count($savedImages),
                'images' => $savedImages,
                'model' => $model,
                'timestamp' => now()->toISOString(),
                'provider' => 'stability_ai',
                'type' => 'image_edit',
                'message' => 'Images edited successfully! 🎨',
                'user_message' => 'Here are your edited images!',
                'stop_generation' => true
            ];
        } catch (\Exception $e) {
            // Clean up any temp files on error
            if (isset($processedFiles)) {
                $this->stabilityImageService->cleanupTempFiles($processedFiles);
            }

            Log::error('Stability AI image editing error: ' . $e->getMessage(), [
                'arguments' => $arguments,
                'chat_id' => $chatId
            ]);

            throw new \Exception($e->getMessage());
        }
    }



    /**
     * Store edited images in chat
     */
    private function storeEditedImagesInChat(?int $chatId, array $images, string $prompt, string $operation): void
    {
        if (!$chatId || empty($images)) {
            return;
        }

        try {
            $chat = \App\Models\Chat::find($chatId);
            if (!$chat) {
                Log::debug("Skipping image storage: chat not found for edited images", ['chat_id' => $chatId]);
                return;
            }

            foreach ($images as $index => $image) {
                $chat->conversation->chats()->create([
                    'message' => "I've {$operation}ed your image: {$prompt}",
                    'role' => 'assistant',
                    'type' => 'image',
                    'metadata' => [
                        'image_url' => $image['url'] ?? '',
                        'image_storage_url' => $image['storage_url'] ?? $image['url'] ?? '',
                        'filename' => $image['filename'] ?? '',
                        'original_prompt' => $prompt,
                        'model' => $image['metadata']['model'] ?? 'unknown',
                        'provider' => 'huggingface',
                        'operation' => $operation,
                        'image_index' => $index + 1,
                        'total_images' => count($images),
                        'original_images' => $image['original_images'] ?? [],
                        'original_image' => $image['original_image'] ?? '',
                        'size' => '1024x1024',
                        'edited_at' => now()->toISOString()
                    ]
                ]);
            }

            Log::info("Stored {$operation} images in chat", [
                'chat_id' => $chatId,
                'count' => count($images),
                'prompt' => $prompt,
                'operation' => $operation
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to store {$operation} images in chat", [
                'chat_id' => $chatId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Store generated images in chat
     */
    private function storeImagesInChat(int $chatId, array $imageResult, string $prompt): void
    {
        try {
            $chat = \App\Models\Chat::find($chatId);
            if (!$chat) {
                Log::debug("Skipping image storage: chat not found", ['chat_id' => $chatId]);
                return;
            }

            $images = $imageResult['saved_images'] ?? $imageResult['images'] ?? [];

            foreach ($images as $index => $image) {
                $chat->conversation->chats()->create([
                    'message' => "I've generated an image for you: {$prompt}",
                    'role' => 'assistant',
                    'type' => 'image',
                    'metadata' => [
                        'image_url' => $image['url'] ?? '',
                        'image_filename' => $image['filename'] ?? '',
                        'revised_prompt' => $image['revised_prompt'] ?? $prompt,
                        'original_prompt' => $prompt,
                        'model' => $imageResult['model'] ?? 'unknown',
                        'provider' => 'huggingface',
                        'generation_id' => $imageResult['generation_id'] ?? uniqid('hf_', true),
                        'image_index' => $index + 1,
                        'total_images' => count($images),
                        'size' => $image['metadata']['width'] ?? '1024x1024',
                        'generated_at' => now()->toISOString()
                    ]
                ]);
            }

            Log::info("Stored images in chat", [
                'chat_id' => $chatId,
                'count' => count($images),
                'generation_id' => $imageResult['generation_id'] ?? null
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to store images in chat", [
                'chat_id' => $chatId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Generate images using Hugging Face
     */
    public function generateImage(
        string $prompt,
        int $n = 1,
        string $model = 'black-forest-labs/FLUX.1-dev',
        string $size = '1024x1024'
    ): array {
        try {
            // Check limits first
            $limitCheck = $this->checkImageLimits($n);
            if ($limitCheck !== null) {
                throw new \Exception($limitCheck['message'] ?? 'Image generation limit exceeded');
            }

            // Use Hugging Face image service
            return $this->stabilityImageService->generateImage(
                prompt: $prompt,
                model: $model,
                n: $n,
                options: [
                    'width' => explode('x', $size)[0] ?? 1024,
                    'height' => explode('x', $size)[1] ?? 1024
                ]
            );
        } catch (\Exception $e) {
            Log::error('Hugging Face Image Generation Error via Grok Service: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate image and save to file system
     */
    /**
     * Generate image and save to file system
     */
    public function generateImageAndSave(
        string $prompt,
        string $directory = '/user-content/images',
        int $n = 1,
        ?int $chatId = null,
        string $model = 'sd3.5',
        string $size = '1024x1024'
    ): array {
        try {
            // Parse size
            $sizeParts = explode('x', $size);
            $width = $sizeParts[0] ?? 1024;
            $height = $sizeParts[1] ?? 1024;

            // Use Stability AI image service
            return $this->stabilityImageService->generateAndSave(
                prompt: $prompt,
                directory: $directory,
                n: $n,
                chatId: $chatId,
                options: [
                    'model' => $model,
                    'width' => $width,
                    'height' => $height,
                    'steps' => 50,
                    'cfg_scale' => 7.0
                ]
            );
        } catch (\Exception $e) {
            Log::error('Stability AI Generate and Save Error via Grok Service: ' . $e->getMessage());
            throw $e;
        }
    }

    // Keep all other existing methods unchanged (they should work as-is)
    // Only the image-related methods have been updated

    /**
     * Check if the current user can generate images
     */
    public function checkImageLimits(int $count = 1, ?User $user = null): ?array
    {
        $userToCheck = $user ?? Auth::user();

        if (!$userToCheck) {
            return LimitResponseService::unauthenticated();
        }

        if (!$this->subscriptionService) {
            return null;
        }

        // Check if user can generate images
        $canGenerateImages = $this->subscriptionService->canGenerateImages($userToCheck, $count);

        if (!$canGenerateImages['allowed']) {
            return LimitResponseService::fromSubscriptionCheck($canGenerateImages, 'image_limit_exceeded');
        }

        return null;
    }

    /**
     * Generate Word document using Laravel Str::markdown()
     */
    private function generateWordDocument(array $arguments, ?int $chatId = null): array
    {
        try {
            $title = $arguments['title'] ?? 'Document';
            $content = $arguments['content'] ?? '';
            $documentType = $arguments['document_type'] ?? 'general';

            Log::info('Python Word document generation requested', [
                'title' => $title,
                'document_type' => $documentType,
                'content_length' => strlen($content),
                'chat_id' => $chatId
            ]);

            $limitCheck = $this->checkDocumentLimits();
            if ($limitCheck !== null) {
                throw new \Exception($limitCheck['message'] ?? 'Document generation limit exceeded');
            }

            $result = $this->documentGenerationService->generateDocument(
                title: $title,
                contentMarkdown: $content,
                format: 'docx',
                documentType: $documentType,
                options: [
                    'formatting' => $arguments['formatting'] ?? [],
                ],
            );

            return [
                'success' => true,
                'title' => $result['title'],
                'filename' => $result['filename'],
                'url' => $result['url'],
                'path' => $result['path'],
                'format' => $result['format'],
                'mime_type' => $result['mime_type'],
                'document_type' => $result['document_type'],
                'size' => $result['size'],
                'generated_at' => $result['generated_at'],
                'timestamp' => $result['generated_at'],
                'type' => 'word_document',
                'stop_generation' => true
            ];
        } catch (\Exception $e) {
            Log::error('Python Word document generation error: ' . $e->getMessage(), [
                'arguments' => $arguments,
                'chat_id' => $chatId
            ]);

            throw new \Exception('Failed to generate DOCX: ' . $e->getMessage());
        }
    }

    /**
     * Generate PDF document using DomPDF (Laravel way)
     */
    public function generatePdfDocument(array $arguments, ?int $chatId = null): array
    {
        try {
            $title = $arguments['title'] ?? 'Document';
            $content = $arguments['content'] ?? '';
            $documentType = $arguments['document_type'] ?? 'general';

            Log::info('Python PDF document generation requested', [
                'title' => $title,
                'document_type' => $documentType,
                'content_length' => strlen($content),
                'chat_id' => $chatId
            ]);

            $limitCheck = $this->checkDocumentLimits();
            if ($limitCheck !== null) {
                throw new \Exception($limitCheck['message'] ?? 'Document generation limit exceeded');
            }

            $result = $this->documentGenerationService->generateDocument(
                title: $title,
                contentMarkdown: $content,
                format: 'pdf',
                documentType: $documentType,
                options: [
                    'include_header' => $arguments['include_header'] ?? true,
                    'include_page_numbers' => $arguments['include_page_numbers'] ?? true,
                    'formatting' => $arguments['formatting'] ?? [],
                ],
            );

            return [
                'success' => true,
                'title' => $result['title'],
                'filename' => $result['filename'],
                'url' => $result['url'],
                'path' => $result['path'],
                'format' => $result['format'],
                'mime_type' => $result['mime_type'],
                'document_type' => $result['document_type'],
                'size' => $result['size'],
                'generated_at' => $result['generated_at'],
                'timestamp' => $result['generated_at'],
                'type' => 'pdf_document',
                'stop_generation' => true
            ];
        } catch (\Exception $e) {
            Log::error('Python PDF generation error: ' . $e->getMessage());
            throw new \Exception('Failed to generate PDF: ' . $e->getMessage());
        }
    }

    /**
     * Check document generation limits
     */
    public function checkDocumentLimits(?User $user = null): ?array
    {
        $userToCheck = $user ?? Auth::user();

        if (!$userToCheck) {
            return LimitResponseService::unauthenticated();
        }

        if (!$this->subscriptionService) {
            return null;
        }

        // Check if user can generate documents
        $canGenerateDocs = $this->subscriptionService->canGenerateDocuments($userToCheck, 1);

        if (!$canGenerateDocs['allowed']) {
            return LimitResponseService::fromSubscriptionCheck($canGenerateDocs, 'document_limit_exceeded');
        }

        return null;
    }
}
