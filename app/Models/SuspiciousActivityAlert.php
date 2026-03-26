<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SuspiciousActivityAlert extends Model
{
    use SoftDeletes;

    protected $table = 'suspicious_activity_alerts';

    protected $fillable = [
        'ip_address',
        'user_id',
        'alert_type',
        'severity',
        'description',
        'auto_action_taken',
        'action_taken',
        'resolved_at',
    ];

    protected $casts = [
        'auto_action_taken' => 'boolean',
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Scope to get unresolved alerts
     */
    public function scopeUnresolved($query)
    {
        return $query->whereNull('resolved_at');
    }

    /**
     * Scope to filter by severity
     */
    public function scopeBySeverity($query, string $severity)
    {
        return $query->where('severity', $severity);
    }

    /**
     * Scope to filter by alert type
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('alert_type', $type);
    }

    /**
     * Scope to get recent alerts
     */
    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    /**
     * Get high severity alerts
     */
    public function scopeHighSeverity($query)
    {
        return $query->where('severity', 'high');
    }

    /**
     * Mark as resolved
     */
    public function markResolved(): void
    {
        $this->update(['resolved_at' => now()]);
    }
}
