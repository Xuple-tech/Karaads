<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConversationShare extends Model
{
    protected $fillable = [
        'conversation_id',
        'share_token',
        'is_public',
        'is_active',
        'expires_at',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
    ];

    /**
     * Relationship to Conversation
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Check if share is still valid
     */
    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    /**
     * Generate unique share token
     */
    public static function generateToken(): string
    {
        do {
            $token = bin2hex(random_bytes(8)); // 16 character alphanumeric token
        } while (self::where('share_token', $token)->exists());

        return $token;
    }

    /**
     * Scope for active shares
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
                     ->where(function ($q) {
                         $q->whereNull('expires_at')
                           ->orWhere('expires_at', '>', now());
                     });
    }

    /**
     * Scope for public shares
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true)->active();
    }
}
