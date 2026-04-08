<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DeveloperApiKey extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'name',
        'key_prefix',
        'hashed_secret',
        'notes',
        'last_used_at',
        'last_rotated_at',
        'expires_at',
        'is_active',
        'allowed_model_ids',
    ];

    protected $hidden = [
        'hashed_secret',
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
        'last_rotated_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'allowed_model_ids' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function usageRecords(): HasMany
    {
        return $this->hasMany(DeveloperUsageRecord::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function allowsModel(string $publicId): bool
    {
        if (empty($this->allowed_model_ids)) {
            return true;
        }

        return in_array($publicId, $this->allowed_model_ids, true);
    }
}
