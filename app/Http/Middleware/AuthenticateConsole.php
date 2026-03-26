<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateConsole
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::guard('console')->check()) {
            return redirect()->route('console.login');
        }

        Auth::shouldUse('console');
        $request->setUserResolver(static fn (?string $guard = null) => Auth::guard($guard ?: 'console')->user());

        return $next($request);
    }
}
