<?php

use App\Http\Controllers\DeveloperApiDocsController;
use Illuminate\Support\Facades\Route;

Route::prefix('/developer-docs')->name('docs.')->group(function () {
    Route::redirect('/', '/developer-docs/api')->name('main');

    Route::prefix('/legal')->name('legal.')->group(function () {
        Route::redirect('/terms', '/terms')->name('terms');
        Route::redirect('/privacy-policy', '/privacy')->name('privacy_policy');
    });

    Route::get('/api', [DeveloperApiDocsController::class, 'index'])->name('api');
    Route::get('/agents', [DeveloperApiDocsController::class, 'agents'])->name('agents');
});
