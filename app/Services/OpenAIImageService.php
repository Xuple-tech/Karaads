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

class OpenAIImageService
{
    private ?string $apiKey;
    private string $apiEndpoint = 'https://api.openai.com/v1/images/generations';
    private string $editEndpoint = 'https://api.openai.com/v1/images/edits';
    private string $variationsEndpoint = 'https://api.openai.com/v1/images/variations';
    private Client $client;
    private ?SubscriptionService $subscriptionService = null;

    // Available OpenAI image models based on official documentation
    private const IMAGE_MODELS = [
        'dall-e-3' => [
            'name' => 'DALL-E 3',
            'max_images' => 1,
            'quality_options' => ['standard', 'hd'],
            'size_options' => ['1024x1024', '1792x1024', '1024x1792'],
            'style_options' => ['vivid', 'natural'],
            'description' => 'Highest quality image generation with enhanced detail and accuracy',
            'supports_edits' => false,
            'supports_variations' => false,
            'supports_upload' => false
        ],
        'dall-e-2' => [
            'name' => 'DALL-E 2',
            'max_images' => 10,
            'quality_options' => ['standard'],
            'size_options' => ['256x256', '512x512', '1024x1024'],
            'style_options' => [],
            'description' => 'Fast and cost-effective image generation',
            'supports_edits' => true,
            'supports_variations' => true,
            'supports_upload' => true
        ],
        'gpt-image-1' => [
            'name' => 'GPT Image 1',
            'max_images' => 10,
            'quality_options' => ['low', 'medium', 'high'],
            'size_options' => ['1024x1024', '1024x1536', '1536x1024', 'auto'],
            'style_options' => [],
            'description' => 'Newer model with improved capabilities including image uploads',
            'supports_edits' => true,
            'supports_variations' => false,
            'supports_upload' => true,
            'background_options' => ['transparent', 'opaque', 'auto'],
            'output_formats' => ['png', 'jpeg', 'webp'],
            'moderation_levels' => ['low', 'auto']
        ]
    ];

