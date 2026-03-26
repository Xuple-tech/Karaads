<?php

namespace App\Services;

use App\Models\ChatFile;
use App\Models\Chat;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Exception;

class ChatFileAttachmentService
{
    // Allowed file types for chat attachments
    private const ALLOWED_MIME_TYPES = [
        'text/plain',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'video/mp4',
        'video/webm',
        'video/ogg',
        'application/json',
        'text/csv',
        'text/xml',
        'application/xml'
    ];

    // Maximum file size (50MB)
    private const MAX_FILE_SIZE = 50 * 1024 * 1024;

    /**
     * Process uploaded files for chat
     */
    public function processUploadedFiles(array $files, ?string $chatId = null): array
    {
        $processedFiles = [];
        $errors = [];

        foreach ($files as $file) {
            try {
                if (!$file instanceof UploadedFile) {
                    $errors[] = 'Invalid file upload';
                    continue;
                }

                // Validate file
                $validation = $this->validateFile($file);
                if (!$validation['valid']) {
                    $errors[] = $validation['error'];
                    continue;
                }

                // Process and store file
                $chatFile = $this->storeFile($file, $chatId);
                if ($chatFile) {
                    $processedFiles[] = $this->formatFileForResponse($chatFile);
                }

            } catch (Exception $e) {
                Log::error('Error processing uploaded file', [
                    'filename' => $file->getClientOriginalName(),
                    'error' => $e->getMessage()
                ]);
                $errors[] = "Failed to process file: {$file->getClientOriginalName()}";
            }
        }

        return [
            'files' => $processedFiles,
            'errors' => $errors,
            'success_count' => count($processedFiles),
            'error_count' => count($errors)
        ];
    }

    /**
     * Validate uploaded file
     */
    private function validateFile(UploadedFile $file): array
    {
        // Check file size
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            return [
                'valid' => false,
                'error' => "File '{$file->getClientOriginalName()}' is too large. Maximum size is 50MB."
            ];
        }

        // Check mime type
        if (!in_array($file->getMimeType(), self::ALLOWED_MIME_TYPES)) {
            return [
                'valid' => false,
                'error' => "File type '{$file->getMimeType()}' is not allowed for '{$file->getClientOriginalName()}'."
            ];
        }

        // Check for malicious files
        if ($this->isMaliciousFile($file)) {
            return [
                'valid' => false,
                'error' => "File '{$file->getClientOriginalName()}' appears to be malicious."
            ];
        }

