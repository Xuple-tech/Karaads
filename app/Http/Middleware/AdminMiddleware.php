<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::check()) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Unauthorized. Admin access required.'], 403);
            }

            return redirect()->route('login');
        }

        $user = Auth::user();
        $role = $user->role;
        $hiddenRole = null;

        if (!in_array($role, ['admin', 'super_admin'], true) && method_exists($user, 'roles')) {
            try {
                $user->loadMissing('roles');
                $hiddenRole = $user->roles?->role;
            } catch (\Throwable) {
                $hiddenRole = null;
            }
        }

        $isAdmin = in_array($role, ['admin', 'super_admin'], true)
            || in_array($hiddenRole, ['admin', 'super_admin'], true);

        if (!$isAdmin) {
            if ($request->expectsJson()) {
                return response()->json(['error' => 'Unauthorized. Admin access required.'], 403);
            }

            return redirect()->route('home')->with('error', 'You do not have permission to access this area.');
        }

        return $next($request);
    }
}
