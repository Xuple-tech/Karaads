<?php

use App\Http\Controllers\PaystackWebhookController;
use Illuminate\Support\Facades\Route;

Route::get('/paystack/callback', [PaystackWebhookController::class, 'callback'])
    ->withoutMiddleware('web')
    ->name('paystack.callback');

Route::post('/paystack/webhook', [PaystackWebhookController::class, 'webhook'])
    ->withoutMiddleware('web')
    ->name('paystack.webhook');
