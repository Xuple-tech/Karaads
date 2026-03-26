<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\SubscriptionController;
use App\Http\Controllers\Admin\SystemController;
use App\Http\Controllers\Admin\SecurityController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\AuditController;
use App\Http\Controllers\SubscriptionController as ControllersSubscriptionController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\BotDetection;
use App\Http\Middleware\LogApiUsageMiddleware;
use Illuminate\Support\Facades\Route;

/**
 * Secure Admin Routes with Heavy Obfuscation
 * All endpoints use randomized paths and enhanced security
 */

// Security middleware stack for admin routes
$adminSecurityMiddleware = [
    'web',
    'auth',
    AdminMiddleware::class,
    'throttle:30,1', // Stricter rate limiting for admin
    BotDetection::class,
    LogApiUsageMiddleware::class
];

Route::middleware($adminSecurityMiddleware)->prefix('admin/secure')->group(function () {

    // Admin Dashboard with heavy obfuscation
    Route::get('/dashboard/x7k9m2p4', [AdminController::class, 'dashboard'])->name('secure.admin.dashboard');
    Route::get('/overview/stats/q3w8r5t1', [AdminController::class, 'overview'])->name('secure.admin.overview');

    // User Management with enhanced security
    Route::prefix('users/mgmt/n8m4k7j2')->group(function () {
        Route::get('/list/all/p9l6h3v5', [UserController::class, 'index'])->name('secure.admin.users.index');
        Route::get('/show/{userUuid}/r2t8y4u1', [UserController::class, 'show'])->name('secure.admin.users.show');
        Route::put('/update/{userUuid}/h5j8n3q1', [UserController::class, 'update'])->name('secure.admin.users.update');
        Route::delete('/delete/{userUuid}/w6r9t2y5', [UserController::class, 'destroy'])->name('secure.admin.users.destroy');
        Route::post('/suspend/{userUuid}/m4k7l9p2', [UserController::class, 'suspend'])->name('secure.admin.users.suspend');
        Route::post('/activate/{userUuid}/q3w8e5r1', [UserController::class, 'activate'])->name('secure.admin.users.activate');
        Route::post('/impersonate/{userUuid}/z7x4c6v8', [UserController::class, 'impersonate'])->name('secure.admin.users.impersonate');
        Route::get('/activity/{userUuid}/a2s5d8f1', [UserController::class, 'activity'])->name('secure.admin.users.activity');
        Route::get('/export/data/j4h7g3f6', [UserController::class, 'export'])->name('secure.admin.users.export');
    });

    // Subscription Management with obfuscated paths
    Route::prefix('subscriptions/mgmt/l9p2o5i8')->group(function () {
        Route::get('/list/all/u1y4t7r0', [ControllersSubscriptionController::class, 'index'])->name('secure.admin.subscriptions.index');
        Route::get('/show/{subscriptionUuid}/e3w6q9a2', [SubscriptionController::class, 'show'])->name('secure.admin.subscriptions.show');
        Route::put('/update/{subscriptionUuid}/s5d8f1g4', [SubscriptionController::class, 'update'])->name('secure.admin.subscriptions.update');
        Route::post('/cancel/{subscriptionUuid}/h7j0k3l6', [SubscriptionController::class, 'cancel'])->name('secure.admin.subscriptions.cancel');
        Route::post('/refund/{subscriptionUuid}/v8c1x4z7', [SubscriptionController::class, 'refund'])->name('secure.admin.subscriptions.refund');
        Route::get('/analytics/revenue/q3w6e9r2', [SubscriptionController::class, 'analytics'])->name('secure.admin.subscriptions.analytics');
        Route::get('/export/data/t5y8u1i4', [SubscriptionController::class, 'export'])->name('secure.admin.subscriptions.export');
    });

    // System Management with enhanced security
    Route::prefix('system/mgmt/o7p0a3s6')->group(function () {
        Route::get('/status/health/d9f2g5h8', [SystemController::class, 'status'])->name('secure.admin.system.status');
        Route::get('/logs/system/j1k4l7z0', [SystemController::class, 'logs'])->name('secure.admin.system.logs');
        Route::post('/maintenance/toggle/x3c6v9b2', [SystemController::class, 'toggleMaintenance'])->name('secure.admin.system.maintenance');
        Route::post('/cache/clear/n5m8k1j4', [SystemController::class, 'clearCache'])->name('secure.admin.system.cache.clear');
        Route::post('/queue/restart/w7e0r3t6', [SystemController::class, 'restartQueue'])->name('secure.admin.system.queue.restart');
        Route::get('/config/view/f4g7h0j3', [SystemController::class, 'config'])->name('secure.admin.system.config');
        Route::put('/config/update/k6l9z2x5', [SystemController::class, 'updateConfig'])->name('secure.admin.system.config.update');
        Route::get('/backup/create/c8v1b4n7', [SystemController::class, 'createBackup'])->name('secure.admin.system.backup');
    });

    // Security Management with heavy obfuscation
    Route::prefix('security/mgmt/m0p3q6w9')->group(function () {
        Route::get('/threats/list/a2s5d8f1', [SecurityController::class, 'threats'])->name('secure.admin.security.threats');
        Route::get('/blocked/ips/r4t7y0u3', [SecurityController::class, 'blockedIps'])->name('secure.admin.security.blocked');
        Route::post('/block/ip/i6o9p2l5', [SecurityController::class, 'blockIp'])->name('secure.admin.security.block');
        Route::delete('/unblock/ip/{ip}/h8j1k4z7', [SecurityController::class, 'unblockIp'])->name('secure.admin.security.unblock');
        Route::get('/failed/logins/g0f3d6s9', [SecurityController::class, 'failedLogins'])->name('secure.admin.security.failed.logins');
        Route::get('/suspicious/activity/q2w5e8r1', [SecurityController::class, 'suspiciousActivity'])->name('secure.admin.security.suspicious');
        Route::post('/security/scan/t4y7u0i3', [SecurityController::class, 'securityScan'])->name('secure.admin.security.scan');
        Route::get('/api/usage/p6a9s2d5', [SecurityController::class, 'apiUsage'])->name('secure.admin.security.api.usage');
    });

    // Analytics with enhanced security
    Route::prefix('analytics/data/l8z1x4c7')->group(function () {
        Route::get('/dashboard/overview/v0b3n6m9', [AnalyticsController::class, 'dashboard'])->name('secure.admin.analytics.dashboard');
        Route::get('/users/stats/k2j5h8g1', [AnalyticsController::class, 'userStats'])->name('secure.admin.analytics.users');
        Route::get('/revenue/stats/f4d7s0a3', [AnalyticsController::class, 'revenueStats'])->name('secure.admin.analytics.revenue');
        Route::get('/usage/stats/w6e9r2t5', [AnalyticsController::class, 'usageStats'])->name('secure.admin.analytics.usage');
        Route::get('/performance/stats/y8u1i4o7', [AnalyticsController::class, 'performanceStats'])->name('secure.admin.analytics.performance');
        Route::get('/export/report/q0w3e6r9', [AnalyticsController::class, 'exportReport'])->name('secure.admin.analytics.export');
        Route::post('/custom/report/z2x5c8v1', [AnalyticsController::class, 'customReport'])->name('secure.admin.analytics.custom');
    });

    // Audit Logs with heavy obfuscation
    Route::prefix('audit/logs/b4n7m0k3')->group(function () {
        Route::get('/list/all/h6g9f2d5', [AuditController::class, 'index'])->name('secure.admin.audit.index');
        Route::get('/show/{auditUuid}/j8k1l4z7', [AuditController::class, 'show'])->name('secure.admin.audit.show');
        Route::get('/user/{userUuid}/s0a3d6f9', [AuditController::class, 'userAudit'])->name('secure.admin.audit.user');
        Route::get('/action/{action}/p2o5i8u1', [AuditController::class, 'actionAudit'])->name('secure.admin.audit.action');
        Route::get('/export/logs/c4v7b0n3', [AuditController::class, 'export'])->name('secure.admin.audit.export');
        Route::delete('/purge/old/x6z9a2s5', [AuditController::class, 'purgeOld'])->name('secure.admin.audit.purge');
        Route::get('/search/logs/m8k1j4h7', [AuditController::class, 'search'])->name('secure.admin.audit.search');
    });

    // API Management with enhanced security
    Route::prefix('api/mgmt/g0f3d6s9')->group(function () {
        Route::get('/keys/list/q2w5e8r1', [AdminController::class, 'apiKeys'])->name('secure.admin.api.keys');
        Route::post('/keys/create/t4y7u0i3', [AdminController::class, 'createApiKey'])->name('secure.admin.api.create');
        Route::delete('/keys/revoke/{keyUuid}/p6a9s2d5', [AdminController::class, 'revokeApiKey'])->name('secure.admin.api.revoke');
        Route::get('/usage/stats/l8z1x4c7', [AdminController::class, 'apiUsageStats'])->name('secure.admin.api.usage');
        Route::get('/rate/limits/v0b3n6m9', [AdminController::class, 'rateLimits'])->name('secure.admin.api.limits');
        Route::put('/rate/limits/update/k2j5h8g1', [AdminController::class, 'updateRateLimits'])->name('secure.admin.api.limits.update');
    });

    // Feature Flags with obfuscated paths
    Route::prefix('features/flags/f4d7s0a3')->group(function () {
        Route::get('/list/all/w6e9r2t5', [AdminController::class, 'featureFlags'])->name('secure.admin.features.index');
        Route::post('/create/flag/y8u1i4o7', [AdminController::class, 'createFeatureFlag'])->name('secure.admin.features.create');
        Route::put('/update/{flagUuid}/q0w3e6r9', [AdminController::class, 'updateFeatureFlag'])->name('secure.admin.features.update');
        Route::delete('/delete/{flagUuid}/z2x5c8v1', [AdminController::class, 'deleteFeatureFlag'])->name('secure.admin.features.delete');
        Route::post('/toggle/{flagUuid}/b4n7m0k3', [AdminController::class, 'toggleFeatureFlag'])->name('secure.admin.features.toggle');
    });

    // Notification Management
    Route::prefix('notifications/mgmt/h6g9f2d5')->group(function () {
        Route::get('/list/all/j8k1l4z7', [AdminController::class, 'notifications'])->name('secure.admin.notifications.index');
        Route::post('/send/broadcast/s0a3d6f9', [AdminController::class, 'sendBroadcast'])->name('secure.admin.notifications.broadcast');
        Route::post('/send/user/{userUuid}/p2o5i8u1', [AdminController::class, 'sendUserNotification'])->name('secure.admin.notifications.user');
        Route::get('/templates/list/c4v7b0n3', [AdminController::class, 'notificationTemplates'])->name('secure.admin.notifications.templates');
        Route::post('/templates/create/x6z9a2s5', [AdminController::class, 'createNotificationTemplate'])->name('secure.admin.notifications.templates.create');
    });
});
