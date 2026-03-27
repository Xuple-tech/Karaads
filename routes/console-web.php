<?php

use App\Http\Controllers\Console\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Console\BillingController;
use App\Http\Controllers\Console\KeysController;
use App\Http\Controllers\Console\ModelsController;
use App\Http\Controllers\Console\OverviewController;
use App\Http\Controllers\Console\UsageController;
use App\Support\ConsoleUrl;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

$registerConsoleRoutes = function (): void {
    Route::middleware('guest:console')->group(function () {
        Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('console.login');
        Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('console.login.store');
    });

    Route::middleware('auth.console')->group(function () {
        Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('console.logout');

        Route::get('/', [OverviewController::class, 'index'])->name('console.overview');
        Route::get('/keys', [KeysController::class, 'index'])->name('console.keys');
        Route::post('/keys', [KeysController::class, 'store'])->name('console.keys.store');
        Route::put('/keys/{developerApiKey}', [KeysController::class, 'update'])->name('console.keys.update');
        Route::post('/keys/{developerApiKey}/revoke', [KeysController::class, 'revoke'])->name('console.keys.revoke');
        Route::post('/keys/{developerApiKey}/regenerate', [KeysController::class, 'regenerate'])->name('console.keys.regenerate');
        Route::get('/usage', [UsageController::class, 'index'])->name('console.usage');
        Route::get('/billing', [BillingController::class, 'index'])->name('console.billing');
        Route::post('/billing/top-up', [BillingController::class, 'topup'])->name('console.topup');
        Route::get('/models', [ModelsController::class, 'index'])->name('console.models');
    });

    Route::prefix('docs')->name('console.docs.')->group(function () {
        Route::get('/', fn () => Inertia::render('docs/index'))->name('index');

        Route::prefix('agents')->name('agents.')->group(function () {
            Route::get('/', fn () => Inertia::render('docs/agents/index'))->name('index');
            Route::get('/widget', fn () => Inertia::render('docs/agents/widget'))->name('widget');
            Route::get('/configuration', fn () => Inertia::render('docs/agents/configuration'))->name('configuration');
            Route::get('/templates', fn () => Inertia::render('docs/agents/templates'))->name('templates');
            Route::get('/knowledge-base', fn () => Inertia::render('docs/agents/knowledge-base'))->name('knowledge-base');
            Route::get('/tools', fn () => Inertia::render('docs/agents/tools'))->name('tools');
        });

        Route::prefix('api')->name('api.')->group(function () {
            Route::get('/', fn () => Inertia::render('docs/api/index'))->name('index');
            Route::get('/authentication', fn () => Inertia::render('docs/api/authentication'))->name('authentication');
            Route::get('/keys', fn () => Inertia::render('docs/api/keys'))->name('keys');
            Route::get('/models', fn () => Inertia::render('docs/api/models'))->name('models');
            Route::get('/chat-completions', fn () => Inertia::render('docs/api/chat-completions'))->name('chat-completions');
            Route::get('/streaming', fn () => Inertia::render('docs/api/streaming'))->name('streaming');
            Route::get('/usage', fn () => Inertia::render('docs/api/usage'))->name('usage');
            Route::get('/errors', fn () => Inertia::render('docs/api/errors'))->name('errors');
            Route::get('/pricing', fn () => Inertia::render('docs/api/pricing'))->name('pricing');
            Route::get('/reference', fn () => Inertia::render('docs/api/reference'))->name('reference');
        });

        Route::prefix('legal')->name('legal.')->group(function () {
            Route::get('/terms', fn () => Inertia::render('docs/legal/terms'))->name('terms');
            Route::get('/privacy-policy', fn () => Inertia::render('docs/legal/privacy'))->name('privacy-policy');
        });
    });
};

if (ConsoleUrl::usesPathPrefix()) {
    Route::prefix(trim((string) config('console.path_prefix'), '/'))
        ->middleware('console-web')
        ->group($registerConsoleRoutes);
} elseif (filled(config('console.domain'))) {
    Route::domain((string) config('console.domain'))
        ->middleware('console-web')
        ->group($registerConsoleRoutes);
}
