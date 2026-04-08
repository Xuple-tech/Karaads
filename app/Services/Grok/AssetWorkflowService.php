<?php

namespace App\Services\Grok;

use App\Models\Chat;
use App\Models\User;
use App\Services\LimitResponseService;
use App\Services\PythonDocumentGenerationService;
use App\Services\StabilityAIImageService;
use App\Services\SubscriptionService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AssetWorkflowService
{
    public function __construct(
        private StabilityAIImageService $stabilityImageService,
        private PythonDocumentGenerationService $documentGenerationService,
        private ?SubscriptionService $subscriptionService = null
    ) {
    }

    public function handleImageGeneration(array $arguments, string|int|null $chatId = null): array
    {
        try {
            $prompt = $arguments['user_prompt'];
            $numberOfImages = min(max($arguments['number_of_images'] ?? 1, 1), 10);
            $model = $arguments['model'] ?? 'sd3.5';
            $size = $arguments['size'] ?? '1024x1024';

            Log::info('Stability AI image generation requested', [
                'prompt' => substr($prompt, 0, 100),
                'count' => $numberOfImages,
                'model' => $model,
                'size' => $size,
                'chat_id' => $chatId,
            ]);

            $limitCheck = $this->checkImageLimits($numberOfImages, chatId: $chatId);
            if ($limitCheck !== null) {
                throw new \Exception($limitCheck['message'] ?? 'Image generation limit exceeded');
            }

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
                    'cfg_scale' => 7.0,
                ]
            );

            if (!$imageResult['success'] || empty($imageResult['images'])) {
                throw new \Exception('Image generation failed. Please try again with a different prompt.');
            }

            $directory = 'user-content/generated/' . date('Y/m/d');
            $savedImages = $this->stabilityImageService->saveImagesToStorage(
                images: $imageResult['images'],
                directory: $directory,
                prompt: $prompt,
                chatId: $chatId,
                model: $model,
                operation: 'generate'
            );

            return [
                'success' => true,
                'prompt' => $prompt,
                'number_of_images' => $numberOfImages,
                'model' => $model,
                'size' => $size,
                'images' => $savedImages,
                'images_count' => count($savedImages),
                'timestamp' => now()->toISOString(),
                'provider' => 'stability_ai',
                'type' => 'image_generation',
                'message' => 'Images generated successfully',
                'user_message' => 'Here are your generated images.',
                'stop_generation' => true,
            ];
        } catch (\Exception $e) {
            Log::error('Stability AI image generation error: ' . $e->getMessage(), [
                'arguments' => $arguments,
                'chat_id' => $chatId,
            ]);

            throw new \Exception($e->getMessage());
        }
    }

    public function handleImageEdit(array $arguments, string|int|null $chatId = null): array
    {
        try {
            $editPrompt = $arguments['edit_prompt'];
            $model = $arguments['model'] ?? 'stable-image-ultra';

            Log::info('Stability AI image edit requested', [
                'edit_prompt' => substr($editPrompt, 0, 100),
                'model' => $model,
                'chat_id' => $chatId,
            ]);

            $limitCheck = $this->checkImageLimits(1, chatId: $chatId);
            if ($limitCheck !== null) {
                throw new \Exception($limitCheck['message'] ?? 'Image editing limit exceeded');
            }

            $uploadedFiles = $arguments['files'] ?? [];
            if (empty($uploadedFiles)) {
                throw new \Exception('Please upload images first, then tell me how you want them edited.');
            }

            $processedFiles = $this->stabilityImageService->processUploadedFiles($uploadedFiles);
            if (empty($processedFiles)) {
                throw new \Exception('No valid images were uploaded. Please upload PNG, JPEG, or WebP images under 10MB.');
            }

            $imagePaths = array_column($processedFiles, 'temp_path');

            $editResult = $this->stabilityImageService->editImages(
                imagePaths: $imagePaths,
                prompt: $editPrompt,
                model: $model,
                options: [
                    'strength' => 0.8,
                    'steps' => 50,
                    'cfg_scale' => 7.0,
                    'search_prompt' => 'original image',
                ]
            );

            $this->stabilityImageService->cleanupTempFiles($processedFiles);

            if (!$editResult['success'] || empty($editResult['images'])) {
                throw new \Exception('Image editing failed. Please try again with different instructions.');
            }

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
                    'input_count' => count($imagePaths),
                ]
            );

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
                'message' => 'Images edited successfully',
                'user_message' => 'Here are your edited images.',
                'stop_generation' => true,
            ];
        } catch (\Exception $e) {
            if (isset($processedFiles)) {
                $this->stabilityImageService->cleanupTempFiles($processedFiles);
            }

            Log::error('Stability AI image editing error: ' . $e->getMessage(), [
                'arguments' => $arguments,
                'chat_id' => $chatId,
            ]);

            throw new \Exception($e->getMessage());
        }
    }

    public function generateImage(
        string $prompt,
        int $n = 1,
        string $model = 'black-forest-labs/FLUX.1-dev',
        string $size = '1024x1024'
    ): array {
        $limitCheck = $this->checkImageLimits($n);
        if ($limitCheck !== null) {
            throw new \Exception($limitCheck['message'] ?? 'Image generation limit exceeded');
        }

        return $this->stabilityImageService->generateImage(
            prompt: $prompt,
            model: $model,
            n: $n,
            options: [
                'width' => explode('x', $size)[0] ?? 1024,
                'height' => explode('x', $size)[1] ?? 1024,
            ]
        );
    }

    public function generateImageAndSave(
        string $prompt,
        string $directory = '/user-content/images',
        int $n = 1,
        ?int $chatId = null,
        string $model = 'sd3.5',
        string $size = '1024x1024'
    ): array {
        $sizeParts = explode('x', $size);

        return $this->stabilityImageService->generateAndSave(
            prompt: $prompt,
            directory: $directory,
            n: $n,
            chatId: $chatId,
            options: [
                'model' => $model,
                'width' => $sizeParts[0] ?? 1024,
                'height' => $sizeParts[1] ?? 1024,
                'steps' => 50,
                'cfg_scale' => 7.0,
            ]
        );
    }

    public function checkImageLimits(int $count = 1, ?User $user = null, string|int|null $chatId = null): ?array
    {
        $userToCheck = $this->resolveExecutionUser($user, $chatId);

        if (!$userToCheck) {
            return LimitResponseService::unauthenticated();
        }

        if (!$this->subscriptionService) {
            return null;
        }

        $canGenerateImages = $this->subscriptionService->canGenerateImages($userToCheck, $count);

        if (!$canGenerateImages['allowed']) {
            return LimitResponseService::fromSubscriptionCheck($canGenerateImages, 'image_limit_exceeded');
        }

        return null;
    }

    public function generateWordDocument(array $arguments, string|int|null $chatId = null): array
    {
        return $this->generateDocument($arguments, $chatId, 'docx', 'DOCX', 'word_document');
    }

    public function generatePdfDocument(array $arguments, string|int|null $chatId = null): array
    {
        return $this->generateDocument($arguments, $chatId, 'pdf', 'PDF', 'pdf_document');
    }

    public function checkDocumentLimits(?User $user = null, string|int|null $chatId = null): ?array
    {
        $userToCheck = $this->resolveExecutionUser($user, $chatId);

        if (!$userToCheck) {
            return LimitResponseService::unauthenticated();
        }

        if (!$this->subscriptionService) {
            return null;
        }

        $canGenerateDocs = $this->subscriptionService->canGenerateDocuments($userToCheck, 1);

        if (!$canGenerateDocs['allowed']) {
            return LimitResponseService::fromSubscriptionCheck($canGenerateDocs, 'document_limit_exceeded');
        }

        return null;
    }

    private function generateDocument(
        array $arguments,
        string|int|null $chatId,
        string $format,
        string $label,
        string $type
    ): array {
        try {
            $title = $arguments['title'] ?? 'Document';
            $content = $arguments['content'] ?? '';
            $documentType = $arguments['document_type'] ?? 'general';

            Log::info("Python {$label} document generation requested", [
                'title' => $title,
                'document_type' => $documentType,
                'content_length' => strlen($content),
                'chat_id' => $chatId,
            ]);

            $limitCheck = $this->checkDocumentLimits(chatId: $chatId);
            if ($limitCheck !== null) {
                throw new \Exception($limitCheck['message'] ?? 'Document generation limit exceeded');
            }

            $result = $this->documentGenerationService->generateDocument(
                title: $title,
                contentMarkdown: $content,
                format: $format,
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
                'type' => $type,
                'stop_generation' => true,
            ];
        } catch (\Exception $e) {
            Log::error("Python {$label} generation error: " . $e->getMessage(), [
                'arguments' => $arguments,
                'chat_id' => $chatId,
            ]);

            throw new \Exception("Failed to generate {$label}: " . $e->getMessage());
        }
    }

    private function storeEditedImagesInChat(string|int|null $chatId, array $images, string $prompt, string $operation): void
    {
        if (!$chatId || empty($images)) {
            return;
        }

        try {
            $chat = Chat::find($chatId);
            if (!$chat) {
                Log::debug('Skipping image storage: chat not found for edited images', ['chat_id' => $chatId]);
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
                        'edited_at' => now()->toISOString(),
                    ],
                ]);
            }
        } catch (\Exception $e) {
            Log::error("Failed to store {$operation} images in chat", [
                'chat_id' => $chatId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function resolveExecutionUser(?User $user = null, string|int|null $chatId = null): ?User
    {
        if ($user instanceof User) {
            return $user;
        }

        $authenticatedUser = Auth::user();
        if ($authenticatedUser instanceof User) {
            return $authenticatedUser;
        }

        if ($chatId === null) {
            return null;
        }

        $chat = Chat::query()
            ->with('conversation.user')
            ->find($chatId);

        return $chat?->conversation?->user;
    }
}
