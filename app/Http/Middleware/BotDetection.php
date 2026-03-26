<?php

namespace App\Http\Middleware;

use App\Services\RequestTrackingService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class BotDetection
{
    public function __construct(private RequestTrackingService $trackingService)
    {
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $ip = $this->getClientIP($request);
        $userAgent = $request->userAgent();

        // Check obvious bot patterns
        if ($this->isCrawler($userAgent)) {
            Log::info("Crawler detected: {$ip} - {$userAgent}");

            // Return 403 for crawlers to prevent indexing
            return response()->json(
                ['error' => 'Bot access not allowed'],
                403,
                ['X-Robots-Tag' => 'noindex, nofollow']
            );
        }

        // Check rate limiting
        $requestsLastMinute = \App\Models\RequestLog::where('ip_address', $ip)
            ->where('created_at', '>', now()->subMinute())
            ->count();
        
        if ($requestsLastMinute > 100) {
            Log::warning("Rate limit exceeded for IP: {$ip}");
            return response()->json(['error' => 'Too many requests'], 429);
        }

        return $next($request);
    }

    /**
     * Check if user agent is a known crawler
     */
    private function isCrawler(?string $userAgent): bool
    {
        if (!$userAgent) {
            return true; // No user agent is suspicious
        }

        $crawlers = [
            'bot',
            'crawler',
            'spider',
            'scraper',
            'wget',
            'curl',
            'php',
            'python',
            'java',
            'google',
            'bing',
            'yahoo',
            'baidu',
            'yandex',
            'facebook',
            'twitter',
            'linkedin',
            'pinterest',
            'instagram',
            'mascan',
            'nmap',
            'metasploit',
            'sqlmap',
        ];

        $userAgentLower = strtolower($userAgent);

        foreach ($crawlers as $crawler) {
            if (strpos($userAgentLower, $crawler) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get client IP address
     */
    private function getClientIP(Request $request): string
    {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        }

        return trim($ip);
    }
}
