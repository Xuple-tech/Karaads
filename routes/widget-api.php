<?php

use App\Http\Controllers\Api\Widget\SessionController;
use App\Http\Controllers\Api\Widget\ChatController;
use App\Http\Controllers\Api\Widget\FileController;
use App\Http\Controllers\Api\Widget\WebhookController;
use App\Http\Controllers\Api\Widget\AnalyticsController;
use App\Http\Middleware\CheckAgentTrialExpiry;
use Illuminate\Support\Facades\Route;

// Widget API Routes (Public)
Route::prefix('v1/widget')->name('api.widget.')->group(function () {

    // Routes that require trial check (user must have active subscription)
    Route::middleware([CheckAgentTrialExpiry::class])->group(function () {
        // Session Management
        Route::post('sessions', [SessionController::class, 'create'])->name('sessions.create');
        Route::get('sessions/{session}', [SessionController::class, 'show'])->name('sessions.show');
        Route::delete('sessions/{session}', [SessionController::class, 'destroy'])->name('sessions.destroy');

        // Chat Messages
        Route::post('chat', [ChatController::class, 'sendMessage'])->name('chat.send');
        Route::post('deepseek/chat', [ChatController::class, 'deepseekChat'])->name('chat.deepseek');
        Route::get('conversations/{conversation}/messages', [ChatController::class, 'getMessages'])->name('chat.messages');
        Route::delete('messages/{message}', [ChatController::class, 'deleteMessage'])->name('chat.delete');

        // File Uploads
        Route::post('files/upload', [FileController::class, 'upload'])->name('files.upload');
        Route::get('files/{file}', [FileController::class, 'show'])->name('files.show');
        Route::delete('files/{file}', [FileController::class, 'destroy'])->name('files.destroy');

        // Webhooks
        Route::post('webhooks/conversation-updated', [WebhookController::class, 'conversationUpdated'])->name('webhooks.conversation');
        Route::post('webhooks/message-received', [WebhookController::class, 'messageReceived'])->name('webhooks.message');
        Route::post('webhooks/widget-status', [WebhookController::class, 'widgetStatus'])->name('webhooks.status');

        // Analytics
        Route::get('analytics/summary/{agent}', [AnalyticsController::class, 'summary'])->name('analytics.summary');
        Route::get('analytics/usage/{agent}', [AnalyticsController::class, 'usage'])->name('analytics.usage');
    });

    // Health Check (No trial check needed)
    Route::get('health', function () {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toISOString(),
            'service' => 'AI Chat Widget API'
        ]);
    })->name('health');

    // Widget Configuration (No trial check needed)
    Route::get('config/{agentSlug}', function ($agentSlug) {
        return App\Http\Controllers\Api\Widget\WidgetConfigController::getConfig($agentSlug);
    })->name('config');
});

// Widget Authentication Middleware
Route::middleware(['api', 'widget.auth'])->prefix('v1/widget/agent')->group(function () {
    // Agent-specific authenticated endpoints with trial check
    Route::middleware('check-agent-trial')->group(function () {
        Route::post('conversations', [ChatController::class, 'createConversation'])->name('agent.conversations.create');
        Route::post('messages', [ChatController::class, 'createMessage'])->name('agent.messages.create');
    });
});
