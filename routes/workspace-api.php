<?php

use App\Http\Controllers\Api\Workspace\AgentController;
use App\Http\Controllers\Api\Workspace\ChatController;
use App\Http\Controllers\Api\Workspace\McpController;
use App\Http\Controllers\Api\Workspace\ProjectController;
use App\Http\Controllers\Api\Workspace\ToolController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('workspace')->group(function () {
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/{project}', [ProjectController::class, 'show']);
    Route::put('/projects/{project}', [ProjectController::class, 'update']);

    Route::get('/projects/{project}/chat/conversations', [ChatController::class, 'conversations']);
    Route::post('/projects/{project}/chat/conversations', [ChatController::class, 'createConversation']);
    Route::get('/projects/{project}/chat/conversations/{conversation}/messages', [ChatController::class, 'messages']);
    Route::post('/projects/{project}/chat/conversations/{conversation}/messages', [ChatController::class, 'sendMessage']);

    Route::get('/projects/{project}/agents', [AgentController::class, 'index']);
    Route::post('/projects/{project}/agents', [AgentController::class, 'store']);
    Route::get('/projects/{project}/agents/{agent}', [AgentController::class, 'show']);
    Route::put('/projects/{project}/agents/{agent}', [AgentController::class, 'update']);
    Route::delete('/projects/{project}/agents/{agent}', [AgentController::class, 'destroy']);
    Route::post('/projects/{project}/agents/{agent}/runs', [AgentController::class, 'run']);

    Route::get('/projects/{project}/tools', [ToolController::class, 'index']);
    Route::post('/projects/{project}/tools', [ToolController::class, 'store']);
    Route::post('/projects/{project}/tools/{tool}/execute', [ToolController::class, 'execute']);

    Route::get('/projects/{project}/mcp/servers', [McpController::class, 'servers']);
    Route::post('/projects/{project}/mcp/servers', [McpController::class, 'registerServer']);
    Route::post('/projects/{project}/mcp/initialize', [McpController::class, 'initialize']);
    Route::post('/projects/{project}/mcp/sessions', [McpController::class, 'createSession']);
    Route::delete('/projects/{project}/mcp/sessions/{session}', [McpController::class, 'revokeSession']);
    Route::post('/projects/{project}/mcp/tools/list', [McpController::class, 'toolsList']);
    Route::post('/projects/{project}/mcp/tools/call', [McpController::class, 'toolsCall']);
    Route::post('/projects/{project}/mcp/resources/list', [McpController::class, 'resourcesList']);
    Route::post('/projects/{project}/mcp/resources/read', [McpController::class, 'resourcesRead']);
});
