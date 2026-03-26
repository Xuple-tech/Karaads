<?php

namespace App\Services;

use App\Models\SecurityAuditLog;
use App\Models\User;
use App\Models\Conversation;
use App\Models\Chat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SecurityAuditService
{
    /**
     * Log access attempt
     */
    public function logAccess(Request $request, string $resource, array $metadata = []): void
    {
        $this->createAuditLog('access', $resource, $request, $metadata);
    }

    /**
     * Log unauthorized access attempt
     */
    public function logUnauthorizedAccess(Request $request, string $resource, string $resourceId = null): void
    {
        $this->createAuditLog('unauthorized_access', $resource, $request, [
            'resource_id' => $resourceId,
            'severity' => 'high'
        ]);

        Log::warning('Unauthorized access attempt', [
            'resource' => $resource,
            'resource_id' => $resourceId,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => Auth::id(),
        ]);
    }

    /**
     * Log conversation creation
     */
    public function logConversationCreated(Conversation $conversation, Request $request): void
    {
        $this->createAuditLog('conversation_created', 'conversation', $request, [
            'conversation_id' => $conversation->id,
            'title' => $conversation->title,
            'canvas_mode' => $conversation->canvas_mode,
        ]);
    }

    /**
     * Log conversation access
     */
    public function logConversationAccess(Conversation $conversation, Request $request): void
    {
        $this->createAuditLog('conversation_accessed', 'conversation', $request, [
            'conversation_id' => $conversation->id,
            'title' => $conversation->title,
        ]);
    }

    /**
     * Log conversations list access
     */
    public function logConversationsList(Request $request): void
    {
        $this->createAuditLog('conversations_listed', 'conversations', $request);
    }

    /**
     * Log message sent
     */
    public function logMessageSent(Chat $chat, Request $request): void
    {
        $this->createAuditLog('message_sent', 'chat', $request, [
            'chat_id' => $chat->id,
            'conversation_id' => $chat->conversation_id,
            'message_length' => strlen($chat->message),
            'has_files' => !empty($chat->files),
        ]);
    }

    /**
     * Log unsafe content detection
     */
    public function logUnsafeContent(Request $request, string $content): void
    {
        $this->createAuditLog('unsafe_content', 'content_filter', $request, [
            'content_length' => strlen($content),
            'content_hash' => hash('sha256', $content),
            'severity' => 'high'
        ]);

        Log::warning('Unsafe content detected', [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => Auth::id(),
            'content_hash' => hash('sha256', $content),
        ]);
    }

    /**
     * Log validation failure
     */
    public function logValidationFailure(Request $request, array $errors): void
    {
        $this->createAuditLog('validation_failure', 'validation', $request, [
            'errors' => $errors,
            'severity' => 'medium'
        ]);
    }

    /**
     * Log integrity violation
     */
    public function logIntegrityViolation(Request $request, string $resource, string $resourceId): void
    {
        $this->createAuditLog('integrity_violation', $resource, $request, [
            'resource_id' => $resourceId,
            'severity' => 'critical'
        ]);

        Log::critical('Data integrity violation detected', [
            'resource' => $resource,
            'resource_id' => $resourceId,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => Auth::id(),
        ]);
    }

    /**
     * Log API error
     */
    public function logApiError(Request $request, \Exception $exception): void
    {
        $this->createAuditLog('api_error', 'api', $request, [
            'error_message' => $exception->getMessage(),
            'error_code' => $exception->getCode(),
            'severity' => 'high'
        ]);
    }

    /**
     * Log general error
     */
    public function logError(Request $request, string $errorType, \Exception $exception): void
    {
        $this->createAuditLog('error', $errorType, $request, [
            'error_message' => $exception->getMessage(),
            'error_code' => $exception->getCode(),
            'error_file' => $exception->getFile(),
            'error_line' => $exception->getLine(),
            'severity' => 'medium'
        ]);
    }

    /**
     * Log security violation
     */
    public function logSecurityViolation(Request $request, string $violationType, array $details = []): void
    {
        $this->createAuditLog('security_violation', $violationType, $request, array_merge($details, [
            'severity' => 'critical'
        ]));

        Log::critical('Security violation detected', [
            'violation_type' => $violationType,
            'details' => $details,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => Auth::id(),
        ]);
    }

    /**
     * Log rate limit exceeded
     */
    public function logRateLimitExceeded(Request $request, string $limitType, int $attempts): void
    {
        $this->createAuditLog('rate_limit_exceeded', $limitType, $request, [
            'attempts' => $attempts,
            'severity' => 'medium'
        ]);

        Log::warning('Rate limit exceeded', [
            'limit_type' => $limitType,
            'attempts' => $attempts,
            'ip' => $request->ip(),
            'user_id' => Auth::id(),
        ]);
    }

    /**
     * Log suspicious activity
     */
    public function logSuspiciousActivity(Request $request, string $activityType, array $indicators = []): void
    {
        $this->createAuditLog('suspicious_activity', $activityType, $request, [
            'indicators' => $indicators,
            'severity' => 'high'
        ]);

        Log::warning('Suspicious activity detected', [
            'activity_type' => $activityType,
            'indicators' => $indicators,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => Auth::id(),
        ]);
    }

    /**
     * Log authentication event
     */
    public function logAuthenticationEvent(Request $request, string $eventType, bool $success, array $metadata = []): void
    {
        $this->createAuditLog('authentication', $eventType, $request, array_merge($metadata, [
            'success' => $success,
            'severity' => $success ? 'low' : 'medium'
        ]));

        if (!$success) {
            Log::warning('Authentication failure', [
                'event_type' => $eventType,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'metadata' => $metadata,
            ]);
        }
    }

    /**
     * Log admin action
     */
    public function logAdminAction(Request $request, string $action, array $metadata = []): void
    {
        $this->createAuditLog('admin_action', $action, $request, array_merge($metadata, [
            'severity' => 'medium'
        ]));

        Log::info('Admin action performed', [
            'action' => $action,
            'admin_id' => Auth::id(),
            'ip' => $request->ip(),
            'metadata' => $metadata,
        ]);
    }

    /**
     * Log file upload
     */
    public function logFileUpload(Request $request, array $fileInfo): void
    {
        $this->createAuditLog('file_upload', 'file', $request, [
            'file_name' => $fileInfo['name'] ?? 'unknown',
            'file_size' => $fileInfo['size'] ?? 0,
            'file_type' => $fileInfo['type'] ?? 'unknown',
            'file_hash' => $fileInfo['hash'] ?? null,
        ]);
    }

    /**
     * Log data export
     */
    public function logDataExport(Request $request, string $exportType, array $metadata = []): void
    {
        $this->createAuditLog('data_export', $exportType, $request, array_merge($metadata, [
            'severity' => 'medium'
        ]));

        Log::info('Data export performed', [
            'export_type' => $exportType,
            'user_id' => Auth::id(),
            'ip' => $request->ip(),
            'metadata' => $metadata,
        ]);
    }

    /**
     * Get security audit logs with filtering
     */
    public function getAuditLogs(array $filters = [], int $limit = 100): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $query = SecurityAuditLog::query();

        // Apply filters
        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (!empty($filters['resource'])) {
            $query->where('resource', $filters['resource']);
        }

        if (!empty($filters['severity'])) {
            $query->where('severity', $filters['severity']);
        }

        if (!empty($filters['ip_address'])) {
            $query->where('ip_address', $filters['ip_address']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('created_at', '<=', $filters['date_to']);
        }

        return $query->orderBy('created_at', 'desc')
                    ->paginate($limit);
    }

    /**
     * Get security statistics
     */
    public function getSecurityStatistics(int $days = 30): array
    {
        $startDate = now()->subDays($days);

        return [
            'total_events' => SecurityAuditLog::where('created_at', '>=', $startDate)->count(),
            'security_violations' => SecurityAuditLog::where('created_at', '>=', $startDate)
                                                   ->where('action', 'security_violation')
                                                   ->count(),
            'unauthorized_access' => SecurityAuditLog::where('created_at', '>=', $startDate)
                                                    ->where('action', 'unauthorized_access')
                                                    ->count(),
            'suspicious_activity' => SecurityAuditLog::where('created_at', '>=', $startDate)
                                                    ->where('action', 'suspicious_activity')
                                                    ->count(),
            'rate_limit_exceeded' => SecurityAuditLog::where('created_at', '>=', $startDate)
                                                    ->where('action', 'rate_limit_exceeded')
                                                    ->count(),
            'top_ips' => SecurityAuditLog::where('created_at', '>=', $startDate)
                                        ->selectRaw('ip_address, COUNT(*) as count')
                                        ->groupBy('ip_address')
                                        ->orderBy('count', 'desc')
                                        ->limit(10)
                                        ->get(),
            'events_by_day' => SecurityAuditLog::where('created_at', '>=', $startDate)
                                              ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                                              ->groupBy('date')
                                              ->orderBy('date')
                                              ->get(),
        ];
    }

    /**
     * Clean old audit logs
     */
    public function cleanOldLogs(int $daysToKeep = 90): int
    {
        $cutoffDate = now()->subDays($daysToKeep);

        $deletedCount = SecurityAuditLog::where('created_at', '<', $cutoffDate)->delete();

        Log::info('Cleaned old security audit logs', [
            'deleted_count' => $deletedCount,
            'cutoff_date' => $cutoffDate->toDateString(),
        ]);

        return $deletedCount;
    }

    /**
     * Create audit log entry
     */
    private function createAuditLog(string $action, string $resource, Request $request, array $metadata = []): void
    {
        try {
            SecurityAuditLog::create([
                'id' => Str::uuid(),
                'user_id' => Auth::id(),
                'action' => $action,
                'resource' => $resource,
                'ip_address' => $this->getClientIP($request),
                'user_agent' => $request->userAgent(),
                'request_method' => $request->method(),
                'request_url' => $request->fullUrl(),
                'route_name' => $request->route()?->getName(),
                'metadata' => $metadata,
                'severity' => $metadata['severity'] ?? 'low',
                'created_at' => now(),
            ]);
        } catch (\Exception $e) {
            // Don't let audit logging failures break the application
            Log::error('Failed to create security audit log', [
                'action' => $action,
                'resource' => $resource,
                'error' => $e->getMessage(),
            ]);
        }
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
}
