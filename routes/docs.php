<?php

use Illuminate\Support\Facades\Route;
Route::prefix('/docs')->name('docs.')->group(function () {
    Route::redirect('/', '/privacy')->name('main');

    Route::prefix('/legal')->name('legal.')->group(function () {
        Route::redirect('/terms', '/terms')->name('terms');
        Route::redirect('/privacy-policy', '/privacy')->name('privacy_policy');
    });
});
