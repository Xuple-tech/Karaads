<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SessionAuthController;
use App\Http\Controllers\Api\Chat\ConversationController as ChatConversationController;
use App\Http\Controllers\Api\Chat\MessageController as ChatMessageController;
use App\Http\Controllers\Api\SpaVoiceConversationController;
use App\Http\Controllers\Api\VoiceConversationController;
use App\Http\Controllers\Api\EmailController;
use App\Http\Controllers\Api\ImageGenerationController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\ChatPreferenceController;
use App\Http\Controllers\Api\PersonalizationController;
use App\Http\Controllers\Meta\MetaAccountController;
use App\Http\Controllers\Meta\MetaMessageController;
use App\Http\Controllers\Meta\MetaPreferenceController;
use App\Http\Controllers\Meta\MetaReplyTemplateController;
use App\Http\Controllers\Meta\MetaBroadcastController;
use App\Http\Controllers\WidgetConfigController;
use App\Http\Controllers\WidgetPublicController;
use App\Http\Controllers\WidgetWebsiteSourceController;
use App\Http\Controllers\Admin\PersonalizationAdminController;
use App\Http\Controllers\Admin\AIModeController;
use App\Http\Controllers\Admin\SubscriptionPlanController as AdminSubscriptionPlanController;

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

Route::prefix('session')->group(function () {
    Route::get('/user', [SessionAuthController::class, 'session'])->name('session.user');
    Route::post('/login', [SessionAuthController::class, 'login'])->name('session.login');
    Route::post('/register', [SessionAuthController::class, 'register'])->name('session.register');
    Route::post('/forgot-password', [SessionAuthController::class, 'forgotPassword'])->name('session.password.email');
    Route::post('/reset-password', [SessionAuthController::class, 'resetPassword'])->name('session.password.reset');
    Route::get('/verify-email/{id}/{hash}', [SessionAuthController::class, 'verifyEmail'])
        ->middleware(['signed', 'throttle:6,1'])
        ->name('session.verification.verify');
});

