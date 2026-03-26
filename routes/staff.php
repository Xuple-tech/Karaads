<?php

use App\Http\Controllers\Staff\StaffMonitoringController;
use App\Http\Middleware\AdminOrStaffMiddleware;
use Illuminate\Support\Facades\Route;

// ========== TECH STAFF ROUTES ==========
Route::middleware([AdminOrStaffMiddleware::class])->prefix('staff')->name('staff.')->group(function () {
    // Monitoring Dashboard
    Route::get('/', [StaffMonitoringController::class, 'index'])->name('dashboard');
    Route::get('/monitoring', [StaffMonitoringController::class, 'index'])->name('monitoring');

    // API Performance
    Route::get('/api-performance', [StaffMonitoringController::class, 'apiPerformance'])->name('api-performance');

    // System Health
    Route::get('/health', [StaffMonitoringController::class, 'systemHealth'])->name('health');
    Route::get('/system-health', [StaffMonitoringController::class, 'systemHealth'])->name('system-health');

    // Error Logs
    Route::get('/logs', [StaffMonitoringController::class, 'logs'])->name('logs');

    // Security Logs
    Route::get('/security-logs', [StaffMonitoringController::class, 'securityLogs'])->name('security-logs');

    // Issue Resolution
    Route::post('/resolve-issue/{alertId}', [StaffMonitoringController::class, 'resolveIssue'])->name('resolve-issue');
});
