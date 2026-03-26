<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserChatPreference;
use App\Models\AIMode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ChatPreferenceController extends Controller
{
    /**
     * Get user's chat preferences
     */
    public function getPreferences()
    {
        try {
            $user = Auth::user();

            $preferences = UserChatPreference::where('user_id', $user->id)
                ->with('aiMode')
                ->first();

            // If no preferences exist, create default ones
            if (!$preferences) {
                $preferences = UserChatPreference::create([
                    'user_id' => $user->id,
                    'tone_level' => 5,
                    'detail_level' => 5,
                    'response_length' => 5,
                    'is_active' => true,
                ]);
            }

            return response()->json([
                'success' => true,
                'preferences' => $this->formatPreferences($preferences),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching chat preferences: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch preferences'
            ], 500);
        }
    }

    /**
     * Update user's chat preferences
     */
    public function updatePreferences(Request $request)
    {
        $request->validate([
            'tone_level' => 'sometimes|integer|min:1|max:10',
            'detail_level' => 'sometimes|integer|min:1|max:10',
            'response_length' => 'sometimes|integer|min:1|max:10',
            'preferred_ai_mode_id' => 'sometimes|nullable|exists:ai_modes,id',
            'custom_system_prompt' => 'sometimes|nullable|string|max:2000',
        ]);

        try {
            $user = Auth::user();

            $preferences = UserChatPreference::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'tone_level' => 5,
                    'detail_level' => 5,
                    'response_length' => 5,
                ]
            );

            $preferences->update($request->only([
                'tone_level',
                'detail_level',
                'response_length',
                'preferred_ai_mode_id',
                'custom_system_prompt',
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Chat preferences updated successfully',
                'preferences' => $this->formatPreferences($preferences),
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating chat preferences: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update preferences'
            ], 500);
        }
    }

    /**
     * Get all available AI modes
     */
    public function getAvailableModes()
    {
        try {
            $modes = AIMode::active()->get();

            return response()->json([
                'success' => true,
                'modes' => $modes->map(fn($mode) => [
                    'id' => $mode->id,
                    'name' => $mode->name,
                    'description' => $mode->description,
                    'emoji' => $mode->emoji,
                    'system_prompt' => $mode->system_prompt,
                ]),
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
     * Reset preferences to defaults
     */
    public function resetPreferences()
    {
        try {
            $user = Auth::user();

            $preferences = UserChatPreference::where('user_id', $user->id)->first();

            if ($preferences) {
                $preferences->update([
                    'tone_level' => 5,
                    'detail_level' => 5,
                    'response_length' => 5,
                    'preferred_ai_mode_id' => null,
                    'custom_system_prompt' => null,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Chat preferences reset to defaults',
            ]);
        } catch (\Exception $e) {
            Log::error('Error resetting chat preferences: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to reset preferences'
            ], 500);
        }
    }

    /**
     * Format preferences for response
     */
    private function formatPreferences($preferences)
    {
        return [
            'id' => $preferences->id,
            'tone_level' => $preferences->tone_level,
            'tone_description' => UserChatPreference::getLevelDescription($preferences->tone_level, 'tone_level'),
            'detail_level' => $preferences->detail_level,
            'detail_description' => UserChatPreference::getLevelDescription($preferences->detail_level, 'detail_level'),
            'response_length' => $preferences->response_length,
            'length_description' => UserChatPreference::getLevelDescription($preferences->response_length, 'response_length'),
            'preferred_ai_mode_id' => $preferences->preferred_ai_mode_id,
            'ai_mode' => $preferences->aiMode ? [
                'id' => $preferences->aiMode->id,
                'name' => $preferences->aiMode->name,
                'emoji' => $preferences->aiMode->emoji,
            ] : null,
            'custom_system_prompt' => $preferences->custom_system_prompt,
            'is_active' => $preferences->is_active,
        ];
    }
}
