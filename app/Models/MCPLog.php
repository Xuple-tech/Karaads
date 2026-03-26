<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MCPLog extends Model
{
    use HasFactory;

    protected $table = 'mcp_logs';

    protected $fillable = [
        'session_id',
        'mcp_server_id',
        'method',
        'tool_name',
        'request_data',
        'response_data',
        'response_time_ms',
        'status',
        'error_message',
    ];

    protected $casts = [
        'request_data' => 'array',
        'response_data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the session
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(MCPSession::class, 'session_id');
    }

    /**
     * Get the MCP server
     */
    public function mcpServer(): BelongsTo
    {
        return $this->belongsTo(MCPServerConfig::class, 'mcp_server_id');
    }

    /**
     * Get log summary
     */
    public function getSummary(): array
    {
        return [
            'method' => $this->method,
            'tool' => $this->tool_name,
            'status' => $this->status,
            'response_time_ms' => $this->response_time_ms,
            'timestamp' => $this->created_at->toIso8601String(),
            'error' => $this->error_message,
        ];
    }

    /**
     * Get success rate for a method
     */
    public static function getSuccessRate(string $method, int $hours = 24): float
    {
        $since = now()->subHours($hours);
        $total = static::where('method', $method)
            ->where('created_at', '>=', $since)
            ->count();

        if ($total === 0) {
            return 100;
        }

        $successful = static::where('method', $method)
            ->where('status', 'success')
            ->where('created_at', '>=', $since)
            ->count();

        return ($successful / $total) * 100;
    }

    /**
     * Get average response time
     */
    public static function getAverageResponseTime(string $method, int $hours = 24): int
    {
        $since = now()->subHours($hours);
        $avg = static::where('method', $method)
            ->where('created_at', '>=', $since)
            ->avg('response_time_ms');

        return (int)($avg ?? 0);
    }
}
