<?php

return [

    'mailgun' => [
        'secret' => env('MAILGUN_SECRET'),
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],
    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'ollama' => [
        'api_key' => env('OLLAMA_API_KEY'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI', '/emails/callback/gmail'),
        'api_key' => env('GOOGLE_API_KEY'),
        'search_engine_id' => env('GOOGLE_SEARCH_ENGINE_ID'),
    ],

    'elevenlabs' => [
        'api_key' => env('ELEVENLABS_API_KEY'),
    ],
    'microsoft' => [
        'client_id' => env('MICROSOFT_CLIENT_ID'),
        'client_secret' => env('MICROSOFT_CLIENT_SECRET'),
        'redirect' => env('MICROSOFT_REDIRECT_URI', '/emails/callback/outlook'),
        'tenant' => env('MICROSOFT_TENANT_ID', 'common'),
    ],

    'openai' => [
        'api_key' => env('OPENAI_API_KEY') ?? "mm",
    ],

    'grok' => [
        'api_key' => env('GROK_API_KEY'),
        'verify_ssl' => filter_var(env('GROK_VERIFY_SSL', true), FILTER_VALIDATE_BOOL)
    ],

    'deepseek' => [
        'api_key' => env('DEEPSEEK_API_KEY'),
        'base_url' => env('DEEPSEEK_BASE_URL', 'https://api.deepseek.com/v1'),
        'default_model' => env('DEEPSEEK_DEFAULT_MODEL', 'deepseek-chat'),
        'timeout' => env('DEEPSEEK_TIMEOUT', 120),
        'max_tokens' => env('DEEPSEEK_MAX_TOKENS', 4000),
    ],

    'aws' => [
        'key' => env('AWS_ACCESS_KEY_ID') ?? "mm",
        'secret' => env('AWS_SECRET_ACCESS_KEY' ?? "mm"),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1') ?? "",
    ],

    'stripe' => [
        'secret' => env('STRIPE_SECRET_KEY'),
        'public' => env('STRIPE_PUBLIC_KEY'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],

    'paystack' => [
        'secret_key' => env('PAYSTACK_SECRET_KEY','sk_test_46beb99e252d1fa4be2dbc043a14248cc344d000'),
        'public_key' => env('PAYSTACK_PUBLIC_KEY','pk_test_cd821bdd12e8f817821893748d75962d7fb8c0a7'),
        'base_url' => env('PAYSTACK_BASE_URL', 'https://api.paystack.co'),
        'currency' => env('PAYSTACK_CURRENCY', 'USD'),
        'settlement_currency' => env('PAYSTACK_SETTLEMENT_CURRENCY', 'NGN'),
        'usd_to_ngn_rate' => (float) env('PAYSTACK_USD_TO_NGN_RATE', 1460),
        'timeout' => (int) env('PAYSTACK_TIMEOUT', 60),
        'connect_timeout' => (int) env('PAYSTACK_CONNECT_TIMEOUT', 15),
        'verify_ssl' => filter_var(env('PAYSTACK_VERIFY_SSL', false), FILTER_VALIDATE_BOOL),
    ],

    'currency' => [
        'api_key' => env('OPENEXCHANGERATES_API_KEY'),
        'default' => env('DEFAULT_CURRENCY', 'USD'),
        'cache_duration' => 3600, // 1 hour
    ],
    'meta' => [
        // OAuth Credentials
        'client_id' => env('META_CLIENT_ID'),
        'client_secret' => env('META_CLIENT_SECRET'),
        'api_version' => env('META_API_VERSION', 'v24.0'),
        'webhook_verify_token' => env('META_WEBHOOK_VERIFY_TOKEN'),

        // System User Configuration (for server-side automation)
        'system_user_token' => env('META_SYSTEM_USER_TOKEN'),
        'system_user_id' => env('META_SYSTEM_USER_ID'),
        'business_account_id' => env('META_BUSINESS_ACCOUNT_ID'),
        'business_manager_id' => env('META_BUSINESS_MANAGER_ID'),

        // Token Management
        'token_refresh_buffer' => env('META_TOKEN_REFRESH_BUFFER', 2592000), // 30 days
        'max_retries' => env('META_MAX_RETRIES', 3),
        'retry_delay' => env('META_RETRY_DELAY', 1000), // milliseconds
        'rate_limit_per_minute' => env('META_RATE_LIMIT_PER_MINUTE', 600),
        'verify_ssl' => env('META_VERIFY_SSL'),

        // Scopes & Events
        'required_scopes' => explode(',', env(
            'META_REQUIRED_SCOPES',
            'pages_manage_messaging,pages_read_user_profile,instagram_manage_messages'
        )),
        'webhook_events' => explode(',', env(
            'META_WEBHOOK_EVENTS',
            'messages,message_template_status_update'
        )),
    ],

    /*
    |--------------------------------------------------------------------------
    | Email Automation OAuth Configuration
    |--------------------------------------------------------------------------
    |
    | Separate OAuth configuration for email automation (Gmail, Outlook, etc.)
    | These have different redirect URIs than user authentication
    |
    */
    'email_automation' => [
        'gmail' => [
            'client_id' => env('GOOGLE_CLIENT_ID'),
            'client_secret' => env('GOOGLE_CLIENT_SECRET'),
            'redirect_uri' => env('EMAIL_AUTOMATION_GMAIL_REDIRECT_URI', env('APP_URL') . '/emails/callback/gmail'),
        ],
        'outlook' => [
            'client_id' => env('EMAIL_AUTOMATION_OUTLOOK_CLIENT_ID'),
            'client_secret' => env('EMAIL_AUTOMATION_OUTLOOK_CLIENT_SECRET'),
            'redirect_uri' => env('EMAIL_AUTOMATION_OUTLOOK_REDIRECT_URI', env('APP_URL') . '/emails/callback/outlook'),
            'tenant_id' => env('EMAIL_AUTOMATION_OUTLOOK_TENANT_ID', 'common'),
        ],
    ],
    'stability_ai' => [
        'api_key' => env('STABILITY_AI_API_KEY',"sk-WyE9b8HobRwjymRf6B5IjUSwbmy6PjgKuTpOGbpKg45HJ8Ok"),
    ],

];
