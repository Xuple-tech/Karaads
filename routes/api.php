<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\VoiceConversationController;
use App\Http\Controllers\Api\EmailController;
use App\Http\Controllers\Api\ImageGenerationController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\ChatPreferenceController;
use App\Http\Controllers\Api\PersonalizationController;
use App\Http\Controllers\Admin\PersonalizationAdminController;
use App\Http\Controllers\Admin\AIModeController;

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/refresh', [AuthController::class, 'refreshToken']);

    // Chat/Conversations
    Route::prefix('chat')->group(function () {
        Route::post('/conversations', [ChatController::class, 'createConversation']);
        Route::get('/conversations', [ChatController::class, 'listConversations']);
        Route::get('/conversations/{id}', [ChatController::class, 'showConversation']);
        Route::put('/conversations/{id}', [ChatController::class, 'updateConversation']);
        Route::delete('/conversations/{id}', [ChatController::class, 'deleteConversation']);
        Route::post('/message', [ChatController::class, 'sendMessage']);
    });

    // Voice Conversations
    Route::prefix('voice')->group(function () {
        Route::post('/conversations', [VoiceConversationController::class, 'createConversation']);
        Route::get('/conversations', [VoiceConversationController::class, 'listConversations']);
        Route::get('/conversations/{id}', [VoiceConversationController::class, 'showConversation']);
        Route::delete('/conversations/{id}', [VoiceConversationController::class, 'deleteConversation']);
        Route::post('/message', [VoiceConversationController::class, 'sendVoiceMessage']);
        Route::get('/audio/{id}', [VoiceConversationController::class, 'getAudio']);
    });

    // Email
    Route::prefix('email')->group(function () {
        Route::get('/accounts', [EmailController::class, 'listAccounts']);
        Route::post('/accounts', [EmailController::class, 'addAccount']);
        Route::put('/accounts/{id}', [EmailController::class, 'updateAccount']);
        Route::delete('/accounts/{id}', [EmailController::class, 'deleteAccount']);
        Route::get('/emails', [EmailController::class, 'listEmails']);
        Route::get('/emails/{id}', [EmailController::class, 'showEmail']);
        Route::post('/send', [EmailController::class, 'sendEmail']);
        Route::put('/emails/{id}/read', [EmailController::class, 'markAsRead']);
        Route::post('/accounts/{accountId}/sync', [EmailController::class, 'syncEmails']);
    });

    // Image Generation
    Route::prefix('images')->group(function () {
        Route::post('/generate', [ImageGenerationController::class, 'generate']);
        Route::get('/generations', [ImageGenerationController::class, 'listGenerations']);
        Route::get('/generations/{id}', [ImageGenerationController::class, 'showGeneration']);
        Route::delete('/generations/{id}', [ImageGenerationController::class, 'deleteGeneration']);
    });

    // Settings
    Route::prefix('settings')->group(function () {
        Route::put('/profile', [SettingsController::class, 'updateProfile']);
        Route::put('/password', [SettingsController::class, 'changePassword']);

        // AI Preferences
        Route::get('/ai-modes', [SettingsController::class, 'getAiModes']);
        Route::get('/ai-preferences', [SettingsController::class, 'getAiPreferences']);
        Route::put('/ai-preferences', [SettingsController::class, 'updateAiPreferences']);

        // Chat Preferences & Personalization
        Route::get('/chat-preferences', [ChatPreferenceController::class, 'getPreferences']);
        Route::put('/chat-preferences', [ChatPreferenceController::class, 'updatePreferences']);
        Route::post('/chat-preferences/reset', [ChatPreferenceController::class, 'resetPreferences']);
        Route::get('/chat-modes', [ChatPreferenceController::class, 'getAvailableModes']);

        // User Personalization
        Route::get('/personalization', [PersonalizationController::class, 'getPreferences']);
        Route::put('/personalization', [PersonalizationController::class, 'updatePreferences']);
        Route::post('/personalization/reset', [PersonalizationController::class, 'resetPreferences']);
        Route::get('/personalization/templates', [PersonalizationController::class, 'getTemplates']);
        Route::get('/personalization/ai-modes', [PersonalizationController::class, 'getAiModes']);
        Route::get('/personalization/descriptions', [PersonalizationController::class, 'getDescriptions']);
    });

    // Admin routes for AI Mode management
    Route::prefix('admin/ai-modes')->middleware('admin')->group(function () {
        Route::get('/', [AIModeController::class, 'index']);
        Route::post('/', [AIModeController::class, 'store']);
        Route::get('/{id}', [AIModeController::class, 'show']);
        Route::put('/{id}', [AIModeController::class, 'update']);
        Route::delete('/{id}', [AIModeController::class, 'destroy']);
        Route::patch('/{id}/toggle', [AIModeController::class, 'toggleStatus']);
        Route::post('/reorder', [AIModeController::class, 'reorder']);
    });

    // Admin routes for System Personalization management
    Route::prefix('admin/system-personalizations')->middleware('admin')->group(function () {
        Route::get('/', [PersonalizationAdminController::class, 'getSystemPersonalizations']);
        Route::post('/', [PersonalizationAdminController::class, 'createSystemPersonalization']);
        Route::put('/{id}', [PersonalizationAdminController::class, 'updateSystemPersonalization']);
    });

    // Admin routes for Personalization Templates management
    Route::prefix('admin/personalization-templates')->middleware('admin')->group(function () {
        Route::get('/', [PersonalizationAdminController::class, 'getTemplates']);
        Route::post('/', [PersonalizationAdminController::class, 'createTemplate']);
        Route::put('/{id}', [PersonalizationAdminController::class, 'updateTemplate']);
        Route::delete('/{id}', [PersonalizationAdminController::class, 'deleteTemplate']);
    });
});
