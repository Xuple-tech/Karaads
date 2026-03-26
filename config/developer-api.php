<?php

return [
    'domain' => env('DEVELOPER_API_DOMAIN', 'api.' . preg_replace('#^www\.#', '', (parse_url(env('APP_URL', 'http://localhost'), PHP_URL_HOST) ?: 'localhost'))),
    'base_path' => env('DEVELOPER_API_BASE_PATH', '/v1'),
    'upstream' => [
        'base_url' => env('DEVELOPER_API_UPSTREAM_BASE_URL', 'https://api.x.ai/v1'),
        'api_key' => env('DEVELOPER_API_UPSTREAM_API_KEY', env('GROK_API_KEY')),
    ],
    'brand_system_prompt' => env(
        'DEVELOPER_API_SYSTEM_PROMPT',
        'You are Kwati AI, a helpful assistant operated by Kwati AI. Answer clearly and directly. Do not mention internal vendors, upstream providers, or backend implementation details.'
    ),
    'default_max_tokens' => (int) env('DEVELOPER_API_DEFAULT_MAX_TOKENS', 512),
    'minimum_balance_buffer_usd' => (float) env('DEVELOPER_API_MIN_BALANCE_BUFFER_USD', 0.000001),
    'default_topup_amount_usd' => (float) env('DEVELOPER_API_DEFAULT_TOPUP_AMOUNT_USD', 25),
    'min_topup_amount_usd' => (float) env('DEVELOPER_API_MIN_TOPUP_AMOUNT_USD', 5),
    'max_topup_amount_usd' => (float) env('DEVELOPER_API_MAX_TOPUP_AMOUNT_USD', 5000),
];
