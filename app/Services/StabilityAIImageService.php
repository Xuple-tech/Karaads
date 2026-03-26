<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use App\Models\ApiUsageLog;
use App\Models\ImageGeneration;

class StabilityAIImageService
{
    private ?string $apiKey;
    private Client $client;
    private string $apiEndpoint = 'https://api.stability.ai/v2beta'; // Changed to v2beta
    private array $availableModels;
    private ?string $activeProvider = 'stability_ai';

    // Available Stability AI models for v2beta API
    private const IMAGE_MODELS = [
        'sd3.5' => [
            'name' => 'Stable Diffusion 3.5',
            'type' => 'text_to_image',
            'description' => 'Latest Stable Diffusion 3.5 for high-quality image generation',
            'max_images' => 10,
            'supports_edits' => true,
            'supports_multiple_inputs' => false,
            'recommended' => true,
            'provider' => 'stability_ai',
            'endpoint_path' => '/stable-image/generate/sd3' // v2beta endpoint
        ],
        'sd3' => [
            'name' => 'Stable Diffusion 3',
            'type' => 'text_to_image',
            'description' => 'Stable Diffusion 3 for high-quality image generation',
            'max_images' => 10,
            'supports_edits' => true,
            'supports_multiple_inputs' => false,
            'recommended' => true,
            'provider' => 'stability_ai',
            'endpoint_path' => '/stable-image/generate/sd3'
        ],
        'stable-image-ultra' => [
            'name' => 'Stable Image Ultra',
            'type' => 'text_to_image',
            'description' => 'Ultra quality image generation',
            'max_images' => 10,
            'supports_edits' => true,
            'supports_multiple_inputs' => false,
            'recommended' => true,
            'provider' => 'stability_ai',
            'endpoint_path' => '/stable-image/generate/ultra'
        ],
        'stable-image-core' => [
            'name' => 'Stable Image Core',
            'type' => 'text_to_image',
            'description' => 'Core image generation model',
            'max_images' => 10,
            'supports_edits' => true,
            'supports_multiple_inputs' => false,
            'recommended' => true,
            'provider' => 'stability_ai',
            'endpoint_path' => '/stable-image/generate/core'
        ]
    ];

    // For editing operations
    private const EDIT_OPERATIONS = [
        'edit' => '/stable-image/edit/search-and-replace',
        'remove-background' => '/stable-image/edit/remove-background',
        'upscale' => '/stable-image/upscale/fast',
        'erase' => '/stable-image/edit/erase'
    ];

