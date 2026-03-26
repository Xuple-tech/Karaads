<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ConfirmablePasswordController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\EmailVerificationPromptController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Middleware\BotDetection;
use App\Http\Middleware\LogApiUsageMiddleware;
use Illuminate\Support\Facades\Route;

/**
 * Secure Authentication Routes with Heavy Obfuscation
 * All endpoints use randomized paths and enhanced security
 */

// Security middleware stack for authentication
$authSecurityMiddleware = [
    'web',
    'throttle:10,1', // Stricter rate limiting for auth
    BotDetection::class,
    LogApiUsageMiddleware::class
];

// Guest routes (registration and login) with obfuscated endpoints
Route::middleware($authSecurityMiddleware)->group(function () {

    // Registration with heavy obfuscation
    Route::get('/register/secure/x7k9m2p4', [RegisteredUserController::class, 'create'])->name('secure.register');
    Route::post('/register/create/q3w8r5t1', [RegisteredUserController::class, 'store'])->name('secure.register.store');

    // Login with enhanced security
    Route::get('/login/secure/n8m4k7j2', [AuthenticatedSessionController::class, 'create'])->name('secure.login');
    Route::post('/login/authenticate/p9l6h3v5', [AuthenticatedSessionController::class, 'store'])->name('secure.login.store');

    // Password reset with obfuscated paths
    Route::get('/forgot-password/secure/r2t8y4u1', [PasswordResetLinkController::class, 'create'])->name('secure.password.request');
    Route::post('/forgot-password/send/h5j8n3q1', [PasswordResetLinkController::class, 'store'])->name('secure.password.email');
    Route::get('/reset-password/secure/{token}/w6r9t2y5', [NewPasswordController::class, 'create'])->name('secure.password.reset');
    Route::post('/reset-password/update/m4k7l9p2', [NewPasswordController::class, 'store'])->name('secure.password.store');
});

// Authenticated routes with enhanced security
Route::middleware(array_merge($authSecurityMiddleware, ['auth']))->group(function () {

    // Email verification with obfuscation
    Route::get('/verify-email/secure/q3w8e5r1', EmailVerificationPromptController::class)->name('secure.verification.notice');
    Route::get('/verify-email/confirm/{id}/{hash}/z7x4c6v8', VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('secure.verification.verify');
    Route::post('/email/verification-notification/a2s5d8f1', [EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('secure.verification.send');

    // Password confirmation with enhanced security
    Route::get('/confirm-password/secure/j4h7g3f6', [ConfirmablePasswordController::class, 'show'])->name('secure.password.confirm');
    Route::post('/confirm-password/verify/l9p2o5i8', [ConfirmablePasswordController::class, 'store'])->name('secure.password.confirm.store');

    // Password update with obfuscation
    Route::put('/password/update/secure/u1y4t7r0', [PasswordController::class, 'update'])->name('secure.password.update');

    // Logout with enhanced security
    Route::post('/logout/secure/e3w6q9a2', [AuthenticatedSessionController::class, 'destroy'])->name('secure.logout');
});
