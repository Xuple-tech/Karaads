<?php

namespace App\Services;

use App\Services\Grok\LanguageDetector;
use App\Services\Grok\AssetWorkflowService;
use App\Services\Grok\ChatTransportService;
use App\Services\Grok\MessageFormatter;
use App\Services\Grok\ToolRegistry;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use App\Models\User;

use Illuminate\Support\Facades\Auth;
use App\Services\LimitResponseService;

class GrokApiService
{
    private ?string $apiKey;
    private array $tools = [];
    private string $apiEndpoint = 'https://api.x.ai/v1/chat/completions';
    private string $modelsEndpoint = 'https://api.x.ai/v1/models';
    private Client $client;
    private string $defaultLanguage = 'en';
    private ?SubscriptionService $subscriptionService = null;
    private AssetWorkflowService $assetWorkflowService;
    private ChatTransportService $chatTransportService;
    private LanguageDetector $languageDetector;
    private MessageFormatter $messageFormatter;
    private ToolRegistry $toolRegistry;

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

    public function __construct(
        AssetWorkflowService $assetWorkflowService,
        ChatTransportService $chatTransportService,
        LanguageDetector $languageDetector,
        MessageFormatter $messageFormatter,
        ToolRegistry $toolRegistry,
        ?SubscriptionService $subscriptionService = null
    )
    {
        $this->subscriptionService = $subscriptionService;
        $this->assetWorkflowService = $assetWorkflowService;
        $this->chatTransportService = $chatTransportService;
        $this->languageDetector = $languageDetector;
        $this->messageFormatter = $messageFormatter;
        $this->toolRegistry = $toolRegistry;

        $this->apiKey = config('services.grok.api_key');
        $this->client = new Client([
            'timeout' => 0,
            'connect_timeout' => 30,
            'verify' => config('services.grok.verify_ssl', true),
        ]);
        $this->defaultLanguage = $this->getUserLanguage();
        $this->languageDetector->setLanguage($this->defaultLanguage);
    }

