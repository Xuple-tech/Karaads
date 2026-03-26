<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DeveloperApiController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\SaasOwnerController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AgentApiKeyController;
use App\Http\Controllers\Admin\AgentKnowledgeBaseController;
use App\Http\Controllers\Admin\AgentPlanController;
use App\Http\Controllers\Admin\AgentTemplateController;
use App\Http\Controllers\Admin\AgentToolController;
use App\Http\Controllers\Admin\AgentUsageStatController;
use App\Http\Controllers\Admin\AgentWidgetSettingsController;
use App\Http\Controllers\Admin\AIAgentController;
use App\Http\Controllers\Admin\GrokApiController;
use App\Http\Controllers\Admin\PromptController;
use App\Http\Controllers\Admin\AIModeController;
use App\Http\Controllers\Admin\PersonalizationController;
use App\Http\Controllers\Admin\SiteController;
use App\Http\Controllers\Admin\SiteSubscriptionController;
use App\Http\Controllers\Api\Demo\DemoController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\AdminOrStaffMiddleware;
use Illuminate\Support\Facades\Route;

// ========== ADMIN MANAGEMENT ROUTES ==========
Route::middleware([AdminMiddleware::class])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Image uploads
    Route::get('/image-uploads', [DashboardController::class, 'imageUploads'])->name('image-uploads');
    Route::delete('/image-uploads/{id}', [DashboardController::class, 'deleteImage'])->name('image-uploads.delete');

    // User statistics
    Route::get('/user-stats', [DashboardController::class, 'userStats'])->name('user-stats');

    // User management
    Route::resource('users', UserController::class);

    // Staff management (Admin/CTO only)
    Route::resource('staff', StaffController::class);

    // SaaS Owner management (Admin/CTO only)
    Route::resource('saas-owners', SaasOwnerController::class);

    // ========== NEW MANAGEMENT FEATURES ==========

    // Admin dashboard with system overview
    Route::get('/management/dashboard', [AdminDashboardController::class, 'index'])->name('management-dashboard');
    Route::get('/management/alerts', [AdminDashboardController::class, 'alerts'])->name('management.alerts');
    Route::post('/management/alerts/{id}/resolve', [AdminDashboardController::class, 'resolveAlert'])->name('management.alerts.resolve');
    Route::get('/management/audit-logs', [AdminDashboardController::class, 'auditLogs'])->name('management.audit-logs');
    Route::get('/management/configuration', [AdminDashboardController::class, 'configuration'])->name('management.configuration');
    Route::put('/management/configuration/{config}', [AdminDashboardController::class, 'updateConfiguration'])->name('management.configuration.update');

    // Grok API Management
    Route::prefix('grok-api')->name('grok-api.')->group(function () {
        Route::get('/', [GrokApiController::class, 'index'])->name('index');
        Route::get('/create', [GrokApiController::class, 'create'])->name('create');
        Route::post('/', [GrokApiController::class, 'store'])->name('store');
        Route::get('/{config}', [GrokApiController::class, 'show'])->name('show');
        Route::get('/{config}/edit', [GrokApiController::class, 'edit'])->name('edit');
        Route::put('/{config}', [GrokApiController::class, 'update'])->name('update');
        Route::post('/{config}/test', [GrokApiController::class, 'test'])->name('test');
        Route::post('/{config}/deactivate', [GrokApiController::class, 'deactivate'])->name('deactivate');
        Route::delete('/{config}', [GrokApiController::class, 'destroy'])->name('destroy');
    });

    Route::prefix('developer-api')->name('developer-api.')->group(function () {
        Route::get('/', [DeveloperApiController::class, 'index'])->name('index');
        Route::post('/models', [DeveloperApiController::class, 'storeModel'])->name('models.store');
        Route::put('/models/{apiModel}', [DeveloperApiController::class, 'updateModel'])->name('models.update');
        Route::post('/models/{apiModel}/toggle', [DeveloperApiController::class, 'toggleModel'])->name('models.toggle');
        Route::post('/keys/{developerApiKey}/toggle', [DeveloperApiController::class, 'toggleKey'])->name('keys.toggle');
        Route::post('/keys/{developerApiKey}/regenerate', [DeveloperApiController::class, 'regenerateKey'])->name('keys.regenerate');
        Route::post('/wallets/{user}/adjust', [DeveloperApiController::class, 'adjustWallet'])->name('wallets.adjust');
    });

    // AI Prompt Templates
    Route::prefix('prompts')->name('prompts.')->group(function () {
        Route::get('/', [PromptController::class, 'index'])->name('index');
        Route::get('/create', [PromptController::class, 'create'])->name('create');
        Route::post('/', [PromptController::class, 'store'])->name('store');
        Route::get('/{prompt}', [PromptController::class, 'show'])->name('show');
        Route::get('/{prompt}/edit', [PromptController::class, 'edit'])->name('edit');
        Route::put('/{prompt}', [PromptController::class, 'update'])->name('update');
        Route::post('/{prompt}/test', [PromptController::class, 'test'])->name('test');
        Route::delete('/{prompt}', [PromptController::class, 'destroy'])->name('destroy');
    });

    // AI Modes Management
    Route::prefix('ai-modes')->name('ai-modes.')->group(function () {
        Route::get('/', [AIModeController::class, 'index'])->name('index');
        Route::get('/create', [AIModeController::class, 'create'])->name('create');
        Route::post('/', [AIModeController::class, 'store'])->name('store');
        Route::get('/{mode}', [AIModeController::class, 'show'])->name('show');
        Route::get('/{mode}/edit', [AIModeController::class, 'edit'])->name('edit');
        Route::put('/{mode}', [AIModeController::class, 'update'])->name('update');
        Route::delete('/{mode}', [AIModeController::class, 'destroy'])->name('destroy');
        Route::patch('/{mode}/toggle', [AIModeController::class, 'toggleStatus'])->name('toggle');
    });

    // System Personalizations Management
    Route::prefix('personalizations')->name('personalizations.')->group(function () {
        Route::get('/', [PersonalizationController::class, 'indexPersonalizations'])->name('index');
        Route::get('/create', [PersonalizationController::class, 'createPersonalization'])->name('create');
        Route::post('/', [PersonalizationController::class, 'storePersonalization'])->name('store');
        Route::get('/{personalization}', [PersonalizationController::class, 'editPersonalization'])->name('edit');
        Route::put('/{personalization}', [PersonalizationController::class, 'updatePersonalization'])->name('update');
        Route::delete('/{personalization}', [PersonalizationController::class, 'destroyPersonalization'])->name('destroy');
    });

    // Personalization Templates Management
    Route::prefix('personalization-templates')->name('personalization-templates.')->group(function () {
        Route::get('/', [PersonalizationController::class, 'indexTemplates'])->name('index');
        Route::get('/create', [PersonalizationController::class, 'createTemplate'])->name('create');
        Route::post('/', [PersonalizationController::class, 'storeTemplate'])->name('store');
        Route::get('/{template}', [PersonalizationController::class, 'editTemplate'])->name('edit');
        Route::put('/{template}', [PersonalizationController::class, 'updateTemplate'])->name('update');
        Route::delete('/{template}', [PersonalizationController::class, 'destroyTemplate'])->name('destroy');
        Route::get('/statistics', [PersonalizationController::class, 'statistics'])->name('statistics');
    });


    // ========== AGENT MANAGEMENT ROUTES ==========
    Route::prefix('agent-templates')->name('agent-templates.')->group(function () {
        Route::get('/', [AgentTemplateController::class, 'index'])->name('index');
        Route::get('/create', [AgentTemplateController::class, 'create'])->name('create');
        Route::post('/', [AgentTemplateController::class, 'store'])->name('store');
        Route::get('/{agentTemplate}', [AgentTemplateController::class, 'show'])->name('show');
        Route::get('/{agentTemplate}/edit', [AgentTemplateController::class, 'edit'])->name('edit');
        Route::put('/{agentTemplate}', [AgentTemplateController::class, 'update'])->name('update');
        Route::delete('/{agentTemplate}', [AgentTemplateController::class, 'destroy'])->name('destroy');
        Route::patch('/{agentTemplate}/toggle', [AgentTemplateController::class, 'toggleStatus'])->name('toggle');
    });

    Route::prefix('agent-knowledge-bases')->name('agent-knowledge-bases.')->group(function () {
        Route::get('/', [AgentKnowledgeBaseController::class, 'index'])->name('index');
        Route::get('/create', [AgentKnowledgeBaseController::class, 'create'])->name('create');
        Route::post('/', [AgentKnowledgeBaseController::class, 'store'])->name('store');
        Route::get('/{agentKnowledgeBase}', [AgentKnowledgeBaseController::class, 'show'])->name('show');
        Route::get('/{agentKnowledgeBase}/edit', [AgentKnowledgeBaseController::class, 'edit'])->name('edit');
        Route::put('/{agentKnowledgeBase}', [AgentKnowledgeBaseController::class, 'update'])->name('update');
        Route::delete('/{agentKnowledgeBase}', [AgentKnowledgeBaseController::class, 'destroy'])->name('destroy');
        Route::patch('/{agentKnowledgeBase}/toggle', [AgentKnowledgeBaseController::class, 'toggleStatus'])->name('toggle');
        Route::post('/bulk-action', [AgentKnowledgeBaseController::class, 'bulkAction'])->name('bulk-action');
    });

    Route::prefix('agent-tools')->name('agent-tools.')->group(function () {
        Route::get('/', [AgentToolController::class, 'index'])->name('index');
        Route::get('/create', [AgentToolController::class, 'create'])->name('create');
        Route::post('/', [AgentToolController::class, 'store'])->name('store');
        Route::get('/{agentTool}', [AgentToolController::class, 'show'])->name('show');
        Route::get('/{agentTool}/edit', [AgentToolController::class, 'edit'])->name('edit');
        Route::put('/{agentTool}', [AgentToolController::class, 'update'])->name('update');
        Route::delete('/{agentTool}', [AgentToolController::class, 'destroy'])->name('destroy');
        Route::post('/{agentTool}/test', [AgentToolController::class, 'test'])->name('test');
    });

    Route::prefix('agent-plans')->name('agent-plans.')->group(function () {
        Route::get('/', [AgentPlanController::class, 'index'])->name('index');
        Route::get('/create', [AgentPlanController::class, 'create'])->name('create');
        Route::post('/', [AgentPlanController::class, 'store'])->name('store');
        Route::get('/{agentPlan}', [AgentPlanController::class, 'show'])->name('show');
        Route::get('/{agentPlan}/edit', [AgentPlanController::class, 'edit'])->name('edit');
        Route::put('/{agentPlan}', [AgentPlanController::class, 'update'])->name('update');
        Route::delete('/{agentPlan}', [AgentPlanController::class, 'destroy'])->name('destroy');
        Route::patch('/{agentPlan}/toggle', [AgentPlanController::class, 'toggleStatus'])->name('toggle');
        Route::post('/{agentPlan}/sync-stripe', [AgentPlanController::class, 'syncStripe'])->name('sync-stripe');
    });

    Route::prefix('agent-api-keys')->name('agent-api-keys.')->group(function () {
        Route::get('/', [AgentApiKeyController::class, 'index'])->name('index');
        Route::get('/create', [AgentApiKeyController::class, 'create'])->name('create');
        Route::post('/', [AgentApiKeyController::class, 'store'])->name('store');
        Route::get('/{agentApiKey}', [AgentApiKeyController::class, 'show'])->name('show');
        Route::get('/{agentApiKey}/edit', [AgentApiKeyController::class, 'edit'])->name('edit');
        Route::put('/{agentApiKey}', [AgentApiKeyController::class, 'update'])->name('update');
        Route::delete('/{agentApiKey}', [AgentApiKeyController::class, 'destroy'])->name('destroy');
        Route::post('/{agentApiKey}/regenerate', [AgentApiKeyController::class, 'regenerate'])->name('regenerate');
        Route::post('/{agentApiKey}/regenerate-secret', [AgentApiKeyController::class, 'regenerateSecret'])->name('regenerate-secret');
        Route::post('/{agentApiKey}/revoke', [AgentApiKeyController::class, 'revoke'])->name('revoke');
    });

    Route::prefix('agent-widget-settings')->name('agent-widget-settings.')->group(function () {
        Route::get('/', [AgentWidgetSettingsController::class, 'index'])->name('index');
        Route::get('/create', [AgentWidgetSettingsController::class, 'create'])->name('create');
        Route::post('/', [AgentWidgetSettingsController::class, 'store'])->name('store');
        Route::get('/{agentWidgetSetting}', [AgentWidgetSettingsController::class, 'show'])->name('show');
        Route::get('/{agentWidgetSetting}/edit', [AgentWidgetSettingsController::class, 'edit'])->name('edit');
        Route::put('/{agentWidgetSetting}', [AgentWidgetSettingsController::class, 'update'])->name('update');
        Route::delete('/{agentWidgetSetting}', [AgentWidgetSettingsController::class, 'destroy'])->name('destroy');
        Route::get('/{agentWidgetSetting}/script', [AgentWidgetSettingsController::class, 'getScript'])->name('script');
        Route::get('/{agentWidgetSetting}/preview', [AgentWidgetSettingsController::class, 'preview'])->name('preview');
    });

    Route::prefix('ai-agents')->name('ai-agents.')->group(function () {
        Route::get('/', [AIAgentController::class, 'index'])->name('index');
        Route::get('/create', [AIAgentController::class, 'create'])->name('create');
        Route::post('/', [AIAgentController::class, 'store'])->name('store');
        Route::get('/{aiAgent}', [AIAgentController::class, 'show'])->name('show');
        Route::get('/{aiAgent}/edit', [AIAgentController::class, 'edit'])->name('edit');
        Route::put('/{aiAgent}', [AIAgentController::class, 'update'])->name('update');
        Route::delete('/{aiAgent}', [AIAgentController::class, 'destroy'])->name('destroy');
        Route::patch('/{aiAgent}/toggle', [AIAgentController::class, 'toggleStatus'])->name('toggle');
        Route::post('/{aiAgent}/clone', [AIAgentController::class, 'clone'])->name('clone');
        Route::get('/{aiAgent}/export', [AIAgentController::class, 'export'])->name('export');
        Route::post('/import', [AIAgentController::class, 'import'])->name('import');
    });

    Route::prefix('sites')->name('sites.')->group(function () {
        Route::get('/', [SiteController::class, 'index'])->name('index');
        Route::get('/create', [SiteController::class, 'create'])->name('create');
        Route::post('/', [SiteController::class, 'store'])->name('store');
        Route::get('/{site}', [SiteController::class, 'show'])->name('show');
        Route::get('/{site}/edit', [SiteController::class, 'edit'])->name('edit');
        Route::put('/{site}', [SiteController::class, 'update'])->name('update');
        Route::delete('/{site}', [SiteController::class, 'destroy'])->name('destroy');
        Route::patch('/{site}/toggle', [SiteController::class, 'toggleStatus'])->name('toggle');
        Route::patch('/{site}/toggle-widget', [SiteController::class, 'toggleWidget'])->name('toggle-widget');
        Route::post('/{site}/verify', [SiteController::class, 'verify'])->name('verify');
        Route::post('/{site}/resend-verification', [SiteController::class, 'resendVerification'])->name('resend-verification');
        Route::get('/{site}/embed-code', [SiteController::class, 'embedCode'])->name('embed-code');
        Route::get('/{site}/analytics', [SiteController::class, 'analytics'])->name('analytics');
    });

    Route::prefix('agent-usage-stats')->name('agent-usage-stats.')->group(function () {
        Route::get('/', [AgentUsageStatController::class, 'index'])->name('index');
        Route::get('/create', [AgentUsageStatController::class, 'create'])->name('create');
        Route::post('/', [AgentUsageStatController::class, 'store'])->name('store');
        Route::get('/{agentUsageStat}', [AgentUsageStatController::class, 'show'])->name('show');
        Route::get('/{agentUsageStat}/edit', [AgentUsageStatController::class, 'edit'])->name('edit');
        Route::put('/{agentUsageStat}', [AgentUsageStatController::class, 'update'])->name('update');
        Route::delete('/{agentUsageStat}', [AgentUsageStatController::class, 'destroy'])->name('destroy');
        Route::get('/report', [AgentUsageStatController::class, 'report'])->name('report');
        Route::get('/dashboard', [AgentUsageStatController::class, 'dashboard'])->name('dashboard');
    });

    Route::prefix('site-subscriptions')->name('site-subscriptions.')->group(function () {
        Route::get('/', [SiteSubscriptionController::class, 'index'])->name('index');
        Route::get('/create', [SiteSubscriptionController::class, 'create'])->name('create');
        Route::post('/', [SiteSubscriptionController::class, 'store'])->name('store');
        Route::get('/{siteSubscription}', [SiteSubscriptionController::class, 'show'])->name('show');
        Route::get('/{siteSubscription}/edit', [SiteSubscriptionController::class, 'edit'])->name('edit');
        Route::put('/{siteSubscription}', [SiteSubscriptionController::class, 'update'])->name('update');
        Route::delete('/{siteSubscription}', [SiteSubscriptionController::class, 'destroy'])->name('destroy');
        Route::post('/{siteSubscription}/cancel', [SiteSubscriptionController::class, 'cancel'])->name('cancel');
        Route::post('/{siteSubscription}/reactivate', [SiteSubscriptionController::class, 'reactivate'])->name('reactivate');
        Route::post('/{siteSubscription}/renew', [SiteSubscriptionController::class, 'renew'])->name('renew');
        Route::post('/{siteSubscription}/change-plan', [SiteSubscriptionController::class, 'changePlan'])->name('change-plan');
        Route::post('/{siteSubscription}/extend-trial', [SiteSubscriptionController::class, 'extendTrial'])->name('extend-trial');
        Route::post('/{siteSubscription}/sync-stripe', [SiteSubscriptionController::class, 'syncStripe'])->name('sync-stripe');
        Route::get('/analytics', [SiteSubscriptionController::class, 'analytics'])->name('analytics');
    });
});