    public function __construct()
    {
        $this->apiKey = config('services.stability_ai.api_key');

        if (empty($this->apiKey)) {
            throw new \Exception('Stability AI API key is not configured');
        }

        $this->client = new Client([
            'timeout' => 120,
            'connect_timeout' => 30,
            'verify' => false,
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Accept' => 'image/*', // Changed to accept image
                'User-Agent' => 'KwatiAI/1.0'
            ]
        ]);

        $this->availableModels = self::IMAGE_MODELS;
    }

    /**
     * Generate images from text prompt using v2beta API
     */
    public function generateImage(
        string $prompt,
        string $model = 'sd3.5',
        int $n = 1,
        array $options = []
    ): array {
        $model = 'stable-image-ultra';
        try {
            $this->validateModel($model, 'text_to_image');
            $modelConfig = $this->availableModels[$model];

            // Check rate limits
            $this->checkRateLimit('generate', $n);

            // v2beta API can only generate 1 image per request
            if ($n > 1) {
                Log::warning("v2beta API only supports 1 image per request, generating {$n} sequentially");
            }

            $images = [];

            Log::info('Starting Stability AI image generation (v2beta)', [
                'model' => $model,
                'provider' => $this->activeProvider,
                'n_images' => $n,
                'prompt_length' => strlen($prompt)
            ]);

            // Generate images sequentially (v2beta only supports 1 per request)
            for ($i = 0; $i < $n; $i++) {
                try {
                    $image = $this->generateSingleImage($prompt, $model, $options);
                    $images[] = $image;
                } catch (\Exception $e) {
                    Log::error("Failed to generate image {$i}: " . $e->getMessage());
                    // Continue with remaining images
                }
            }

            if (empty($images)) {
                throw new \Exception('Failed to generate any images');
            }

            // Log successful API usage
            $this->logApiUsage([
                'operation' => 'generate',
                'model' => $model,
                'provider' => $this->activeProvider,
                'input_tokens' => strlen($prompt),
                'images_count' => count($images),
                'success' => true
            ]);

            return [
                'success' => true,
                'model' => $model,
                'provider' => $this->activeProvider,
                'prompt' => $prompt,
                'images' => $images,
                'count' => count($images),
                'timestamp' => now()->toIso8601String()
            ];
        } catch (\Exception $e) {
            $this->logApiUsage([
                'operation' => 'generate',
                'model' => $model ?? 'unknown',
                'provider' => $this->activeProvider ?? 'unknown',
                'error' => $e->getMessage(),
                'success' => false
            ]);

            Log::error('Stability AI Image Generation Error: ' . $e->getMessage());
            throw new \Exception('Image generation failed: ' . $e->getMessage());
        }
    }

    /**
     * Generate a single image using v2beta API
     */
    private function generateSingleImage(string $prompt, string $model, array $options): array
    {
        $modelConfig = $this->availableModels[$model];
        $endpoint = $this->apiEndpoint . $modelConfig['endpoint_path'];

        // Prepare multipart form data for v2beta API
        $multipart = [
            [
                'name' => 'prompt',
                'contents' => $prompt
            ],
            [
                'name' => 'output_format',
                'contents' => $options['output_format'] ?? 'png'
            ]
        ];

        // Add optional parameters
        if (isset($options['negative_prompt']) && !empty($options['negative_prompt'])) {
            $multipart[] = [
                'name' => 'negative_prompt',
                'contents' => $options['negative_prompt']
            ];
        }

        if (isset($options['seed'])) {
            $multipart[] = [
                'name' => 'seed',
                'contents' => (string) $options['seed']
            ];
        }

        // Add mode if specified (for some models)
        if (isset($options['mode'])) {
            $multipart[] = [
                'name' => 'mode',
                'contents' => $options['mode']
            ];
        }

        Log::debug('Stability AI v2beta Request', [
            'endpoint' => $endpoint,
            'model' => $model,
            'prompt_preview' => substr($prompt, 0, 100)
        ]);

        $startTime = microtime(true);

        try {
            $response = $this->client->post($endpoint, [
                'multipart' => $multipart,
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Accept' => 'image/*',
                ]
            ]);
        } catch (\GuzzleHttp\Exception\ClientException $e) {
            $errorResponse = $e->getResponse();
            $errorBody = $errorResponse ? $errorResponse->getBody()->getContents() : 'No response body';

            Log::error('Stability AI v2beta Client Error', [
                'status' => $e->getCode(),
                'message' => $e->getMessage(),
                'response' => $errorBody
            ]);

            throw new \Exception('API request failed: ' . $e->getMessage());
        }

        $responseTime = (microtime(true) - $startTime) * 1000;

        // Get the image content
        $imageContent = $response->getBody()->getContents();
        $base64Image = base64_encode($imageContent);

        return [
            'b64_json' => $base64Image,
            'revised_prompt' => $prompt,
            'response_time' => $responseTime,
            'format' => $options['output_format'] ?? 'png'
        ];
    }

    public function editImages(
        array $imagePaths,
        string $prompt,
        string $model = 'stable-image-ultra',
        array $options = []
    ): array {
        try {
            $this->validateModel($model, 'text_to_image');

            if (empty($imagePaths)) {
                throw new \Exception('No source images provided');
            }

            // Check rate limits
            $this->checkRateLimit('edit', count($imagePaths));

            Log::info('Starting Stability AI image edit (v2beta)', [
                'model' => $model,
                'provider' => $this->activeProvider,
                'image_count' => count($imagePaths),
                'prompt' => $prompt
            ]);

            $allResults = [
                'success' => true,
                'model' => $model,
                'provider' => $this->activeProvider,
                'edit_prompt' => $prompt,
                'images' => [],
                'batch_results' => []
            ];

            // Process each image individually
            foreach ($imagePaths as $index => $imagePath) {
                try {
                    $imageContent = file_get_contents($imagePath);

                    // Use search-and-replace edit endpoint
                    $endpoint = $this->apiEndpoint . self::EDIT_OPERATIONS['edit'];

                    $multipart = [
                        [
                            'name' => 'image',
                            'contents' => $imageContent,
                            'filename' => basename($imagePath)
                        ],
                        [
                            'name' => 'prompt',
                            'contents' => $prompt
                        ],
                        [
                            'name' => 'output_format',
                            'contents' => $options['output_format'] ?? 'png'
                        ],
                        // ADD THIS REQUIRED PARAMETER:
                        [
                            'name' => 'search_prompt',
                            'contents' => $options['search_prompt'] ?? 'original image'
                        ]
                    ];

                    // Optional seed parameter
                    if (isset($options['seed'])) {
                        $multipart[] = [
                            'name' => 'seed',
                            'contents' => (string) $options['seed']
                        ];
                    }

                    $response = $this->client->post($endpoint, [
                        'multipart' => $multipart,
                        'headers' => [
                            'Authorization' => 'Bearer ' . $this->apiKey,
                            'Accept' => 'image/*',
                        ]
                    ]);

                    $editedImageContent = $response->getBody()->getContents();
                    $base64Image = base64_encode($editedImageContent);

                    $allResults['images'][] = [
                        'b64_json' => $base64Image,
                        'revised_prompt' => $prompt,
                        'original_image' => basename($imagePath),
                        'original_index' => $index
                    ];

                    $allResults['batch_results'][] = [
                        'original' => basename($imagePath),
                        'success' => true
                    ];
                } catch (\Exception $e) {
                    Log::warning("Image edit failed for image {$index}: " . $e->getMessage());
                    $allResults['batch_results'][] = [
                        'original' => basename($imagePath),
                        'success' => false,
                        'error' => $e->getMessage()
                    ];
                }
            }

            $allResults['count'] = count($allResults['images']);
            $allResults['input_count'] = count($imagePaths);
            $allResults['operation_type'] = 'edit';
            $allResults['timestamp'] = now()->toIso8601String();

            // Log usage
            $this->logApiUsage([
                'operation' => 'edit',
                'model' => $model,
                'provider' => $this->activeProvider,
                'images_count' => count($allResults['images']),
                'input_images_count' => count($imagePaths),
                'success' => true
            ]);

            return $allResults;
        } catch (\Exception $e) {
            $this->logApiUsage([
                'operation' => 'edit',
                'model' => $model ?? 'unknown',
                'provider' => $this->activeProvider ?? 'unknown',
                'error' => $e->getMessage(),
                'success' => false
            ]);

            Log::error('Stability AI Image Edit Error: ' . $e->getMessage());
            throw new \Exception('Image editing failed: ' . $e->getMessage());
        }
    }

    /**
     * Remove background from image
     */
    public function removeBackground(
        string $imagePath,
        array $options = []
    ): array {
        try {
            if (!file_exists($imagePath)) {
                throw new \Exception("Source image file not found: " . basename($imagePath));
            }

            $this->checkRateLimit('edit', 1);

            Log::info('Starting background removal', [
                'provider' => $this->activeProvider
            ]);

            $imageContent = file_get_contents($imagePath);
            $endpoint = $this->apiEndpoint . self::EDIT_OPERATIONS['remove-background'];

            $multipart = [
                [
                    'name' => 'image',
                    'contents' => $imageContent,
                    'filename' => basename($imagePath)
                ],
                [
                    'name' => 'output_format',
                    'contents' => $options['output_format'] ?? 'png'
                ]
            ];

            $startTime = microtime(true);
            $response = $this->client->post($endpoint, [
                'multipart' => $multipart,
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Accept' => 'image/*',
                ]
            ]);

            $responseTime = (microtime(true) - $startTime) * 1000;
            $imageContent = $response->getBody()->getContents();
            $base64Image = base64_encode($imageContent);

            $image = [
                'b64_json' => $base64Image,
                'original_image' => basename($imagePath),
                'format' => $options['output_format'] ?? 'png'
            ];

            // Log usage
            $this->logApiUsage([
                'operation' => 'remove-background',
                'provider' => $this->activeProvider,
                'response_time' => round($responseTime),
                'images_count' => 1,
                'success' => true
            ]);

            return [
                'success' => true,
                'provider' => $this->activeProvider,
                'original_image' => basename($imagePath),
                'images' => [$image],
                'count' => 1,
                'operation_type' => 'remove-background',
                'timestamp' => now()->toIso8601String()
            ];
        } catch (\Exception $e) {
            $this->logApiUsage([
                'operation' => 'remove-background',
                'provider' => $this->activeProvider ?? 'unknown',
                'error' => $e->getMessage(),
                'success' => false
            ]);

            Log::error('Background Removal Error: ' . $e->getMessage());
            throw new \Exception('Background removal failed: ' . $e->getMessage());
        }
    }

    /**
     * Upscale image
     */
    public function upscaleImage(
        string $imagePath,
        array $options = []
    ): array {
        try {
            if (!file_exists($imagePath)) {
                throw new \Exception("Source image file not found: " . basename($imagePath));
            }

            $this->checkRateLimit('upscale', 1);

            Log::info('Starting image upscale', [
                'provider' => $this->activeProvider
            ]);

            $imageContent = file_get_contents($imagePath);
            $endpoint = $this->apiEndpoint . self::EDIT_OPERATIONS['upscale'];

            $multipart = [
                [
                    'name' => 'image',
                    'contents' => $imageContent,
                    'filename' => basename($imagePath)
                ],
                [
                    'name' => 'output_format',
                    'contents' => $options['output_format'] ?? 'png'
                ]
            ];

            $startTime = microtime(true);
            $response = $this->client->post($endpoint, [
                'multipart' => $multipart,
                'headers' => [
                    'Authorization' => 'Bearer ' . $this->apiKey,
                    'Accept' => 'image/*',
                ]
            ]);

            $responseTime = (microtime(true) - $startTime) * 1000;
            $imageContent = $response->getBody()->getContents();
            $base64Image = base64_encode($imageContent);

            $image = [
                'b64_json' => $base64Image,
                'original_image' => basename($imagePath),
                'format' => $options['output_format'] ?? 'png'
            ];

            // Log usage
            $this->logApiUsage([
                'operation' => 'upscale',
                'provider' => $this->activeProvider,
                'response_time' => round($responseTime),
                'images_count' => 1,
                'success' => true
            ]);

            return [
                'success' => true,
                'provider' => $this->activeProvider,
                'original_image' => basename($imagePath),
                'images' => [$image],
                'count' => 1,
                'operation_type' => 'upscale',
                'timestamp' => now()->toIso8601String()
            ];
        } catch (\Exception $e) {
            $this->logApiUsage([
                'operation' => 'upscale',
                'provider' => $this->activeProvider ?? 'unknown',
                'error' => $e->getMessage(),
                'success' => false
            ]);

            Log::error('Image Upscale Error: ' . $e->getMessage());
            throw new \Exception('Image upscaling failed: ' . $e->getMessage());
        }
    }

    /**
     * Parse API response for v2beta (returns binary image, not JSON)
     */
    private function parseResponse($response): array
    {
        // v2beta returns binary image data
        $contentType = $response->getHeaderLine('Content-Type');
        $imageData = $response->getBody()->getContents();

        return [
            'content_type' => $contentType,
            'image_data' => $imageData,
            'success' => true
        ];
    }

    /**
     * Process generated images - simplified for v2beta
     */
    private function processGeneratedImages(array $responseData, string $prompt): array
    {
        // v2beta returns binary image directly
        $imageData = $responseData['image_data'] ?? '';

        if (empty($imageData)) {
            return [];
        }

        return [[
            'b64_json' => base64_encode($imageData),
            'revised_prompt' => $prompt,
            'content_type' => $responseData['content_type'] ?? 'image/png'
        ]];
    }

    /**
     * Process edited images
     */
    private function processEditedImages(array $responseData, string $prompt, array $originalImagePaths): array
    {
        $imageData = $responseData['image_data'] ?? '';

        if (empty($imageData)) {
            return [];
        }

        $images = [];
        $originalIndex = 0; // For single image edits

        $images[] = [
            'b64_json' => base64_encode($imageData),
            'revised_prompt' => $prompt,
            'original_image' => basename($originalImagePaths[$originalIndex] ?? 'unknown'),
            'original_index' => $originalIndex,
            'content_type' => $responseData['content_type'] ?? 'image/png'
        ];

        return $images;
    }

    /**
     * Process upscaled images
     */
    private function processUpscaledImages(array $responseData, string $originalImagePath): array
    {
        $imageData = $responseData['image_data'] ?? '';

        if (empty($imageData)) {
            return [];
        }

        return [[
            'b64_json' => base64_encode($imageData),
            'original_image' => basename($originalImagePath),
            'content_type' => $responseData['content_type'] ?? 'image/png'
        ]];
    }

    /**
     * Save images to storage
     */
    public function saveImagesToStorage(
        array $images,
        string $directory,
        string $prompt,
        ?int $chatId = null,
        string $model = 'unknown',
        string $operation = 'generate',
        array $metadata = []
    ): array {
        $savedImages = [];

        // Ensure directory exists
        if (!Storage::exists($directory)) {
            Storage::makeDirectory($directory, 0755, true);
        }

        foreach ($images as $index => $imageData) {
            if (!empty($imageData['b64_json'])) {
                $base64Data = $imageData['b64_json'];
                $imageContent = base64_decode($base64Data);

                if ($imageContent === false) {
                    Log::warning('Failed to decode base64 image data');
                    continue;
                }

                // Determine file extension
                $contentType = $imageData['content_type'] ?? 'image/png';
                $extension = $this->getExtensionFromContentType($contentType);

                // Generate unique filename
                $filename = $operation . '-' . uniqid() . $extension;
                $filepath = $directory . '/' . $filename;

                // Save file
                if (Storage::put($filepath, $imageContent)) {
                    $url = Storage::url($filepath);

                    // Prepare metadata
                    $imageMetadata = array_merge([
                        'filename' => $filename,
                        'directory' => $directory,
                        'file_size' => Storage::size($filepath),
                        'provider' => $this->activeProvider,
                        'original_image' => $imageData['original_image'] ?? null,
                        'original_index' => $imageData['original_index'] ?? null,
                        'seed' => $imageData['seed'] ?? null,
                        'content_type' => $contentType,
                    ], $metadata);

                    // Store in database
                    try {
                        ImageGeneration::create([
                            'user_id' => Auth::id(),
                            'prompt' => $prompt,
                            'revised_prompt' => $imageData['revised_prompt'] ?? $prompt,
                            'image_url' => $url,
                            'model' => $model,
                            'operation' => $operation,
                            'chat_id' => $chatId,
                            'metadata' => $imageMetadata,
                            'ip_address' => request()->ip(),
                        ]);
                    } catch (\Exception $e) {
                        Log::warning('Failed to save image record to database: ' . $e->getMessage());
                    }

                    $savedImages[] = [
                        'filename' => $filename,
                        'path' => $filepath,
                        'url' => $url,
                        'revised_prompt' => $imageData['revised_prompt'] ?? $prompt,
                        'size' => Storage::size($filepath),
                        'original_image' => $imageData['original_image'] ?? null,
                        'metadata' => $imageMetadata
                    ];
                }
            }
        }

        return $savedImages;
    }

    /**
     * Get file extension from content type
     */
    private function getExtensionFromContentType(string $contentType): string
    {
        $mapping = [
            'image/png' => '.png',
            'image/jpeg' => '.jpg',
            'image/jpg' => '.jpg',
            'image/webp' => '.webp',
            'image/gif' => '.gif'
        ];

        return $mapping[$contentType] ?? '.png';
    }

    /**
     * Check rate limits
     */
    private function checkRateLimit(string $operation, int $requests = 1): void
    {
        $userId = Auth::id() ?? 'anonymous';
        $cacheKey = "stability_rate_limit_{$operation}_{$userId}";
        $date = now()->toDateString();
        $limitKey = "{$cacheKey}_{$date}";

        // Get current usage
        $currentUsage = Cache::get($limitKey, 0);
        $newUsage = $currentUsage + $requests;

        // Rate limits for Stability AI
        $dailyLimit = 1000; // Adjust based on your subscription

        if ($newUsage > $dailyLimit) {
            $remaining = $dailyLimit - $currentUsage;
            if ($remaining <= 0) {
                throw new \Exception("Daily {$operation} limit reached ({$dailyLimit} requests). Please try again tomorrow.");
            } else {
                throw new \Exception("Cannot process {$requests} requests. You have {$remaining} requests remaining today.");
            }
        }

        // Update usage
        Cache::put($limitKey, $newUsage, now()->endOfDay());

        // 5-minute window
        $minuteKey = "{$cacheKey}_5min_" . floor(time() / 300);
        $minuteUsage = Cache::get($minuteKey, 0);

        if ($minuteUsage + $requests > 100) {
            throw new \Exception('Rate limit exceeded. Please wait a few minutes before trying again.');
        }

        Cache::put($minuteKey, $minuteUsage + $requests, 300);
    }

    /**
     * Process uploaded files from request
     */
    public function processUploadedFiles(array $uploadedFiles, int $maxFiles = 10, array $allowedTypes = ['image/png', 'image/jpeg', 'image/webp']): array
    {
        $processedFiles = [];
        $fileCount = 0;

        foreach ($uploadedFiles as $file) {
            if ($fileCount >= $maxFiles) {
                break;
            }

            try {
                // Check if file has required data
                if (!isset($file['data']) || !isset($file['type'])) {
                    continue;
                }

                // Check file type
                if (!in_array($file['type'], $allowedTypes)) {
                    Log::warning('Unsupported file type uploaded: ' . $file['type']);
                    continue;
                }

                // Extract base64 data
                $base64Data = $file['data'];
                if (strpos($base64Data, 'data:') === 0) {
                    $base64Data = explode(',', $base64Data)[1];
                }

                // Check file size (10MB limit)
                $fileSize = strlen($base64Data) * 0.75;
                if ($fileSize > 10 * 1024 * 1024) {
                    Log::warning('File too large: ' . ($fileSize / 1024 / 1024) . 'MB');
                    continue;
                }

                $imageContent = base64_decode($base64Data);
                if ($imageContent === false) {
                    Log::warning('Failed to decode base64 image data');
                    continue;
                }

                // Save to temporary file
                $tempPath = tempnam(sys_get_temp_dir(), 'stability_upload_');
                file_put_contents($tempPath, $imageContent);

                $processedFiles[] = [
                    'temp_path' => $tempPath,
                    'original_name' => $file['name'] ?? 'uploaded_image.png',
                    'mime_type' => $file['type'],
                    'size' => strlen($imageContent)
                ];

                $fileCount++;
            } catch (\Exception $e) {
                Log::warning('Error processing uploaded file: ' . $e->getMessage());
                continue;
            }
        }

        Log::info('Processed uploaded files', [
            'total_uploaded' => count($uploadedFiles),
            'processed' => count($processedFiles),
            'max_allowed' => $maxFiles
        ]);

        return $processedFiles;
    }

    /**
     * Clean up temporary files
     */
    public function cleanupTempFiles(array $tempFiles): void
    {
        foreach ($tempFiles as $file) {
            if (isset($file['temp_path']) && file_exists($file['temp_path'])) {
                @unlink($file['temp_path']);
            }
        }
    }

    /**
     * Validate model and operation compatibility
     */
    private function validateModel(string $model, string $operationType): void
    {
        if (!isset($this->availableModels[$model])) {
            throw new \InvalidArgumentException(
                "Invalid Stability AI model: {$model}. " .
                    "Available models: " . implode(', ', array_keys($this->availableModels))
            );
        }

        $modelConfig = $this->availableModels[$model];

        if ($operationType === 'image_to_image' && !$modelConfig['supports_edits']) {
            throw new \InvalidArgumentException(
                "Model {$modelConfig['name']} does not support image editing operations"
            );
        }
    }

    /**
     * Log API usage to the database
     */
    private function logApiUsage(array $data): void
    {
        try {
            ApiUsageLog::create(array_merge([
                'provider' => 'stability_ai',
                'user_id' => Auth::id(),
                'ip_address' => request()->ip(),
                'timestamp' => now()
            ], $data));
        } catch (\Exception $e) {
            Log::error('Failed to log API usage: ' . $e->getMessage());
        }
    }

    /**
     * Get available models
     */
    public function getAvailableModels(): array
    {
        return $this->availableModels;
    }

    /**
     * Get maximum allowed images for operation
     */
    public function getMaxImagesForOperation(string $operation, string $model = ''): int
    {
        if ($model && isset($this->availableModels[$model])) {
            return $this->availableModels[$model]['max_images'];
        }

        return 1; // v2beta only supports 1 image per request
    }

    /**
     * Check if model supports multiple image inputs
     */
    public function supportsMultipleImages(string $model): bool
    {
        return false; // v2beta doesn't support multiple images per request
    }

    /**
     * Generate image and save to file system (all-in-one method)
     */
    public function generateAndSave(
        string $prompt,
        string $directory,
        int $n = 1,
        ?int $chatId = null,
        array $options = []
    ): array {
        try {
            $model = $options['model'] ?? 'sd3.5';
            $this->validateModel($model, 'text_to_image');

            // Generate images
            $generationResult = $this->generateImage(
                prompt: $prompt,
                model: $model,
                n: $n,
                options: $options
            );

            if (!$generationResult['success'] || empty($generationResult['images'])) {
                throw new \Exception('Image generation failed');
            }

            // Save images to storage
            $savedImages = $this->saveImagesToStorage(
                images: $generationResult['images'],
                directory: $directory,
                prompt: $prompt,
                chatId: $chatId,
                model: $model,
                operation: 'generate',
                metadata: [
                    'output_format' => $options['output_format'] ?? 'png'
                ]
            );

            return array_merge($generationResult, [
                'saved_images' => $savedImages,
                'directory' => $directory,
                'saved_count' => count($savedImages)
            ]);
        } catch (\Exception $e) {
            Log::error('Generate and save error: ' . $e->getMessage(), [
                'prompt' => $prompt,
                'directory' => $directory,
                'n' => $n
            ]);
            throw $e;
        }
    }
}
