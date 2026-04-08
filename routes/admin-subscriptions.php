<?php

use App\Http\Controllers\Admin\SubscriptionPlanController;
use App\Http\Controllers\Admin\SubscriptionPlanFeaturesController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', AdminMiddleware::class])->prefix('admin/subscriptions')->group(function () {
    // Subscription Plans
    Route::get('/plans', [SubscriptionPlanController::class, 'index'])->name('admin.subscriptions.plans.index');
    Route::get('/plans/create', [SubscriptionPlanController::class, 'create'])->name('admin.subscriptions.plans.create');
    Route::post('/plans', [SubscriptionPlanController::class, 'store'])->name('admin.subscriptions.plans.store');
    Route::get('/plans/{subscriptionPlan}/edit', [SubscriptionPlanController::class, 'edit'])->name('admin.subscriptions.plans.edit');
    Route::get('/plans/{subscriptionPlan}', [SubscriptionPlanController::class, 'show'])->name('admin.subscriptions.plans.show');
    Route::put('/plans/{subscriptionPlan}', [SubscriptionPlanController::class, 'update'])->name('admin.subscriptions.plans.update');
    Route::delete('/plans/{subscriptionPlan}', [SubscriptionPlanController::class, 'destroy'])->name('admin.subscriptions.plans.destroy');
    Route::patch('/plans/{subscriptionPlan}/deactivate', [SubscriptionPlanController::class, 'deactivate'])->name('admin.subscriptions.plans.deactivate');
    Route::get('/plans/{subscriptionPlan}/stats', [SubscriptionPlanController::class, 'getStats'])->name('admin.subscriptions.plans.stats');

    // Plan Features Management
    Route::get('/plans/{plan}/features', [SubscriptionPlanFeaturesController::class, 'index'])->name('admin.subscriptions.features.index');
    Route::post('/plans/{plan}/features', [SubscriptionPlanFeaturesController::class, 'store'])->name('admin.subscriptions.features.store');
    Route::put('/plans/{plan}/features/{feature}', [SubscriptionPlanFeaturesController::class, 'update'])->name('admin.subscriptions.features.update');
    Route::delete('/plans/{plan}/features/{feature}', [SubscriptionPlanFeaturesController::class, 'destroy'])->name('admin.subscriptions.features.destroy');
    Route::post('/plans/{plan}/features/bulk-toggle', [SubscriptionPlanFeaturesController::class, 'bulkToggle'])->name('admin.subscriptions.features.bulk-toggle');
});
