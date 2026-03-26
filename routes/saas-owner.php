<?php

use App\Http\Controllers\SaasOwner\SaasOwnerDashboardController;
use App\Http\Controllers\SaasOwner\TeamMemberController;
use App\Http\Controllers\SaasOwner\CustomPromptController;
use App\Http\Controllers\SaasOwner\SubscriptionManagementController;
use App\Http\Controllers\SaasOwner\UserManagementController;
use App\Http\Controllers\SaasOwner\UserStatsController;
use App\Http\Middleware\SaasOwnerMiddleware;
use Illuminate\Support\Facades\Route;

// ========== SAAS OWNER ROUTES ==========
Route::middleware([SaasOwnerMiddleware::class])->prefix('saas-owner')->name('saas-owner.')->group(function () {
    // Dashboard
    Route::get('/', [SaasOwnerDashboardController::class, 'index'])->name('dashboard');
    Route::get('/analytics', [SaasOwnerDashboardController::class, 'analytics'])->name('analytics');
    Route::get('/subscription', [SaasOwnerDashboardController::class, 'subscription'])->name('subscription');
    Route::get('/billing', [SaasOwnerDashboardController::class, 'billing'])->name('billing');
    Route::get('/settings', [SaasOwnerDashboardController::class, 'settings'])->name('settings');

    // ========== SUBSCRIPTION MANAGEMENT ==========
    Route::prefix('subscriptions')->name('subscriptions.')->group(function () {
        Route::get('/', [SubscriptionManagementController::class, 'index'])->name('index');
        Route::get('/create', [SubscriptionManagementController::class, 'create'])->name('create');
        Route::post('/', [SubscriptionManagementController::class, 'store'])->name('store');
        Route::get('/{subscription}', [SubscriptionManagementController::class, 'show'])->name('show');
        Route::get('/{subscription}/edit', [SubscriptionManagementController::class, 'edit'])->name('edit');
        Route::put('/{subscription}', [SubscriptionManagementController::class, 'update'])->name('update');
        Route::post('/{subscription}/cancel', [SubscriptionManagementController::class, 'cancel'])->name('cancel');
        Route::post('/{subscription}/pause', [SubscriptionManagementController::class, 'pause'])->name('pause');
        Route::post('/{subscription}/resume', [SubscriptionManagementController::class, 'resume'])->name('resume');
        Route::get('/export/csv', [SubscriptionManagementController::class, 'export'])->name('export');
    });

    // ========== USER MANAGEMENT ==========
    Route::prefix('users')->name('users.')->group(function () {
        Route::get('/', [UserManagementController::class, 'index'])->name('index');
        Route::get('/{user}', [UserManagementController::class, 'show'])->name('show');
        Route::get('/{user}/edit', [UserManagementController::class, 'edit'])->name('edit');
        Route::put('/{user}', [UserManagementController::class, 'update'])->name('update');
        Route::post('/{user}/reset-password', [UserManagementController::class, 'resetPassword'])->name('reset-password');
        Route::post('/{user}/toggle-active', [UserManagementController::class, 'toggleActive'])->name('toggle-active');
        Route::delete('/{user}', [UserManagementController::class, 'destroy'])->name('destroy');
        Route::get('/export/csv', [UserManagementController::class, 'export'])->name('export');
    });

    // ========== USER STATISTICS ==========
    Route::prefix('stats')->name('stats.')->group(function () {
        // Overview stats
        Route::get('/', [UserStatsController::class, 'index'])->name('overview');

        // User details stats
        Route::get('/users/{user}', [UserStatsController::class, 'userDetails'])->name('user-details');

        // Subscription stats
        Route::get('/subscriptions', [UserStatsController::class, 'subscriptionStats'])->name('subscriptions');

        // Engagement stats
        Route::get('/engagement', [UserStatsController::class, 'engagementStats'])->name('engagement');
    });

    // Team Member Management
    Route::prefix('team-members')->name('team-members.')->group(function () {
        Route::get('/', [TeamMemberController::class, 'index'])->name('index');
        Route::get('/create', [TeamMemberController::class, 'create'])->name('create');
        Route::post('/', [TeamMemberController::class, 'store'])->name('store');
        Route::get('/{member}/edit', [TeamMemberController::class, 'edit'])->name('edit');
        Route::put('/{member}', [TeamMemberController::class, 'update'])->name('update');
        Route::post('/{member}/deactivate', [TeamMemberController::class, 'deactivate'])->name('deactivate');
        Route::delete('/{member}', [TeamMemberController::class, 'destroy'])->name('destroy');
    });

    // Custom AI Prompts
    Route::prefix('prompts')->name('prompts.')->group(function () {
        Route::get('/', [CustomPromptController::class, 'index'])->name('index');
        Route::get('/create', [CustomPromptController::class, 'create'])->name('create');
        Route::post('/', [CustomPromptController::class, 'store'])->name('store');
        Route::get('/{prompt}', [CustomPromptController::class, 'show'])->name('show');
        Route::get('/{prompt}/edit', [CustomPromptController::class, 'edit'])->name('edit');
        Route::put('/{prompt}', [CustomPromptController::class, 'update'])->name('update');
        Route::post('/{prompt}/test', [CustomPromptController::class, 'test'])->name('test');
        Route::delete('/{prompt}', [CustomPromptController::class, 'destroy'])->name('destroy');
    });
});
