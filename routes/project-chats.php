<?php

use App\Http\Controllers\AgentMemoryController;
use App\Http\Controllers\AgentScheduleController;
use App\Http\Controllers\AgentToolController;
use App\Http\Controllers\Api\Workspace\AgentController as WorkspaceAgentController;
use App\Http\Controllers\Api\Workspace\ChatController as WorkspaceChatController;
use App\Http\Controllers\Api\Workspace\ToolController as WorkspaceToolController;
use App\Http\Controllers\ProjectAgentController;
use App\Http\Controllers\ProjectChatController;
use App\Http\Controllers\ToolChainController;
use Illuminate\Support\Facades\Route;

/**
 * Project Chat Routes
 * Base: /api/projects/{project}
 */
Route::middleware(['web', 'auth'])->prefix('api/projects')->group(function () {
    Route::prefix('{project}')->group(function () {
        // Conversations
        Route::get('/conversations', [WorkspaceChatController::class, 'conversations'])->name('project.conversations.index');
        Route::post('/conversations', [WorkspaceChatController::class, 'createConversation'])->name('project.conversations.create');

        Route::prefix('conversations/{conversation}')->group(function () {
            // Conversation view and messages
            Route::get('/', [ProjectChatController::class, 'show'])->name('project.conversation.show');
            Route::post('/messages', [WorkspaceChatController::class, 'sendMessage'])->name('project.conversation.message.create');
            Route::get('/export', [ProjectChatController::class, 'exportConversation'])->name('project.conversation.export');
            Route::get('/statistics', [ProjectChatController::class, 'statistics'])->name('project.conversation.statistics');
            Route::get('/pinned', [ProjectChatController::class, 'pinnedMessages'])->name('project.conversation.pinned');
            Route::post('/search', [ProjectChatController::class, 'searchMessages'])->name('project.conversation.search');
            Route::get('/tags/{tag}', [ProjectChatController::class, 'messagesByTag'])->name('project.conversation.tag');

            // Message operations
            Route::prefix('messages/{chat}')->group(function () {
                Route::put('/', [ProjectChatController::class, 'updateMessage'])->name('project.message.update');
                Route::delete('/', [ProjectChatController::class, 'deleteMessage'])->name('project.message.delete');
                Route::post('/pin', [ProjectChatController::class, 'togglePin'])->name('project.message.pin');
                Route::post('/tag', [ProjectChatController::class, 'addTag'])->name('project.message.tag');
                Route::post('/mention', [ProjectChatController::class, 'addMention'])->name('project.message.mention');
                Route::get('/thread', [ProjectChatController::class, 'threadedReplies'])->name('project.message.thread');
            });
        });

        // Agent Management
        Route::prefix('agents')->group(function () {
            Route::get('/', [WorkspaceAgentController::class, 'index'])->name('project.agents.index');
            Route::post('/', [WorkspaceAgentController::class, 'store'])->name('project.agents.create');

            Route::prefix('{agent}')->group(function () {
                Route::get('/', [WorkspaceAgentController::class, 'show'])->name('project.agent.show');
                Route::put('/', [WorkspaceAgentController::class, 'update'])->name('project.agent.update');
                Route::delete('/', [WorkspaceAgentController::class, 'destroy'])->name('project.agent.delete');
                Route::post('/toggle-status', [ProjectAgentController::class, 'toggleStatus'])->name('project.agent.toggle-status');
                Route::get('/statistics', [ProjectAgentController::class, 'statistics'])->name('project.agent.statistics');

                // Triggers
                Route::get('/triggers', [ProjectAgentController::class, 'triggers'])->name('project.agent.triggers.index');
                Route::post('/triggers', [ProjectAgentController::class, 'storeTrigger'])->name('project.agent.triggers.create');
                Route::put('/triggers/{trigger}', [ProjectAgentController::class, 'updateTrigger'])->name('project.agent.triggers.update');
                Route::delete('/triggers/{trigger}', [ProjectAgentController::class, 'destroyTrigger'])->name('project.agent.triggers.delete');
                Route::post('/triggers/{trigger}/test', [ProjectAgentController::class, 'testTrigger'])->name('project.agent.triggers.test');

                // Actions
                Route::get('/actions', [ProjectAgentController::class, 'actions'])->name('project.agent.actions.index');
                Route::post('/actions', [ProjectAgentController::class, 'storeAction'])->name('project.agent.actions.create');
                Route::put('/actions/{action}', [ProjectAgentController::class, 'updateAction'])->name('project.agent.actions.update');
                Route::delete('/actions/{action}', [ProjectAgentController::class, 'destroyAction'])->name('project.agent.actions.delete');

                // Execution Logs
                Route::get('/executions', [ProjectAgentController::class, 'executionLogs'])->name('project.agent.executions.index');
                Route::get('/executions/{log}', [ProjectAgentController::class, 'executionLogDetail'])->name('project.agent.executions.show');

                // Agent Memory
                Route::prefix('memory')->group(function () {
                    Route::get('/', [AgentMemoryController::class, 'index'])->name('agent.memory.index');
                    Route::post('/search', [AgentMemoryController::class, 'search'])->name('agent.memory.search');
                    Route::get('/relevant', [AgentMemoryController::class, 'relevant'])->name('agent.memory.relevant');
                    Route::post('/', [AgentMemoryController::class, 'store'])->name('agent.memory.store');
                    Route::delete('/{memory}', [AgentMemoryController::class, 'destroy'])->name('agent.memory.destroy');
                    Route::post('/clear', [AgentMemoryController::class, 'clear'])->name('agent.memory.clear');
                    Route::get('/export', [AgentMemoryController::class, 'export'])->name('agent.memory.export');
                });

                // Tool Chains (Workflow Composition)
                Route::prefix('workflows')->group(function () {
                    Route::get('/', [ToolChainController::class, 'index'])->name('agent.workflows.index');
                    Route::post('/', [ToolChainController::class, 'store'])->name('agent.workflows.store');

                    Route::prefix('{chain}')->group(function () {
                        Route::get('/', [ToolChainController::class, 'show'])->name('agent.workflows.show');
                        Route::put('/', [ToolChainController::class, 'update'])->name('agent.workflows.update');
                        Route::delete('/', [ToolChainController::class, 'destroy'])->name('agent.workflows.destroy');
                        Route::get('/validate', [ToolChainController::class, 'validateChain'])->name('agent.workflows.validate');
                        Route::get('/plan', [ToolChainController::class, 'plan'])->name('agent.workflows.plan');
                        Route::post('/execute', [ToolChainController::class, 'execute'])->name('agent.workflows.execute');
                    });
                });

                // Agent Schedules
                Route::prefix('schedules')->group(function () {
                    Route::get('/', [AgentScheduleController::class, 'index'])->name('agent.schedules.index');
                    Route::post('/', [AgentScheduleController::class, 'store'])->name('agent.schedules.store');

                    Route::prefix('{schedule}')->group(function () {
                        Route::get('/', [AgentScheduleController::class, 'show'])->name('agent.schedules.show');
                        Route::put('/', [AgentScheduleController::class, 'update'])->name('agent.schedules.update');
                        Route::delete('/', [AgentScheduleController::class, 'destroy'])->name('agent.schedules.destroy');
                        Route::post('/execute', [AgentScheduleController::class, 'execute'])->name('agent.schedules.execute');
                        Route::get('/history', [AgentScheduleController::class, 'history'])->name('agent.schedules.history');
                        Route::get('/stats', [AgentScheduleController::class, 'stats'])->name('agent.schedules.stats');
                        Route::post('/toggle', [AgentScheduleController::class, 'toggle'])->name('agent.schedules.toggle');
                    });
                });
            });
        });

        // Global Tools (managed by admins, available to all agents)
        Route::prefix('tools')->group(function () {
            Route::get('/', [WorkspaceToolController::class, 'index'])->name('tools.index');
            Route::get('/{toolName}', [AgentToolController::class, 'show'])->name('tools.show');
            Route::post('/{toolName}/execute', [AgentToolController::class, 'execute'])->name('tools.execute');
            Route::post('/{toolName}/test', [AgentToolController::class, 'test'])->name('tools.test');
            Route::get('/{toolName}/guidelines', [AgentToolController::class, 'guidelines'])->name('tools.guidelines');

            // Admin only
            Route::post('/', [AgentToolController::class, 'store'])->middleware('admin')->name('tools.store');
            Route::put('/{toolName}', [AgentToolController::class, 'update'])->middleware('admin')->name('tools.update');
            Route::delete('/{toolName}', [AgentToolController::class, 'destroy'])->middleware('admin')->name('tools.destroy');
        });
    });
});
