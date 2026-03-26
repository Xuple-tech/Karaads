<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ImageGeneration;
use App\Services\EnhancedImageGenerationService;
use App\Services\ChatFileAttachmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Exception;

class ImageGenerationController extends Controller
{
    private EnhancedImageGenerationService $imageService;
    private ChatFileAttachmentService $fileService;

    public function __construct(
        EnhancedImageGenerationService $imageService,
        ChatFileAttachmentService $fileService
    ) {
        $this->imageService = $imageService;
        $this->fileService = $fileService;
    }

    public function generate(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string|max:2000',
            'model' => 'nullable|string|in:dall-e-2,dall-e-3,gpt-image-1,grok-vision',
            'n' => 'nullable|integer|min:1|max:10',
            'size' => 'nullable|string|in:256x256,512x512,1024x1024,1792x1024,1024x1792',
            'quality' => 'nullable|string|in:standard,hd,low,medium,high',
            'style' => 'nullable|string|in:vivid,natural',
            'chat_id' => 'nullable|string',
            'files' => 'nullable|array',
            'files.*' => 'file|max:51200' // 50MB max per file
        ]);

        try {
            // Process uploaded files if any
            $uploadedFiles = [];
            if ($request->hasFile('files')) {
                $fileResult = $this->fileService->processUploadedFiles(
                    $request->file('files'),
                    $request->input('chat_id')
                );

                if (!empty($fileResult['errors'])) {
                    return response()->json([
                        'success' => false,
                        'error' => 'File upload errors: ' . implode(', ', $fileResult['errors']),
                        'file_errors' => $fileResult['errors']
                    ], 400);
                }

                $uploadedFiles = $fileResult['files'];
            }

            // Generate image with fallback
            $result = $this->imageService->generateImage(
                $request->input('prompt'),
                $request->input('model'),
                $request->input('n', 1),
                $request->input('size', '1024x1024'),
                $request->input('quality', 'standard'),
                $request->input('style', 'vivid'),
                $request->input('chat_id'),
                $uploadedFiles
            );

            return response()->json([
                'success' => true,
                'images' => $result['images'],
                'generation_id' => $result['generation_id'],
                'provider_used' => $result['provider_used'],
                'model_used' => $result['model_used'],
                'fallback_used' => $result['fallback_used'],
                'uploaded_files' => $uploadedFiles,
                'message' => 'Images generated successfully'
            ]);

        } catch (Exception $e) {
            Log::error('Image generation error: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'prompt' => $request->input('prompt'),
                'model' => $request->input('model'),
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function listGenerations(Request $request)
    {
        $request->validate([
            'limit' => 'integer|min:1|max:100',
            'offset' => 'integer|min:0'
        ]);

        try {
            $result = $this->imageService->getUserGenerations(
                Auth::user(),
                $request->input('limit', 20),
                $request->input('offset', 0)
            );

            return response()->json([
                'success' => true,
                'generations' => $result['generations'],
                'total' => $result['total'],
                'limit' => $result['limit'],
                'offset' => $result['offset']
            ]);
        } catch (Exception $e) {
            Log::error('Error fetching image generations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch generations'
            ], 500);
        }
    }

    public function showGeneration($id)
    {
        try {
            $generation = ImageGeneration::where('user_id', Auth::id())->findOrFail($id);

            return response()->json([
                'success' => true,
                'generation' => $generation
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching image generation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Generation not found'
            ], 404);
        }
    }

    public function deleteGeneration($id)
    {
        try {
            $success = $this->imageService->deleteGeneration((int)$id, Auth::user());

            if ($success) {
                return response()->json([
                    'success' => true,
                    'message' => 'Image generation deleted successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'error' => 'Generation not found or access denied'
                ], 404);
            }
        } catch (Exception $e) {
            Log::error('Error deleting image generation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete generation'
            ], 500);
        }
    }

    /**
     * Upload files for chat
     */
    public function uploadFiles(Request $request)
    {
        $request->validate([
            'files' => 'required|array|max:10',
            'files.*' => 'file|max:51200', // 50MB max per file
            'chat_id' => 'nullable|string'
        ]);

        try {
            $result = $this->fileService->processUploadedFiles(
                $request->file('files'),
                $request->input('chat_id')
            );

            return response()->json([
                'success' => true,
                'files' => $result['files'],
                'success_count' => $result['success_count'],
                'error_count' => $result['error_count'],
                'errors' => $result['errors'],
                'message' => "Successfully uploaded {$result['success_count']} file(s)"
            ]);

        } catch (Exception $e) {
            Log::error('File upload error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to upload files'
            ], 500);
        }
    }

    /**
     * Get files for a chat
     */
    public function getChatFiles(Request $request, string $chatId)
    {
        try {
            $files = $this->fileService->getChatFiles($chatId);

            return response()->json([
                'success' => true,
                'files' => $files,
                'count' => count($files)
            ]);

        } catch (Exception $e) {
            Log::error('Error fetching chat files: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch files'
            ], 500);
        }
    }

    /**
     * Delete a file
     */
    public function deleteFile($fileId)
    {
        try {
            $success = $this->fileService->deleteFile((int)$fileId);

            if ($success) {
                return response()->json([
                    'success' => true,
                    'message' => 'File deleted successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'error' => 'File not found or access denied'
                ], 404);
            }

        } catch (Exception $e) {
            Log::error('Error deleting file: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete file'
            ], 500);
        }
    }

    /**
     * Download a file
     */
    public function downloadFile($fileId)
    {
        try {
            $response = $this->fileService->serveFile((int)$fileId);

            if ($response) {
                return $response;
            } else {
                return response()->json([
                    'success' => false,
                    'error' => 'File not found or access denied'
                ], 404);
            }

        } catch (Exception $e) {
            Log::error('Error downloading file: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to download file'
            ], 500);
        }
    }

    private function generatePlaceholderImage($prompt)
    {
        // In a real implementation, you would:
        // 1. Call an AI image generation API (DALL-E, Stable Diffusion, etc.)
        // 2. Save the generated image to storage
        // 3. Return the URL

        // For demo purposes, return a placeholder URL
        return 'https://via.placeholder.com/1024x1024.png?text=' . urlencode(substr($prompt, 0, 50));
    }
}
