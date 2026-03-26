<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserChatPreference;
use App\Models\AIMode;
use App\Models\SystemPersonalization;
use App\Models\PersonalizationTemplate;
use Illuminate\Support\Facades\Log;

class ChatPersonalizationService
{
    /**
     * Build personalized system prompt based on user preferences with system constraints
     *
     * Layered approach:
     * 1. System Personalization (base layer - cannot be overridden)
     * 2. Template Defaults (if template selected)
     * 3. User Preferences (user customizations within constraints)
     * 4. Custom System Prompt (user additions, but cannot override system)
     */
    public static function buildSystemPrompt(User $user): string
    {
        $preferences = $user->chatPreferences ?? UserChatPreference::firstOrCreate(
            ['user_id' => $user->id],
            [
                'tone_level' => 5,
                'detail_level' => 5,
                'response_length' => 5,
            ]
        );

        // Load relationships if not already loaded
        $preferences->load(['systemPersonalization', 'personalizationTemplate', 'aiMode']);

        // LAYER 1: System Personalization (Mandatory - Base Layer)
        $basePrompt = '';
        if ($preferences->systemPersonalization) {
            $basePrompt = $preferences->systemPersonalization->system_prompt;
        } else {
            // Try to get default system personalization
            $defaultSys = SystemPersonalization::where('is_default', true)->first();
            if ($defaultSys) {
                $basePrompt = $defaultSys->system_prompt;
                $preferences->system_personalization_id = $defaultSys->id;
                $preferences->applySystemConstraints();
            }
        }

        // If no system personalization, use AI mode or default
        if (!$basePrompt) {
            if ($preferences->preferred_ai_mode_id) {
                $mode = AIMode::find($preferences->preferred_ai_mode_id);
                if ($mode) {
                    $basePrompt = $mode->system_prompt;
                }
            }

            if (!$basePrompt) {
                $basePrompt = self::getDefaultBasePrompt();
            }
        }

        // LAYER 2 & 3: Apply system constraints to user preferences
        // This ensures user settings cannot override system requirements
        $preferences->applySystemConstraints();

        // Build personalization additions
        $personalizations = [];

        // Tone instructions - respect system constraints
        $toneInstruction = self::getToneInstruction($preferences->tone_level);
        if ($toneInstruction) {
            $personalizations[] = $toneInstruction;
        }

        // Detail level instructions - respect system constraints
        $detailInstruction = self::getDetailInstruction($preferences->detail_level);
        if ($detailInstruction) {
            $personalizations[] = $detailInstruction;
        }

        // Response length instructions - respect system constraints
        $lengthInstruction = self::getLengthInstruction($preferences->response_length);
        if ($lengthInstruction) {
            $personalizations[] = $lengthInstruction;
        }

        // LAYER 4: Add custom system prompt if exists
        // Note: This is treated as a user suggestion, system requirements take precedence
        if ($preferences->custom_system_prompt) {
            $personalizations[] = "Additional instructions: " . $preferences->custom_system_prompt;
        }

        // Add user name if call_by_name is enabled
        if ($user->call_by_name && $user->name) {
            $personalizations[] = "The user's name is {$user->name}. Use their name occasionally in your responses when appropriate.";
        }

        // System-level note that constraints are in effect (optional, for transparency)
        if ($preferences->systemPersonalization) {
            $personalizations[] = "[System constraint: User preferences respect organizational requirements]";
        }

        // Combine everything with system layer as base
        $fullPrompt = $basePrompt;
        if (!empty($personalizations)) {
            $fullPrompt .= "\n\n" . implode("\n\n", $personalizations);
        }

        Log::info('info("Generated System Prompt:");' . $fullPrompt);
        return $fullPrompt;
    }

    /**
     * Get tone-related system instructions
     */
    private static function getToneInstruction(int $level): ?string
    {
        $instructions = [
            1 => "Maintain an extremely formal, professional tone. Use proper terminology and avoid contractions. Be very serious and corporate in all responses.",
            2 => "Maintain a formal, professional tone. Use proper terminology and minimize casual language.",
            3 => "Keep a professional tone with appropriate business terminology.",
            4 => "Use professional but slightly more approachable language.",
            5 => null, // Balanced - no special instruction needed
            6 => "Use a friendly and approachable tone while remaining helpful and professional.",
            7 => "Be casual and conversational, as if talking to a friend, while remaining helpful.",
            8 => "Be very casual and friendly in your communication style.",
            9 => "Use humor appropriately and maintain a lighthearted tone in your responses.",
            10 => "Be playful and humorous while still being helpful and informative.",
        ];

        return $instructions[$level] ?? null;
    }

    /**
     * Get detail level system instructions
     */
    private static function getDetailInstruction(int $level): ?string
    {
        $instructions = [
            1 => "Provide extremely brief, one-liner answers. Get straight to the point with minimal explanation.",
            2 => "Keep responses very brief, one to two sentences maximum.",
            3 => "Provide brief, concise answers with minimal elaboration.",
            4 => "Keep responses concise and to-the-point without excessive detail.",
            5 => null, // Balanced - no special instruction needed
            6 => "Provide detailed explanations with examples and supporting information.",
            7 => "Give very detailed responses with comprehensive explanations and multiple examples.",
            8 => "Provide exhaustive responses with thorough analysis, examples, and edge cases covered.",
            9 => "Go into great depth with extensive explanations, multiple perspectives, and detailed analysis.",
            10 => "Provide ultra-detailed responses with everything covered comprehensively, including nuances and subtleties.",
        ];

        return $instructions[$level] ?? null;
    }

