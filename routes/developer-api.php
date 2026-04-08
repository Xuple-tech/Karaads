<?php

use App\Http\Controllers\DeveloperApi\V1\AccountController;
use App\Http\Controllers\DeveloperApi\V1\ChatCompletionsController;
use App\Http\Controllers\DeveloperApi\V1\ModelsController;
use App\Http\Middleware\AuthenticateDeveloperApiKey;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Developer API Routes — OpenAI-compatible
|--------------------------------------------------------------------------
| Base URL: https://<APP_URL>/api/v1
|
| Authentication: Bearer token (Authorization: Bearer kwati_xxxx.secret)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->middleware('api')->group(function () {
    // Unauthenticated
    Route::get('/models', [ModelsController::class, 'index']);

    // Authenticated
    Route::middleware([AuthenticateDeveloperApiKey::class])->group(function () {
        Route::post('/chat/completions', [ChatCompletionsController::class, 'store']);
        Route::get('/me', [AccountController::class, 'me']);
        Route::get('/usage', [AccountController::class, 'usage']);
    });
});
