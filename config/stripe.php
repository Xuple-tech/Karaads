<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Stripe API Keys
    |--------------------------------------------------------------------------
    */
    'secret' => env('STRIPE_SECRET_KEY'),
    'public' => env('STRIPE_PUBLIC_KEY'),
    'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | Stripe Configuration
    |--------------------------------------------------------------------------
    */
    'currency' => env('STRIPE_CURRENCY', 'usd'),
    'mode' => env('STRIPE_MODE', 'test'), // 'test' or 'live'
];
