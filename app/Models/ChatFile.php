<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ChatFile extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'chat_id',
        'user_id',
        'filename',
        'filepath',
        'mime_type',
        'file_size',
        'hash',
        'metadata',
        'status',
        'processing_results',
        'processed_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'processing_results' => 'array',
        'processed_at' => 'datetime',
        'file_size' => 'integer',
    ];

    protected $attributes = [
        'status' => 'pending',
    ];

    // Status constants
    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_PROCESSED = 'processed';
    public const STATUS_FAILED = 'failed';

    // Relationships
    public function chat(): BelongsTo
    {
        return $this->belongsTo(Chat::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Accessors
    public function getUrlAttribute(): string
    {
        return Storage::url($this->filepath);
    }

    public function getSizeForHumansAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        $factor = floor((strlen($bytes) - 1) / 3);
        return sprintf('%.2f', $bytes / pow(1024, $factor)) . ' ' . $units[$factor];
    }

    // Status helpers
    public function isProcessed(): bool
    {
        return $this->status === self::STATUS_PROCESSED;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isProcessing(): bool
    {
        return $this->status === self::STATUS_PROCESSING;
    }

    public function hasFailed(): bool
    {
        return $this->status === self::STATUS_FAILED;
    }

    // File handling methods
    public function delete(): ?bool
    {
        // Delete the physical file
        if (Storage::exists($this->filepath)) {
            Storage::delete($this->filepath);
        }

        return parent::delete();
    }

    public static function findDuplicate(string $hash): ?self
    {
        return static::where('hash', $hash)->first();
    }

    // Scopes
    public function scopeProcessed($query)
    {
        return $query->where('status', self::STATUS_PROCESSED);
    }

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeProcessing($query)
    {
        return $query->where('status', self::STATUS_PROCESSING);
    }

    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }
}
