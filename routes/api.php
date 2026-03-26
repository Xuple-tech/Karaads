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
use App\Http\Controllers\Agent\PageContentExplainerController;

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
        Route::get('/api-keys', [SettingsController::class, 'getApiKeys']);
        Route::post('/api-keys/gemini', [SettingsController::class, 'addGeminiKey']);
        Route::post('/api-keys/ollama', [SettingsController::class, 'addOllamaKey']);
        Route::post('/api-keys/openrouter', [SettingsController::class, 'addOpenRouterKey']);
        Route::put('/api-keys/{type}/{id}/status', [SettingsController::class, 'updateApiKeyStatus']);
        Route::delete('/api-keys/{type}/{id}', [SettingsController::class, 'deleteApiKey']);

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

    // Subscription Limits & Feature Access
    Route::prefix('subscription')->group(function () {
        Route::get('/limits', [SubscriptionLimitsController::class, 'show']);
        Route::post('/check-agent-creation', [SubscriptionLimitsController::class, 'checkAgentCreation']);
        Route::post('/check-agent-activation', [SubscriptionLimitsController::class, 'checkAgentActivation']);
        Route::post('/check-tools', [SubscriptionLimitsController::class, 'checkToolsUsage']);
        Route::get('/features', [SubscriptionLimitsController::class, 'getFeatures']);
        Route::get('/features/{featureKey}', [SubscriptionLimitsController::class, 'checkFeature']);
        Route::get('/tools', [SubscriptionLimitsController::class, 'getTools']);
        Route::get('/tools/{toolKey}', [SubscriptionLimitsController::class, 'checkTool']);
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

    // Phase 4: Enterprise Teams Management
    Route::prefix('teams')->group(function () {
        Route::get('/', [TeamController::class, 'index']);
        Route::post('/', [TeamController::class, 'store']);
        Route::get('/{team}', [TeamController::class, 'show']);
        Route::put('/{team}', [TeamController::class, 'update']);
        Route::delete('/{team}', [TeamController::class, 'destroy']);

        // Team members management
        Route::get('/{team}/members', [TeamController::class, 'members']);
        Route::post('/{team}/members/invite', [TeamController::class, 'inviteMember']);
        Route::delete('/{team}/members/{member}', [TeamController::class, 'removeMember']);
        Route::put('/{team}/members/{member}/role', [TeamController::class, 'updateMemberRole']);

        // Team invitations
        Route::get('/{team}/invitations', [TeamController::class, 'invitations']);
        Route::post('/invitations/{invitation}/accept', [TeamController::class, 'acceptInvitation']);
        Route::post('/invitations/{invitation}/decline', [TeamController::class, 'declineInvitation']);

        // Activity logs
        Route::get('/{team}/activity', [TeamController::class, 'activityLog']);

        // Workflows within team
        Route::get('/{team}/workflows', [WorkflowController::class, 'index']);
        Route::post('/{team}/workflows', [WorkflowController::class, 'store']);

        // Team executions
        Route::get('/{team}/executions', [WorkflowController::class, 'getTeamExecutions']);
    });

    // Phase 4: Workflow Management
    Route::prefix('workflows')->group(function () {
        Route::get('/{workflow}', [WorkflowController::class, 'show']);
        Route::put('/{workflow}', [WorkflowController::class, 'update']);
        Route::delete('/{workflow}', [WorkflowController::class, 'destroy']);
        Route::post('/{workflow}/execute', [WorkflowController::class, 'execute']);
        Route::get('/{workflow}/executions', [WorkflowController::class, 'executionHistory']);
        Route::get('/{workflow}/executions/{execution}', [WorkflowController::class, 'getExecution']);
        Route::post('/{workflow}/executions/{execution}/cancel', [WorkflowController::class, 'cancelExecution']);
        Route::delete('/{workflow}/executions/{execution}', [WorkflowController::class, 'deleteExecution']);
        Route::get('/{workflow}/stats', [WorkflowController::class, 'stats']);
        Route::post('/{workflow}/publish', [WorkflowController::class, 'publish']);
        Route::post('/{workflow}/revert', [WorkflowController::class, 'revert']);
        Route::get('/{workflow}/versions', [WorkflowController::class, 'versions']);
    });

    // Execution history
    Route::get('/workflow-executions/{execution}', [WorkflowController::class, 'executionDetails']);

    // Available tools for workflow builder
    Route::get('/tools/available', [WorkflowController::class, 'availableTools']);

    // Phase 4: MCP Server (Model Context Protocol)
    Route::prefix('mcp')->group(function () {
        // Public MCP protocol endpoints (session-based auth)
        Route::post('/initialize', [MCPServerController::class, 'initialize']);
        Route::post('/tools/list', [MCPServerController::class, 'toolsList']);
        Route::post('/tools/call', [MCPServerController::class, 'toolsCall']);
        Route::post('/resources/list', [MCPServerController::class, 'resourcesList']);
        Route::post('/resources/read', [MCPServerController::class, 'resourcesRead']);

        // Session management
        Route::post('/sessions', [MCPServerController::class, 'createSession']);
        Route::post('/sessions/{session}/validate', [MCPServerController::class, 'validateSession']);
        Route::delete('/sessions/{session}', [MCPServerController::class, 'revokeSession']);

        // Server configuration (requires auth)
        Route::get('/servers', [MCPServerController::class, 'serversList']);
        Route::post('/servers', [MCPServerController::class, 'registerServer']);
        Route::put('/servers/{server}', [MCPServerController::class, 'updateServer']);
        Route::post('/servers/{server}/test', [MCPServerController::class, 'testConnection']);
        Route::get('/logs', [MCPServerController::class, 'logs']);
    });
});

/**
 * Agent API Routes
 * Page Content Explainer and related agent features
 */
Route::prefix('agent')->group(function () {
    Route::post('/explain-page-content', [PageContentExplainerController::class, 'explainPageContent']);
});

// Include secure API routes (new security-enhanced routing system)
require __DIR__ . '/secure-api.php';
require __DIR__ . '/widget-api.php';
