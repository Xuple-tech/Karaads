<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SystemPersonalization extends Model
{
    use \Illuminate\Database\Eloquent\Concerns\HasUuids;

    protected $table = 'system_personalizations';

    protected $fillable = [
        'name',
        'description',
        'system_prompt',
        'min_tone_level',
        'max_tone_level',
        'min_detail_level',
        'max_detail_level',
        'min_response_length',
        'max_response_length',
        'is_default',
        'is_active',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'min_tone_level' => 'integer',
        'max_tone_level' => 'integer',
        'min_detail_level' => 'integer',
        'max_detail_level' => 'integer',
        'min_response_length' => 'integer',
        'max_response_length' => 'integer',
    ];

    /**
     * Get templates associated with this system personalization
     */
    public function templates(): HasMany
    {
        return $this->hasMany(PersonalizationTemplate::class);
    }

    /**
     * Get active system personalization
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get default system personalization
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true)->first();
    }

    /**
     * Validate if user preferences are within system constraints
     */
    public function isPreferenceAllowed(string $type, int $value): bool
    {
        return match ($type) {
            'tone' => $value >= $this->min_tone_level && $value <= $this->max_tone_level,
            'detail' => $value >= $this->min_detail_level && $value <= $this->max_detail_level,
            'length' => $value >= $this->min_response_length && $value <= $this->max_response_length,
            default => false,
        };
    }

    /**
     * Clamp user preference to system constraints
     */
    public function clampPreference(string $type, int $value): int
    {
        return match ($type) {
            'tone' => max($this->min_tone_level, min($this->max_tone_level, $value)),
            'detail' => max($this->min_detail_level, min($this->max_detail_level, $value)),
            'length' => max($this->min_response_length, min($this->max_response_length, $value)),
            default => $value,
        };
    }

    /**
     * Get constraint details for frontend display
     */
    public function getConstraints(): array
    {
        return [
            'tone' => [
                'min' => $this->min_tone_level,
                'max' => $this->max_tone_level,
                'label' => "Tone: {$this->min_tone_level}-{$this->max_tone_level}",
            ],
            'detail' => [
                'min' => $this->min_detail_level,
                'max' => $this->max_detail_level,
                'label' => "Detail: {$this->min_detail_level}-{$this->max_detail_level}",
            ],
            'length' => [
                'min' => $this->min_response_length,
                'max' => $this->max_response_length,
                'label' => "Length: {$this->min_response_length}-{$this->max_response_length}",
            ],
        ];
    }
}
