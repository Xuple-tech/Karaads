<?php

namespace App\Services;

use App\Models\IpReputation;
use App\Models\PromptLog;
use App\Models\RequestLog;
use App\Models\SuspiciousActivityAlert;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class RequestTrackingService
{
    private const BOT_PATTERNS = [
        // Common bot user agents
        '/bot|crawler|spider|scraper|wget|curl/i',
        '/googlebot|bingbot|slurp|duckduckgo|baiduspider|yandexbot/i',
        '/facebook|twitter|pinterest|linkedin/i',
        '/masscan|nmap|metasploit|sqlmap/i',
    ];

    private const RATE_LIMITS = [
        'requests_per_minute' => 60,
        'requests_per_hour' => 1000,
        'prompts_per_minute' => 5,
        'prompts_per_hour' => 100,
        'failed_attempts_threshold' => 5,
    ];

    /**
     * Log request with IP and user agent tracking
     */
    public function logRequest(
        ?int $userId,
        string $ipAddress,
        string $method,
        string $path,
        string $uri,
        ?string $userAgent = null,
        ?string $referer = null,
        ?int $responseStatus = null,
        ?int $responseTimeMs = null,
        ?array $requestData = null
    ): RequestLog {
        // Detect bot and check IP reputation
        $botAnalysis = $this->analyzeBotLikelihood($ipAddress, $userAgent);

        // Detect currency
        $currency = app(CurrencyService::class)->detectCurrencyFromIP($ipAddress);

        // Sanitize request data
        $sanitizedData = $this->sanitizeRequestData($requestData);

        $log = RequestLog::create([
            'user_id' => $userId,
            'ip_address' => $ipAddress,
            'request_method' => $method,
            'request_path' => $path,
            'request_uri' => $uri,
            'user_agent' => $userAgent,
            'referer' => $referer,
            'response_status' => $responseStatus,
            'response_time_ms' => $responseTimeMs,
            'request_data' => $sanitizedData ? json_encode($sanitizedData) : null,
            'detected_currency' => $currency,
            'is_suspected_bot' => $botAnalysis['is_bot'],
            'bot_reason' => $botAnalysis['reason'],
            'bot_score' => $botAnalysis['score'],
        ]);

        // Check for suspicious activity
        if ($botAnalysis['is_bot'] || $botAnalysis['score'] > 50) {
            $this->checkSuspiciousActivity($ipAddress, $userId, $botAnalysis);
        }

        return $log;
    }

    /**
     * Log prompt for analytics and abuse prevention
     */
    public function logPrompt(
        ?int $userId,
        string $ipAddress,
        string $prompt,
        ?int $conversationId = null,
        ?string $model = null,
        ?float $estimatedCost = null,
        ?int $tokensUsed = null
    ): PromptLog {
        // Detect abuse patterns
        $abuseAnalysis = $this->analyzePromptForAbuse($prompt, $ipAddress, $userId);

        // Calculate prompt hash for duplicate detection
        $promptHash = hash('sha256', strtolower(trim($prompt)));

        // Check for similar prompts in the last hour
        $similarCount = PromptLog::where('prompt_hash', $promptHash)
            ->where('timestamp', '>', now()->subHour())
            ->count();

        $currency = app(CurrencyService::class)->detectCurrencyFromIP($ipAddress);

        $log = PromptLog::create([
            'user_id' => $userId,
            'conversation_id' => $conversationId,
            'ip_address' => $ipAddress,
            'prompt' => substr($prompt, 0, 1000),
            'prompt_length' => $this->categorizPromptLength(strlen($prompt)),
            'model_used' => $model,
            'estimated_cost' => $estimatedCost,
            'detected_currency' => $currency,
            'timestamp' => now(),
            'tokens_used' => $tokensUsed,
            'is_likely_abuse' => $abuseAnalysis['is_abuse'],
            'abuse_reason' => $abuseAnalysis['reason'],
            'prompt_hash' => $promptHash,
            'similar_prompts_in_hour' => $similarCount,
        ]);

        // Alert if abuse detected
        if ($abuseAnalysis['is_abuse']) {
            $this->createAlert('prompt_abuse', $ipAddress, $userId, 'high', $abuseAnalysis['reason']);
        }

        return $log;
    }

    /**
     * Analyze request for bot likelihood
     */
    private function analyzeBotLikelihood(string $ipAddress, ?string $userAgent = null): array
    {
        $score = 0;
        $reasons = [];

        // Check IP reputation
        $ipReputation = IpReputation::where('ip_address', $ipAddress)->first();
        if ($ipReputation) {
            $score += $ipReputation->bot_score;
            if ($ipReputation->is_blocked) {
                return [
                    'is_bot' => true,
                    'score' => 100,
                    'reason' => 'IP address is blocked: ' . $ipReputation->notes,
                ];
            }
        }

        // Check user agent patterns
        if ($userAgent) {
            foreach (self::BOT_PATTERNS as $pattern) {
                if (preg_match($pattern, $userAgent)) {
                    $score += 50;
                    $reasons[] = 'Detected bot pattern in user agent';
                    break;
                }
            }

            // Check for missing or suspicious user agents
            if (empty($userAgent) || strlen($userAgent) < 10) {
                $score += 20;
                $reasons[] = 'Missing or unusually short user agent';
            }
        } else {
            $score += 30;
            $reasons[] = 'No user agent provided';
        }

        // Rate limiting check
        $requestsLastMinute = RequestLog::where('ip_address', $ipAddress)
            ->where('created_at', '>', now()->subMinute())
            ->count();

        if ($requestsLastMinute > self::RATE_LIMITS['requests_per_minute']) {
            $score += 40;
            $reasons[] = 'Excessive requests per minute';
        }

        return [
            'is_bot' => $score > 50,
            'score' => min($score, 100),
            'reason' => implode('; ', $reasons) ?: null,
        ];
    }

    /**
     * Analyze prompt for abuse patterns
     */
    private function analyzePromptForAbuse(string $prompt, string $ipAddress, ?int $userId = null): array
    {
        $reasons = [];
        $isAbuse = false;

        // Check prompt length
        if (strlen($prompt) < 5) {
            $reasons[] = 'Prompt too short';
        }

        // Check for spam patterns
        if (preg_match('/(.)\1{10,}/', $prompt)) {
            $reasons[] = 'Repeated characters (spam pattern)';
            $isAbuse = true;
        }

        // Check for command injection patterns
        if (preg_match('/[`;$(){}[\]|&<>\'"].*[`;$(){}[\]|&<>\'"]/i', $prompt)) {
            $reasons[] = 'Possible injection attempt';
            $isAbuse = true;
        }

        // Check rate limiting
        $promptsLastMinute = PromptLog::where('ip_address', $ipAddress)
            ->where('timestamp', '>', now()->subMinute())
            ->count();

        if ($promptsLastMinute >= self::RATE_LIMITS['prompts_per_minute']) {
            $reasons[] = 'Exceeding prompts per minute limit';
            $isAbuse = true;
        }

        // Check for duplicate prompts (possible automation)
        $promptHash = hash('sha256', strtolower(trim($prompt)));
        $duplicateCount = PromptLog::where('prompt_hash', $promptHash)
            ->where('timestamp', '>', now()->subHour())
            ->count();

        if ($duplicateCount > 3) {
            $reasons[] = 'Duplicate prompt detected multiple times';
            $isAbuse = true;
        }

        // Check user history if logged in
        if ($userId) {
            $userAbusivePrompts = PromptLog::where('user_id', $userId)
                ->where('is_likely_abuse', true)
                ->where('timestamp', '>', now()->subDay())
                ->count();

            if ($userAbusivePrompts > 10) {
                $reasons[] = 'User has history of abusive prompts';
                $isAbuse = true;
            }
        }

        return [
            'is_abuse' => $isAbuse,
            'reason' => implode('; ', $reasons) ?: null,
        ];
    }

    /**
     * Check for suspicious activity patterns
     */
    private function checkSuspiciousActivity(string $ipAddress, ?int $userId, array $botAnalysis): void
    {
        $ipReputation = IpReputation::firstOrCreate(
            ['ip_address' => $ipAddress],
            ['request_count' => 0]
        );

        // Update reputation
        $ipReputation->increment('request_count');
        $ipReputation->update(['last_seen_at' => now()]);

        // Check multiple failed requests
        $failedRequests = RequestLog::where('ip_address', $ipAddress)
            ->where('response_status', '>=', 400)
            ->where('created_at', '>', now()->subHour())
            ->count();

        if ($failedRequests > self::RATE_LIMITS['failed_attempts_threshold']) {
            $ipReputation->increment('failed_attempts');
            $ipReputation->update(['bot_score' => min(100, $ipReputation->bot_score + 10)]);

            if ($ipReputation->failed_attempts > 10) {
                $this->blockIP($ipAddress, false, "Multiple failed requests: {$failedRequests}");
            } else {
                $this->createAlert('multiple_failed_requests', $ipAddress, $userId, 'medium', "Failed requests: {$failedRequests}");
            }
        }

        // Check rate limiting violations
        $requestsLastMinute = RequestLog::where('ip_address', $ipAddress)
            ->where('created_at', '>', now()->subMinute())
            ->count();

        if ($requestsLastMinute > self::RATE_LIMITS['requests_per_minute'] * 2) {
            $ipReputation->update([
                'reputation_status' => 'suspicious',
                'bot_score' => min(100, $ipReputation->bot_score + 15),
            ]);

            $this->createAlert('rate_limit_exceeded', $ipAddress, $userId, 'high', "Requests/min: {$requestsLastMinute}");
        }

        // Block if bot score too high
        if ($ipReputation->bot_score > 80) {
            $this->blockIP($ipAddress, false, 'High bot score');
        }
    }

    /**
     * Block an IP address
     */
    public function blockIP(string $ipAddress, bool $permanent = false, ?string $reason = null): void
    {
        $blocked = IpReputation::firstOrCreate(['ip_address' => $ipAddress]);
        $blocked->update([
            'is_blocked' => true,
            'is_permanent_block' => $permanent,
            'reputation_status' => 'blocked',
            'blocked_until' => $permanent ? null : now()->addHours(24),
            'notes' => $reason,
        ]);

        Log::warning("IP {$ipAddress} blocked: {$reason}", ['permanent' => $permanent]);
    }

    /**
     * Unblock an IP address
     */
    public function unblockIP(string $ipAddress): void
    {
        IpReputation::where('ip_address', $ipAddress)->update([
            'is_blocked' => false,
            'is_permanent_block' => false,
            'blocked_until' => null,
            'reputation_status' => 'clean',
        ]);

        Log::info("IP {$ipAddress} unblocked");
    }

    /**
     * Create suspicious activity alert
     */
    private function createAlert(
        string $type,
        string $ipAddress,
        ?int $userId,
        string $severity = 'medium',
        ?string $details = null
    ): SuspiciousActivityAlert {
        $recommendations = [
            'rate_limit_exceeded' => 'Implement exponential backoff; user may need CAPTCHA',
            'bot_detected' => 'Verify user identity; consider blocking or rate limiting IP',
            'multiple_failed_requests' => 'Check for brute force attempts; may need account lockout',
            'prompt_abuse' => 'Flag prompt for review; consider limiting user rate',
        ];

        return SuspiciousActivityAlert::create([
            'ip_address' => $ipAddress,
            'user_id' => $userId,
            'alert_type' => $type,
            'severity' => $severity,
            'details' => $details,
            'recommendation' => $recommendations[$type] ?? null,
        ]);
    }

    /**
     * Check if IP is blocked
     */
    public function isIPBlocked(string $ipAddress): bool
    {
        $reputation = IpReputation::where('ip_address', $ipAddress)
            ->where('is_blocked', true)
            ->first();

        if (!$reputation) {
            return false;
        }

        // Check if temporary block has expired
        if ($reputation->is_permanent_block === false && $reputation->blocked_until && $reputation->blocked_until < now()) {
            $this->unblockIP($ipAddress);
            return false;
        }

        return true;
    }

    /**
     * Sanitize request data for logging
     */
    private function sanitizeRequestData(?array $data): ?array
    {
        if (!$data) {
            return null;
        }

        $sensitive = ['password', 'token', 'secret', 'api_key', 'card', 'ccv', 'cvv'];

        foreach ($sensitive as $key) {
            unset($data[$key]);
        }

        return $data;
    }

    /**
     * Categorize prompt length
     */
    private function categorizPromptLength(int $length): string
    {
        if ($length < 100) {
            return 'short';
        } elseif ($length < 500) {
            return 'medium';
        } elseif ($length < 2000) {
            return 'long';
        } else {
            return 'huge';
        }
    }

    /**
     * Get IP reputation summary
     */
    public function getIPReputation(string $ipAddress): array
    {
        $reputation = IpReputation::where('ip_address', $ipAddress)->first();

        if (!$reputation) {
            return [
                'ip_address' => $ipAddress,
                'status' => 'unknown',
                'bot_score' => 0,
                'request_count' => 0,
                'is_blocked' => false,
            ];
        }

        return [
            'ip_address' => $ipAddress,
            'status' => $reputation->reputation_status,
            'bot_score' => $reputation->bot_score,
            'request_count' => $reputation->request_count,
            'failed_attempts' => $reputation->failed_attempts,
            'is_blocked' => $reputation->is_blocked,
            'last_seen_at' => $reputation->last_seen_at,
        ];
    }

    /**
     * Get recent suspicious alerts
     */
    public function getRecentAlerts(string $ipAddress, int $hours = 24): array
    {
        return SuspiciousActivityAlert::where('ip_address', $ipAddress)
            ->where('created_at', '>', now()->subHours($hours))
            ->orderByDesc('created_at')
            ->get()
            ->toArray();
    }
}
