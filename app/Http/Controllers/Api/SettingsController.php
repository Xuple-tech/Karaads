<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AIMode;
use App\Models\OllamaApiKey;
use App\Models\OpenRouterApiKey;
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

    public function getApiKeys()
    {
        try {
            $ollamaKeys = OllamaApiKey::where('user_id', Auth::id())->get(['id', 'name', 'endpoint', 'is_active', 'created_at']);
            $openRouterKeys = OpenRouterApiKey::where('user_id', Auth::id())->get(['id', 'name', 'is_active', 'created_at']);

            return response()->json([
                'success' => true,
                'api_keys' => [
                    'ollama' => $ollamaKeys,
                    'openrouter' => $openRouterKeys
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching API keys: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch API keys'
            ], 500);
        }
    }

    public function addOllamaKey(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'endpoint' => 'required|url',
            'api_key' => 'nullable|string',
        ]);

        try {
            $key = OllamaApiKey::create([
                'user_id' => Auth::id(),
                'name' => $request->name,
                'endpoint' => $request->endpoint,
                'api_key' => $request->api_key ? encrypt($request->api_key) : null,
                'is_active' => true
            ]);

            return response()->json([
                'success' => true,
                'key' => $key->only(['id', 'name', 'endpoint', 'is_active', 'created_at']),
                'message' => 'Ollama API key added successfully'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error adding Ollama API key: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to add API key'
            ], 500);
        }
    }

    public function addOpenRouterKey(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'api_key' => 'required|string',
        ]);

        try {
            $key = OpenRouterApiKey::create([
                'user_id' => Auth::id(),
                'name' => $request->name,
                'api_key' => encrypt($request->api_key),
                'is_active' => true
            ]);

            return response()->json([
                'success' => true,
                'key' => $key->only(['id', 'name', 'is_active', 'created_at']),
                'message' => 'OpenRouter API key added successfully'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error adding OpenRouter API key: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to add API key'
            ], 500);
        }
    }

    public function updateApiKeyStatus(Request $request, $type, $id)
    {
        $request->validate([
            'is_active' => 'required|boolean'
        ]);

        try {
            $model = match($type) {
                'ollama' => OllamaApiKey::class,
                'openrouter' => OpenRouterApiKey::class,
                default => throw new \InvalidArgumentException('Invalid key type')
            };

            $key = $model::where('user_id', Auth::id())->findOrFail($id);
            $key->update(['is_active' => $request->is_active]);

            return response()->json([
                'success' => true,
                'message' => 'API key status updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating API key status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update API key status'
            ], 500);
        }
    }

    public function deleteApiKey($type, $id)
    {
        try {
            $model = match($type) {
                'ollama' => OllamaApiKey::class,
                'openrouter' => OpenRouterApiKey::class,
                default => throw new \InvalidArgumentException('Invalid key type')
            };

            $key = $model::where('user_id', Auth::id())->findOrFail($id);
            $key->delete();

            return response()->json([
                'success' => true,
                'message' => 'API key deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting API key: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete API key'
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
