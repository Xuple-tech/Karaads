<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class UseConsoleGuard
{
    public function handle(Request $request, Closure $next): Response
    {
        Auth::shouldUse('console');

        $request->setUserResolver(static fn (?string $guard = null) => Auth::guard($guard ?: 'console')->user());

        return $next($request);
    }
}
