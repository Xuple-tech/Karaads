<?php

use App\Support\ConsoleUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

$redirectToConsoleDocs = function (Request $request, string $suffix = '') {
    $target = ConsoleUrl::docsUrl($request);

    if ($suffix !== '') {
        $target .= '/' . ltrim($suffix, '/');
    }

    return redirect()->away($target, 302);
};

Route::prefix('/docs')->name('docs.')->group(function () use ($redirectToConsoleDocs) {
    Route::get('/', fn (Request $request) => $redirectToConsoleDocs($request))->name('main');

    Route::prefix('/legal')->name('legal.')->group(function () use ($redirectToConsoleDocs) {
        Route::get('/terms', fn (Request $request) => $redirectToConsoleDocs($request, 'legal/terms'))->name('terms');
        Route::get('/privacy-policy', fn (Request $request) => $redirectToConsoleDocs($request, 'legal/privacy-policy'))->name('privacy_policy');
    });

    Route::prefix('/agents')->name('agents.')->group(function () use ($redirectToConsoleDocs) {
        Route::get('/', fn (Request $request) => $redirectToConsoleDocs($request, 'agents'))->name('index');
        Route::get('/widget', fn (Request $request) => $redirectToConsoleDocs($request, 'agents/widget'))->name('widget');
        Route::get('/configuration', fn (Request $request) => $redirectToConsoleDocs($request, 'agents/configuration'))->name('configuration');
        Route::get('/templates', fn (Request $request) => $redirectToConsoleDocs($request, 'agents/templates'))->name('templates');
        Route::get('/knowledge-base', fn (Request $request) => $redirectToConsoleDocs($request, 'agents/knowledge-base'))->name('knowledge-base');
        Route::get('/tools', fn (Request $request) => $redirectToConsoleDocs($request, 'agents/tools'))->name('tools');
    });

    Route::get('/developer-api', fn (Request $request) => $redirectToConsoleDocs($request, 'api'))->name('developer-api');
    Route::get('/api', fn (Request $request) => $redirectToConsoleDocs($request, 'api'))->name('api.index');
});
