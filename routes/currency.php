<?php

use App\Http\Controllers\CurrencyController;
use Illuminate\Support\Facades\Route;

Route::prefix('api/currency')->middleware('web')->group(function () {
    // Public routes
    Route::get('/exchange-rate', [CurrencyController::class, 'getExchangeRate'])->name('currency.exchange-rate');
    Route::post('/convert', [CurrencyController::class, 'convertPrice'])->name('currency.convert');
    Route::get('/detect', [CurrencyController::class, 'detectUserCurrency'])->name('currency.detect');
    Route::get('/supported', [CurrencyController::class, 'getSupportedCurrencies'])->name('currency.supported');
    Route::get('/subscription-prices', [CurrencyController::class, 'getSubscriptionPrices'])->name('currency.subscription-prices');

    // Authenticated routes
    Route::middleware('auth')->group(function () {
        Route::get('/user-currency', [CurrencyController::class, 'getUserCurrency'])->name('currency.user-currency');
        Route::post('/user-currency', [CurrencyController::class, 'setUserCurrency'])->name('currency.set-user-currency');
    });
});
