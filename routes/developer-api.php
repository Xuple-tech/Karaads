<?php

use App\Http\Controllers\DeveloperApi\V1\AccountController;
use App\Http\Controllers\DeveloperApi\V1\ChatCompletionsController;
use App\Http\Controllers\DeveloperApi\V1\ImageGenerationsController;
use App\Http\Controllers\DeveloperApi\V1\ModelsController;
use App\Http\Middleware\AuthenticateDeveloperApiKey;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Support\Facades\Route;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

collect(array_unique(array_filter([
    config('developer-api.domain'),
    app()->environment('local') ? 'localhost' : null,
    app()->environment('local') ? '127.0.0.1' : null,
    app()->environment('testing') ? 'api.test' : null,
    app()->environment('testing') ? 'api.localhost' : null,
])))->each(function (string $domain) {
    Route::domain($domain)
        ->middleware('api')
        ->withoutMiddleware([
            EncryptCookies::class,
            AddQueuedCookiesToResponse::class,
            StartSession::class,
            ShareErrorsFromSession::class,
            ValidateCsrfToken::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ])
        ->group(function () {
        Route::prefix('v1')->group(function () {
            Route::middleware([AuthenticateDeveloperApiKey::class])->group(function () {
                Route::get('/models', [ModelsController::class, 'index']);
                Route::post('/chat/completions', [ChatCompletionsController::class, 'store']);
                Route::post('/images/generations', [ImageGenerationsController::class, 'store']);
                Route::get('/usage', [AccountController::class, 'usage']);
                Route::get('/me', [AccountController::class, 'me']);
            });
        });
    });
});
