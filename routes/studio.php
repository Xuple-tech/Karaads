<?php

use App\Http\Controllers\SpaController;
use App\Http\Controllers\PodcastController;
use App\Http\Controllers\StudioController;
use Illuminate\Support\Facades\Route;

Route::get('/studio', SpaController::class)->name('studio.index');

    // routes/web.php or routes/api.php
    Route::middleware(['auth', 'verified'])->group(function () {
        // Page routes
        Route::get('/studio/podcast-master', SpaController::class)->name('podcast.library');
        Route::get('/podcast/generate', SpaController::class)->name('podcast.generate');

        // API routes
        Route::post('/podcast/generate', [PodcastController::class, 'generate']);
        Route::post('/podcast/generate-from-text', [PodcastController::class, 'generateFromText']);
        Route::get('/podcast/metadata', [PodcastController::class, 'metadata']);
        Route::get('/podcast/{id}', [PodcastController::class, 'show']);
        Route::delete('/podcast/{id}', [PodcastController::class, 'delete']);

        // Audio streaming routes
        Route::get('/podcast/{id}/stream', [PodcastController::class, 'stream'])->name('podcast.stream');
        Route::get('/podcast/{id}/download', [PodcastController::class, 'download'])->name('podcast.download');

        // List podcasts (for API or if needed)
        Route::get('/podcasts', [PodcastController::class, 'list']);
    });
