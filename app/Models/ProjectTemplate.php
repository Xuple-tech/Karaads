<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectTemplate extends Model
{
    use HasUlids;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'icon',
        'category',
        'config',
        'is_public',
        'usage_count',
    ];

    protected $casts = [
        'config' => 'array',
        'is_public' => 'boolean',
    ];

    /**
     * Get the user who created this template
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get projects created from this template
     */
    public function projects(): HasMany
    {
        return $this->hasMany(Projects::class, 'template_id');
    }

    /**
     * Increment usage counter
     */
    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }
}
