<?php

use App\Http\Controllers\User\DashboardController;
use App\Http\Controllers\User\SiteController;
use App\Http\Controllers\User\AIAgentController;
use App\Http\Controllers\User\AgentConversationController;
use App\Http\Controllers\User\AgentMessageController;
use App\Http\Controllers\User\AgentKnowledgeBaseController;
use App\Http\Controllers\User\AgentToolController;
use App\Http\Controllers\User\AgentWidgetSettingsController;
use App\Http\Controllers\User\AgentApiKeyController;
use App\Http\Controllers\User\AgentUsageController;
use App\Http\Controllers\User\SubscriptionController;
use App\Http\Controllers\User\AgentTemplateController;
use Illuminate\Support\Facades\Route;

// User dashboard and profile routes
Route::middleware(['auth'])->prefix('ai-agents')->name('user.')->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Sites Management
    Route::prefix('sites')->name('sites.')->group(function () {
        Route::get('/', [SiteController::class, 'index'])->name('index');
        Route::get('/create', [SiteController::class, 'create'])->name('create');
        Route::post('/', [SiteController::class, 'store'])->name('store');
        Route::get('/{site}', [SiteController::class, 'show'])->name('show');
        Route::get('/{site}/edit', [SiteController::class, 'edit'])->name('edit');
        Route::put('/{site}', [SiteController::class, 'update'])->name('update');
        Route::delete('/{site}', [SiteController::class, 'destroy'])->name('destroy');
        Route::post('/{site}/verify', [SiteController::class, 'verify'])->name('verify');
        Route::post('/{site}/toggle-widget', [SiteController::class, 'toggleWidget'])->name('toggle-widget');
        Route::get('/{site}/agents', [SiteController::class, 'agents'])->name('agents');
    });

    // AI Agents Management
    Route::prefix('agents')->name('agents.')->group(function () {
        Route::get('/', [AIAgentController::class, 'index'])->name('index');
        Route::get('/create', [AIAgentController::class, 'create'])->name('create');
        Route::post('/', [AIAgentController::class, 'store'])->name('store');
        Route::get('/{agent}', [AIAgentController::class, 'show'])->name('show');
        Route::get('/{agent}/edit', [AIAgentController::class, 'edit'])->name('edit');
        Route::put('/{agent}', [AIAgentController::class, 'update'])->name('update');
        Route::delete('/{agent}', [AIAgentController::class, 'destroy'])->name('destroy');
        Route::post('/{agent}/toggle-active', [AIAgentController::class, 'toggleActive'])->name('toggle-active');
        Route::post('/{agent}/duplicate', [AIAgentController::class, 'duplicate'])->name('duplicate');

        // Agent Conversations
        Route::prefix('{agent}/conversations')->name('conversations.')->group(function () {
            Route::get('/', [AgentConversationController::class, 'index'])->name('index');
            Route::get('/{conversation}', [AgentConversationController::class, 'show'])->name('show');
            Route::delete('/{conversation}', [AgentConversationController::class, 'destroy'])->name('destroy');
            Route::post('/{conversation}/close', [AgentConversationController::class, 'close'])->name('close');
            Route::post('/{conversation}/reopen', [AgentConversationController::class, 'reopen'])->name('reopen');
        });

        // Agent Messages
        Route::prefix('{agent}/messages')->name('messages.')->group(function () {
            Route::get('/', [AgentMessageController::class, 'index'])->name('index');
            Route::post('/{message}/mark-read', [AgentMessageController::class, 'markRead'])->name('mark-read');
        });

        // Agent Knowledge Base
        Route::prefix('{agent}/knowledge-base')->name('knowledge-base.')->group(function () {
            Route::get('/', [AgentKnowledgeBaseController::class, 'index'])->name('index');
            Route::get('/create', [AgentKnowledgeBaseController::class, 'create'])->name('create');
            Route::post('/', [AgentKnowledgeBaseController::class, 'store'])->name('store');
            Route::get('/{knowledge}/edit', [AgentKnowledgeBaseController::class, 'edit'])->name('edit');
            Route::put('/{knowledge}', [AgentKnowledgeBaseController::class, 'update'])->name('update');
            Route::delete('/{knowledge}', [AgentKnowledgeBaseController::class, 'destroy'])->name('destroy');
            Route::post('/{knowledge}/toggle-active', [AgentKnowledgeBaseController::class, 'toggleActive'])->name('toggle-active');
            Route::post('/import', [AgentKnowledgeBaseController::class, 'import'])->name('import');
        });

        // Agent Tools
        Route::prefix('{agent}/tools')->name('tools.')->group(function () {
            Route::get('/', [AgentToolController::class, 'index'])->name('index');
            Route::get('/create', [AgentToolController::class, 'create'])->name('create');
            Route::post('/', [AgentToolController::class, 'store'])->name('store');
            Route::get('/{tool}/edit', [AgentToolController::class, 'edit'])->name('edit');
            Route::put('/{tool}', [AgentToolController::class, 'update'])->name('update');
            Route::delete('/{tool}', [AgentToolController::class, 'destroy'])->name('destroy');
            Route::post('/{tool}/toggle-active', [AgentToolController::class, 'toggleActive'])->name('toggle-active');
            Route::post('/reorder', [AgentToolController::class, 'reorder'])->name('reorder');
        });

        // Agent Widget Settings
        Route::prefix('{agent}/widget-settings')->name('widget-settings.')->group(function () {
            Route::get('/', [AgentWidgetSettingsController::class, 'show'])->name('show');
            Route::get('/edit', [AgentWidgetSettingsController::class, 'edit'])->name('edit');
            Route::put('/', [AgentWidgetSettingsController::class, 'update'])->name('update');
            Route::post('/preview', [AgentWidgetSettingsController::class, 'preview'])->name('preview');
            Route::post('/reset', [AgentWidgetSettingsController::class, 'reset'])->name('reset');
        });

        // Agent API Keys
        Route::prefix('{agent}/api-keys')->name('api-keys.')->group(function () {
            Route::get('/', [AgentApiKeyController::class, 'index'])->name('index');
            Route::get('/create', [AgentApiKeyController::class, 'create'])->name('create');
            Route::post('/', [AgentApiKeyController::class, 'store'])->name('store');
            Route::delete('/{apiKey}', [AgentApiKeyController::class, 'destroy'])->name('destroy');
            Route::post('/{apiKey}/toggle-active', [AgentApiKeyController::class, 'toggleActive'])->name('toggle-active');
            Route::post('/{apiKey}/regenerate', [AgentApiKeyController::class, 'regenerate'])->name('regenerate');
        });

        // Agent Usage Analytics
        Route::prefix('{agent}/analytics')->name('analytics.')->group(function () {
            Route::get('/', [AgentUsageController::class, 'index'])->name('index');
            Route::get('/export', [AgentUsageController::class, 'export'])->name('export');
        });
    });

    // Subscriptions & Billing
    Route::prefix('subscriptions')->name('subscriptions.')->group(function () {
        Route::get('/', [SubscriptionController::class, 'index'])->name('index');
        Route::get('/plans', [SubscriptionController::class, 'plans'])->name('plans');
        Route::get('/{subscription}', [SubscriptionController::class, 'show'])->name('show');
        Route::post('/subscribe/{plan}', [SubscriptionController::class, 'subscribe'])->name('subscribe');
        Route::post('/cancel/{subscription}', [SubscriptionController::class, 'cancel'])->name('cancel');
        Route::post('/resume/{subscription}', [SubscriptionController::class, 'resume'])->name('resume');
        Route::post('/upgrade/{subscription}', [SubscriptionController::class, 'upgrade'])->name('upgrade');
    });

    // Templates (for creating agents)
    Route::prefix('templates')->name('templates.')->group(function () {
        Route::get('/', [AgentTemplateController::class, 'index'])->name('index');
        Route::get('/{template}', [AgentTemplateController::class, 'show'])->name('show');
        Route::post('/{template}/apply', [AgentTemplateController::class, 'apply'])->name('apply');
    });

    // Global Analytics
    Route::prefix('analytics')->name('analytics.')->group(function () {
        Route::get('/', [AgentUsageController::class, 'overview'])->name('overview');
        Route::get('/conversations', [AgentUsageController::class, 'conversations'])->name('conversations');
        Route::get('/messages', [AgentUsageController::class, 'messages'])->name('messages');
    });
});
