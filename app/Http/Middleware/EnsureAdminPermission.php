<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminPermission
{
    public function handle(Request $request, Closure $next, string $type, string ...$values): Response
    {
        $admin = auth('admin')->user();

        if (! $admin) {
            abort(403, 'Admin authentication required.');
        }

        if (! $admin->is_active) {
            abort(403, 'Your admin account is deactivated.');
        }

        if ($admin->isSuperAdmin()) {
            return $next($request);
        }

        if ($type === 'role') {
            if (in_array($admin->role, $values, true)) {
                return $next($request);
            }

            abort(403, 'Insufficient role for this operation.');
        }

        if ($type === 'permission') {
            if ($admin->isAdmin() || $admin->hasAnyPermission($values)) {
                return $next($request);
            }

            abort(403, 'Missing required permission.');
        }

        abort(403, 'Invalid authorization policy.');
    }
}
