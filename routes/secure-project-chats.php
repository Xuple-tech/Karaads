<?php

use App\Http\Controllers\AgentMemoryController;
use App\Http\Controllers\AgentScheduleController;
use App\Http\Controllers\AgentToolController;
use App\Http\Controllers\ProjectAgentController;
use App\Http\Controllers\ProjectChatController;
use App\Http\Controllers\ToolChainController;
use App\Http\Middleware\BotDetection;
use App\Http\Middleware\LogApiUsageMiddleware;
use App\Http\Middleware\CheckSubscriptionRateLimit;
use Illuminate\Support\Facades\Route;

/**
 * Secure Project Chat Routes with Heavy Obfuscation
 * Base: /api/secure/projects/{projectUuid}
 * All endpoints use randomized paths and enhanced security
 */

// Security middleware stack for project routes
$projectSecurityMiddleware = [
    'web',
    'auth',
    'throttle:60,1',
    BotDetection::class,
    LogApiUsageMiddleware::class,
    CheckSubscriptionRateLimit::class
];

Route::middleware($projectSecurityMiddleware)->prefix('api/secure/projects')->group(function () {
    Route::prefix('{projectUuid}')->group(function () {

        // Conversations with heavy obfuscation
        Route::get('/conversations/list/x7k9m2p4', [ProjectChatController::class, 'conversations'])->name('secure.project.conversations.index');
        Route::post('/conversations/create/q3w8r5t1', [ProjectChatController::class, 'createConversation'])->name('secure.project.conversations.create');

        Route::prefix('conversations/{conversationUuid}')->group(function () {
            // Conversation view and messages with obfuscated paths
            Route::get('/show/secure/n8m4k7j2', [ProjectChatController::class, 'show'])->name('secure.project.conversation.show');
            Route::post('/messages/send/p9l6h3v5', [ProjectChatController::class, 'sendMessage'])->name('secure.project.conversation.message.create');
            Route::get('/export/data/r2t8y4u1', [ProjectChatController::class, 'exportConversation'])->name('secure.project.conversation.export');
            Route::get('/statistics/view/h5j8n3q1', [ProjectChatController::class, 'statistics'])->name('secure.project.conversation.statistics');
            Route::get('/pinned/messages/w6r9t2y5', [ProjectChatController::class, 'pinnedMessages'])->name('secure.project.conversation.pinned');
            Route::post('/search/messages/m4k7l9p2', [ProjectChatController::class, 'searchMessages'])->name('secure.project.conversation.search');
            Route::get('/tags/filter/{tag}/q3w8e5r1', [ProjectChatController::class, 'messagesByTag'])->name('secure.project.conversation.tag');

            // Message operations with enhanced security
            Route::prefix('messages/{chatUuid}')->group(function () {
                Route::put('/update/secure/z7x4c6v8', [ProjectChatController::class, 'updateMessage'])->name('secure.project.message.update');
                Route::delete('/delete/secure/a2s5d8f1', [ProjectChatController::class, 'deleteMessage'])->name('secure.project.message.delete');
                Route::post('/pin/toggle/j4h7g3f6', [ProjectChatController::class, 'togglePin'])->name('secure.project.message.pin');
                Route::post('/tag/add/l9p2o5i8', [ProjectChatController::class, 'addTag'])->name('secure.project.message.tag');
                Route::post('/mention/add/u1y4t7r0', [ProjectChatController::class, 'addMention'])->name('secure.project.message.mention');
                Route::get('/thread/replies/e3w6q9a2', [ProjectChatController::class, 'threadedReplies'])->name('secure.project.message.thread');
            });
        });

        // Agent Management with heavy obfuscation
        Route::prefix('agents/mgmt/s5d8f1g4')->group(function () {
            Route::get('/list/secure/h7j0k3l6', [ProjectAgentController::class, 'index'])->name('secure.project.agents.index');
            Route::post('/create/agent/v8c1x4z7', [ProjectAgentController::class, 'store'])->name('secure.project.agents.create');

            Route::prefix('{agentUuid}')->group(function () {
                Route::get('/show/details/q3w6e9r2', [ProjectAgentController::class, 'show'])->name('secure.project.agent.show');
                Route::put('/update/config/t5y8u1i4', [ProjectAgentController::class, 'update'])->name('secure.project.agent.update');
                Route::delete('/delete/agent/o7p0a3s6', [ProjectAgentController::class, 'destroy'])->name('secure.project.agent.delete');
                Route::post('/toggle/status/d9f2g5h8', [ProjectAgentController::class, 'toggleStatus'])->name('secure.project.agent.toggle-status');
                Route::get('/statistics/view/j1k4l7z0', [ProjectAgentController::class, 'statistics'])->name('secure.project.agent.statistics');

                // Triggers with enhanced security
                Route::get('/triggers/list/x3c6v9b2', [ProjectAgentController::class, 'triggers'])->name('secure.project.agent.triggers.index');
                Route::post('/triggers/create/n5m8k1j4', [ProjectAgentController::class, 'storeTrigger'])->name('secure.project.agent.triggers.create');
                Route::put('/triggers/update/{triggerUuid}/w7e0r3t6', [ProjectAgentController::class, 'updateTrigger'])->name('secure.project.agent.triggers.update');
                Route::delete('/triggers/delete/{triggerUuid}/f4g7h0j3', [ProjectAgentController::class, 'destroyTrigger'])->name('secure.project.agent.triggers.delete');
                Route::post('/triggers/test/{triggerUuid}/k6l9z2x5', [ProjectAgentController::class, 'testTrigger'])->name('secure.project.agent.triggers.test');

                // Actions with obfuscated paths
                Route::get('/actions/list/c8v1b4n7', [ProjectAgentController::class, 'actions'])->name('secure.project.agent.actions.index');
                Route::post('/actions/create/m0p3q6w9', [ProjectAgentController::class, 'storeAction'])->name('secure.project.agent.actions.create');
                Route::put('/actions/update/{actionUuid}/a2s5d8f1', [ProjectAgentController::class, 'updateAction'])->name('secure.project.agent.actions.update');
                Route::delete('/actions/delete/{actionUuid}/r4t7y0u3', [ProjectAgentController::class, 'destroyAction'])->name('secure.project.agent.actions.delete');

                // Execution Logs with enhanced security
                Route::get('/executions/logs/i6o9p2l5', [ProjectAgentController::class, 'executionLogs'])->name('secure.project.agent.executions.index');
                Route::get('/executions/detail/{logUuid}/h8j1k4z7', [ProjectAgentController::class, 'executionLogDetail'])->name('secure.project.agent.executions.show');

                // Agent Memory with heavy obfuscation
                Route::prefix('memory/secure/g0f3d6s9')->group(function () {
                    Route::get('/list/memories/q2w5e8r1', [AgentMemoryController::class, 'index'])->name('secure.agent.memory.index');
                    Route::post('/search/memories/t4y7u0i3', [AgentMemoryController::class, 'search'])->name('secure.agent.memory.search');
                    Route::get('/relevant/memories/p6a9s2d5', [AgentMemoryController::class, 'relevant'])->name('secure.agent.memory.relevant');
                    Route::post('/store/memory/l8z1x4c7', [AgentMemoryController::class, 'store'])->name('secure.agent.memory.store');
                    Route::delete('/delete/{memoryUuid}/v0b3n6m9', [AgentMemoryController::class, 'destroy'])->name('secure.agent.memory.destroy');
                    Route::post('/clear/all/k2j5h8g1', [AgentMemoryController::class, 'clear'])->name('secure.agent.memory.clear');
                    Route::get('/export/data/f4d7s0a3', [AgentMemoryController::class, 'export'])->name('secure.agent.memory.export');
                });

                // Tool Chains (Workflow Composition) with enhanced security
                Route::prefix('workflows/chains/w6e9r2t5')->group(function () {
                    Route::get('/list/workflows/y8u1i4o7', [ToolChainController::class, 'index'])->name('secure.agent.workflows.index');
                    Route::post('/create/workflow/q0w3e6r9', [ToolChainController::class, 'store'])->name('secure.agent.workflows.store');

                    Route::prefix('{chainUuid}')->group(function () {
                        Route::get('/show/details/z2x5c8v1', [ToolChainController::class, 'show'])->name('secure.agent.workflows.show');
                        Route::put('/update/workflow/b4n7m0k3', [ToolChainController::class, 'update'])->name('secure.agent.workflows.update');
                        Route::delete('/delete/workflow/h6g9f2d5', [ToolChainController::class, 'destroy'])->name('secure.agent.workflows.destroy');
                        Route::get('/validate/workflow/j8k1l4z7', [ToolChainController::class, 'validateChain'])->name('secure.agent.workflows.validate');
                        Route::get('/plan/execution/s0a3d6f9', [ToolChainController::class, 'plan'])->name('secure.agent.workflows.plan');
                        Route::post('/execute/workflow/p2o5i8u1', [ToolChainController::class, 'execute'])->name('secure.agent.workflows.execute');
                    });
                });

                // Agent Schedules with heavy obfuscation
                Route::prefix('schedules/mgmt/c4v7b0n3')->group(function () {
                    Route::get('/list/schedules/x6z9a2s5', [AgentScheduleController::class, 'index'])->name('secure.agent.schedules.index');
                    Route::post('/create/schedule/m8k1j4h7', [AgentScheduleController::class, 'store'])->name('secure.agent.schedules.store');

                    Route::prefix('{scheduleUuid}')->group(function () {
                        Route::get('/show/details/g0f3d6s9', [AgentScheduleController::class, 'show'])->name('secure.agent.schedules.show');
                        Route::put('/update/schedule/q2w5e8r1', [AgentScheduleController::class, 'update'])->name('secure.agent.schedules.update');
                        Route::delete('/delete/schedule/t4y7u0i3', [AgentScheduleController::class, 'destroy'])->name('secure.agent.schedules.destroy');
                        Route::post('/execute/schedule/p6a9s2d5', [AgentScheduleController::class, 'execute'])->name('secure.agent.schedules.execute');
                        Route::get('/history/logs/l8z1x4c7', [AgentScheduleController::class, 'history'])->name('secure.agent.schedules.history');
                        Route::get('/stats/view/v0b3n6m9', [AgentScheduleController::class, 'stats'])->name('secure.agent.schedules.stats');
                        Route::post('/toggle/status/k2j5h8g1', [AgentScheduleController::class, 'toggle'])->name('secure.agent.schedules.toggle');
                    });
                });
            });
        });

        // Global Tools with enhanced security (managed by admins, available to all agents)
        Route::prefix('tools/global/f4d7s0a3')->group(function () {
            Route::get('/list/available/w6e9r2t5', [AgentToolController::class, 'index'])->name('secure.tools.index');
            Route::get('/show/{toolName}/y8u1i4o7', [AgentToolController::class, 'show'])->name('secure.tools.show');
            Route::post('/execute/{toolName}/q0w3e6r9', [AgentToolController::class, 'execute'])->name('secure.tools.execute');
            Route::post('/test/{toolName}/z2x5c8v1', [AgentToolController::class, 'test'])->name('secure.tools.test');
            Route::get('/guidelines/{toolName}/b4n7m0k3', [AgentToolController::class, 'guidelines'])->name('secure.tools.guidelines');

            // Admin only routes with enhanced security
            Route::middleware(['admin', 'throttle:30,1'])->group(function () {
                Route::post('/create/tool/h6g9f2d5', [AgentToolController::class, 'store'])->name('secure.tools.store');
                Route::put('/update/{toolName}/j8k1l4z7', [AgentToolController::class, 'update'])->name('secure.tools.update');
                Route::delete('/delete/{toolName}/s0a3d6f9', [AgentToolController::class, 'destroy'])->name('secure.tools.destroy');
            });
        });
    });
});
