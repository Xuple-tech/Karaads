<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserChatPreference extends Model
{
    use HasUuids;

    protected $table = 'user_chat_preferences';
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'system_personalization_id',
        'personalization_template_id',
        'tone_level',
        'detail_level',
        'response_length',
        'preferred_ai_mode_id',
        'custom_system_prompt',
        'is_active',
        'applied_min_tone',
        'applied_max_tone',
        'applied_min_detail',
        'applied_max_detail',
        'applied_min_length',
        'applied_max_length',
    ];

    protected $casts = [
        'tone_level' => 'integer',
        'detail_level' => 'integer',
        'response_length' => 'integer',
        'is_active' => 'boolean',
        'applied_min_tone' => 'integer',
        'applied_max_tone' => 'integer',
        'applied_min_detail' => 'integer',
        'applied_max_detail' => 'integer',
        'applied_min_length' => 'integer',
        'applied_max_length' => 'integer',
    ];

    /**
     * Get the user that owns this preference
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the AI mode
     */
    public function aiMode(): BelongsTo
    {
        return $this->belongsTo(AIMode::class, 'preferred_ai_mode_id');
    }

    /**
     * Get the system personalization for this user
     */
    public function systemPersonalization(): BelongsTo
    {
        return $this->belongsTo(SystemPersonalization::class);
    }

    /**
     * Get the personalization template for this user
     */
    public function personalizationTemplate(): BelongsTo
    {
        return $this->belongsTo(PersonalizationTemplate::class);
    }

    /**
     * Scope to get active preferences
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get preference level description
     */
    public static function getLevelDescription($level, $type)
    {
        $descriptions = [
            'tone_level' => [
                1 => 'Very Formal',
                2 => 'Formal',
                3 => 'Professional',
                4 => 'Semi-professional',
                5 => 'Balanced',
                6 => 'Friendly',
                7 => 'Casual',
                8 => 'Very Casual',
                9 => 'Humorous',
                10 => 'Playful'
            ],
            'detail_level' => [
                1 => 'Extremely Brief',
                2 => 'Very Brief',
                3 => 'Brief',
                4 => 'Concise',
                5 => 'Moderate',
                6 => 'Detailed',
                7 => 'Very Detailed',
                8 => 'Comprehensive',
                9 => 'Exhaustive',
                10 => 'Ultra-detailed'
            ],
            'response_length' => [
                1 => 'One-liner',
                2 => 'Very Short',
                3 => 'Short',
                4 => 'Brief',
                5 => 'Moderate',
                6 => 'Long',
                7 => 'Very Long',
                8 => 'Extended',
                9 => 'Very Extended',
                10 => 'Maximum'
            ]
        ];

        return $descriptions[$type][$level] ?? 'Unknown';
    }

    /**
     * Apply system constraints to user preferences
     * Ensures user settings cannot override system-level requirements
     */
    public function applySystemConstraints(): void
    {
        if (!$this->systemPersonalization) {
            return; // No constraints to apply
        }

        $sys = $this->systemPersonalization;

        // Clamp user preferences within system constraints
        $this->tone_level = $sys->clampPreference('tone', $this->tone_level);
        $this->detail_level = $sys->clampPreference('detail', $this->detail_level);
        $this->response_length = $sys->clampPreference('length', $this->response_length);

        // Store the applied constraints for reference
        $this->applied_min_tone = $sys->min_tone_level;
        $this->applied_max_tone = $sys->max_tone_level;
        $this->applied_min_detail = $sys->min_detail_level;
        $this->applied_max_detail = $sys->max_detail_level;
        $this->applied_min_length = $sys->min_response_length;
        $this->applied_max_length = $sys->max_response_length;
    }

    /**
     * Get effective preference values respecting system constraints
     */
    public function getEffectivePreferences(): array
    {
        return [
            'tone_level' => $this->tone_level,
            'detail_level' => $this->detail_level,
            'response_length' => $this->response_length,
            'applied_constraints' => $this->systemPersonalization ? [
                'tone' => [
                    'min' => $this->applied_min_tone,
                    'max' => $this->applied_max_tone,
                ],
                'detail' => [
                    'min' => $this->applied_min_detail,
                    'max' => $this->applied_max_detail,
                ],
                'length' => [
                    'min' => $this->applied_min_length,
                    'max' => $this->applied_max_length,
                ],
            ] : null,
        ];
    }

    /**
     * Check if user preference is valid under system constraints
     */
    public function isPreferenceValid(string $type, int $value): bool
    {
        if (!$this->systemPersonalization) {
            return true; // No constraints
        }

        return $this->systemPersonalization->isPreferenceAllowed($type, $value);
    }

    /**
     * Get system constraint violations
     */
    public function getConstraintViolations(): array
    {
        if (!$this->systemPersonalization) {
            return [];
        }

        $violations = [];

        if ($this->tone_level < $this->applied_min_tone || $this->tone_level > $this->applied_max_tone) {
            $violations['tone_level'] = "Tone must be between {$this->applied_min_tone} and {$this->applied_max_tone}";
        }

        if ($this->detail_level < $this->applied_min_detail || $this->detail_level > $this->applied_max_detail) {
            $violations['detail_level'] = "Detail must be between {$this->applied_min_detail} and {$this->applied_max_detail}";
        }

        if ($this->response_length < $this->applied_min_length || $this->response_length > $this->applied_max_length) {
            $violations['response_length'] = "Response length must be between {$this->applied_min_length} and {$this->applied_max_length}";
        }

        return $violations;
    }
}
