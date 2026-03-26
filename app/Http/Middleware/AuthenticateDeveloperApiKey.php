<?php

namespace App\Http\Middleware;

use App\Services\DeveloperApiTokenService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateDeveloperApiKey
{
    public function __construct(private readonly DeveloperApiTokenService $tokenService)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        $apiKey = $this->tokenService->findActiveKeyFromBearer($token);

        if (!$apiKey) {
            return response()->json([
                'error' => [
                    'message' => 'Invalid API key.',
                    'type' => 'authentication_error',
                    'code' => 'invalid_api_key',
                ],
            ], 401);
        }

        $apiKey->forceFill(['last_used_at' => now()])->save();
        $request->attributes->set('developer_api_key', $apiKey);

        return $next($request);
    }
}
