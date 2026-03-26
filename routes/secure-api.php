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
use App\Http\Controllers\TeamController;
use App\Http\Controllers\WorkflowController;
use App\Http\Controllers\MCPServerController;
use App\Http\Controllers\Api\SubscriptionLimitsController;
use App\Http\Middleware\BotDetection;
use App\Http\Middleware\LogApiUsageMiddleware;
use App\Http\Middleware\CheckSubscriptionRateLimit;

/**
 * Secure API Routes with Heavy Obfuscation
 * All endpoints use randomized paths and enhanced security
 */

// Security middleware stack
$securityMiddleware = [
    'throttle:60,1',
    BotDetection::class,
    LogApiUsageMiddleware::class,
    'api'
];

// Public authentication routes with obfuscated endpoints
Route::middleware($securityMiddleware)->group(function () {
    Route::post('/auth/x7k9m2p4/login', [AuthController::class, 'login'])->name('secure.auth.login');
    Route::post('/auth/q3w8r5t1/register', [AuthController::class, 'register'])->name('secure.auth.register');
});

// Protected routes with enhanced security
Route::middleware(array_merge($securityMiddleware, ['auth:sanctum']))->group(function () {

    // Authentication management
    Route::prefix('auth/secure')->group(function () {
        Route::post('/n8m4k7j2/logout', [AuthController::class, 'logout'])->name('secure.auth.logout');
        Route::get('/p9l6h3v5/user', [AuthController::class, 'user'])->name('secure.auth.user');
        Route::post('/r2t8y4u1/refresh', [AuthController::class, 'refreshToken'])->name('secure.auth.refresh');
    });

    // Chat/Conversations with UUID-based routing
    Route::prefix('chat/x9k2m7p4')->middleware([CheckSubscriptionRateLimit::class])->group(function () {
        Route::post('/conv/create/h5j8n3q1', [ChatController::class, 'createConversation'])->name('secure.chat.create');
        Route::get('/conv/list/w6r9t2y5', [ChatController::class, 'listConversations'])->name('secure.chat.list');
        Route::get('/conv/show/{uuid}/m4k7l9p2', [ChatController::class, 'showConversation'])->name('secure.chat.show');
        Route::put('/conv/update/{uuid}/q3w8e5r1', [ChatController::class, 'updateConversation'])->name('secure.chat.update');
        Route::delete('/conv/delete/{uuid}/z7x4c6v8', [ChatController::class, 'deleteConversation'])->name('secure.chat.delete');
        Route::post('/msg/send/a2s5d8f1', [ChatController::class, 'sendMessage'])->name('secure.chat.message');
    });

    // Voice Conversations with enhanced security
    Route::prefix('voice/secure/v8n5m2k9')->middleware([CheckSubscriptionRateLimit::class])->group(function () {
        Route::post('/conv/create/j4h7g3f6', [VoiceConversationController::class, 'createConversation'])->name('secure.voice.create');
        Route::get('/conv/list/l9p2o5i8', [VoiceConversationController::class, 'listConversations'])->name('secure.voice.list');
        Route::get('/conv/show/{uuid}/u1y4t7r0', [VoiceConversationController::class, 'showConversation'])->name('secure.voice.show');
        Route::delete('/conv/delete/{uuid}/e3w6q9a2', [VoiceConversationController::class, 'deleteConversation'])->name('secure.voice.delete');
        Route::post('/msg/send/s5d8f1g4', [VoiceConversationController::class, 'sendVoiceMessage'])->name('secure.voice.message');
        Route::get('/audio/get/{uuid}/h7j0k3l6', [VoiceConversationController::class, 'getAudio'])->name('secure.voice.audio');
    });

    // Email management with obfuscated paths
    Route::prefix('email/mgmt/b6n9m2k5')->group(function () {
        Route::get('/accounts/list/v8c1x4z7', [EmailController::class, 'listAccounts'])->name('secure.email.accounts.list');
        Route::post('/accounts/add/q3w6e9r2', [EmailController::class, 'addAccount'])->name('secure.email.accounts.add');
        Route::put('/accounts/update/{uuid}/t5y8u1i4', [EmailController::class, 'updateAccount'])->name('secure.email.accounts.update');
        Route::delete('/accounts/delete/{uuid}/o7p0a3s6', [EmailController::class, 'deleteAccount'])->name('secure.email.accounts.delete');
        Route::get('/emails/list/d9f2g5h8', [EmailController::class, 'listEmails'])->name('secure.email.list');
        Route::get('/emails/show/{uuid}/j1k4l7z0', [EmailController::class, 'showEmail'])->name('secure.email.show');
        Route::post('/send/msg/x3c6v9b2', [EmailController::class, 'sendEmail'])->name('secure.email.send');
        Route::put('/emails/read/{uuid}/n5m8k1j4', [EmailController::class, 'markAsRead'])->name('secure.email.read');
        Route::post('/accounts/sync/{uuid}/w7e0r3t6', [EmailController::class, 'syncEmails'])->name('secure.email.sync');
    });

    // Image Generation with rate limiting
    Route::prefix('images/gen/f4g7h0j3')->middleware([
        'throttle:10,1',
        CheckSubscriptionRateLimit::class
    ])->group(function () {
        Route::post('/create/k6l9z2x5', [ImageGenerationController::class, 'generate'])->name('secure.images.generate');
        Route::get('/list/c8v1b4n7', [ImageGenerationController::class, 'listGenerations'])->name('secure.images.list');
        Route::get('/show/{uuid}/m0p3q6w9', [ImageGenerationController::class, 'showGeneration'])->name('secure.images.show');
        Route::delete('/delete/{uuid}/a2s5d8f1', [ImageGenerationController::class, 'deleteGeneration'])->name('secure.images.delete');
    });

    // File Upload and Management
    Route::prefix('files/mgmt/x9z2c5v8')->middleware([
        'throttle:30,1'
    ])->group(function () {
        Route::post('/upload/b1n4m7k0', [ImageGenerationController::class, 'uploadFiles'])->name('secure.files.upload');
        Route::get('/chat/{chatId}/list/q3w6e9r2', [ImageGenerationController::class, 'getChatFiles'])->name('secure.files.chat.list');
        Route::delete('/delete/{fileId}/t5y8u1i4', [ImageGenerationController::class, 'deleteFile'])->name('secure.files.delete');
        Route::get('/download/{fileId}/o7p0a3s6', [ImageGenerationController::class, 'downloadFile'])->name('chat.file.download');
    });

    // Settings management with enhanced security
    Route::prefix('settings/mgmt/r4t7y0u3')->group(function () {
        Route::put('/profile/update/i6o9p2l5', [SettingsController::class, 'updateProfile'])->name('secure.settings.profile');
        Route::put('/password/change/h8j1k4z7', [SettingsController::class, 'changePassword'])->name('secure.settings.password');
        Route::get('/apikeys/list/g0f3d6s9', [SettingsController::class, 'getApiKeys'])->name('secure.settings.apikeys');
        Route::post('/apikeys/gemini/q2w5e8r1', [SettingsController::class, 'addGeminiKey'])->name('secure.settings.gemini');
        Route::post('/apikeys/ollama/t4y7u0i3', [SettingsController::class, 'addOllamaKey'])->name('secure.settings.ollama');
        Route::post('/apikeys/openrouter/p6a9s2d5', [SettingsController::class, 'addOpenRouterKey'])->name('secure.settings.openrouter');
        Route::put('/apikeys/status/{type}/{uuid}/l8z1x4c7', [SettingsController::class, 'updateApiKeyStatus'])->name('secure.settings.apikey.status');
        Route::delete('/apikeys/delete/{type}/{uuid}/v0b3n6m9', [SettingsController::class, 'deleteApiKey'])->name('secure.settings.apikey.delete');

        // AI Preferences with obfuscation
        Route::get('/ai/modes/k2j5h8g1', [SettingsController::class, 'getAiModes'])->name('secure.settings.ai.modes');
        Route::get('/ai/prefs/f4d7s0a3', [SettingsController::class, 'getAiPreferences'])->name('secure.settings.ai.prefs');
        Route::put('/ai/prefs/update/w6e9r2t5', [SettingsController::class, 'updateAiPreferences'])->name('secure.settings.ai.update');

        // Chat Preferences
        Route::get('/chat/prefs/y8u1i4o7', [ChatPreferenceController::class, 'getPreferences'])->name('secure.settings.chat.prefs');
        Route::put('/chat/prefs/update/q0w3e6r9', [ChatPreferenceController::class, 'updatePreferences'])->name('secure.settings.chat.update');
        Route::post('/chat/prefs/reset/z2x5c8v1', [ChatPreferenceController::class, 'resetPreferences'])->name('secure.settings.chat.reset');
        Route::get('/chat/modes/b4n7m0k3', [ChatPreferenceController::class, 'getAvailableModes'])->name('secure.settings.chat.modes');

        // User Personalization
        Route::get('/personal/prefs/h6g9f2d5', [PersonalizationController::class, 'getPreferences'])->name('secure.settings.personal.prefs');
        Route::put('/personal/prefs/update/j8k1l4z7', [PersonalizationController::class, 'updatePreferences'])->name('secure.settings.personal.update');
        Route::post('/personal/prefs/reset/s0a3d6f9', [PersonalizationController::class, 'resetPreferences'])->name('secure.settings.personal.reset');
        Route::get('/personal/templates/p2o5i8u1', [PersonalizationController::class, 'getTemplates'])->name('secure.settings.personal.templates');
        Route::get('/personal/ai/modes/c4v7b0n3', [PersonalizationController::class, 'getAiModes'])->name('secure.settings.personal.ai');
        Route::get('/personal/descriptions/x6z9a2s5', [PersonalizationController::class, 'getDescriptions'])->name('secure.settings.personal.desc');
    });

    // Subscription Limits with enhanced tracking
    Route::prefix('subscription/limits/m8k1j4h7')->group(function () {
        Route::get('/show/g0f3d6s9', [SubscriptionLimitsController::class, 'show'])->name('secure.subscription.limits');
        Route::post('/check/agent/create/q2w5e8r1', [SubscriptionLimitsController::class, 'checkAgentCreation'])->name('secure.subscription.agent.create');
        Route::post('/check/agent/activate/t4y7u0i3', [SubscriptionLimitsController::class, 'checkAgentActivation'])->name('secure.subscription.agent.activate');
        Route::post('/check/tools/usage/p6a9s2d5', [SubscriptionLimitsController::class, 'checkToolsUsage'])->name('secure.subscription.tools.check');
        Route::get('/features/list/l8z1x4c7', [SubscriptionLimitsController::class, 'getFeatures'])->name('secure.subscription.features');
        Route::get('/features/check/{key}/v0b3n6m9', [SubscriptionLimitsController::class, 'checkFeature'])->name('secure.subscription.feature.check');
        Route::get('/tools/list/k2j5h8g1', [SubscriptionLimitsController::class, 'getTools'])->name('secure.subscription.tools');
        Route::get('/tools/check/{key}/f4d7s0a3', [SubscriptionLimitsController::class, 'checkTool'])->name('secure.subscription.tool.check');
    });

    // Admin routes with enhanced security
    Route::prefix('admin/secure/w6e9r2t5')->middleware(['admin', 'throttle:30,1'])->group(function () {
        // AI Mode management
        Route::prefix('ai/modes/y8u1i4o7')->group(function () {
            Route::get('/list/q0w3e6r9', [AIModeController::class, 'index'])->name('secure.admin.ai.modes.list');
            Route::post('/create/z2x5c8v1', [AIModeController::class, 'store'])->name('secure.admin.ai.modes.create');
            Route::get('/show/{uuid}/b4n7m0k3', [AIModeController::class, 'show'])->name('secure.admin.ai.modes.show');
            Route::put('/update/{uuid}/h6g9f2d5', [AIModeController::class, 'update'])->name('secure.admin.ai.modes.update');
            Route::delete('/delete/{uuid}/j8k1l4z7', [AIModeController::class, 'destroy'])->name('secure.admin.ai.modes.delete');
            Route::patch('/toggle/{uuid}/s0a3d6f9', [AIModeController::class, 'toggleStatus'])->name('secure.admin.ai.modes.toggle');
            Route::post('/reorder/p2o5i8u1', [AIModeController::class, 'reorder'])->name('secure.admin.ai.modes.reorder');
        });

        // System Personalization management
        Route::prefix('personalization/system/c4v7b0n3')->group(function () {
            Route::get('/list/x6z9a2s5', [PersonalizationAdminController::class, 'getSystemPersonalizations'])->name('secure.admin.personal.system.list');
            Route::post('/create/m8k1j4h7', [PersonalizationAdminController::class, 'createSystemPersonalization'])->name('secure.admin.personal.system.create');
            Route::put('/update/{uuid}/g0f3d6s9', [PersonalizationAdminController::class, 'updateSystemPersonalization'])->name('secure.admin.personal.system.update');
        });

        // Personalization Templates management
        Route::prefix('personalization/templates/q2w5e8r1')->group(function () {
            Route::get('/list/t4y7u0i3', [PersonalizationAdminController::class, 'getTemplates'])->name('secure.admin.personal.templates.list');
            Route::post('/create/p6a9s2d5', [PersonalizationAdminController::class, 'createTemplate'])->name('secure.admin.personal.templates.create');
            Route::put('/update/{uuid}/l8z1x4c7', [PersonalizationAdminController::class, 'updateTemplate'])->name('secure.admin.personal.templates.update');
            Route::delete('/delete/{uuid}/v0b3n6m9', [PersonalizationAdminController::class, 'deleteTemplate'])->name('secure.admin.personal.templates.delete');
        });
    });

    // Enterprise Teams Management with heavy obfuscation
    Route::prefix('teams/enterprise/k2j5h8g1')->group(function () {
        Route::get('/list/f4d7s0a3', [TeamController::class, 'index'])->name('secure.teams.list');
        Route::post('/create/w6e9r2t5', [TeamController::class, 'store'])->name('secure.teams.create');
        Route::get('/show/{uuid}/y8u1i4o7', [TeamController::class, 'show'])->name('secure.teams.show');
        Route::put('/update/{uuid}/q0w3e6r9', [TeamController::class, 'update'])->name('secure.teams.update');
        Route::delete('/delete/{uuid}/z2x5c8v1', [TeamController::class, 'destroy'])->name('secure.teams.delete');

        // Team members management
        Route::get('/members/{uuid}/b4n7m0k3', [TeamController::class, 'members'])->name('secure.teams.members');
        Route::post('/members/invite/{uuid}/h6g9f2d5', [TeamController::class, 'inviteMember'])->name('secure.teams.invite');
        Route::delete('/members/remove/{uuid}/{memberUuid}/j8k1l4z7', [TeamController::class, 'removeMember'])->name('secure.teams.remove');
        Route::put('/members/role/{uuid}/{memberUuid}/s0a3d6f9', [TeamController::class, 'updateMemberRole'])->name('secure.teams.role');

        // Team invitations
        Route::get('/invitations/{uuid}/p2o5i8u1', [TeamController::class, 'invitations'])->name('secure.teams.invitations');
        Route::post('/invitations/accept/{uuid}/c4v7b0n3', [TeamController::class, 'acceptInvitation'])->name('secure.teams.accept');
        Route::post('/invitations/decline/{uuid}/x6z9a2s5', [TeamController::class, 'declineInvitation'])->name('secure.teams.decline');

        // Activity logs
        Route::get('/activity/{uuid}/m8k1j4h7', [TeamController::class, 'activityLog'])->name('secure.teams.activity');

        // Workflows within team
        Route::get('/workflows/{uuid}/g0f3d6s9', [WorkflowController::class, 'index'])->name('secure.teams.workflows');
        Route::post('/workflows/create/{uuid}/q2w5e8r1', [WorkflowController::class, 'store'])->name('secure.teams.workflows.create');

        // Team executions
        Route::get('/executions/{uuid}/t4y7u0i3', [WorkflowController::class, 'getTeamExecutions'])->name('secure.teams.executions');
    });

    // Workflow Management with enhanced security
    Route::prefix('workflows/mgmt/p6a9s2d5')->group(function () {
        Route::get('/show/{uuid}/l8z1x4c7', [WorkflowController::class, 'show'])->name('secure.workflows.show');
        Route::put('/update/{uuid}/v0b3n6m9', [WorkflowController::class, 'update'])->name('secure.workflows.update');
        Route::delete('/delete/{uuid}/k2j5h8g1', [WorkflowController::class, 'destroy'])->name('secure.workflows.delete');
        Route::post('/execute/{uuid}/f4d7s0a3', [WorkflowController::class, 'execute'])->name('secure.workflows.execute');
        Route::get('/executions/{uuid}/w6e9r2t5', [WorkflowController::class, 'executionHistory'])->name('secure.workflows.history');
        Route::get('/executions/show/{uuid}/{execUuid}/y8u1i4o7', [WorkflowController::class, 'getExecution'])->name('secure.workflows.execution');
        Route::post('/executions/cancel/{uuid}/{execUuid}/q0w3e6r9', [WorkflowController::class, 'cancelExecution'])->name('secure.workflows.cancel');
        Route::delete('/executions/delete/{uuid}/{execUuid}/z2x5c8v1', [WorkflowController::class, 'deleteExecution'])->name('secure.workflows.exec.delete');
        Route::get('/stats/{uuid}/b4n7m0k3', [WorkflowController::class, 'stats'])->name('secure.workflows.stats');
        Route::post('/publish/{uuid}/h6g9f2d5', [WorkflowController::class, 'publish'])->name('secure.workflows.publish');
        Route::post('/revert/{uuid}/j8k1l4z7', [WorkflowController::class, 'revert'])->name('secure.workflows.revert');
        Route::get('/versions/{uuid}/s0a3d6f9', [WorkflowController::class, 'versions'])->name('secure.workflows.versions');
    });

    // Execution history
    Route::get('/workflow/executions/details/{uuid}/p2o5i8u1', [WorkflowController::class, 'executionDetails'])->name('secure.workflows.exec.details');

    // Available tools for workflow builder
    Route::get('/tools/available/workflow/c4v7b0n3', [WorkflowController::class, 'availableTools'])->name('secure.workflows.tools');

    // MCP Server (Model Context Protocol) with enhanced security
    Route::prefix('mcp/protocol/x6z9a2s5')->group(function () {
        // Public MCP protocol endpoints (session-based auth)
        Route::post('/initialize/m8k1j4h7', [MCPServerController::class, 'initialize'])->name('secure.mcp.initialize');
        Route::post('/tools/list/g0f3d6s9', [MCPServerController::class, 'toolsList'])->name('secure.mcp.tools.list');
        Route::post('/tools/call/q2w5e8r1', [MCPServerController::class, 'toolsCall'])->name('secure.mcp.tools.call');
        Route::post('/resources/list/t4y7u0i3', [MCPServerController::class, 'resourcesList'])->name('secure.mcp.resources.list');
        Route::post('/resources/read/p6a9s2d5', [MCPServerController::class, 'resourcesRead'])->name('secure.mcp.resources.read');

        // Session management
        Route::post('/sessions/create/l8z1x4c7', [MCPServerController::class, 'createSession'])->name('secure.mcp.sessions.create');
        Route::post('/sessions/validate/{uuid}/v0b3n6m9', [MCPServerController::class, 'validateSession'])->name('secure.mcp.sessions.validate');
        Route::delete('/sessions/revoke/{uuid}/k2j5h8g1', [MCPServerController::class, 'revokeSession'])->name('secure.mcp.sessions.revoke');

        // Server configuration (requires auth)
        Route::get('/servers/list/f4d7s0a3', [MCPServerController::class, 'serversList'])->name('secure.mcp.servers.list');
        Route::post('/servers/register/w6e9r2t5', [MCPServerController::class, 'registerServer'])->name('secure.mcp.servers.register');
        Route::put('/servers/update/{uuid}/y8u1i4o7', [MCPServerController::class, 'updateServer'])->name('secure.mcp.servers.update');
        Route::post('/servers/test/{uuid}/q0w3e6r9', [MCPServerController::class, 'testConnection'])->name('secure.mcp.servers.test');
        Route::get('/logs/system/z2x5c8v1', [MCPServerController::class, 'logs'])->name('secure.mcp.logs');
    });
});
