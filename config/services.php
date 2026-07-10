<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_CALLBACK_URL'),
    ],
    'paystack' => [
        'secret_key' => env('PAYSTACK_SECRET_KEY','sk_test_6f1313731f16aafafb0b68195b4764d033ada665'),
        'public_key' => env('PAYSTACK_PUBLIC_KEY','pk_test_848d68c1a85b1c6a7b46d580b171cc981f49fe04'),
        'webhook_secret' => env('PAYSTACK_WEBHOOK_SECRET', env('PAYSTACK_SECRET_KEY','sk_test_6f1313731f16aafafb0b68195b4764d033ada665')),
        'verify_ssl' => filter_var(env('PAYSTACK_VERIFY_SSL', true), FILTER_VALIDATE_BOOLEAN),
    ],
    'http_client' => [
        'verify_ssl' => filter_var(env('HTTP_CLIENT_VERIFY_SSL', true), FILTER_VALIDATE_BOOLEAN),
    ],
    'interface' => [
        'base_url' => env('INTERFACE_BASE_URL'),
        'secret_key' => env('INTERFACE_SECRET_KEY'),
        'secret_password' => env('INTERFACE_SECRET_PASSWORD'),
        'account_number' => env('INTERFACE_ACCOUNT_NUMBER'),
        'source' => env('INTERFACE_SOURCE', env('INTERFACE_PUBLIC_KEY', env('INTERFACE_PUBLICK_KEY'))),
        'hash_secret' => env('INTERFACE_HASH_SECRET'),
        'verify_ssl' => env('INTERFACE_VERIFY_SSL', true),
        'user_agent' => env('INTERFACE_USER_AGENT', 'KaraadsInterfaceClient/1.0'),
        'narration_prefix' => env('INTERFACE_NARRATION_PREFIX', ''),
        'timeout' => env('INTERFACE_TIMEOUT', 30),
        'connect_timeout' => env('INTERFACE_CONNECT_TIMEOUT', 8),
        'retry_attempts' => env('INTERFACE_RETRY_ATTEMPTS', 3),
        'retry_delay_ms' => env('INTERFACE_RETRY_DELAY_MS', 300),
        'public_key' => env('INTERFACE_PUBLIC_KEY', env('INTERFACE_PUBLICK_KEY')),
    ],
    'expo' => [
        'access_token' => env('EXPO_PUSH_ACCESS_TOKEN'),
    ],
    'kwati_ai' => [
        'base_url' => env('KWATI_AI_BASE_URL', 'http://console.kwatiai.com/api/v1'),
        'api_key' => env('KWATI_AI_API_KEY'),
        'model' => env('KWATI_AI_MODEL', 'kwati-fast'),
        'timeout' => env('KWATI_AI_TIMEOUT', 45),
        'connect_timeout' => env('KWATI_AI_CONNECT_TIMEOUT', 10),
    ],
    'rewarded' => [
        // Keep the lock implementation, but default it off to allow multi-tab and multi-device usage.
        'enforce_single_active_watcher' => env('REWARDED_ENFORCE_SINGLE_ACTIVE_WATCHER', false),
    ],
    'currency' => [
        'live_rates' => filter_var(env('CURRENCY_LIVE_RATES', true), FILTER_VALIDATE_BOOLEAN),
        'rates_url' => env('CURRENCY_RATES_URL', 'https://open.er-api.com/v6/latest/NGN'),
        'cache_hours' => env('CURRENCY_RATE_CACHE_HOURS', 6),
        'timeout' => env('CURRENCY_RATE_TIMEOUT', 2),
    ],

];