Route::prefix('widget')->group(function () {
    Route::get('/{token}/config', [WidgetPublicController::class, 'config']);
    Route::post('/{token}/session', [WidgetPublicController::class, 'startSession']);
    Route::post('/{token}/chat', [WidgetPublicController::class, 'chat']);
    Route::post('/plugin/{token}/sync', [WidgetWebsiteSourceController::class, 'pluginSync']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('session')->group(function () {
        Route::post('/logout', [SessionAuthController::class, 'logout'])->name('session.logout');
        Route::post('/confirm-password', [SessionAuthController::class, 'confirmPassword'])->name('session.password.confirm');
        Route::post('/email/verification-notification', [SessionAuthController::class, 'resendVerification'])
            ->middleware('throttle:6,1')
            ->name('session.verification.send');
    });

    Route::prefix('chat')->group(function () {
        Route::get('/conversations', [ChatConversationController::class, 'index'])->name('chat.api.conversations.index');
        Route::post('/conversations', [ChatConversationController::class, 'store'])->name('chat.api.conversations.store');
        Route::delete('/conversations', [ChatConversationController::class, 'destroyAll'])->name('chat.api.conversations.destroy-all');
        Route::get('/conversations/{conversation}', [ChatConversationController::class, 'show'])->name('chat.api.conversations.show');
        Route::get('/conversations/{conversation}/export', [ChatConversationController::class, 'export'])->name('chat.api.conversations.export');
        Route::patch('/conversations/{conversation}', [ChatConversationController::class, 'update'])->name('chat.api.conversations.update');
        Route::delete('/conversations/{conversation}', [ChatConversationController::class, 'destroy'])->name('chat.api.conversations.destroy');
        Route::post('/messages', [ChatMessageController::class, 'store'])->name('chat.api.messages.store');
        Route::post('/messages/stream', [ChatMessageController::class, 'storeStream'])->name('chat.api.messages.stream');
        Route::get('/messages/stream', fn () => response()->json(['error' => 'Use POST to this endpoint.'], 405))->name('chat.api.messages.stream.get-guard');
        Route::post('/messages/{message}/regenerate', [ChatMessageController::class, 'regenerate'])->name('chat.api.messages.regenerate');
        Route::post('/messages/{message}/regenerate/stream', [ChatMessageController::class, 'regenerateStream'])->name('chat.api.messages.regenerate.stream');
        Route::get('/files/{file}', [ChatMessageController::class, 'file'])->name('chat.file.download');
    });

    Route::prefix('spa/voice')->group(function () {
        Route::get('/conversations', [SpaVoiceConversationController::class, 'index'])->name('spa.voice.index');
        Route::post('/conversations', [SpaVoiceConversationController::class, 'store'])->name('spa.voice.store');
        Route::get('/conversations/{conversation}', [SpaVoiceConversationController::class, 'show'])->name('spa.voice.show');
    });
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/refresh', [AuthController::class, 'refreshToken']);

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

    Route::prefix('meta')->group(function () {
        Route::get('/dashboard', [MetaAccountController::class, 'dashboard']);
        Route::get('/accounts', [MetaAccountController::class, 'index']);
        Route::post('/accounts/initiate-oauth', [MetaAccountController::class, 'initiateOAuth']);
        Route::delete('/accounts/{account}', [MetaAccountController::class, 'disconnect']);
        Route::patch('/accounts/{account}/status', [MetaAccountController::class, 'updateStatus']);
        Route::get('/accounts/{account}/webhook-info', [MetaAccountController::class, 'webhookInfo']);
        Route::post('/accounts/{account}/test-connection', [MetaAccountController::class, 'testConnection']);
        Route::get('/accounts/{account}/preferences', [MetaPreferenceController::class, 'show']);
        Route::put('/accounts/{account}/preferences', [MetaPreferenceController::class, 'update']);
        Route::get('/accounts/{account}/conversations', [MetaMessageController::class, 'conversations']);
        Route::get('/accounts/{account}/conversations/{conversation}', [MetaMessageController::class, 'conversation']);
        Route::post('/messages/{message}/analyze', [MetaMessageController::class, 'analyzeAndDraft']);
        Route::put('/drafts/{draft}', [MetaMessageController::class, 'updateDraft']);
        Route::post('/drafts/{draft}/send', [MetaMessageController::class, 'sendDraft']);
        Route::post('/drafts/{draft}/reject', [MetaMessageController::class, 'rejectDraft']);
        Route::post('/conversations/{conversation}/send', [MetaMessageController::class, 'send']);

        // CRM
        Route::patch('/accounts/{account}/conversations/{conversation}/crm', [MetaMessageController::class, 'updateCrm']);

        // Quick Reply Templates
        Route::get('/accounts/{account}/templates', [MetaReplyTemplateController::class, 'index']);
        Route::post('/accounts/{account}/templates', [MetaReplyTemplateController::class, 'store']);
        Route::put('/accounts/{account}/templates/{template}', [MetaReplyTemplateController::class, 'update']);
        Route::delete('/accounts/{account}/templates/{template}', [MetaReplyTemplateController::class, 'destroy']);
        Route::post('/templates/{template}/use', [MetaReplyTemplateController::class, 'incrementUsage']);

        // Broadcasts
        Route::get('/accounts/{account}/broadcasts', [MetaBroadcastController::class, 'index']);
        Route::post('/accounts/{account}/broadcasts', [MetaBroadcastController::class, 'store']);
        Route::get('/accounts/{account}/broadcasts/{broadcast}', [MetaBroadcastController::class, 'show']);
        Route::post('/accounts/{account}/broadcasts/{broadcast}/send', [MetaBroadcastController::class, 'send']);
    });

    Route::prefix('widget')->group(function () {
        Route::get('/', [WidgetConfigController::class, 'index']);
        Route::post('/', [WidgetConfigController::class, 'store']);
        Route::get('/{widget}', [WidgetConfigController::class, 'show']);
        Route::put('/{widget}', [WidgetConfigController::class, 'update']);
        Route::delete('/{widget}', [WidgetConfigController::class, 'destroy']);

        Route::get('/{widget}/knowledge', [WidgetConfigController::class, 'listKnowledge']);
        Route::post('/{widget}/knowledge', [WidgetConfigController::class, 'addKnowledge']);
        Route::post('/{widget}/knowledge/pdf', [WidgetConfigController::class, 'uploadPdf']);
        Route::delete('/{widget}/knowledge/{item}', [WidgetConfigController::class, 'deleteKnowledge']);

        Route::post('/{widget}/website-sources', [WidgetWebsiteSourceController::class, 'store']);
        Route::put('/{widget}/website-sources/{source}', [WidgetWebsiteSourceController::class, 'update']);
        Route::post('/{widget}/website-sources/{source}/verify', [WidgetWebsiteSourceController::class, 'verify']);
        Route::post('/{widget}/website-sources/{source}/crawl', [WidgetWebsiteSourceController::class, 'crawl']);
        Route::get('/{widget}/website-sources/{source}/verification-file', [WidgetWebsiteSourceController::class, 'verificationFile']);

        Route::get('/{widget}/tools', [WidgetConfigController::class, 'listTools']);
        Route::post('/{widget}/tools', [WidgetConfigController::class, 'addTool']);
        Route::put('/{widget}/tools/{tool}', [WidgetConfigController::class, 'updateTool']);
        Route::delete('/{widget}/tools/{tool}', [WidgetConfigController::class, 'deleteTool']);
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

    // Admin routes for Subscription Plan management
    Route::prefix('admin/subscription-plans')->middleware('admin')->group(function () {
        Route::get('/', [AdminSubscriptionPlanController::class, 'index']);
        Route::get('/{subscriptionPlan}', [AdminSubscriptionPlanController::class, 'show']);
        Route::get('/{subscriptionPlan}/stats', [AdminSubscriptionPlanController::class, 'getStats']);
        Route::post('/', [AdminSubscriptionPlanController::class, 'store']);
        Route::put('/{subscriptionPlan}', [AdminSubscriptionPlanController::class, 'update']);
        Route::delete('/{subscriptionPlan}', [AdminSubscriptionPlanController::class, 'destroy']);
        Route::patch('/{subscriptionPlan}/toggle', [AdminSubscriptionPlanController::class, 'deactivate']);
    });
});