        return ['valid' => true];
    }

    /**
     * Basic malicious file detection
     */
    private function isMaliciousFile(UploadedFile $file): bool
    {
        $dangerousExtensions = ['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar', 'php', 'asp', 'aspx'];
        $extension = strtolower($file->getClientOriginalExtension());

        return in_array($extension, $dangerousExtensions);
    }

    /**
     * Store file and create database record
     */
    private function storeFile(UploadedFile $file, ?string $chatId = null): ?ChatFile
    {
        $user = Auth::user();

        // Generate unique filename
        $originalName = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $extension;

        // Create directory path
        $directory = 'chat-attachments/' . date('Y/m/d') . '/' . ($user?->id ?? 'guest');
        $filepath = $directory . '/' . $filename;

        try {
            // Store file
            $storedPath = $file->storeAs($directory, $filename, 'private');

            if (!$storedPath) {
                throw new Exception('Failed to store file');
            }

            // Calculate file hash for duplicate detection
            $hash = hash_file('sha256', $file->getRealPath());

            // Check for existing file with same hash
            $existingFile = ChatFile::where('hash', $hash)
                ->where('user_id', $user?->id)
                ->first();

            if ($existingFile) {
                // Delete the newly uploaded file since we have a duplicate
                Storage::disk('private')->delete($storedPath);

                // Return existing file info
                return $existingFile;
            }

            // Create database record
            $chatFile = ChatFile::create([
                'chat_id' => $chatId,
                'user_id' => $user?->id,
                'filename' => $originalName,
                'filepath' => $storedPath,
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'hash' => $hash,
                'metadata' => [
                    'original_extension' => $extension,
                    'stored_filename' => $filename,
                    'upload_timestamp' => now()->toIso8601String(),
                    'user_agent' => request()->userAgent(),
                    'ip_address' => request()->ip()
                ],
                'status' => ChatFile::STATUS_PROCESSED
            ]);

            Log::info('File uploaded successfully', [
                'file_id' => $chatFile->id,
                'original_name' => $originalName,
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType()
            ]);

            return $chatFile;

        } catch (Exception $e) {
            Log::error('Failed to store uploaded file', [
                'filename' => $originalName,
                'error' => $e->getMessage()
            ]);

            // Clean up if file was partially stored
            if (isset($storedPath) && Storage::disk('private')->exists($storedPath)) {
                Storage::disk('private')->delete($storedPath);
            }

            throw $e;
        }
    }

    /**
     * Format file for API response
     */
    private function formatFileForResponse(ChatFile $chatFile): array
    {
        return [
            'id' => $chatFile->id,
            'filename' => $chatFile->filename,
            'mime_type' => $chatFile->mime_type,
            'file_size' => $chatFile->file_size,
            'size_human' => $chatFile->size_for_humans,
            'hash' => $chatFile->hash,
            'status' => $chatFile->status,
            'upload_date' => $chatFile->created_at->toIso8601String(),
            'url' => $this->getFileUrl($chatFile),
            'is_image' => $this->isImageFile($chatFile->mime_type),
            'is_document' => $this->isDocumentFile($chatFile->mime_type),
            'is_audio' => $this->isAudioFile($chatFile->mime_type),
            'is_video' => $this->isVideoFile($chatFile->mime_type),
            'metadata' => $chatFile->metadata
        ];
    }

    /**
     * Get secure file URL
     */
    private function getFileUrl(ChatFile $chatFile): string
    {
        // Return a route that will serve the file securely
        return route('chat.file.download', ['file' => $chatFile->id]);
    }

    /**
     * Check if file is an image
     */
    private function isImageFile(string $mimeType): bool
    {
        return str_starts_with($mimeType, 'image/');
    }

    /**
     * Check if file is a document
     */
    private function isDocumentFile(string $mimeType): bool
    {
        $documentTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'text/csv',
            'application/json',
            'text/xml',
            'application/xml'
        ];

        return in_array($mimeType, $documentTypes);
    }

    /**
     * Check if file is audio
     */
    private function isAudioFile(string $mimeType): bool
    {
        return str_starts_with($mimeType, 'audio/');
    }

    /**
     * Check if file is video
     */
    private function isVideoFile(string $mimeType): bool
    {
        return str_starts_with($mimeType, 'video/');
    }

    /**
     * Get files for a chat
     */
    public function getChatFiles(string $chatId, ?int $limit = null): array
    {
        $user = Auth::user();

        $query = ChatFile::where('chat_id', $chatId)
            ->where('user_id', $user?->id)
            ->orderBy('created_at', 'desc');

        if ($limit) {
            $query->limit($limit);
        }

        $files = $query->get();

        return $files->map(function ($file) {
            return $this->formatFileForResponse($file);
        })->toArray();
    }

    /**
     * Delete a file
     */
    public function deleteFile(int $fileId): bool
    {
        $user = Auth::user();

        $chatFile = ChatFile::where('id', $fileId)
            ->where('user_id', $user?->id)
            ->first();

        if (!$chatFile) {
            return false;
        }

        try {
            // Delete physical file
            if (Storage::disk('private')->exists($chatFile->filepath)) {
                Storage::disk('private')->delete($chatFile->filepath);
            }

            // Delete database record
            $chatFile->delete();

            Log::info('File deleted successfully', [
                'file_id' => $fileId,
                'filename' => $chatFile->filename
            ]);

            return true;

        } catch (Exception $e) {
            Log::error('Failed to delete file', [
                'file_id' => $fileId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Serve file download
     */
    public function serveFile(int $fileId): ?\Symfony\Component\HttpFoundation\StreamedResponse
    {
        $user = Auth::user();

        $chatFile = ChatFile::where('id', $fileId)
            ->where('user_id', $user?->id)
            ->first();

        if (!$chatFile || !Storage::disk('private')->exists($chatFile->filepath)) {
            return null;
        }

        return Storage::disk('private')->download(
            $chatFile->filepath,
            $chatFile->filename,
            [
                'Content-Type' => $chatFile->mime_type,
                'Content-Disposition' => 'inline; filename="' . $chatFile->filename . '"'
            ]
        );
    }
}
