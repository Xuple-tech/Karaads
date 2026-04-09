<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::guard('internal')->check()) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Unauthorized. Admin access required.'], 403);
            }

            return redirect()->route('admin.login');
        }

        /** @var \App\Models\InternalUser $user */
        $user = Auth::guard('internal')->user();

        if (! $user->is_active) {
            Auth::guard('internal')->logout();

            return redirect()->route('admin.login')
                ->withErrors(['email' => 'This account has been deactivated.']);
        }

        return $next($request);
    }
}

