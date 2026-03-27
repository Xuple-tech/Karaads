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
        Auth::shouldUse('web');

        $request->setUserResolver(static fn (?string $guard = null) => Auth::guard($guard ?: 'web')->user());

        return $next($request);
    }
}
