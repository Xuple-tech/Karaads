<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminOrStaffMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::guard('internal')->check()) {
            return redirect()->route('admin.login');
        }

        /** @var \App\Models\InternalUser $user */
        $user = Auth::guard('internal')->user();

        if (! $user->is_active) {
            Auth::guard('internal')->logout();
            return redirect()->route('admin.login');
        }

        return $next($request);
    }
}
