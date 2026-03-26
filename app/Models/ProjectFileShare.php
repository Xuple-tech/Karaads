<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ProjectFileShare extends Model
{
    use HasUlids;

    protected $fillable = [
        'project_file_id',
        'shared_with_user_id',
        'permission',
        'expires_at',
        'is_public_link',
        'public_token',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_public_link' => 'boolean',
    ];

    public function projectFile(): BelongsTo
    {
        return $this->belongsTo(ProjectFiles::class);
    }

    public function sharedWithUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'shared_with_user_id');
    }

    /**
     * Check if share is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Generate public share token
     */
    public static function generatePublicToken(): string
    {
        return Str::random(32);
    }

    /**
     * Create public share
     */
    public static function createPublicShare(ProjectFiles $file, string $permission = 'view', ?\DateTime $expiresAt = null): self
    {
        return self::create([
            'project_file_id' => $file->id,
            'permission' => $permission,
            'expires_at' => $expiresAt,
            'is_public_link' => true,
            'public_token' => self::generatePublicToken(),
        ]);
    }
}
