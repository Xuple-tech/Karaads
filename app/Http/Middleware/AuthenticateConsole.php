<?php

namespace App\Http\Middleware;

use App\Support\AuthRedirect;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateConsole
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::guard('web')->check()) {
            $target = AuthRedirect::sanitize($request->fullUrl()) ?? $request->getRequestUri();

            return redirect()->to(AuthRedirect::mainLoginUrl($target));
        }

        Auth::shouldUse('web');
        $request->setUserResolver(static fn (?string $guard = null) => Auth::guard($guard ?: 'web')->user());

        return $next($request);
    }
}
