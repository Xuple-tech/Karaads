<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MCPSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'mcp_server_id',
        'session_token',
        'capabilities_offered',
        'capabilities_requested',
        'request_count',
        'last_activity_at',
        'expires_at',
        'status',
    ];

    protected $casts = [
        'capabilities_offered' => 'array',
        'capabilities_requested' => 'array',
        'last_activity_at' => 'datetime',
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the MCP server
     */
    public function mcpServer(): BelongsTo
    {
        return $this->belongsTo(MCPServerConfig::class, 'mcp_server_id');
    }

    /**
     * Get session logs
     */
    public function logs(): HasMany
    {
        return $this->hasMany(MCPLog::class, 'session_id');
    }

    /**
     * Check if session is active
     */
    public function isActive(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }
        if ($this->expires_at && $this->expires_at < now()) {
            $this->update(['status' => 'expired']);
            return false;
        }
        return true;
    }

    /**
     * Record activity
     */
    public function recordActivity(): void
    {
        $this->increment('request_count');
        $this->update(['last_activity_at' => now()]);
    }

    /**
     * Refresh expiration
     */
    public function refreshExpiration(int $minutes = 60): void
    {
        $this->update([
            'expires_at' => now()->addMinutes($minutes),
            'status' => 'active',
        ]);
    }

    /**
     * Get session info
     */
    public function getInfo(): array
    {
        return [
            'token' => $this->session_token,
            'user_id' => $this->user_id,
            'server_id' => $this->mcp_server_id,
            'status' => $this->status,
            'request_count' => $this->request_count,
            'created_at' => $this->created_at->toIso8601String(),
            'last_activity_at' => $this->last_activity_at->toIso8601String(),
            'expires_at' => $this->expires_at?->toIso8601String(),
            'capabilities_offered' => $this->capabilities_offered,
        ];
    }
}
