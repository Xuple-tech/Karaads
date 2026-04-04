<?php

use App\Http\Controllers\Api\ChatPreferenceController;
use App\Http\Controllers\User\UserDashboardController;
use App\Http\Controllers\User\UserConversationController;
use App\Http\Controllers\User\UserSettingsController;
use Illuminate\Support\Facades\Route;

// ========== USER ROUTES ==========
Route::middleware(['auth'])->prefix('user')->name('user.')->group(function () {
    // Dashboard
    // Route::get('/dashboard', [UserDashboardController::class, 'index'])->name('dashboard');

    // Conversations
    Route::prefix('conversations')->name('conversations.')->group(function () {
        Route::get('/', [UserConversationController::class, 'index'])->name('index');
    });

    // Settings
    Route::get('/settings', [UserSettingsController::class, 'index'])->name('settings');

    // Help/Support (simple inertia render without controller)
    Route::get('/help', function () {
        return \Inertia\Inertia::render('User/Help');
    })->name('help');

    // Subscription & Billing
    Route::get('/subscription', function () {
        $subscriptionService = app(\App\Services\SubscriptionService::class);
        $user = auth()->user();
        
        return \Inertia\Inertia::render('User/Subscription', [
            'currentSubscription' => $subscriptionService->getUserSubscription($user),
            'currentPlan' => $subscriptionService->getUserPlan($user),
            'availablePlans' => \App\Models\SubscriptionPlan::getActivePlans(),
        ]);
    })->name('subscription');
});

Route::middleware('web')->prefix('/api-/_0001/user')->group(function () {
    // Chat preferences endpoints
    Route::get('/chat-preferences', [ChatPreferenceController::class, 'getPreferences']);
    Route::put('/chat-preferences', [ChatPreferenceController::class, 'updatePreferences']);
    Route::post('/chat-preferences/reset', [ChatPreferenceController::class, 'resetPreferences']);
    Route::get('/chat-modes', [ChatPreferenceController::class, 'getAvailableModes']);
});