    /**
     * Get response length system instructions
     */
    private static function getLengthInstruction(int $level): ?string
    {
        $instructions = [
            1 => "Respond with one-liners or very short responses (1-2 sentences).",
            2 => "Keep responses very short (2-3 sentences).",
            3 => "Provide short responses (1-2 paragraphs).",
            4 => "Keep responses brief (1-3 paragraphs).",
            5 => null, // Balanced - no special instruction needed
            6 => "Provide longer, more comprehensive responses (2-4 paragraphs).",
            7 => "Give very long, detailed responses (4-6 paragraphs).",
            8 => "Provide extended responses with multiple sections (6+ paragraphs).",
            9 => "Give very extensive responses with detailed sections and subsections.",
            10 => "Provide maximum-length responses with everything expanded to full detail.",
        ];

        return $instructions[$level] ?? null;
    }

    /**
     * Get default base system prompt
     */
    private static function getDefaultBasePrompt(): string
    {
        return "You are a highly knowledgeable and concise AI assistant named Kwati Ai . Built By KwatiAi Team. You reply with a friendly and expressive tone and may use emojis.

        Safety Requirements:
        • Decline any request involving explicit sexual content, graphic violence, illegal activities, political persuasion, hateful behavior, or personal data extraction.
        • If a request falls into those categories, give a gentle and brief refusal.
        • Keep all content safe, non-graphic, and suitable for general audiences.

        Tool Usage:
        • Use web search only when the user asks for current, real-time, or recently updated information.
        • Do not use tools for general knowledge, math, programming help, or creative tasks.
        • Integrate search results naturally and concisely.

        Capabilities:
        • Communicate in English, Hausa, Yoruba, and Igbo depending on user input.
        • Help with writing tasks such as stories, poems, dialogue, and brainstorming, as long as they remain safe.
        • Explain technical topics, assist with coding, and guide through APIs.
        • Help with studying, simplifying concepts, translations, and generating practice questions.
        • Analyze user-provided data in a safe and non-sensitive context.

        You must always follow the Safety Requirements above when interacting with user content.
       ";
    }

    /**
     * Apply template defaults to user preferences
     * Updates user preferences with template defaults (respecting system constraints)
     */
    public static function applyTemplateDefaults(User $user, PersonalizationTemplate $template): void
    {
        $preferences = $user->chatPreferences ?? UserChatPreference::firstOrCreate(
            ['user_id' => $user->id],
            [
                'tone_level' => 5,
                'detail_level' => 5,
                'response_length' => 5,
            ]
        );

        $defaults = $template->getDefaultPreferences();

        // Update with template defaults
        $preferences->tone_level = $defaults['tone_level'];
        $preferences->detail_level = $defaults['detail_level'];
        $preferences->response_length = $defaults['response_length'];
        $preferences->personalization_template_id = $template->id;

        // If template has system personalization, apply it
        if ($template->system_personalization_id) {
            $preferences->system_personalization_id = $template->system_personalization_id;
            $preferences->applySystemConstraints();
        }

        $preferences->save();

        // Increment template usage counter
        $template->incrementUsage();
    }

    /**
     * Get available templates for user selection
     * Returns only active templates respecting system personalization constraints
     */
    public static function getAvailableTemplates(User $user): array
    {
        $templates = PersonalizationTemplate::active()
            ->with('systemPersonalization')
            ->orderByDesc('usage_count')
            ->get();

        return $templates->map(fn($template) => [
            'id' => $template->id,
            'name' => $template->name,
            'description' => $template->description,
            'emoji' => $template->emoji,
            'defaults' => $template->getDefaultPreferences(),
            'system_personalization' => $template->systemPersonalization ? [
                'id' => $template->systemPersonalization->id,
                'name' => $template->systemPersonalization->name,
                'constraints' => $template->systemPersonalization->getConstraints(),
            ] : null,
        ])->toArray();
    }

    /**
     * Get preference summary for display
     */
    public static function getPreferenceSummary(User $user): array
    {
        $preferences = $user->chatPreferences;

        if (!$preferences) {
            return [
                'tone' => 'Balanced',
                'detail' => 'Moderate',
                'length' => 'Moderate',
                'mode' => 'Default',
            ];
        }

        return [
            'tone' => UserChatPreference::getLevelDescription($preferences->tone_level, 'tone_level'),
            'detail' => UserChatPreference::getLevelDescription($preferences->detail_level, 'detail_level'),
            'length' => UserChatPreference::getLevelDescription($preferences->response_length, 'response_length'),
            'mode' => $preferences->aiMode?->name ?? 'Default',
        ];
    }

    /**
     * Apply conversation mode settings to outgoing responses
     */
    public static function applyPreferencesToResponse(string $response, int $responseLength, int $detailLevel): string
    {
        // This could be expanded to truncate or expand responses based on user preferences
        // For now, this is handled via system prompt

        return $response;
    }
}
