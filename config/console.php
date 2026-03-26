<?php

use Illuminate\Support\Str;

$appHost = parse_url(env('APP_URL', 'http://localhost'), PHP_URL_HOST);
$isLocalConsole = in_array(env('APP_ENV', 'production'), ['local', 'testing'], true);

return [
    'domain' => env(
        'CONSOLE_DOMAIN',
        $isLocalConsole || ! $appHost ? null : 'console.' . $appHost
    ),

    'path_prefix' => trim(env('CONSOLE_PATH_PREFIX', 'console'), '/'),

    'session_cookie' => env(
        'CONSOLE_SESSION_COOKIE',
        Str::slug(env('APP_NAME', 'kwati'), '_') . '_console_session'
    ),

    'session_domain' => env('CONSOLE_SESSION_DOMAIN'),

    'session_path' => env(
        'CONSOLE_SESSION_PATH',
        $isLocalConsole ? '/console' : '/'
    ),
];
