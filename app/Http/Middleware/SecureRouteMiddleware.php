<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class SecureRouteMiddleware
{
    /**
     * Handle an incoming request with enhanced security measures.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get client information
        $ip = $this->getClientIP($request);
        $userAgent = $request->userAgent();
        $route = $request->route()->getName();

        // Enhanced security checks
        if (!$this->passesSecurityChecks($request, $ip, $userAgent, $route)) {
            return $this->securityResponse();
        }

        // UUID validation for route parameters
        if (!$this->validateUuidParameters($request)) {
            return response()->json(['error' => 'Invalid request parameters'], 400);
        }

        // Enhanced rate limiting based on route sensitivity
        if (!$this->passesEnhancedRateLimit($request, $ip, $route)) {
            return response()->json(['error' => 'Rate limit exceeded'], 429);
        }

        // Log security events
        $this->logSecurityEvent($request, $ip, $userAgent, $route);

        return $next($request);
    }

    /**
     * Perform comprehensive security checks
     */
    private function passesSecurityChecks(Request $request, string $ip, ?string $userAgent, ?string $route): bool
    {
        // Check if IP is blacklisted
        if ($this->isBlacklistedIP($ip)) {
            Log::warning("Blacklisted IP attempted access: {$ip}");
            return false;
        }

        // Check for suspicious patterns
        if ($this->hasSuspiciousPatterns($request)) {
            Log::warning("Suspicious request patterns detected from IP: {$ip}");
            return false;
        }

        // Check for automated tools
        if ($this->isAutomatedTool($userAgent)) {
            Log::warning("Automated tool detected: {$ip} - {$userAgent}");
            return false;
        }

        // Check for SQL injection attempts
        if ($this->hasSqlInjectionAttempt($request)) {
            Log::warning("SQL injection attempt detected from IP: {$ip}");
            return false;
        }

        // Check for XSS attempts
        if ($this->hasXssAttempt($request)) {
            Log::warning("XSS attempt detected from IP: {$ip}");
            return false;
        }

        return true;
    }

    /**
     * Validate UUID parameters in routes
     */
    private function validateUuidParameters(Request $request): bool
    {
        $route = $request->route();
        if (!$route) {
            return true;
        }

        $parameters = $route->parameters();
        $uuidPattern = '/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i';

        foreach ($parameters as $key => $value) {
            // Check if parameter name suggests it should be a UUID
            if (str_contains($key, 'Uuid') || str_contains($key, 'uuid') ||
                in_array($key, ['id', 'conversation', 'project', 'agent', 'user'])) {
                if (!preg_match($uuidPattern, $value)) {
                    Log::warning("Invalid UUID parameter detected: {$key} = {$value}");
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Enhanced rate limiting based on route sensitivity
     */
    private function passesEnhancedRateLimit(Request $request, string $ip, ?string $route): bool
    {
        // Define rate limits for different route types
        $rateLimits = [
            'auth' => ['attempts' => 5, 'decay' => 300], // 5 attempts per 5 minutes
            'admin' => ['attempts' => 20, 'decay' => 60], // 20 attempts per minute
            'api' => ['attempts' => 60, 'decay' => 60], // 60 attempts per minute
            'chat' => ['attempts' => 30, 'decay' => 60], // 30 attempts per minute
            'default' => ['attempts' => 100, 'decay' => 60] // 100 attempts per minute
        ];

        // Determine route type
        $routeType = 'default';
        if ($route) {
            if (str_contains($route, 'auth')) {
                $routeType = 'auth';
            } elseif (str_contains($route, 'admin')) {
                $routeType = 'admin';
            } elseif (str_contains($route, 'api')) {
                $routeType = 'api';
            } elseif (str_contains($route, 'chat')) {
                $routeType = 'chat';
            }
        }

        $limit = $rateLimits[$routeType];
        $key = "secure_rate_limit:{$routeType}:{$ip}";

        return RateLimiter::attempt($key, $limit['attempts'], function() {}, $limit['decay']);
    }

    /**
     * Check if IP is blacklisted
     */
    private function isBlacklistedIP(string $ip): bool
    {
        return Cache::has("blacklisted_ip:{$ip}");
    }

    /**
     * Check for suspicious request patterns
     */
    private function hasSuspiciousPatterns(Request $request): bool
    {
        $suspiciousPatterns = [
            '/\.\.\//i', // Directory traversal
            '/\/etc\/passwd/i', // System file access
            '/\/proc\//i', // Process information
            '/\/dev\//i', // Device access
            '/cmd\.exe/i', // Windows command execution
            '/powershell/i', // PowerShell execution
            '/bash/i', // Bash execution
            '/wget/i', // File download
            '/curl/i', // HTTP requests
        ];

        $fullUrl = $request->fullUrl();
        $content = $request->getContent();

        foreach ($suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $fullUrl) || preg_match($pattern, $content)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user agent indicates automated tool
     */
    private function isAutomatedTool(?string $userAgent): bool
    {
        if (!$userAgent) {
            return true;
        }

        $automatedTools = [
            'python-requests',
            'python-urllib',
            'java/',
            'go-http-client',
            'okhttp',
            'apache-httpclient',
            'postman',
            'insomnia',
            'httpie',
            'rest-client',
            'api-client',
            'test-client',
            'automation',
            'selenium',
            'phantomjs',
            'headless',
        ];

        $userAgentLower = strtolower($userAgent);

        foreach ($automatedTools as $tool) {
            if (str_contains($userAgentLower, $tool)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check for SQL injection attempts
     */
    private function hasSqlInjectionAttempt(Request $request): bool
    {
        $sqlPatterns = [
            '/union\s+select/i',
            '/select\s+.*\s+from/i',
            '/insert\s+into/i',
            '/update\s+.*\s+set/i',
            '/delete\s+from/i',
            '/drop\s+table/i',
            '/create\s+table/i',
            '/alter\s+table/i',
            '/exec\s*\(/i',
            '/execute\s*\(/i',
            '/sp_/i',
            '/xp_/i',
            '/0x[0-9a-f]+/i',
            '/\'\s*or\s*\'/i',
            '/\'\s*and\s*\'/i',
            '/\'\s*;\s*/i',
        ];

        $allInput = json_encode($request->all()) . $request->getContent() . $request->fullUrl();

        foreach ($sqlPatterns as $pattern) {
            if (preg_match($pattern, $allInput)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check for XSS attempts
     */
    private function hasXssAttempt(Request $request): bool
    {
        $xssPatterns = [
            '/<script/i',
            '/<\/script>/i',
            '/javascript:/i',
            '/vbscript:/i',
            '/onload\s*=/i',
            '/onerror\s*=/i',
            '/onclick\s*=/i',
            '/onmouseover\s*=/i',
            '/onfocus\s*=/i',
            '/onblur\s*=/i',
            '/eval\s*\(/i',
            '/expression\s*\(/i',
            '/document\.cookie/i',
            '/document\.write/i',
            '/window\.location/i',
        ];

        $allInput = json_encode($request->all()) . $request->getContent();

        foreach ($xssPatterns as $pattern) {
            if (preg_match($pattern, $allInput)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Log security events
     */
    private function logSecurityEvent(Request $request, string $ip, ?string $userAgent, ?string $route): void
    {
        Log::info('Secure route access', [
            'ip' => $ip,
            'user_agent' => $userAgent,
            'route' => $route,
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Get client IP address
     */
    private function getClientIP(Request $request): string
    {
        $headers = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_CLIENT_IP',            // Proxy
            'HTTP_X_FORWARDED_FOR',      // Load balancer/proxy
            'HTTP_X_FORWARDED',          // Proxy
            'HTTP_X_CLUSTER_CLIENT_IP',  // Cluster
            'HTTP_FORWARDED_FOR',        // Proxy
            'HTTP_FORWARDED',            // Proxy
            'REMOTE_ADDR'                // Standard
        ];

        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ip = $_SERVER[$header];
                // Handle comma-separated IPs (take the first one)
                if (str_contains($ip, ',')) {
                    $ip = explode(',', $ip)[0];
                }
                $ip = trim($ip);
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }

        return $request->ip() ?? '0.0.0.0';
    }

    /**
     * Return security response
     */
    private function securityResponse(): Response
    {
        return response()->json([
            'error' => 'Access denied',
            'message' => 'Security validation failed'
        ], 403);
    }
}
