<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectFiles extends Model
{
    use HasUuids;
    protected $keyType = 'string';
    protected $table = 'project_files';
    protected $fillable = [
        'project_id',
        'file_path',
        'file_name',
        'file_size',
        'file_type',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
        'file_size' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Projects::class, 'project_id');
    }

    /**
     * Get all shares of this file
     */
    public function shares(): HasMany
    {
        return $this->hasMany(ProjectFileShare::class);
    }

    /**
     * Get users this file is shared with
     */
    public function sharedWithUsers()
    {
        return $this->hasManyThrough(
            User::class,
            ProjectFileShare::class,
            'project_file_id',
            'id',
            'id',
            'shared_with_user_id'
        );
    }

    /**
     * Check if file is shared with user
     */
    public function isSharedWith(string $userId): bool
    {
        return $this->shares()
            ->where('shared_with_user_id', $userId)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->exists();
    }

    /**
     * Get the file download URL
     */
    public function getDownloadUrlAttribute()
    {
        return asset("storage/{$this->file_path}");
    }

    /**
     * Get human readable file size
     */
    public function getHumanFileSizeAttribute()
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));
        return round($bytes, 2) . ' ' . $units[$pow];
    }

    /**
     * Get file icon based on type
     */
    public function getFileIconAttribute()
    {
        $extension = strtolower(pathinfo($this->file_path, PATHINFO_EXTENSION));

        return match($extension) {
            'pdf' => 'FileText',
            'doc', 'docx' => 'FileText',
            'xls', 'xlsx' => 'FileText',
            'ppt', 'pptx' => 'FileText',
            'jpg', 'jpeg', 'png', 'gif', 'svg', 'webp' => 'Image',
            'zip', 'rar', '7z' => 'Archive',
            'mp3', 'wav', 'flac' => 'Music',
            'mp4', 'avi', 'mov' => 'Video',
            default => 'File',
        };
    }

    /**
     * Generate file preview if applicable
     */
    public function getPreviewUrl(): ?string
    {
        $extension = strtolower(pathinfo($this->file_path, PATHINFO_EXTENSION));

        // For images, return the file URL directly
        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
            return $this->download_url;
        }

        // For PDFs, could generate preview via external service
        if ($extension === 'pdf') {
            return route('file.preview', ['file' => $this->id]);
        }

        return null;
    }

    /**
     * Check if file is previewable
     */
    public function isPreviewable(): bool
    {
        $extension = strtolower(pathinfo($this->file_path, PATHINFO_EXTENSION));
        return in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'txt']);
    }

    /**
     * Get file MIME type
     */
    public function getMimeType(): string
    {
        $extension = strtolower(pathinfo($this->file_path, PATHINFO_EXTENSION));

        return match($extension) {
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'mp3' => 'audio/mpeg',
            'wav' => 'audio/wav',
            'mp4' => 'video/mp4',
            'avi' => 'video/x-msvideo',
            'zip' => 'application/zip',
            'txt' => 'text/plain',
            default => 'application/octet-stream',
        };
    }
}
