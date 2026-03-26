<?php

use App\Http\Controllers\SubscriptionController;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;

// Public subscription routes
Route::get('/subscription/pricing', [SubscriptionController::class, 'pricing'])->name('subscription.pricing');
Route::get('/pricing', [SubscriptionController::class, 'pricing'])->name('pricing');
Route::get('/api/subscription/plans', [SubscriptionController::class, 'getPlans'])->name('subscription.plans');

// Subscription checkout success route
Route::get('/subscription/success', [SubscriptionController::class, 'handleCheckoutSuccess'])->name('subscription.success');

// Authenticated subscription routes
Route::middleware('auth')->group(function () {
    Route::get('/subscription', [SubscriptionController::class, 'index'])->name('subscription.index');
    Route::get('/billing', [SubscriptionController::class, 'billing'])->name('billing.index');
    Route::get('/api/subscription/my-subscription', [SubscriptionController::class, 'getMySubscription'])->name('subscription.mine');
    Route::post('/api/subscription/upgrade', [SubscriptionController::class, 'upgrade'])->name('subscription.upgrade')->withoutMiddleware(VerifyCsrfToken::class);
    Route::post('/api/subscription/downgrade', [SubscriptionController::class, 'downgrade'])->name('subscription.downgrade');
    Route::post('/api/subscription/cancel', [SubscriptionController::class, 'cancel'])->name('subscription.cancel');
    Route::post('/api/subscription/start-trial', [SubscriptionController::class, 'startTrial'])->name('subscription.trial.start');
    Route::get('/api/subscription/usage-stats', [SubscriptionController::class, 'getUsageStats'])->name('subscription.usage');
});
