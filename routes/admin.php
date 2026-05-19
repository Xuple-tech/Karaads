<?php

use App\Http\Controllers\Admin\Auth\AdminSessionController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\SaasOwnerController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\GrokApiController;
use App\Http\Controllers\Admin\PromptController;
use App\Http\Controllers\Admin\AIModeController;
use App\Http\Controllers\Admin\PersonalizationController;
use App\Http\Controllers\Admin\PresentationTemplateAdminController;
use App\Http\Controllers\Admin\DeveloperApiController;
use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\AdminOrStaffMiddleware;
use Illuminate\Support\Facades\Route;

// ========== ADMIN AUTH (guest) ==========
Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('guest:internal')->group(function () {
        Route::get('/login', [AdminSessionController::class, 'create'])->name('login');
        Route::post('/login', [AdminSessionController::class, 'store'])->name('login.store');
    });
    Route::post('/logout', [AdminSessionController::class, 'destroy'])->name('logout');
});

// ========== ADMIN MANAGEMENT ROUTES ==========
Route::middleware([AdminMiddleware::class])->prefix('admin')->name('admin.')->group(function () {
    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Image uploads
    Route::get('/image-uploads', [DashboardController::class, 'imageUploads'])->name('image-uploads');
    Route::delete('/image-uploads/{id}', [DashboardController::class, 'deleteImage'])->name('image-uploads.delete');

    // User statistics
    Route::get('/user-stats', [DashboardController::class, 'userStats'])->name('user-stats');

    // User management
    Route::resource('users', UserController::class);

    // Staff management (Admin/CTO only)
    Route::resource('staff', StaffController::class);

    // SaaS Owner management (Admin/CTO only)
    Route::resource('saas-owners', SaasOwnerController::class);

    // ========== NEW MANAGEMENT FEATURES ==========

    // Admin dashboard with system overview
    Route::get('/management/dashboard', [AdminDashboardController::class, 'index'])->name('management-dashboard');
    Route::get('/management/alerts', [AdminDashboardController::class, 'alerts'])->name('management.alerts');
    Route::post('/management/alerts/{id}/resolve', [AdminDashboardController::class, 'resolveAlert'])->name('management.alerts.resolve');
    Route::get('/management/audit-logs', [AdminDashboardController::class, 'auditLogs'])->name('management.audit-logs');
    Route::get('/management/configuration', [AdminDashboardController::class, 'configuration'])->name('management.configuration');
    Route::put('/management/configuration/{config}', [AdminDashboardController::class, 'updateConfiguration'])->name('management.configuration.update');

    // Grok API Management
    Route::prefix('grok-api')->name('grok-api.')->group(function () {
        Route::get('/', [GrokApiController::class, 'index'])->name('index');
        Route::get('/create', [GrokApiController::class, 'create'])->name('create');
        Route::post('/', [GrokApiController::class, 'store'])->name('store');
        Route::get('/{config}', [GrokApiController::class, 'show'])->name('show');
        Route::get('/{config}/edit', [GrokApiController::class, 'edit'])->name('edit');
        Route::put('/{config}', [GrokApiController::class, 'update'])->name('update');
        Route::post('/{config}/test', [GrokApiController::class, 'test'])->name('test');
        Route::post('/{config}/deactivate', [GrokApiController::class, 'deactivate'])->name('deactivate');
        Route::delete('/{config}', [GrokApiController::class, 'destroy'])->name('destroy');
    });

    // AI Prompt Templates
    Route::prefix('prompts')->name('prompts.')->group(function () {
        Route::get('/', [PromptController::class, 'index'])->name('index');
        Route::get('/create', [PromptController::class, 'create'])->name('create');
        Route::post('/', [PromptController::class, 'store'])->name('store');
        Route::get('/{prompt}', [PromptController::class, 'show'])->name('show');
        Route::get('/{prompt}/edit', [PromptController::class, 'edit'])->name('edit');
        Route::put('/{prompt}', [PromptController::class, 'update'])->name('update');
        Route::post('/{prompt}/test', [PromptController::class, 'test'])->name('test');
        Route::delete('/{prompt}', [PromptController::class, 'destroy'])->name('destroy');
    });

    // PowerPoint Slide Templates
    Route::prefix('slide-templates')->name('slide-templates.')->group(function () {
        Route::get('/', [PresentationTemplateAdminController::class, 'index'])->name('index');
        Route::get('/create', [PresentationTemplateAdminController::class, 'create'])->name('create');
        Route::post('/', [PresentationTemplateAdminController::class, 'store'])->name('store');
        Route::get('/{template}/edit', [PresentationTemplateAdminController::class, 'edit'])->name('edit');
        Route::put('/{template}', [PresentationTemplateAdminController::class, 'update'])->name('update');
        Route::delete('/{template}', [PresentationTemplateAdminController::class, 'destroy'])->name('destroy');
    });

    // AI Modes Management
    Route::prefix('ai-modes')->name('ai-modes.')->group(function () {
        Route::get('/', [AIModeController::class, 'index'])->name('index');
        Route::get('/create', [AIModeController::class, 'create'])->name('create');
        Route::post('/', [AIModeController::class, 'store'])->name('store');
        Route::get('/{mode}', [AIModeController::class, 'show'])->name('show');
        Route::get('/{mode}/edit', [AIModeController::class, 'edit'])->name('edit');
        Route::put('/{mode}', [AIModeController::class, 'update'])->name('update');
        Route::delete('/{mode}', [AIModeController::class, 'destroy'])->name('destroy');
        Route::patch('/{mode}/toggle', [AIModeController::class, 'toggleStatus'])->name('toggle');
    });

    // System Personalizations Management
    Route::prefix('personalizations')->name('personalizations.')->group(function () {
        Route::get('/', [PersonalizationController::class, 'indexPersonalizations'])->name('index');
        Route::get('/create', [PersonalizationController::class, 'createPersonalization'])->name('create');
        Route::post('/', [PersonalizationController::class, 'storePersonalization'])->name('store');
        Route::get('/{personalization}', [PersonalizationController::class, 'editPersonalization'])->name('edit');
        Route::put('/{personalization}', [PersonalizationController::class, 'updatePersonalization'])->name('update');
        Route::delete('/{personalization}', [PersonalizationController::class, 'destroyPersonalization'])->name('destroy');
    });

    // Personalization Templates Management
    Route::prefix('personalization-templates')->name('personalization-templates.')->group(function () {
        Route::get('/', [PersonalizationController::class, 'indexTemplates'])->name('index');
        Route::get('/create', [PersonalizationController::class, 'createTemplate'])->name('create');
        Route::post('/', [PersonalizationController::class, 'storeTemplate'])->name('store');
        Route::get('/{template}', [PersonalizationController::class, 'editTemplate'])->name('edit');
        Route::put('/{template}', [PersonalizationController::class, 'updateTemplate'])->name('update');
        Route::delete('/{template}', [PersonalizationController::class, 'destroyTemplate'])->name('destroy');
        Route::get('/statistics', [PersonalizationController::class, 'statistics'])->name('statistics');
    });

    // Developer API Management
    Route::prefix('developer-api')->name('developer-api.')->group(function () {
        Route::get('/', [DeveloperApiController::class, 'index'])->name('index');
        Route::post('/models', [DeveloperApiController::class, 'storeModel'])->name('models.store');
        Route::put('/models/{apiModel}', [DeveloperApiController::class, 'updateModel'])->name('models.update');
        Route::post('/models/{apiModel}/toggle', [DeveloperApiController::class, 'toggleModel'])->name('models.toggle');
        Route::post('/keys/{developerApiKey}/toggle', [DeveloperApiController::class, 'toggleKey'])->name('keys.toggle');
        Route::post('/keys/{developerApiKey}/regenerate', [DeveloperApiController::class, 'regenerateKey'])->name('keys.regenerate');
        Route::post('/wallets/{user}/adjust', [DeveloperApiController::class, 'adjustWallet'])->name('wallets.adjust');
    });
});
