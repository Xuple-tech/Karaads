<?php

use App\Http\Controllers\Docs\MainController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('/docs')->name('docs.')->group(function () {
   Route::get('/', [MainController::class, 'index'])->name('main');
   Route::prefix('/legal')->group(function () {
      Route::get('/terms', function () {
         return  Inertia::render('docs/legal/terms');
      })->name('legal.terms');
      Route::get('/privacy-policy', function () {
         return Inertia::render('docs/legal/privacy');
      })->name('legal.privacy_policy');
   });
   Route::prefix('/agents')->group(function () {
      Route::get('/', function () {
         return Inertia::render('docs/agents/index');
      })->name('agents.index');
      Route::get('/configuration', function () {
         return Inertia::render('docs/agents/configuration');
      })->name('agents.configuration');
      Route::get('/templates', function () {
         return Inertia::render('docs/agents/templates');
      })->name('agents.templates');
      Route::get('/knowledge-base', function () {
         return Inertia::render('docs/agents/knowledge-base');
      })->name('agents.knowledge-base');
      Route::get('/tools', function () {
         return Inertia::render('docs/agents/tools');
      })->name('agents.tools');
   });
   Route::prefix('/subscription')->group(function () {
      Route::get('/', function () {
         return Inertia::render('docs/subscription/overview');
      })->name('subscription.overview');
      Route::get('/features', function () {
         return Inertia::render('docs/subscription/features');
      })->name('subscription.features');
      Route::get('/faq', function () {
         return Inertia::render('docs/subscription/faq');
      })->name('subscription.faq');
   });
});
