<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class SaasOwnerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Ensures only SaaS owners can access protected routes.
     * Logs all access attempts for security auditing.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            return redirect()->route('login')->with('error', 'Please login to access SaaS Owner features.');
        }

        $user = Auth::user();

        // Verify SaaS Owner role
        if (!$user->isSaasOwner()) {
            Log::warning("Unauthorized SaaS Owner access attempt", [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_role' => $user->role,
                'requested_path' => $request->path(),
                'ip_address' => $request->ip(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access. SaaS Owner privileges required.',
                'code' => 'UNAUTHORIZED_SAAS_OWNER'
            ], 403);
        }

        // Log successful access
        Log::info("SaaS Owner access granted", [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'requested_path' => $request->path(),
            'method' => $request->method(),
        ]);

        return $next($request);
    }
}
