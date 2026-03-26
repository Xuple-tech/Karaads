<?php

namespace App\Http\Middleware;

use App\Models\ApiUsageLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Torann\GeoIP\Facades\GeoIP;

/**
 * LogApiUsageMiddleware
 *
 * Logs all API requests for analytics and monitoring
 */
class LogApiUsageMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);

        $response = $next($request);

        $duration = (microtime(true) - $startTime) * 1000; // Convert to milliseconds

        // Only log API requests
        if ($request->is('api/*') && Auth::check()) {
            try {
                $ipAddress = $request->ip();
                $country = null;

                // Try to get country from IP
                try {
                    $location = GeoIP::getLocation($ipAddress);
                    $country = $location['country'] ?? null;
                } catch (\Exception $e) {
                    // GeoIP might fail if database not available
                    \Illuminate\Support\Facades\Log::debug('GeoIP lookup failed: ' . $e->getMessage());
                }

                ApiUsageLog::create([
                    'user_id' => Auth::id(),
                    'api_provider' => 'internal',
                    'model' => $request->input('model', 'default'),
                    'endpoint' => $request->path(),
                    'response_time_ms' => $duration,
                    'status' => $response->getStatusCode() >= 400 ? 'error' : 'success',
                    'error_message' => $response->getStatusCode() >= 400 ? $response->getContent() : null,
                    'ip_address' => $ipAddress,
                    'country' => $country,
                    'metadata' => [
                        'method' => $request->method(),
                        'status_code' => $response->getStatusCode(),
                        'user_agent' => $request->userAgent(),
                    ],
                ]);
            } catch (\Exception $e) {
                // Fail silently to not disrupt API calls
                \Illuminate\Support\Facades\Log::error('Failed to log API usage: ' . $e->getMessage());
            }
        }

        return $response;
    }
}
