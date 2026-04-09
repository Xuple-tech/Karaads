<?php

use App\Http\Controllers\SpaController;
use App\Http\Controllers\SubscriptionController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;

// Public subscription routes
Route::get('/subscription/pricing', SpaController::class)->name('subscription.pricing');
Route::get('/pricing', SpaController::class)->name('pricing');
Route::get('/api/subscription/plans', [SubscriptionController::class, 'getPlans'])->name('subscription.plans');

// Subscription checkout success route
Route::get('/subscription/success', [SubscriptionController::class, 'handleCheckoutSuccess'])->name('subscription.success');

// SPA entry pages are served publicly; the SPA itself enforces protected access.
Route::get('/subscription', SpaController::class)->name('subscription.index');
Route::get('/billing', SpaController::class)->name('billing.index');

// Authenticated subscription API routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/api/subscription/my-subscription', [SubscriptionController::class, 'getMySubscription'])->name('subscription.mine');
    Route::get('/api/subscription/billing-portal', [SubscriptionController::class, 'billingPortal'])->name('subscription.billing-portal');
    Route::post('/api/subscription/upgrade', [SubscriptionController::class, 'upgrade'])->name('subscription.upgrade')->withoutMiddleware(VerifyCsrfToken::class);
    Route::post('/api/subscription/downgrade', [SubscriptionController::class, 'downgrade'])->name('subscription.downgrade')->withoutMiddleware(VerifyCsrfToken::class);
    Route::post('/api/subscription/cancel', [SubscriptionController::class, 'cancel'])->name('subscription.cancel')->withoutMiddleware(VerifyCsrfToken::class);
    Route::post('/api/subscription/start-trial', [SubscriptionController::class, 'startTrial'])->name('subscription.trial.start')->withoutMiddleware(VerifyCsrfToken::class);
    Route::get('/api/subscription/usage-stats', [SubscriptionController::class, 'getUsageStats'])->name('subscription.usage');
});
