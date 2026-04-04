<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AIMode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class SettingsController extends Controller
{
    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . Auth::id(),
        ]);

        try {
            $user = Auth::user();
            $user->update($request->only(['name', 'email']));

            return response()->json([
                'success' => true,
                'user' => $user,
                'message' => 'Profile updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating profile: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update profile'
            ], 500);
        }
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        try {
            $user = Auth::user();

            if (!Hash::check($request->current_password, $user->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['Current password is incorrect.']
                ]);
            }

            $user->update([
                'password' => Hash::make($request->password)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error changing password: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to change password'
            ], 500);
        }
    }

    /**
     * Get all available AI modes
     */
    public function getAiModes()
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
     * Update user AI preferences (mode and call_by_name)
     */
    public function updateAiPreferences(Request $request)
    {
        $request->validate([
            'ai_mode_id' => 'nullable|exists:ai_modes,id',
            'call_by_name' => 'nullable|boolean',
        ]);

        try {
            $user = Auth::user();
            $user->update($request->only(['ai_mode_id', 'call_by_name']));

            return response()->json([
                'success' => true,
                'user' => $user->only(['id', 'ai_mode_id', 'call_by_name']),
                'message' => 'AI preferences updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating AI preferences: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update AI preferences'
            ], 500);
        }
    }

    /**
     * Get current user's AI preferences
     */
    public function getAiPreferences()
    {
        try {
            $user = Auth::user();
            $preferences = [
                'ai_mode_id' => $user->ai_mode_id,
                'call_by_name' => $user->call_by_name,
                'mode' => $user->aiMode ? $user->aiMode->only(['id', 'name', 'description', 'emoji']) : null,
            ];

            return response()->json([
                'success' => true,
                'preferences' => $preferences
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching AI preferences: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch AI preferences'
            ], 500);
        }
    }
}
