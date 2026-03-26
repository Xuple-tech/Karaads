<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class SecurityAuditLog extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'action',
        'resource',
        'ip_address',
        'user_agent',
        'request_method',
        'request_url',
        'route_name',
        'metadata',
        'severity',
        'created_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = Str::uuid();
            }
        });
    }

    /**
     * Get the user that performed the action
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for filtering by severity
     */
    public function scopeBySeverity($query, string $severity)
    {
        return $query->where('severity', $severity);
    }

    /**
     * Scope for filtering by action
     */
    public function scopeByAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope for filtering by resource
     */
    public function scopeByResource($query, string $resource)
    {
        return $query->where('resource', $resource);
    }

    /**
     * Scope for filtering by IP address
     */
    public function scopeByIpAddress($query, string $ipAddress)
    {
        return $query->where('ip_address', $ipAddress);
    }

    /**
     * Scope for filtering by date range
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope for high severity events
     */
    public function scopeHighSeverity($query)
    {
        return $query->whereIn('severity', ['high', 'critical']);
    }

    /**
     * Scope for security violations
     */
    public function scopeSecurityViolations($query)
    {
        return $query->whereIn('action', [
            'security_violation',
            'unauthorized_access',
            'integrity_violation',
            'suspicious_activity'
        ]);
    }

    /**
     * Get formatted severity with color
     */
    public function getSeverityColorAttribute(): string
    {
        return match ($this->severity) {
            'critical' => 'red',
            'high' => 'orange',
            'medium' => 'yellow',
            'low' => 'green',
            default => 'gray'
        };
    }

    /**
     * Get human-readable action description
     */
    public function getActionDescriptionAttribute(): string
    {
        return match ($this->action) {
            'access' => 'Resource Access',
            'unauthorized_access' => 'Unauthorized Access Attempt',
            'conversation_created' => 'Conversation Created',
            'conversation_accessed' => 'Conversation Accessed',
            'conversations_listed' => 'Conversations Listed',
            'message_sent' => 'Message Sent',
            'unsafe_content' => 'Unsafe Content Detected',
            'validation_failure' => 'Validation Failure',
            'integrity_violation' => 'Data Integrity Violation',
            'api_error' => 'API Error',
            'error' => 'System Error',
            'security_violation' => 'Security Violation',
            'rate_limit_exceeded' => 'Rate Limit Exceeded',
            'suspicious_activity' => 'Suspicious Activity',
            'authentication' => 'Authentication Event',
            'admin_action' => 'Admin Action',
            'file_upload' => 'File Upload',
            'data_export' => 'Data Export',
            default => ucwords(str_replace('_', ' ', $this->action))
        };
    }

    /**
     * Check if this is a security-related event
     */
    public function isSecurityEvent(): bool
    {
        return in_array($this->action, [
            'security_violation',
            'unauthorized_access',
            'integrity_violation',
            'suspicious_activity',
            'unsafe_content'
        ]);
    }

    /**
     * Check if this is a critical event
     */
    public function isCritical(): bool
    {
        return $this->severity === 'critical';
    }

    /**
     * Get the user's display name or IP if no user
     */
    public function getActorAttribute(): string
    {
        if ($this->user) {
            return $this->user->name ?? $this->user->email ?? 'User #' . $this->user->id;
        }

        return 'Anonymous (' . $this->ip_address . ')';
    }
}
