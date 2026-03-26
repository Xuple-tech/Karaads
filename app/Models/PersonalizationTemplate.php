<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PersonalizationTemplate extends Model
{
    use \Illuminate\Database\Eloquent\Concerns\HasUuids;
    use SoftDeletes;

    protected $table = 'personalization_templates';

    protected $fillable = [
        'system_personalization_id',
        'name',
        'description',
        'emoji',
        'default_tone_level',
        'default_detail_level',
        'default_response_length',
        'is_system_template',
        'is_active',
        'usage_count',
    ];

    protected $casts = [
        'is_system_template' => 'boolean',
        'is_active' => 'boolean',
        'default_tone_level' => 'integer',
        'default_detail_level' => 'integer',
        'default_response_length' => 'integer',
        'usage_count' => 'integer',
    ];

    /**
     * Get the system personalization for this template
     */
    public function systemPersonalization(): BelongsTo
    {
        return $this->belongsTo(SystemPersonalization::class);
    }

    /**
     * Get active templates
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get system templates only
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system_template', true);
    }

    /**
     * Increment usage counter
     */
    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }

    /**
     * Get popular templates
     */
    public function scopePopular($query, int $limit = 5)
    {
        return $query->active()
            ->orderByDesc('usage_count')
            ->limit($limit);
    }

    /**
     * Validate defaults against system personalization constraints
     */
    public function validateDefaults(): bool
    {
        if (!$this->systemPersonalization) {
            return true; // No constraints
        }

        $sys = $this->systemPersonalization;

        return $sys->isPreferenceAllowed('tone', $this->default_tone_level)
            && $sys->isPreferenceAllowed('detail', $this->default_detail_level)
            && $sys->isPreferenceAllowed('length', $this->default_response_length);
    }

    /**
     * Apply defaults to user preferences
     */
    public function getDefaultPreferences(): array
    {
        return [
            'tone_level' => $this->default_tone_level,
            'detail_level' => $this->default_detail_level,
            'response_length' => $this->default_response_length,
        ];
    }
}
