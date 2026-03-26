<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetConsoleSessionConfig
{
    public function handle(Request $request, Closure $next): Response
    {
        config([
            'session.cookie' => config('console.session_cookie'),
            'session.domain' => config('console.session_domain'),
            'session.path' => config('console.session_path'),
        ]);

        return $next($request);
    }
}