// Demo Routes
Route::prefix('demo')->name('demo.')->group(function () {
    // Demo pages
    Route::get('/', [\App\Http\Controllers\Demo\DemoController::class, 'index'])->name('index');
    Route::get('/agent/{agent}', [\App\Http\Controllers\Demo\DemoController::class, 'show'])->name('agent');
    Route::get('/preview/{widgetSetting}', [\App\Http\Controllers\Demo\DemoController::class, 'preview'])->name('preview');

    // API endpoints for demo
    Route::prefix('api')->name('api.')->group(function () {
        Route::get('/agents', [DemoController::class, 'getAgents'])->name('agents');
        Route::get('/agents/{agent}/widget-settings', [DemoController::class, 'getWidgetSettings'])->name('widget-settings');
        Route::get('/agents/{agent}/script', [DemoController::class, 'generateScript'])->name('script');
        Route::get('/agents/{agent}/stats', [DemoController::class, 'getWidgetStats'])->name('stats');
        Route::get('/data', [DemoController::class, 'getDemoData'])->name('data');

        Route::post('/agents/{agent}/conversation', [DemoController::class, 'testConversation'])->name('conversation');
        Route::post('/validate-config', [DemoController::class, 'validateConfig'])->name('validate-config');
    });
});

// Widget script endpoints (public)
Route::get('/widget/script/{agent}', [DemoController::class, 'generateScript'])->name('widget.script');
Route::get('/widget/config/{agent}', [DemoController::class, 'getWidgetSettings'])->name('widget.config');
