<?php

namespace App\Http\Middleware;

use App\Support\DeveloperPortalUrl;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateDeveloperPortal
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Unauthenticated.'], 401);
            }

            return redirect()->to(DeveloperPortalUrl::loginUrl($request));
        }

        return $next($request);
    }
}
