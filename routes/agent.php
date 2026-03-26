<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Agent\PageContentExplainerController;

/**
 * Agent API Routes
 * All routes under /api/agent prefix
 */
Route::prefix('agent')->middleware(['api'])->group(function () {
    /**
     * Page Content Explainer Agent
     * Explains and analyzes page content
     */
    Route::post('/explain-page-content', [PageContentExplainerController::class, 'explainPageContent']);
});
