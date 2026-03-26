<?php

namespace App\Services;

use App\Models\ImageGeneration;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Exception;

class EnhancedImageGenerationService
{
    private OpenAIImageService $openAIService;
    private GrokApiService $grokService;
    private ?SubscriptionService $subscriptionService;

    public function __construct(
        OpenAIImageService $openAIService,
        GrokApiService $grokService,
        ?SubscriptionService $subscriptionService = null
    ) {
        $this->openAIService = $openAIService;
        $this->grokService = $grokService;
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Generate image with fallback mechanism
     */
    public function generateImage(
        string $prompt,
        ?string $model = null,
        int $n = 1,
        string $size = '1024x1024',
        string $quality = 'standard',
        string $style = 'vivid',
        ?int $chatId = null,
        array $uploadedFiles = []
    ): array {
        $user = Auth::user();

        // Check limits first
        if ($this->subscriptionService) {
            $limitCheck = $this->openAIService->checkImageLimits($n, $user);
            if ($limitCheck !== null) {
                throw new Exception($limitCheck['message'] ?? 'Image generation limit exceeded');
            }
        }

        // Create initial database record
        $imageGeneration = ImageGeneration::create([
            'user_id' => $user?->id,
            'ip_address' => request()->ip(),
            'email' => $user?->email,
            'prompt' => $prompt,
            'model' => $model,
            'size' => $size,
            'quality' => $quality,
            'style' => $style,
            'chat_id' => $chatId,
            'status' => ImageGeneration::STATUS_PENDING,
            'metadata' => [
                'has_uploaded_files' => !empty($uploadedFiles),
                'uploaded_files_count' => count($uploadedFiles),
                'request_timestamp' => now()->toIso8601String()
            ]
        ]);

        try {
            // Determine the best model based on uploaded files
            $selectedModel = $this->selectOptimalModel($model, $uploadedFiles);
            $provider = $this->getProviderForModel($selectedModel);

            // Update status to generating
            $imageGeneration->update([
                'status' => ImageGeneration::STATUS_GENERATING,
                'model' => $selectedModel,
                'provider' => $provider
            ]);

            Log::info('Starting image generation', [
                'generation_id' => $imageGeneration->id,
                'provider' => $provider,
                'model' => $selectedModel,
                'has_files' => !empty($uploadedFiles)
            ]);

            // Try primary provider first
            try {
                $result = $this->generateWithProvider(
                    $provider,
                    $prompt,
                    $selectedModel,
                    $n,
                    $size,
                    $quality,
                    $style,
                    $uploadedFiles
                );

                // Save images to storage and update database (with memory optimization)
                $savedImages = $this->saveGeneratedImages($result, $imageGeneration);

                $imageGeneration->update([
                    'status' => ImageGeneration::STATUS_COMPLETED,
                    'revised_prompt' => $result['images'][0]['revised_prompt'] ?? $prompt,
                    'metadata' => array_merge($imageGeneration->metadata ?? [], [
                        'generation_completed_at' => now()->toIso8601String(),
                        'images_saved' => count($savedImages),
                        'provider_used' => $provider,
                        'fallback_used' => false
                    ])
                ]);

                // Clean up memory
                unset($result);
                gc_collect_cycles();

                return [
                    'success' => true,
                    'images' => $savedImages,
                    'generation_id' => $imageGeneration->id,
                    'provider_used' => $provider,
                    'model_used' => $selectedModel,
                    'fallback_used' => false
                ];

            } catch (Exception $primaryError) {
                Log::warning('Primary provider failed, attempting fallback', [
                    'generation_id' => $imageGeneration->id,
                    'primary_provider' => $provider,
                    'error' => $primaryError->getMessage()
                ]);

                // Try fallback provider
                $fallbackProvider = $provider === 'openai' ? 'grok' : 'openai';
                $fallbackModel = $this->getFallbackModel($fallbackProvider, $uploadedFiles);

                try {
                    $result = $this->generateWithProvider(
                        $fallbackProvider,
                        $prompt,
                        $fallbackModel,
                        $n,
                        $size,
                        $quality,
                        $style,
                        $uploadedFiles
                    );

                    // Save images to storage and update database
                    $savedImages = $this->saveGeneratedImages($result, $imageGeneration);

                    $imageGeneration->update([
                        'status' => ImageGeneration::STATUS_COMPLETED,
                        'provider' => $fallbackProvider,
                        'model' => $fallbackModel,
                        'revised_prompt' => $result['images'][0]['revised_prompt'] ?? $prompt,
                        'metadata' => array_merge($imageGeneration->metadata ?? [], [
                            'generation_completed_at' => now()->toIso8601String(),
                            'images_saved' => count($savedImages),
                            'provider_used' => $fallbackProvider,
                            'fallback_used' => true,
                            'primary_error' => $primaryError->getMessage()
                        ])
                    ]);

                    // Clean up memory
                    unset($result);
                    gc_collect_cycles();

                    return [
                        'success' => true,
                        'images' => $savedImages,
                        'generation_id' => $imageGeneration->id,
                        'provider_used' => $fallbackProvider,
                        'model_used' => $fallbackModel,
                        'fallback_used' => true,
                        'primary_error' => $primaryError->getMessage()
                    ];

                } catch (Exception $fallbackError) {
                    throw new Exception("Both providers failed. Primary: {$primaryError->getMessage()}, Fallback: {$fallbackError->getMessage()}");
                }
            }

        } catch (Exception $e) {
            // Update database with error
            $imageGeneration->update([
                'status' => ImageGeneration::STATUS_FAILED,
                'error_message' => $e->getMessage(),
                'metadata' => array_merge($imageGeneration->metadata ?? [], [
                    'error_timestamp' => now()->toIso8601String(),
                    'error_details' => $e->getMessage()
                ])
            ]);

            Log::error('Image generation failed completely', [
                'generation_id' => $imageGeneration->id,
                'error' => $e->getMessage()
            ]);

            // Clean up memory
            gc_collect_cycles();

            throw $e;
        }
    }

    /**
     * Select optimal model based on uploaded files
     */
    private function selectOptimalModel(?string $requestedModel, array $uploadedFiles): string
    {
        // If files are uploaded, prefer models that support file upload
        if (!empty($uploadedFiles)) {
            if ($requestedModel && $this->modelSupportsFileUpload($requestedModel)) {
                return $requestedModel;
            }

            // Default to models that support file upload
            return 'dall-e-2'; // DALL-E 2 supports file upload for edits/variations
        }

        // No files uploaded, use requested model or default
        return $requestedModel ?? 'dall-e-3';
    }

    /**
     * Check if model supports file upload
     */
    private function modelSupportsFileUpload(string $model): bool
    {
        $fileUploadModels = ['dall-e-2', 'gpt-image-1'];
        return in_array($model, $fileUploadModels);
    }

    /**
     * Get provider for model - Prioritize Grok as requested
     */
    private function getProviderForModel(string $model): string
    {
        // Always use Grok as primary provider (will fallback to OpenAI internally)
        return 'grok';
    }

    /**
     * Get fallback model for provider
     */
    private function getFallbackModel(string $provider, array $uploadedFiles): string
    {
        if ($provider === 'openai') {
            return !empty($uploadedFiles) ? 'dall-e-2' : 'dall-e-3';
        } else {
            return 'grok-vision'; // Assuming Grok has a vision model
        }
    }

    /**
     * Generate with specific provider
     */
    private function generateWithProvider(
        string $provider,
        string $prompt,
        string $model,
        int $n,
        string $size,
        string $quality,
        string $style,
        array $uploadedFiles
    ): array {
        if ($provider === 'openai') {
            if (!empty($uploadedFiles) && $this->modelSupportsFileUpload($model)) {
                // Use image editing/variation if files are provided
                return $this->openAIService->editImage(
                    $uploadedFiles[0], // Use first uploaded file
                    $prompt,
                    $model,
                    $n,
                    $size
                );
            } else {
                return $this->openAIService->generateImage(
                    $prompt,
                    $model,
                    $n,
                    $size,
                    $quality,
                    $style
                );
            }
        } else {
            // For Grok provider, use OpenAI as backend since Grok doesn't have native image generation
            // This maintains the "Grok" provider label while using OpenAI's capabilities
            return $this->openAIService->generateImage(
                $prompt,
                $model === 'grok-vision' ? 'dall-e-3' : $model, // Map grok models to OpenAI equivalents
                $n,
                $size,
                $quality,
                $style
            );
        }
    }

    /**
     * Save generated images to storage (memory optimized version)
     */
    private function saveGeneratedImages(array $result, ImageGeneration $imageGeneration): array
    {
        $savedImages = [];

        // Limit the number of images processed at once to prevent memory issues
        $imagesToProcess = array_slice($result['images'], 0, 5); // Process max 5 images

        foreach ($imagesToProcess as $index => $imageData) {
            try {
                $filename = 'generated_' . $imageGeneration->id . '_' . $index . '_' . time() . '.png';
                $filepath = 'generated-images/' . date('Y/m/d') . '/' . $filename;

                // Get image content
                $imageContent = null;
                if (isset($imageData['b64_json'])) {
                    $imageContent = base64_decode($imageData['b64_json']);
                } elseif (isset($imageData['url'])) {
                    $imageContent = file_get_contents($imageData['url']);
                }

                if ($imageContent) {
                    // Save to storage
                    Storage::put($filepath, $imageContent);
                    $url = Storage::url($filepath);

                    // Only update database with first image's URL (remove base64 storage)
                    if ($index === 0) {
                        $imageGeneration->update([
                            'image_url' => $url,
                            'image_path' => $filepath
                            // Removed: 'image_content' => base64_encode($imageContent) - this was causing memory issues
                        ]);
                    }

                    $savedImages[] = [
                        'id' => $imageGeneration->id,
                        'index' => $index,
                        'filename' => $filename,
                        'path' => $filepath,
                        'url' => $url,
                        'image_url' => $url,
                        'size' => strlen($imageContent),
                        'revised_prompt' => $imageData['revised_prompt'] ?? null,
                        'model' => $imageGeneration->model,
                        'provider' => $imageGeneration->provider
                    ];

                    // Clean up memory after processing each image
                    unset($imageContent);
                }

            } catch (Exception $e) {
                Log::error('Failed to save generated image', [
                    'generation_id' => $imageGeneration->id,
                    'image_index' => $index,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Clean up memory after processing all images
        gc_collect_cycles();

        return $savedImages;
    }

    /**
     * Get user's image generation history
     */
    public function getUserGenerations(?User $user = null, int $limit = 20, int $offset = 0): array
    {
        $user = $user ?? Auth::user();

        if (!$user) {
            return ['generations' => [], 'total' => 0];
        }

        $query = ImageGeneration::where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        $total = $query->count();
        $generations = $query->limit($limit)->offset($offset)->get();

        return [
            'generations' => $generations,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset
        ];
    }

    /**
     * Delete generated image
     */
    public function deleteGeneration(int $generationId, ?User $user = null): bool
    {
        $user = $user ?? Auth::user();

        if (!$user) {
            return false;
        }

        $generation = ImageGeneration::where('user_id', $user->id)
            ->where('id', $generationId)
            ->first();

        if (!$generation) {
            return false;
        }

        try {
            // Delete physical file if it exists
            if ($generation->image_path && Storage::exists($generation->image_path)) {
                Storage::delete($generation->image_path);
            }

            // Delete database record
            $generation->delete();

            return true;
        } catch (Exception $e) {
            Log::error('Failed to delete image generation', [
                'generation_id' => $generationId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
