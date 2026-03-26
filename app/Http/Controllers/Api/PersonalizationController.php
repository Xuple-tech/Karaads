<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserChatPreference;
use App\Models\PersonalizationTemplate;
use App\Models\SystemPersonalization;
use App\Models\AIMode;
use App\Services\ChatPersonalizationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class PersonalizationController extends Controller
{
    /**
     * Get current user's personalization preferences
     */
    public function getPreferences(Request $request)
    {
        try {
            $user = Auth::user();
            $preferences = $user->chatPreferences ?? UserChatPreference::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'tone_level' => 5,
                    'detail_level' => 5,
                    'response_length' => 5,
                ]
            );

            $preferences->load(['systemPersonalization', 'personalizationTemplate', 'aiMode']);

            $summary = ChatPersonalizationService::getPreferenceSummary($user);

            return response()->json([
                'success' => true,
                'preferences' => [
                    'tone_level' => $preferences->tone_level,
                    'detail_level' => $preferences->detail_level,
                    'response_length' => $preferences->response_length,
                    'preferred_ai_mode_id' => $preferences->preferred_ai_mode_id,
                    'custom_system_prompt' => $preferences->custom_system_prompt,
                    'personalization_template_id' => $preferences->personalization_template_id,
                    'is_active' => $preferences->is_active,

                    // System constraints info
                    'system_constraints' => $preferences->systemPersonalization ? [
                        'applied_min_tone' => $preferences->applied_min_tone,
                        'applied_max_tone' => $preferences->applied_max_tone,
                        'applied_min_detail' => $preferences->applied_min_detail,
                        'applied_max_detail' => $preferences->applied_max_detail,
                        'applied_min_length' => $preferences->applied_min_length,
                        'applied_max_length' => $preferences->applied_max_length,
                        'system_name' => $preferences->systemPersonalization->name,
                        'system_description' => $preferences->systemPersonalization->description,
                    ] : null,

                    // Template info
                    'template' => $preferences->personalizationTemplate ? [
                        'id' => $preferences->personalizationTemplate->id,
                        'name' => $preferences->personalizationTemplate->name,
                        'emoji' => $preferences->personalizationTemplate->emoji,
                    ] : null,

                    // Mode info
                    'ai_mode' => $preferences->aiMode ? [
                        'id' => $preferences->aiMode->id,
                        'name' => $preferences->aiMode->name,
                        'emoji' => $preferences->aiMode->emoji,
                    ] : null,

                    'summary' => $summary,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching preferences: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch preferences'
            ], 500);
        }
    }

    /**
     * Update user personalization preferences
     * User preferences CANNOT override system constraints
     */
    public function updatePreferences(Request $request)
    {
        $request->validate([
            'tone_level' => 'sometimes|integer|min:1|max:10',
            'detail_level' => 'sometimes|integer|min:1|max:10',
            'response_length' => 'sometimes|integer|min:1|max:10',
            'preferred_ai_mode_id' => 'sometimes|nullable|exists:ai_modes,id',
            'custom_system_prompt' => 'sometimes|nullable|string|max:1000',
            'personalization_template_id' => 'sometimes|nullable|exists:personalization_templates,id',
        ]);

        try {
            $user = Auth::user();
            $preferences = $user->chatPreferences ?? UserChatPreference::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'tone_level' => 5,
                    'detail_level' => 5,
                    'response_length' => 5,
                ]
            );

            $preferences->load(['systemPersonalization']);

            // Update preferences if provided
            if ($request->has('tone_level')) {
                $preferences->tone_level = $request->tone_level;
            }
            if ($request->has('detail_level')) {
                $preferences->detail_level = $request->detail_level;
            }
            if ($request->has('response_length')) {
                $preferences->response_length = $request->response_length;
            }
            if ($request->has('preferred_ai_mode_id')) {
                $preferences->preferred_ai_mode_id = $request->preferred_ai_mode_id;
            }
            if ($request->has('custom_system_prompt')) {
                $preferences->custom_system_prompt = $request->custom_system_prompt;
            }

            // If template is selected, apply its defaults
            if ($request->has('personalization_template_id') && $request->personalization_template_id) {
                $template = PersonalizationTemplate::findOrFail($request->personalization_template_id);
                ChatPersonalizationService::applyTemplateDefaults($user, $template);
                $preferences->refresh();
            }

            // CRITICAL: Apply system constraints BEFORE saving
            // This ensures user cannot override system-level requirements
            $preferences->applySystemConstraints();
            $preferences->save();

            // Verify no violations after save
            $violations = $preferences->getConstraintViolations();
            if (!empty($violations)) {
                Log::warning('Constraint violations detected after save', [
                    'user_id' => $user->id,
                    'violations' => $violations
                ]);
            }

            $preferences->load(['systemPersonalization', 'personalizationTemplate', 'aiMode']);

            return response()->json([
                'success' => true,
                'message' => 'Preferences updated successfully',
                'preferences' => [
                    'tone_level' => $preferences->tone_level,
                    'detail_level' => $preferences->detail_level,
                    'response_length' => $preferences->response_length,
                    'preferred_ai_mode_id' => $preferences->preferred_ai_mode_id,
                    'custom_system_prompt' => $preferences->custom_system_prompt,
                    'personalization_template_id' => $preferences->personalization_template_id,

                    'system_constraints' => $preferences->systemPersonalization ? [
                        'applied_min_tone' => $preferences->applied_min_tone,
                        'applied_max_tone' => $preferences->applied_max_tone,
                        'applied_min_detail' => $preferences->applied_min_detail,
                        'applied_max_detail' => $preferences->applied_max_detail,
                        'applied_min_length' => $preferences->applied_min_length,
                        'applied_max_length' => $preferences->applied_max_length,
                    ] : null,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating preferences: ' . $e->getMessage(), ['user_id' => Auth::id()]);
            return response()->json([
                'success' => false,
                'error' => 'Failed to update preferences'
            ], 500);
        }
    }

    /**
     * Get available personalization templates
     */
    public function getTemplates(Request $request)
    {
        try {
            $user = Auth::user();
            $templates = ChatPersonalizationService::getAvailableTemplates($user);

            return response()->json([
                'success' => true,
                'templates' => $templates
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching templates: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch templates'
            ], 500);
        }
    }

    /**
     * Get available AI modes
     */
    public function getAiModes(Request $request)
    {
        try {
            $modes = AIMode::active()->get(['id', 'name', 'description', 'emoji']);

            return response()->json([
                'success' => true,
                'modes' => $modes
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching AI modes: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch AI modes'
            ], 500);
        }
    }

    /**
     * Get preference level descriptions
     */
    public function getDescriptions(Request $request)
    {
        return response()->json([
            'success' => true,
            'descriptions' => [
                'tone' => [
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
                'detail' => [
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
                'length' => [
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
            ]
        ]);
    }

    /**
     * Reset preferences to defaults
     */
    public function resetPreferences(Request $request)
    {
        try {
            $user = Auth::user();
            $preferences = $user->chatPreferences ?? UserChatPreference::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'tone_level' => 5,
                    'detail_level' => 5,
                    'response_length' => 5,
                ]
            );

            // Reset to balanced defaults
            $preferences->tone_level = 5;
            $preferences->detail_level = 5;
            $preferences->response_length = 5;
            $preferences->preferred_ai_mode_id = null;
            $preferences->custom_system_prompt = null;
            $preferences->personalization_template_id = null;

            $preferences->applySystemConstraints();
            $preferences->save();

            return response()->json([
                'success' => true,
                'message' => 'Preferences reset to defaults',
                'preferences' => [
                    'tone_level' => $preferences->tone_level,
                    'detail_level' => $preferences->detail_level,
                    'response_length' => $preferences->response_length,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error resetting preferences: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to reset preferences'
            ], 500);
        }
    }
}
