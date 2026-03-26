<?php

use App\Http\Controllers\DeveloperApi\V1\AccountController;
use App\Http\Controllers\DeveloperApi\V1\ChatCompletionsController;
use App\Http\Controllers\DeveloperApi\V1\ModelsController;
use App\Http\Middleware\AuthenticateDeveloperApiKey;
use Illuminate\Support\Facades\Route;

collect(array_unique(array_filter([
    config('developer-api.domain'),
    app()->environment('testing') ? 'api.test' : null,
    app()->environment('testing') ? 'api.localhost' : null,
])))->each(function (string $domain) {
    Route::domain($domain)->middleware('api')->group(function () {
        Route::prefix('v1')->group(function () {
            Route::middleware([AuthenticateDeveloperApiKey::class])->group(function () {
                Route::get('/models', [ModelsController::class, 'index']);
                Route::post('/chat/completions', [ChatCompletionsController::class, 'store']);
                Route::get('/usage', [AccountController::class, 'usage']);
                Route::get('/me', [AccountController::class, 'me']);
            });
        });
    });
});
