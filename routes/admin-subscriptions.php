<?php

use App\Http\Controllers\Admin\SubscriptionPlanController;
use App\Http\Controllers\Admin\SubscriptionPlanFeaturesController;
use App\Http\Controllers\Admin\SubscriptionPlanToolsController;
use App\Http\Controllers\Admin\SubscriptionPlanAgentLimitsController;
use App\Http\Controllers\Admin\SubscriptionPlanToolLimitsController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', AdminMiddleware::class])->prefix('admin/subscriptions')->group(function () {
    // Subscription Plans
    Route::get('/plans', [SubscriptionPlanController::class, 'index'])->name('admin.subscriptions.plans.index');
    Route::get('/plans/create', [SubscriptionPlanController::class, 'create'])->name('admin.subscriptions.plans.create');
    Route::post('/plans', [SubscriptionPlanController::class, 'store'])->name('admin.subscriptions.plans.store');
    Route::get('/plans/{subscriptionPlan}/edit', [SubscriptionPlanController::class, 'edit'])->name('admin.subscriptions.plans.edit');
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

    // Plan Tools Management
    Route::get('/plans/{plan}/tools', [SubscriptionPlanToolsController::class, 'index'])->name('admin.subscriptions.tools.index');
    Route::post('/plans/{plan}/tools', [SubscriptionPlanToolsController::class, 'store'])->name('admin.subscriptions.tools.store');
    Route::put('/plans/{plan}/tools/{tool}', [SubscriptionPlanToolsController::class, 'update'])->name('admin.subscriptions.tools.update');
    Route::delete('/plans/{plan}/tools/{tool}', [SubscriptionPlanToolsController::class, 'destroy'])->name('admin.subscriptions.tools.destroy');
    Route::post('/plans/{plan}/tools/bulk-toggle', [SubscriptionPlanToolsController::class, 'bulkToggle'])->name('admin.subscriptions.tools.bulk-toggle');
    Route::get('/plans/{plan}/tools/by-category', [SubscriptionPlanToolsController::class, 'getByCategory'])->name('admin.subscriptions.tools.by-category');

    // Plan Agent Limits Management
    Route::get('/plans/{plan}/agent-limits', [SubscriptionPlanAgentLimitsController::class, 'show'])->name('admin.subscriptions.agent-limits.show');
    Route::put('/plans/{plan}/agent-limits', [SubscriptionPlanAgentLimitsController::class, 'update'])->name('admin.subscriptions.agent-limits.update');
    Route::post('/plans/{plan}/agent-limits/set-unlimited', [SubscriptionPlanAgentLimitsController::class, 'setUnlimited'])->name('admin.subscriptions.agent-limits.set-unlimited');
    Route::get('/plans/{plan}/agent-limits/statistics', [SubscriptionPlanAgentLimitsController::class, 'getStatistics'])->name('admin.subscriptions.agent-limits.statistics');

    // Plan Tool Limits Management
    Route::get('/plans/{plan}/tool-limits', [SubscriptionPlanToolLimitsController::class, 'show'])->name('admin.subscriptions.tool-limits.show');
    Route::put('/plans/{plan}/tool-limits', [SubscriptionPlanToolLimitsController::class, 'update'])->name('admin.subscriptions.tool-limits.update');
    Route::post('/plans/{plan}/tool-limits/set-unlimited-servers', [SubscriptionPlanToolLimitsController::class, 'setUnlimitedServers'])->name('admin.subscriptions.tool-limits.set-unlimited-servers');
    Route::post('/plans/{plan}/tool-limits/set-unlimited-per-workflow', [SubscriptionPlanToolLimitsController::class, 'setUnlimitedToolsPerWorkflow'])->name('admin.subscriptions.tool-limits.set-unlimited-per-workflow');
    Route::post('/plans/{plan}/tool-limits/add-category', [SubscriptionPlanToolLimitsController::class, 'addToolCategory'])->name('admin.subscriptions.tool-limits.add-category');
    Route::post('/plans/{plan}/tool-limits/remove-category', [SubscriptionPlanToolLimitsController::class, 'removeToolCategory'])->name('admin.subscriptions.tool-limits.remove-category');
    Route::get('/plans/{plan}/tool-limits/statistics', [SubscriptionPlanToolLimitsController::class, 'getStatistics'])->name('admin.subscriptions.tool-limits.statistics');
});
