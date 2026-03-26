<?php

namespace App\Http\Middleware;

use App\Services\RequestTrackingService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class TrackRequest
{
    public function __construct(private RequestTrackingService $trackingService)
    {
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if IP is blocked
        $ip = $this->getClientIP($request);
        if ($this->trackingService->isIPBlocked($ip)) {
            Log::warning("Blocked request from IP: {$ip}");
            return response()->json(['error' => 'Access denied'], 403);
        }

        $startTime = microtime(true);

        // Get response
        $response = $next($request);

        $endTime = microtime(true);
        $responseTimeMs = (int)(($endTime - $startTime) * 1000);

        // Extract request data (exclude files)
        $requestData = [];
        if ($request->method() !== 'GET') {
            $requestData = $request->except(['password', 'token', 'card', 'secret']);
        }

        // Log the request
        try {
            $this->trackingService->logRequest(
                userId: auth()->id(),
                ipAddress: $ip,
                method: $request->method(),
                path: $request->path(),
                uri: $request->getRequestUri(),
                userAgent: $request->userAgent(),
                referer: $request->referrer(),
                responseStatus: $response->getStatusCode(),
                responseTimeMs: $responseTimeMs,
                requestData: $requestData
            );
        } catch (\Exception $e) {
            Log::error('Failed to track request: ' . $e->getMessage());
        }

        return $response;
    }

    /**
     * Get client IP address (handles proxies)
     */
    private function getClientIP(Request $request): string
    {
        // Check for IP from shared internet
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        }
        // Check for IP passed from proxy
        elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
        }
        // Check for remote address
        else {
            $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        }

        return trim($ip);
    }
}
