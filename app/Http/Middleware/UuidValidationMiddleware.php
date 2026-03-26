<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class UuidValidationMiddleware
{
    /**
     * Handle an incoming request to validate UUID parameters.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$this->validateUuids($request)) {
            Log::warning('Invalid UUID parameters detected', [
                'ip' => $request->ip(),
                'route' => $request->route()?->getName(),
                'parameters' => $request->route()?->parameters(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'error' => 'Invalid request parameters',
                'message' => 'One or more parameters are not valid'
            ], 400);
        }

        return $next($request);
    }

    /**
     * Validate all UUID parameters in the request
     */
    private function validateUuids(Request $request): bool
    {
        $route = $request->route();
        if (!$route) {
            return true;
        }

        $parameters = $route->parameters();
        $uuidPattern = '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i';

        // Parameters that should be UUIDs
        $uuidParameters = [
            'uuid', 'userUuid', 'projectUuid', 'conversationUuid', 'chatUuid',
            'agentUuid', 'memoryUuid', 'scheduleUuid', 'chainUuid', 'triggerUuid',
            'actionUuid', 'logUuid', 'fileUuid', 'memberUuid', 'execUuid',
            'auditUuid', 'keyUuid', 'flagUuid', 'subscriptionUuid'
        ];

        foreach ($parameters as $key => $value) {
            // Check if this parameter should be a UUID
            if (in_array($key, $uuidParameters) || str_ends_with($key, 'Uuid')) {
                if (!preg_match($uuidPattern, $value)) {
                    return false;
                }
            }
        }

        return true;
    }
}