    public function getTools(): array
    {
        return $this->toolRegistry->getTools();
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
     * Get the API key (single key, no rotation)
     */
    private function getCurrentApiKey(): string
    {
        if (empty($this->apiKey)) {
            throw new \Exception('Grok API key is not configured. Add GROK_API_KEY to your .env file.');
        }
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
        $filesForMessages = $this->filesForModelMessages($prompt, $files, $history);
        $model = $this->ensureVisionCapableModel($model, $filesForMessages);
        $this->tools = is_array($tools) && !empty($tools) ? $tools : ($autoTools ? $this->getTools() : []);
        $detectedLanguage = $this->detectLanguage($prompt);
        $this->applyDetectedLanguage($detectedLanguage, 'this message');

        $messages = $this->formatMessages($prompt, $history, $filesForMessages, 'text', $customSystemPrompt);

        $this->chatTransportService->generateStreamingChat(
            client: $this->client,
            apiEndpoint: $this->apiEndpoint,
            apiKey: $this->getCurrentApiKey(),
            supportedModels: self::GROK_MODELS,
            tools: $this->tools,
            prompt: $prompt,
            messages: $messages,
            callback: $callback,
            model: $model,
            format: $format,
            files: $files,
            chatId: $chatId,
            detectedLanguage: $detectedLanguage,
        );
    }

    /**
     * Generate a non-streaming chat response using Grok API
     */
    public function generateChat(string $prompt, string $model = 'grok-4', array $history = [], array $tools = [], ?array $format = null, array $files = [], ?string $customSystemPrompt = null, ?bool $callByName = false, ?string $userName = null, ?int $chatId = null): string
    {
        $filesForMessages = $this->filesForModelMessages($prompt, $files, $history);
        $model = $this->ensureVisionCapableModel($model, $filesForMessages);
        $detectedLanguage = $this->detectLanguage($prompt);
        $this->applyDetectedLanguage($detectedLanguage, 'this message');

        // Chat personalization is enabled. Custom system prompt from user preferences is used if provided.
        // Default system prompt is used only if no custom prompt is provided.

        $messages = $this->formatMessages($prompt, $history, $filesForMessages, 'text', $customSystemPrompt);
        $toolsToUse = is_array($tools) && !empty($tools) ? $tools : $this->getTools();

        return $this->chatTransportService->generateChat(
            client: $this->client,
            apiEndpoint: $this->apiEndpoint,
            apiKey: $this->getCurrentApiKey(),
            supportedModels: self::GROK_MODELS,
            messages: $messages,
            toolsToUse: $toolsToUse,
            model: $model,
            format: $format,
            chatId: $chatId,
        );
    }

    /**
     * Format messages for the API request
     */
    private function formatMessages(string $prompt, array $history = [], array $files = [], string $mode = 'text', ?string $customSystemPrompt = null): array
    {
        $this->languageDetector->setLanguage($this->defaultLanguage);

        return $this->messageFormatter->formatMessages($prompt, $history, $files, $mode, $customSystemPrompt);
    }

    private function ensureVisionCapableModel(string $model, array $files): string
    {
        $hasImage = collect($files)->contains(
            fn (array $file): bool => str_starts_with((string) ($file['type'] ?? ''), 'image/')
        );

        if (!$hasImage) {
            return $model;
        }

        return (self::GROK_MODELS[$model]['supports_vision'] ?? false) ? $model : 'grok-4';
    }

    private function filesForModelMessages(string $prompt, array $files, array $history = []): array
    {
        if (!$this->isPowerPointLogoRequest($prompt, $files, $history)) {
            return $files;
        }

        // The PowerPoint tool receives the original files separately and embeds the
        // logo itself. Sending logos to the vision API can reject valid branding
        // assets before the tool has a chance to run.
        return collect($files)
            ->reject(fn (array $file): bool => str_starts_with((string) ($file['type'] ?? ''), 'image/'))
            ->values()
            ->all();
    }

    private function isPowerPointLogoRequest(string $prompt, array $files, array $history = []): bool
    {
        $hasImage = collect($files)->contains(
            fn (array $file): bool => str_starts_with((string) ($file['type'] ?? ''), 'image/')
        );

        if (!$hasImage) {
            return false;
        }

        $normalizedPrompt = strtolower($prompt);
        $historyText = strtolower(collect($history)
            ->pluck('content')
            ->filter(fn ($content): bool => is_string($content))
            ->implode("\n"));

        $mentionsPresentation = str_contains($normalizedPrompt, 'powerpoint')
            || str_contains($normalizedPrompt, 'ppt')
            || str_contains($normalizedPrompt, 'slide')
            || str_contains($normalizedPrompt, 'presentation')
            || str_contains($normalizedPrompt, 'deck')
            || str_contains($historyText, 'previous powerpoint generation context')
            || str_contains($historyText, 'generate_powerpoint_presentation')
            || str_contains($historyText, '.pptx');

        $mentionsLogo = str_contains($normalizedPrompt, 'logo')
            || str_contains($normalizedPrompt, 'brand')
            || str_contains($normalizedPrompt, 'branding')
            || str_contains($normalizedPrompt, 'add it up');

        return $mentionsPresentation && $mentionsLogo;
    }

    /**
     * Generate content for canvas editor
     */
    public function generateContent(string $prompt, string $language = 'plaintext', string $model = 'grok-4'): string
    {
        return $this->chatTransportService->generateContent(
            client: $this->client,
            apiEndpoint: $this->apiEndpoint,
            apiKey: $this->getCurrentApiKey(),
            supportedModels: self::GROK_MODELS,
            prompt: $prompt,
            language: $language,
            model: $model,
        );
    }

    /**
     * Generate a title for a chat conversation
     */
    public function generateTitle(string $prompt, string $model = 'grok-4'): string
    {
        return $this->chatTransportService->generateTitle(
            client: $this->client,
            apiEndpoint: $this->apiEndpoint,
            apiKey: $this->getCurrentApiKey(),
            supportedModels: self::GROK_MODELS,
            prompt: $prompt,
            model: $model,
        );
    }

    /**
     * Get available models from Grok API
     */
    public function fetchAvailableModels(): array
    {
        return $this->chatTransportService->fetchAvailableModels(
            client: $this->client,
            modelsEndpoint: $this->modelsEndpoint,
            apiKey: $this->getCurrentApiKey(),
        );
    }

    /**
     * Get all available Grok models
     */
    public function getAvailableModels(): array
    {
        return self::GROK_MODELS;
    }

    /**
     * Set the language for responses
     */
    public function setLanguage(string $language): void
    {
        $this->languageDetector->setLanguage($language);
        $this->defaultLanguage = $this->languageDetector->getLanguage();
    }

    /**
     * Detect language from input text
     */
    private function detectLanguage(string $text): string
    {
        return $this->languageDetector->detect($text);
    }

    /**
     * Get user's preferred language or default to English
     */
    private function getUserLanguage(): string
    {
        return $this->languageDetector->getUserLanguage();
    }

    /**
     * Test API connectivity
     */
    public function testConnection(): bool
    {
        return $this->chatTransportService->testConnection(
            client: $this->client,
            modelsEndpoint: $this->modelsEndpoint,
            apiKey: $this->getCurrentApiKey(),
        );
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
    public function generateVoiceMessage(string $prompt, array $history = [], string $model = 'grok-4-fast-non-reasoning'): string
    {
        $detectedLanguage = $this->detectLanguage($prompt);
        $this->applyDetectedLanguage($detectedLanguage, 'voice message');
        $messages = $this->formatVoiceMessages($prompt, $history);

        return $this->chatTransportService->generateVoiceMessage(
            apiEndpoint: $this->apiEndpoint,
            apiKey: $this->getCurrentApiKey(),
            supportedModels: self::GROK_MODELS,
            prompt: $prompt,
            messages: $messages,
            model: $model,
        );
    }

    /**
     * Format messages specifically for voice mode
     */
    private function formatVoiceMessages(string $prompt, array $history = []): array
    {
        $this->languageDetector->setLanguage($this->defaultLanguage);

        return $this->messageFormatter->formatVoiceMessages($prompt, $history);
    }

    private function applyDetectedLanguage(string $detectedLanguage, string $context): void
    {
        if ($detectedLanguage === $this->defaultLanguage || !$this->languageDetector->isSupported($detectedLanguage)) {
            return;
        }

        $previousLanguage = $this->defaultLanguage;
        $this->setLanguage($detectedLanguage);

        $supportedLanguages = $this->languageDetector->getSupportedLanguages();
        Log::info(
            "Temporarily switching from " . ($supportedLanguages[$previousLanguage] ?? $previousLanguage) .
            " to " . ($supportedLanguages[$detectedLanguage] ?? $detectedLanguage) .
            " for {$context}"
        );
    }
    public function generateImage(
        string $prompt,
        int $n = 1,
        string $model = 'black-forest-labs/FLUX.1-dev',
        string $size = '1024x1024'
    ): array {
        return $this->assetWorkflowService->generateImage($prompt, $n, $model, $size);
    }

    public function generateImageAndSave(
        string $prompt,
        string $directory = '/user-content/images',
        int $n = 1,
        ?int $chatId = null,
        string $model = 'sd3.5',
        string $size = '1024x1024'
    ): array {
        return $this->assetWorkflowService->generateImageAndSave($prompt, $directory, $n, $chatId, $model, $size);
    }

    public function checkImageLimits(int $count = 1, ?User $user = null): ?array
    {
        return $this->assetWorkflowService->checkImageLimits($count, $user);
    }

    private function generateWordDocument(array $arguments, ?int $chatId = null): array
    {
        return $this->assetWorkflowService->generateWordDocument($arguments, $chatId);
    }

    public function generatePdfDocument(array $arguments, ?int $chatId = null): array
    {
        return $this->assetWorkflowService->generatePdfDocument($arguments, $chatId);
    }

    public function checkDocumentLimits(?User $user = null): ?array
    {
        return $this->assetWorkflowService->checkDocumentLimits($user);
    }
}
