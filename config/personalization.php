<?php

/**
 * Personalization Configuration
 *
 * This file configures the personalization system behavior
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Personalization Settings
    |--------------------------------------------------------------------------
    */

    // Default preference values (used when no personalization is set)
    'defaults' => [
        'tone_level' => 5,
        'detail_level' => 5,
        'response_length' => 5,
    ],

    // Preference ranges (global min/max)
    'ranges' => [
        'tone_level' => [
            'min' => 1,
            'max' => 10,
            'label' => 'Tone (1=Very Formal, 10=Very Playful)',
        ],
        'detail_level' => [
            'min' => 1,
            'max' => 10,
            'label' => 'Detail (1=Extremely Brief, 10=Ultra-detailed)',
        ],
        'response_length' => [
            'min' => 1,
            'max' => 10,
            'label' => 'Response Length (1=One-liner, 10=Maximum)',
        ],
    ],

    // Preference level descriptions
    'descriptions' => [
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
    ],

    // System personalization settings
    'system' => [
        // Whether system personalizations are required
        'required' => env('PERSONALIZATION_REQUIRED', false),

        // Default system personalization (by name)
        'default_name' => env('PERSONALIZATION_DEFAULT', 'Default'),

        // Whether users can see system constraints
        'show_constraints' => env('PERSONALIZATION_SHOW_CONSTRAINTS', true),

        // Whether custom system prompts are allowed
        'allow_custom_prompts' => env('PERSONALIZATION_ALLOW_CUSTOM_PROMPTS', true),

        // Maximum length of custom system prompt
        'max_custom_prompt_length' => 1000,
    ],

    // Template settings
    'templates' => [
        // Whether templates are available to users
        'enabled' => env('PERSONALIZATION_TEMPLATES_ENABLED', true),

        // Whether users can see all templates or only their assigned ones
        'show_all' => env('PERSONALIZATION_SHOW_ALL_TEMPLATES', true),

        // Maximum number of templates to display at once
        'max_display' => 12,
    ],

    // Logging and debugging
    'logging' => [
        // Log personalization application
        'enabled' => env('PERSONALIZATION_LOG', true),

        // Log constraint violations
        'log_violations' => env('PERSONALIZATION_LOG_VIOLATIONS', true),

        // Log admin changes
        'log_admin_changes' => env('PERSONALIZATION_LOG_ADMIN_CHANGES', true),
    ],

    // Caching (Future feature)
    'cache' => [
        // Cache system personalizations
        'enabled' => env('PERSONALIZATION_CACHE_ENABLED', false),

        // Cache TTL in seconds
        'ttl' => 3600 * 24, // 24 hours

        // Prefix for cache keys
        'prefix' => 'personalization_',
    ],

    // Feature flags
    'features' => [
        // Enable personalization system
        'enabled' => env('PERSONALIZATION_ENABLED', true),

        // Show system constraints in UI
        'show_constraints' => env('PERSONALIZATION_SHOW_CONSTRAINTS', true),

        // Allow template application
        'allow_templates' => env('PERSONALIZATION_ALLOW_TEMPLATES', true),

        // Allow AI mode selection
        'allow_ai_modes' => env('PERSONALIZATION_ALLOW_AI_MODES', true),

        // Allow custom instructions
        'allow_custom_instructions' => env('PERSONALIZATION_ALLOW_CUSTOM_INSTRUCTIONS', true),
    ],
];
