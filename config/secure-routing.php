<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Secure Routing Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration options for the secure routing system
    | with heavy obfuscation and enhanced security measures.
    |
    */

    'enabled' => env('SECURE_ROUTING_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Route Obfuscation Settings
    |--------------------------------------------------------------------------
    */
    'obfuscation' => [
        'level' => env('ROUTE_OBFUSCATION_LEVEL', 'heavy'), // light, medium, heavy, dynamic
        'regenerate_interval' => env('ROUTE_REGENERATE_INTERVAL', 86400), // seconds
        'cache_key_prefix' => 'secure_routes:',
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Middleware Configuration
    |--------------------------------------------------------------------------
    */
    'middleware' => [
        'rate_limits' => [
            'auth' => ['attempts' => 5, 'decay' => 300],
            'admin' => ['attempts' => 20, 'decay' => 60],
            'api' => ['attempts' => 60, 'decay' => 60],
            'chat' => ['attempts' => 30, 'decay' => 60],
            'default' => ['attempts' => 100, 'decay' => 60],
        ],
        'bot_detection' => [
            'enabled' => true,
            'strict_mode' => env('BOT_DETECTION_STRICT', true),
        ],
        'csrf_protection' => [
            'enabled' => true,
            'exclude_routes' => [
                'secure.auth.login',
                'secure.auth.register',
                'secure.chat.send',
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | UUID Validation Settings
    |--------------------------------------------------------------------------
    */
    'uuid_validation' => [
        'enabled' => true,
        'strict_v4_only' => true,
        'required_parameters' => [
            'uuid', 'userUuid', 'projectUuid', 'conversationUuid', 'chatUuid',
            'agentUuid', 'memoryUuid', 'scheduleUuid', 'chainUuid', 'triggerUuid',
            'actionUuid', 'logUuid', 'fileUuid', 'memberUuid', 'execUuid',
            'auditUuid', 'keyUuid', 'flagUuid', 'subscriptionUuid'
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Token Configuration
    |--------------------------------------------------------------------------
    */
    'security_tokens' => [
        'enabled' => true,
        'lifetime' => 300, // 5 minutes
        'algorithm' => 'sha256',
        'length' => 32,
    ],

    /*
    |--------------------------------------------------------------------------
    | Content Security Settings
    |--------------------------------------------------------------------------
    */
    'content_security' => [
        'max_message_length' => 10000,
        'max_file_size' => 10485760, // 10MB
        'allowed_file_types' => [
            'text/plain',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/gif'
        ],
        'scan_for_malware' => env('SCAN_FILES_FOR_MALWARE', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Audit Logging Configuration
    |--------------------------------------------------------------------------
    */
    'audit_logging' => [
        'enabled' => true,
        'log_all_requests' => env('AUDIT_LOG_ALL_REQUESTS', false),
        'log_sensitive_data' => false,
        'retention_days' => 90,
        'high_severity_retention_days' => 365,
    ],

    /*
    |--------------------------------------------------------------------------
    | IP Security Settings
    |--------------------------------------------------------------------------
    */
    'ip_security' => [
        'whitelist_enabled' => env('IP_WHITELIST_ENABLED', false),
        'whitelist' => env('IP_WHITELIST', ''),
        'blacklist_enabled' => true,
        'auto_blacklist_threshold' => 100, // requests per minute
        'blacklist_duration' => 3600, // 1 hour
    ],

    /*
    |--------------------------------------------------------------------------
    | Session Security
    |--------------------------------------------------------------------------
    */
    'session_security' => [
        'max_lifetime' => 86400, // 24 hours
        'check_ip_consistency' => env('SESSION_CHECK_IP', false),
        'regenerate_on_auth' => true,
        'secure_cookies' => env('SESSION_SECURE_COOKIE', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | API Security Settings
    |--------------------------------------------------------------------------
    */
    'api_security' => [
        'require_https' => env('API_REQUIRE_HTTPS', true),
        'validate_user_agent' => true,
        'block_automated_tools' => true,
        'encrypt_sensitive_responses' => false,
    ],

    /*
    |--------------------------------------------------------------------------
    | Emergency Security Measures
    |--------------------------------------------------------------------------
    */
    'emergency' => [
        'lockdown_mode' => env('SECURITY_LOCKDOWN_MODE', false),
        'maintenance_mode_on_threats' => true,
        'auto_disable_on_breach' => false,
        'notification_channels' => ['log', 'email'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Performance Settings
    |--------------------------------------------------------------------------
    */
    'performance' => [
        'cache_route_patterns' => true,
        'cache_security_checks' => true,
        'cache_ttl' => 3600, // 1 hour
        'enable_compression' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Development Settings
    |--------------------------------------------------------------------------
    */
    'development' => [
        'debug_security_headers' => env('DEBUG_SECURITY_HEADERS', false),
        'log_all_security_events' => env('LOG_ALL_SECURITY_EVENTS', false),
        'bypass_rate_limits' => env('BYPASS_RATE_LIMITS', false),
        'disable_obfuscation' => env('DISABLE_ROUTE_OBFUSCATION', false),
    ],
];