    public function __construct(?SubscriptionService $subscriptionService = null)
    {
        $this->subscriptionService = $subscriptionService;
        $this->apiKey = config('services.openai.api_key');

        if (empty($this->apiKey)) {
            throw new \Exception('OpenAI API key is not configured');
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

        $userToCheck = $user ?? Auth::user();

        if (!$userToCheck) {
            return LimitResponseService::unauthenticated();
        }

        $canGenerateImages = $this->subscriptionService->canGenerateImages($userToCheck, $count);

        if (!$canGenerateImages['allowed']) {
            return LimitResponseService::fromSubscriptionCheck($canGenerateImages, 'image_limit_exceeded');
        }

        return null;
    }

    /**
     * Generate images using OpenAI Images API with support for GPT Image 1
     */
    public function generateImage(
        string $prompt,
        string $model = 'dall-e-2',
        int $n = 1,
        string $size = '1024x1024',
        string $quality = 'standard',
        string $style = 'natural',
        string $response_format = 'url',
        ?string $background = null,
        ?string $output_format = null,
        ?int $output_compression = null,
        ?string $moderation = null,
        bool $stream = false,
        int $partial_images = 0
    ): array {
        try {
            // Validate parameters
            if (empty($prompt)) {
                throw new \Exception('Prompt cannot be empty');
            }

            $this->validateModel($model);

            $modelConfig = self::IMAGE_MODELS[$model];

            // Validate number of images based on model limits
            if ($n < 1 || $n > $modelConfig['max_images']) {
                throw new \Exception("Number of images must be between 1 and {$modelConfig['max_images']} for {$model}");
            }

            // DALL-E 3 only supports n=1
            if ($model === 'dall-e-3' && $n !== 1) {
                throw new \Exception('DALL-E 3 only supports generating 1 image per request');
            }

            // Validate size
            if (!in_array($size, $modelConfig['size_options'])) {
                throw new \Exception("Invalid size for {$model}. Available sizes: " . implode(', ', $modelConfig['size_options']));
            }

            // Validate quality
            if (!in_array($quality, $modelConfig['quality_options'])) {
                throw new \Exception("Invalid quality for {$model}. Available qualities: " . implode(', ', $modelConfig['quality_options']));
            }

            // Validate response format
            if ($model !== 'gpt-image-1' && !in_array($response_format, ['url', 'b64_json'])) {
                throw new \Exception("Invalid response format. Must be 'url' or 'b64_json'");
            }

            // Build payload according to OpenAI API specifications
            $payload = [
                'model' => $model,
                'prompt' => $prompt,
                'n' => $n,
                'size' => $size,
            ];

            // Add model-specific parameters
            if ($model === 'gpt-image-1') {
                // GPT Image 1 specific parameters
                if ($background && in_array($background, $modelConfig['background_options'])) {
                    $payload['background'] = $background;
                }
                if ($output_format && in_array($output_format, $modelConfig['output_formats'])) {
                    $payload['output_format'] = $output_format;
                }
                if ($output_compression !== null) {
                    $payload['output_compression'] = $output_compression;
                }
                if ($moderation && in_array($moderation, $modelConfig['moderation_levels'])) {
                    $payload['moderation'] = $moderation;
                }
                if ($stream) {
                    $payload['stream'] = $stream;
                }
                if ($partial_images > 0) {
                    $payload['partial_images'] = $partial_images;
                }
            } else {
                // DALL-E parameters
                $payload['response_format'] = $response_format;

                if (in_array($model, ['dall-e-3', 'gpt-image-1'])) {
                    $payload['quality'] = $quality;
                }

                if ($model === 'dall-e-3' && in_array($style, ['vivid', 'natural'])) {
                    $payload['style'] = $style;
                }
            }

            Log::info('Starting OpenAI image generation request', [
                'model' => $model,
                'n_images' => $n,
                'size' => $size,
                'quality' => $quality,
                'prompt_length' => strlen($prompt),
                ...$payload
            ]);

            $startTime = microtime(true);

            $response = $this->client->post($this->apiEndpoint, [
                'headers' => [
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $this->apiKey,
                ],
                'json' => $payload,
                'timeout' => 120,
            ]);

            $responseTime = (microtime(true) - $startTime) * 1000;
            $responseData = json_decode($response->getBody()->getContents(), true);

            // Handle API errors including credit balance issues
            if (isset($responseData['error'])) {
                $errorMessage = $responseData['error']['message'] ?? 'Unknown API error';
                $errorCode = $responseData['error']['code'] ?? 'unknown';

                if ($errorCode === 'invalid_request_error' || strpos($errorMessage, 'credit') !== false) {
                    throw new \Exception('API request failed. Please check your OpenAI credit balance.');
                }

                throw new \Exception("OpenAI API error: {$errorMessage}");
            }

            if (!isset($responseData['data']) || !is_array($responseData['data'])) {
                throw new \Exception('Invalid response structure from OpenAI image generation API');
            }

            // Format the response
            $generatedImages = [];
            foreach ($responseData['data'] as $index => $imageData) {
                $imageInfo = [
                    'index' => $index,
                    'revised_prompt' => $imageData['revised_prompt'] ?? $prompt,
                ];

                if (($model === 'gpt-image-1' || $response_format === 'b64_json') && isset($imageData['b64_json'])) {
                    $imageInfo['b64_json'] = $imageData['b64_json'];
                    $imageInfo['url'] = null;
                } else {
                    $imageInfo['url'] = $imageData['url'] ?? null;
                    $imageInfo['b64_json'] = null;
                }

                $generatedImages[] = $imageInfo;
            }

            // Log successful API usage
            $this->logApiUsage([
                'provider' => 'openai',
                'model' => $model,
                'endpoint' => $this->apiEndpoint,
                'input_tokens' => $responseData['usage']['input_tokens'] ?? 0,
                'output_tokens' => $responseData['usage']['output_tokens'] ?? 0,
                'tokens' => $responseData['usage']['total_tokens'] ?? 0,
                'response_time' => round($responseTime),
                'status' => 'success',
                'metadata' => [
                    'image_count' => count($generatedImages),
                    'size' => $size,
                    'quality' => $quality,
                    'style' => $style,
                    'prompt_length' => strlen($prompt),
                    'model_specific' => $model === 'gpt-image-1' ? [
                        'background' => $background,
                        'output_format' => $output_format,
                        'moderation' => $moderation
                    ] : []
                ]
            ]);

            Log::info('OpenAI image generation completed successfully', [
                'images_generated' => count($generatedImages),
                'model' => $model
            ]);

            return [
                'success' => true,
                'model' => $model,
                'prompt' => $prompt,
                'n_images' => $n,
                'size' => $size,
                'quality' => $quality,
                'style' => $style,
                'images' => $generatedImages,
                'usage' => $responseData['usage'] ?? null,
                'timestamp' => now()->toIso8601String()
            ];
        } catch (ClientException $e) {
            $responseTime = (microtime(true) - $startTime) * 1000;
            $responseBody = $e->getResponse()->getBody()->getContents();
            $statusCode = $e->getResponse()->getStatusCode();

            // Log error API usage
            $this->logApiUsage([
                'provider' => 'openai',
                'model' => $model,
                'endpoint' => $this->apiEndpoint,
                'input_tokens' => 0,
                'output_tokens' => 0,
                'tokens' => 0,
                'response_time' => round($responseTime),
                'status' => 'error',
                'error' => "HTTP {$statusCode}: " . $e->getMessage(),
                'metadata' => [
                    'error_details' => $responseBody,
                    'size' => $size,
                    'quality' => $quality
                ]
            ]);

            Log::error("OpenAI Image Generation Error (Status: {$statusCode}): " . $e->getMessage());

            if ($statusCode === 400) {
                $errorData = json_decode($responseBody, true);
                if (isset($errorData['error']['code']) && $errorData['error']['code'] === 'contentFilter') {
                    throw new \Exception('Your request was rejected by the content safety system. Please modify your prompt.');
                }
                throw new \Exception('Invalid request. Please check your input parameters and credit balance.');
            }

            throw new \Exception("Image generation failed: " . $e->getMessage());
        } catch (\Exception $e) {
            $responseTime = isset($startTime) ? (microtime(true) - $startTime) * 1000 : 0;

            $this->logApiUsage([
                'provider' => 'openai',
                'model' => $model,
                'endpoint' => $this->apiEndpoint,
                'input_tokens' => 0,
                'output_tokens' => 0,
                'tokens' => 0,
                'response_time' => round($responseTime),
                'status' => 'error',
                'error' => $e->getMessage(),
                'metadata' => [
                    'size' => $size,
                    'quality' => $quality
                ]
            ]);

            Log::error('OpenAI Image Generation Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create image edit with GPT Image 1 or DALL-E 2
     */
    public function createImageEdit(
        array $images,
        string $prompt,
        string $model = 'dall-e-2',
        ?string $mask = null,
        int $n = 1,
        string $size = '1024x1024',
        string $quality = 'auto',
        ?string $background = null,
        ?string $output_format = 'png',
        ?int $output_compression = 100,
        ?string $input_fidelity = 'low',
        bool $stream = false,
        int $partial_images = 0
    ): array {
        try {
            $this->validateModel($model);
            $modelConfig = self::IMAGE_MODELS[$model];

            if (!$modelConfig['supports_edits']) {
                throw new \Exception("Model {$model} does not support image edits");
            }

            if (empty($images)) {
                throw new \Exception('At least one image is required for editing');
            }

            // Prepare multipart form data
            $multipart = [];

            // Add model
            $multipart[] = [
                'name' => 'model',
                'contents' => $model
            ];

            // Add prompt
            $multipart[] = [
                'name' => 'prompt',
                'contents' => $prompt
            ];

            // Add images
            // foreach ($images as $index => $imageData) {
            //     $multipart[] = [
            //         'name' => 'image[]',
            //         'contents' => $imageData['content'],
            //         'filename' => $imageData['filename'] ?? "image_{$index}.png",
            //         'headers' => [
            //             'Content-Type' => $imageData['mime_type'] ?? 'image/png'
            //         ]
            //     ];
            // }
            foreach ($images as $index => $img) {
                $multipart[] = [
                    'name'     => 'image',
                    'contents' => $img['content'],
                    'filename' => $img['filename'] ?? "image_$index.png",
                    'headers'  => [
                        'Content-Type' => $img['mime_type'] ?? 'image/png'
                    ]
                ];
            }

            // Add mask if provided
            // if ($mask) {
            //     $multipart[] = [
            //         'name' => 'mask',
            //         'contents' => $mask['content'],
            //         'filename' => $mask['filename'] ?? 'mask.png',
            //         'headers' => [
            //             'Content-Type' => $mask['mime_type'] ?? 'image/png'
            //         ]
            //     ];
            // }

            if ($mask) {
                $multipart[] = [
                    'name'     => 'mask',
                    'contents' => $mask['content'],
                    'filename' => $mask['filename'] ?? 'mask.png',
                    'headers'  => [
                        'Content-Type' => $mask['mime_type'] ?? 'image/png'
                    ]
                ];
            }

            // Add common parameters
            $multipart[] = [
                'name' => 'n',
                'contents' => $n
            ];

            $multipart[] = [
                'name' => 'size',
                'contents' => $size
            ];

            // Add GPT Image 1 specific parameters
            if ($model === 'gpt-image-1') {
                $multipart[] = [
                    'name' => 'quality',
                    'contents' => $quality
                ];

                if ($background) {
                    $multipart[] = [
                        'name' => 'background',
                        'contents' => $background
                    ];
                }

                if ($output_format) {
                    $multipart[] = [
                        'name' => 'output_format',
                        'contents' => $output_format
                    ];
                }

                if ($output_compression !== null) {
                    $multipart[] = [
                        'name' => 'output_compression',
                        'contents' => $output_compression
                    ];
                }

                if ($input_fidelity) {
                    $multipart[] = [
                        'name' => 'input_fidelity',
                        'contents' => $input_fidelity
                    ];
                }

                if ($stream) {
                    $multipart[] = [
                        'name' => 'stream',
                        'contents' => $stream
                    ];
                }

                if ($partial_images > 0) {
                    $multipart[] = [
                        'name' => 'partial_images',
                        'contents' => $partial_images
                    ];
                }
            } else {
                // DALL-E 2 parameters
                $multipart[] = [
                    'name' => 'response_format',
                    'contents' => 'b64_json'
                ];
            }

            Log::info('Starting OpenAI image edit request', [
                'model' => $model,
                'n_images' => $n,
                'size' => $size,
                'input_images' => count($images),
                'has_mask' => !empty($mask)
            ]);

            $startTime = microtime(true);

            $response = $this->client->post($this->editEndpoint, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiKey,
                ],
                'multipart' => $multipart,
                'timeout' => 120,
            ]);

            $responseTime = (microtime(true) - $startTime) * 1000;
            $responseData = json_decode($response->getBody()->getContents(), true);

            if (!isset($responseData['data']) || !is_array($responseData['data'])) {
                throw new \Exception('Invalid response structure from OpenAI image edit API');
            }

            // Format the response
            $generatedImages = [];
            foreach ($responseData['data'] as $index => $imageData) {
                $imageInfo = [
                    'index' => $index,
                ];

                if (isset($imageData['b64_json'])) {
                    $imageInfo['b64_json'] = $imageData['b64_json'];
                    $imageInfo['url'] = null;
                } else {
                    $imageInfo['url'] = $imageData['url'] ?? null;
                    $imageInfo['b64_json'] = null;
                }

                $generatedImages[] = $imageInfo;
            }

            // Log successful API usage
            $this->logApiUsage([
                'provider' => 'openai',
                'model' => $model,
                'endpoint' => $this->editEndpoint,
                'input_tokens' => $responseData['usage']['input_tokens'] ?? 0,
                'output_tokens' => $responseData['usage']['output_tokens'] ?? 0,
                'tokens' => $responseData['usage']['total_tokens'] ?? 0,
                'response_time' => round($responseTime),
                'status' => 'success',
                'metadata' => [
                    'image_count' => count($generatedImages),
                    'size' => $size,
                    'quality' => $quality,
                    'input_images' => count($images),
                    'has_mask' => !empty($mask),
                    'operation' => 'edit'
                ]
            ]);

            return [
                'success' => true,
                'model' => $model,
                'prompt' => $prompt,
                'n_images' => $n,
                'size' => $size,
                'quality' => $quality,
                'images' => $generatedImages,
                'usage' => $responseData['usage'] ?? null,
                'timestamp' => now()->toIso8601String(),
                'operation' => 'edit'
            ];
        } catch (\Exception $e) {
            $responseTime = isset($startTime) ? (microtime(true) - $startTime) * 1000 : 0;

            $this->logApiUsage([
                'provider' => 'openai',
                'model' => $model,
                'endpoint' => $this->editEndpoint,
                'input_tokens' => 0,
                'output_tokens' => 0,
                'tokens' => 0,
                'response_time' => round($responseTime),
                'status' => 'error',
                'error' => $e->getMessage(),
                'metadata' => [
                    'operation' => 'edit',
                    'input_images' => count($images)
                ]
            ]);

            Log::error('OpenAI Image Edit Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create image variations (DALL-E 2 only)
     */
    public function createImageVariations(
        string $imagePath,
        string $model = 'dall-e-2',
        int $n = 1,
        string $size = '1024x1024',
        string $response_format = 'b64_json'
    ): array {
        try {
            if ($model !== 'dall-e-2') {
                throw new \Exception('Image variations are only supported with DALL-E 2');
            }

            if (!file_exists($imagePath)) {
                throw new \Exception('Image file not found');
            }

            $multipart = [
                [
                    'name' => 'image',
                    'contents' => fopen($imagePath, 'r'),
                    'filename' => basename($imagePath)
                ],
                [
                    'name' => 'model',
                    'contents' => $model
                ],
                [
                    'name' => 'n',
                    'contents' => $n
                ],
                [
                    'name' => 'size',
                    'contents' => $size
                ],
                [
                    'name' => 'response_format',
                    'contents' => $response_format
                ]
            ];

            Log::info('Starting OpenAI image variations request', [
                'model' => $model,
                'n_variations' => $n,
                'size' => $size
            ]);

            $startTime = microtime(true);

            $response = $this->client->post($this->variationsEndpoint, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiKey,
                ],
                'multipart' => $multipart,
                'timeout' => 120,
            ]);

            $responseTime = (microtime(true) - $startTime) * 1000;
            $responseData = json_decode($response->getBody()->getContents(), true);

            if (!isset($responseData['data']) || !is_array($responseData['data'])) {
                throw new \Exception('Invalid response structure from OpenAI image variations API');
            }

            // Format the response
            $generatedImages = [];
            foreach ($responseData['data'] as $index => $imageData) {
                $imageInfo = [
                    'index' => $index,
                ];

                if ($response_format === 'b64_json' && isset($imageData['b64_json'])) {
                    $imageInfo['b64_json'] = $imageData['b64_json'];
                    $imageInfo['url'] = null;
                } else {
                    $imageInfo['url'] = $imageData['url'] ?? null;
                    $imageInfo['b64_json'] = null;
                }

                $generatedImages[] = $imageInfo;
            }

            // Log successful API usage
            $this->logApiUsage([
                'provider' => 'openai',
                'model' => $model,
                'endpoint' => $this->variationsEndpoint,
                'input_tokens' => 0,
                'output_tokens' => 0,
                'tokens' => 0,
                'response_time' => round($responseTime),
                'status' => 'success',
                'metadata' => [
                    'image_count' => count($generatedImages),
                    'size' => $size,
                    'operation' => 'variations'
                ]
            ]);

            return [
                'success' => true,
                'model' => $model,
                'n_variations' => $n,
                'size' => $size,
                'images' => $generatedImages,
                'timestamp' => now()->toIso8601String(),
                'operation' => 'variations'
            ];
        } catch (\Exception $e) {
            $responseTime = isset($startTime) ? (microtime(true) - $startTime) * 1000 : 0;

            $this->logApiUsage([
                'provider' => 'openai',
                'model' => $model,
                'endpoint' => $this->variationsEndpoint,
                'input_tokens' => 0,
                'output_tokens' => 0,
                'tokens' => 0,
                'response_time' => round($responseTime),
                'status' => 'error',
                'error' => $e->getMessage(),
                'metadata' => [
                    'operation' => 'variations'
                ]
            ]);

            Log::error('OpenAI Image Variations Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate image and save to file system with enhanced GPT Image 1 support
     */
    public function generateImageAndSave(
        string $prompt,
        string $directory = '/user-k-content/images',
        int $n = 1,
        ?int $chatId = null,
        string $model = 'dall-e-3',
        string $size = '1024x1024',
        string $quality = 'standard',
        string $style = 'vivid',
        ?string $background = null,
        ?string $output_format = null
    ): array {
        try {
            // Check rate limits
            $this->checkImageGenerationRateLimit($n);

            // For GPT Image 1, use b64_json by default
            $response_format = $model === 'gpt-image-1' ? 'b64_json' : 'b64_json';

            // Generate images
            $generationResult = $this->generateImage(
                prompt: $prompt,
                model: $model,
                n: $n,
                size: $size,
                quality: $quality,
                style: $style,
                response_format: $response_format,
                background: $background,
                output_format: $output_format
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
                if ($imageData['b64_json']) {
                    $base64Data = $imageData['b64_json'];

                    // Determine file extension based on model and output format
                    $extension = 'png';
                    if ($model === 'gpt-image-1' && $output_format) {
                        $extension = $output_format;
                    }

                    $imageContent = base64_decode($base64Data);
                    if ($imageContent === false) {
                        Log::warning('Failed to decode base64 image data');
                        continue;
                    }

                    // Generate unique filename
                    $filename = 'kwati-user-g-content-' . uniqid() . '-' . md5($prompt) . '.' . $extension;
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
                                'revised_prompt' => $imageData['revised_prompt'] ?? $prompt,
                                'image_url' => $url,
                                'model' => $model,
                                'size' => $size,
                                'quality' => $quality,
                                'style' => $style,
                                'background' => $background,
                                'output_format' => $output_format,
                                'chat_id' => $chatId
                            ]);
                            Log::info('OpenAI image record saved to database', [
                                'filename' => $filename,
                                'user_id' => Auth::id(),
                                'chat_id' => $chatId,
                                'model' => $model
                            ]);
                        } catch (\Exception $e) {
                            Log::warning('Failed to save OpenAI image record to database: ' . $e->getMessage());
                        }

                        $savedImages[] = [
                            'filename' => $filename,
                            'path' => $filepath,
                            'full_path' => Storage::path($filepath),
                            'revised_prompt' => $imageData['revised_prompt'] ?? $prompt,
                            'size' => Storage::size($filepath),
                            'url' => $url,
                            'model' => $model,
                            'size_dimensions' => $size,
                            'quality' => $quality,
                            'style' => $style,
                            'background' => $background,
                            'output_format' => $output_format
                        ];
                        Log::info('OpenAI image saved successfully', ['filename' => $filename]);
                    } else {
                        Log::warning('Failed to save OpenAI image file', ['filename' => $filename]);
                    }
                }
            }

            return [
                'success' => true,
                'prompt' => $prompt,
                'model' => $model,
                'size' => $size,
                'quality' => $quality,
                'style' => $style,
                'background' => $background,
                'output_format' => $output_format,
                'images_saved' => count($savedImages),
                'images' => $savedImages,
                'directory' => $directory,
                'timestamp' => now()->toIso8601String()
            ];
        } catch (\Exception $e) {
            Log::error('OpenAI Generate and Save Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Check image generation rate limit
     */
    private function checkImageGenerationRateLimit(int $numberOfImages): void
    {
        $userId = Auth::id();
        if (!$userId) {
            throw new \Exception('User not authenticated. Please login to generate images.');
        }

        $date = now()->toDateString();
        $cacheKey = "user_{$userId}_openai_image_generation_{$date}";

        $currentCount = Cache::get($cacheKey, 0);
        $newCount = $currentCount + $numberOfImages;

        $dailyLimit = 10; // Adjust as needed

        if ($newCount > $dailyLimit) {
            $remaining = $dailyLimit - $currentCount;
            if ($remaining <= 0) {
                throw new \Exception("Daily image generation limit reached ({$dailyLimit} images per day). Please try again tomorrow.");
            } else {
                throw new \Exception("Cannot generate {$numberOfImages} images. You have {$remaining} images remaining today.");
            }
        }

        Cache::put($cacheKey, $newCount, now()->endOfDay());
    }

    /**
     * Get available OpenAI image models
     */
    public function getAvailableModels(): array
    {
        return self::IMAGE_MODELS;
    }

    /**
     * Validate if a model exists
     */
    private function validateModel(string $model): void
    {
        if (!isset(self::IMAGE_MODELS[$model])) {
            throw new \InvalidArgumentException("Invalid OpenAI image model: {$model}. Available models: " . implode(', ', array_keys(self::IMAGE_MODELS)));
        }
    }

    /**
     * Get model configuration
     */
    public function getModelConfig(string $model): array
    {
        $this->validateModel($model);
        return self::IMAGE_MODELS[$model];
    }

    /**
     * Test API connectivity
     */
    public function testConnection(): bool
    {
        try {
            $response = $this->client->get('https://api.openai.com/v1/models', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiKey
                ],
                'timeout' => 10
            ]);
            return $response->getStatusCode() === 200;
        } catch (\Exception $e) {
            Log::error('OpenAI connection test failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Simple image generation with default parameters
     */
    public function simpleGenerateImage(string $prompt, string $model = 'dall-e-3'): array
    {
        return $this->generateImage(
            prompt: $prompt,
            model: $model,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            response_format: 'url'
        );
    }

    /**
     * Process uploaded files for image editing
     */
    public function processUploadedFiles(array $files): array
    {
        $processedFiles = [];

        foreach ($files as $file) {
            if (isset($file['data']) && isset($file['type'])) {
                // Extract base64 data
                $base64Data = $file['data'];
                if (strpos($base64Data, 'data:') === 0) {
                    $base64Data = explode(',', $base64Data)[1];
                }

                $processedFiles[] = [
                    'content' => base64_decode($base64Data),
                    'filename' => $file['name'] ?? 'uploaded_image.png',
                    'mime_type' => $file['type'] ?? 'image/png'
                ];
            }
        }

        return $processedFiles;
    }
}
