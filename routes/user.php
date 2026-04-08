<?php

use App\Http\Controllers\Api\ChatPreferenceController;
use App\Http\Controllers\Developer\DeveloperPortalController;
use App\Http\Controllers\SpaController;
use Illuminate\Support\Facades\Route;

// ========== USER ROUTES ==========
Route::middleware(['auth'])->prefix('user')->name('user.')->group(function () {
    // Conversations
    Route::prefix('conversations')->name('conversations.')->group(function () {
        Route::get('/', SpaController::class)->name('index');
    });

    // Settings
    Route::get('/settings', SpaController::class)->name('settings');

    Route::get('/help', SpaController::class)->name('help');

    // Subscription & Billing
    Route::get('/subscription', SpaController::class)->name('subscription');

    // Developer API portal
    Route::prefix('developer-api')->name('developer-api.')->group(function () {
        Route::get('/', [DeveloperPortalController::class, 'index'])->name('index');
        Route::post('/keys', [DeveloperPortalController::class, 'storeKey'])->name('keys.store');
        Route::put('/keys/{developerApiKey}', [DeveloperPortalController::class, 'updateKey'])->name('keys.update');
        Route::post('/keys/{developerApiKey}/revoke', [DeveloperPortalController::class, 'revokeKey'])->name('keys.revoke');
        Route::post('/keys/{developerApiKey}/regenerate', [DeveloperPortalController::class, 'regenerateKey'])->name('keys.regenerate');
        Route::post('/top-up', [DeveloperPortalController::class, 'createTopupCheckout'])->name('topup');
    });
});

Route::middleware('web')->prefix('/api-/_0001/user')->group(function () {
    // Chat preferences endpoints
    Route::get('/chat-preferences', [ChatPreferenceController::class, 'getPreferences']);
    Route::put('/chat-preferences', [ChatPreferenceController::class, 'updatePreferences']);
    Route::post('/chat-preferences/reset', [ChatPreferenceController::class, 'resetPreferences']);
    Route::get('/chat-modes', [ChatPreferenceController::class, 'getAvailableModes']);
});
