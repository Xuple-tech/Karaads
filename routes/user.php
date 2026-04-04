<?php

use App\Http\Controllers\Api\ChatPreferenceController;
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
});

Route::middleware('web')->prefix('/api-/_0001/user')->group(function () {
    // Chat preferences endpoints
    Route::get('/chat-preferences', [ChatPreferenceController::class, 'getPreferences']);
    Route::put('/chat-preferences', [ChatPreferenceController::class, 'updatePreferences']);
    Route::post('/chat-preferences/reset', [ChatPreferenceController::class, 'resetPreferences']);
    Route::get('/chat-modes', [ChatPreferenceController::class, 'getAvailableModes']);
});
