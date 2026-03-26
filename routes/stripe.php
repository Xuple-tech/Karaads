<?php

use App\Http\Controllers\StripePaymentController;
use App\Http\Controllers\StripeWebhookController;
use Illuminate\Support\Facades\Route;

// Public webhook endpoint (no CSRF protection needed)
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleWebhook'])
    ->withoutMiddleware('web')
    ->name('stripe.webhook');

// Authenticated Stripe payment routes
Route::middleware('auth')->group(function () {
    // Checkout and payment intent
    Route::get('/stripe/checkout', [StripePaymentController::class, 'checkout'])->name('stripe.checkout');
    Route::post('/stripe/payment-intent', [StripePaymentController::class, 'createPaymentIntent'])
        ->name('stripe.payment-intent');
    Route::post('/stripe/confirm-subscription', [StripePaymentController::class, 'confirmSubscription'])
        ->name('stripe.confirm-subscription');

    // Payment method management
    Route::get('/stripe/payment-methods', [StripePaymentController::class, 'getPaymentMethods'])
        ->name('stripe.payment-methods');
    Route::post('/stripe/payment-method/update', [StripePaymentController::class, 'updatePaymentMethod'])
        ->name('stripe.payment-method.update');
    Route::delete('/stripe/payment-method/{paymentMethodId}', [StripePaymentController::class, 'deletePaymentMethod'])
        ->name('stripe.payment-method.delete');

    // Subscription management
    Route::post('/stripe/cancel', [StripePaymentController::class, 'cancelSubscription'])
        ->name('stripe.cancel');
    Route::post('/stripe/reactivate', [StripePaymentController::class, 'reactivateSubscription'])
        ->name('stripe.reactivate');

    // Billing portal
    Route::get('/stripe/billing-portal', [StripePaymentController::class, 'billingPortal'])
        ->name('stripe.billing-portal');
});
