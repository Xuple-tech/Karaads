<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use App\Models\ApiUsageLog;
use App\Models\ImageGeneration;
use App\Models\User;
use App\Services\LimitResponseService;

class GrokImageService
{
    private ?string $apiKey;
    private string $apiEndpoint = 'https://api.x.ai/v1/images/generations';
    private Client $client;
    private ?SubscriptionService $subscriptionService = null;

    // Available GROK image models
    private const IMAGE_MODELS = [
        'grok-2-image' => [
            'name' => 'GROK 2 Image',
            'max_images' => 10,
            'size_options' => ['1024x1024', '1792x1024', '1024x1792'],
            'description' => 'High-quality image generation with GROK 2',
            'format' => 'jpg'
        ]
    ];

    public function __construct(?SubscriptionService $subscriptionService = null)
    {
        $this->subscriptionService = $subscriptionService;
        $this->apiKey = config('services.grok.api_key');

        if (empty($this->apiKey)) {
            throw new \Exception('GROK API key is not configured');
        }

        $this->client = new Client([
            'timeout' => 120,
            'connect_timeout' => 30,
            'verify' => false,
        ]);
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
     * Check if the current user can generate images
     */
    public function checkImageLimits(int $count = 1, ?User $user = null): ?array
    {
        if (!$this->subscriptionService) {
            return null;
        }

        $user = $user ?? Auth::user();
        if (!$user) {
            return [
                'can_generate' => false,
                'message' => 'User not authenticated. Please login to generate images.',
                'type' => 'unauthenticated'
            ];
        }

        try {
            $this->subscriptionService->checkImageLimits($user, $count);
            return null; // No limits exceeded
        } catch (\Exception $e) {
            return [
                'can_generate' => false,
                'message' => $e->getMessage(),
                'type' => 'limit_exceeded'
            ];
        }
    }

    /**
     * Generate image using GROK API
     */
    public function generateImage(
        string $prompt,
        string $model = 'grok-2-image',
        int $n = 1,
        string $size = '1024x1024'
    ): array {
        try {
            $startTime = microtime(true);

            // Validate model
            if (!isset(self::IMAGE_MODELS[$model])) {
                throw new \Exception("Unsupported model: {$model}");
            }

            // Validate number of images
            $maxImages = self::IMAGE_MODELS[$model]['max_images'];
            if ($n > $maxImages) {
                throw new \Exception("Maximum {$maxImages} images allowed for model {$model}");
            }

            // Validate size
            $validSizes = self::IMAGE_MODELS[$model]['size_options'];
            if (!in_array($size, $validSizes)) {
                throw new \Exception("Invalid size {$size} for model {$model}. Valid sizes: " . implode(', ', $validSizes));
            }

            $payload = [
                'model' => $model,
                'prompt' => $prompt,
                'n' => $n,
                'size' => $size,
                'response_format' => 'b64_json'
            ];

            Log::info('GROK Image Generation Request', [
                'model' => $model,
                'prompt' => substr($prompt, 0, 100) . (strlen($prompt) > 100 ? '...' : ''),
                'n' => $n,
                'size' => $size,
                'user_id' => Auth::id()
            ]);

            $response = $this->client->post($this->apiEndpoint, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Content-Type' => 'application/json',
                ],
                'json' => $payload,
                'timeout' => 120
            ]);

            $responseData = json_decode($response->getBody()->getContents(), true);
            $endTime = microtime(true);
            $duration = round(($endTime - $startTime) * 1000, 2);

            if (!isset($responseData['data']) || empty($responseData['data'])) {
                throw new \Exception('No image data received from GROK API');
            }

            // Log successful API usage
            $this->logApiUsage([
                'service' => 'grok_image',
                'model' => $model,
                'prompt_tokens' => 0, // GROK doesn't provide token count for images
                'completion_tokens' => 0,
                'total_tokens' => 0,
                'cost' => 0, // Calculate based on your pricing
                'user_id' => Auth::id(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'response_time_ms' => $duration,
                'images_generated' => count($responseData['data']),
                'success' => true
            ]);

            return [
                'success' => true,
                'model' => $model,
                'prompt' => $prompt,
                'images' => $responseData['data'],
                'created' => $responseData['created'] ?? time(),
                'duration_ms' => $duration
            ];

        } catch (ClientException $e) {
            $statusCode = $e->getResponse()->getStatusCode();
            $errorBody = $e->getResponse()->getBody()->getContents();
            $errorData = json_decode($errorBody, true);

            $errorMessage = $errorData['error']['message'] ?? 'GROK API error';

            Log::error('GROK Image Generation Error', [
                'status_code' => $statusCode,
                'error' => $errorMessage,
                'prompt' => substr($prompt, 0, 100),
                'user_id' => Auth::id()
            ]);

            // Log failed API usage
            $this->logApiUsage([
                'service' => 'grok_image',
                'model' => $model,
                'prompt_tokens' => 0,
                'completion_tokens' => 0,
                'total_tokens' => 0,
                'cost' => 0,
                'user_id' => Auth::id(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'response_time_ms' => 0,
                'images_generated' => 0,
                'success' => false,
                'error_message' => $errorMessage
            ]);

            throw new \Exception($errorMessage);
        } catch (\Exception $e) {
            Log::error('GROK Image Generation Exception: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate image and save to storage
     */
    public function generateImageAndSave(
        string $prompt,
        string $directory = 'user-content',
        int $n = 1,
        ?int $chatId = null,
        string $model = 'grok-2-image',
        string $size = '1024x1024'
    ): array {
        try {
            // Check rate limits
            $limitCheck = $this->checkImageLimits($n);
            if ($limitCheck !== null) {
                throw new \Exception($limitCheck['message']);
            }

            // Generate images
            $generationResult = $this->generateImage(
                prompt: $prompt,
                model: $model,
                n: $n,
                size: $size
            );

            if (!$generationResult['success']) {
                throw new \Exception('Image generation failed');
            }

            // Ensure directory exists in storage
            if (!Storage::exists($directory)) {
                Storage::makeDirectory($directory, 0755, true);
            }

            $savedImages = [];

            foreach ($generationResult['images'] as $imageData) {
                if (isset($imageData['b64_json'])) {
                    $base64Data = $imageData['b64_json'];

                    $imageContent = base64_decode($base64Data);
                    if ($imageContent === false) {
                        Log::warning('Failed to decode base64 image data');
                        continue;
                    }

                    // Generate unique filename
                    $filename = 'kwai-gen-image-' . uniqid() . '-' . md5($prompt) . '.jpg';
                    $filepath = $directory . '/' . $filename;

                    // Save file using Laravel Storage
                    if (Storage::put($filepath, $imageContent)) {
                        $url = Storage::url($filepath);
                        $url = str_replace('/storage/', '/user-g-content/', $url);

                        // Store in database for user's library
                        try {
                            ImageGeneration::create([
                                'user_id' => Auth::id(),
                                'ip_address' => request()->ip(),
                                'email' => Auth::user()?->email,
                                'prompt' => $prompt,
                                'revised_prompt' => $prompt, // GROK doesn't revise prompts
                                'image_url' => $url,
                                'model' => $model,
                                'size' => $size,
                                'quality' => 'standard',
                                'style' => 'vivid',
                                'background' => null,
                                'output_format' => 'jpg',
                                'chat_id' => $chatId
                            ]);
                            Log::info('GROK image record saved to database', [
                                'filename' => $filename,
                                'user_id' => Auth::id(),
                                'chat_id' => $chatId,
                                'model' => $model
                            ]);
                        } catch (\Exception $e) {
                            Log::warning('Failed to save GROK image record to database: ' . $e->getMessage());
                        }

                        $savedImages[] = [
                            'filename' => $filename,
                            'path' => $filepath,
                            'full_path' => Storage::path($filepath),
                            'revised_prompt' => $prompt,
                            'size' => Storage::size($filepath),
                            'url' => $url,
                            'model' => $model,
                            'size_dimensions' => $size,
                            'quality' => 'standard',
                            'style' => 'vivid',
                            'background' => null,
                            'output_format' => 'jpg'
                        ];
                        Log::info('GROK image saved successfully', ['filename' => $filename]);
                    } else {
                        Log::warning('Failed to save GROK image file', ['filename' => $filename]);
                    }
                }
            }

            return [
                'success' => true,
                'prompt' => $prompt,
                'model' => $model,
                'size' => $size,
                'images_saved' => count($savedImages),
                'images' => $savedImages,
                'directory' => $directory,
                'timestamp' => now()->toIso8601String()
            ];
        } catch (\Exception $e) {
            Log::error('GROK Generate and Save Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get available models
     */
    public function getAvailableModels(): array
    {
        return self::IMAGE_MODELS;
    }
}
