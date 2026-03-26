<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IpReputation extends Model
{
    use SoftDeletes;

    protected $table = 'ip_reputation';

    protected $fillable = [
        'ip_address',
        'reputation_score',
        'reputation_status',
        'failed_attempts',
        'last_failed_attempt',
        'blocked_until',
        'is_blocked',
        'is_permanent_block',
    ];

    protected $casts = [
        'reputation_score' => 'float',
        'failed_attempts' => 'integer',
        'last_failed_attempt' => 'datetime',
        'blocked_until' => 'datetime',
        'is_blocked' => 'boolean',
        'is_permanent_block' => 'boolean',
    ];

    /**
     * Scope to get blocked IPs
     */
    public function scopeBlocked($query)
    {
        return $query->where('is_blocked', true)
            ->where(function ($q) {
                $q->where('is_permanent_block', true)
                    ->orWhere('blocked_until', '>', now());
            });
    }

    /**
     * Scope to get suspicious IPs
     */
    public function scopeSuspicious($query)
    {
        return $query->where('reputation_score', '>=', 70);
    }

    /**
     * Scope to get high-risk IPs
     */
    public function scopeHighRisk($query)
    {
        return $query->where('reputation_score', '>=', 85);
    }

    /**
     * Check if IP is currently blocked
     */
    public function isCurrentlyBlocked(): bool
    {
        if (!$this->is_blocked) {
            return false;
        }

        if ($this->is_permanent_block) {
            return true;
        }

        return $this->blocked_until && $this->blocked_until->isFuture();
    }

    /**
     * Increment failed attempts
     */
    public function incrementFailedAttempts(): void
    {
        $this->update([
            'failed_attempts' => $this->failed_attempts + 1,
            'last_failed_attempt' => now(),
        ]);
    }

    /**
     * Reset failed attempts
     */
    public function resetFailedAttempts(): void
    {
        $this->update([
            'failed_attempts' => 0,
            'last_failed_attempt' => null,
        ]);
    }

    /**
     * Block IP temporarily
     */
    public function blockTemporarily($minutes = 60): void
    {
        $this->update([
            'is_blocked' => true,
            'is_permanent_block' => false,
            'blocked_until' => now()->addMinutes($minutes),
        ]);
    }

    /**
     * Block IP permanently
     */
    public function blockPermanently(): void
    {
        $this->update([
            'is_blocked' => true,
            'is_permanent_block' => true,
            'blocked_until' => null,
        ]);
    }

    /**
     * Unblock IP
     */
    public function unblock(): void
    {
        $this->update([
            'is_blocked' => false,
            'is_permanent_block' => false,
            'blocked_until' => null,
        ]);
    }
}
