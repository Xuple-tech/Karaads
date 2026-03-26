<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MCPResource extends Model
{
    use HasFactory;

    protected $fillable = [
        'mcp_server_id',
        'name',
        'uri',
        'mime_type',
        'metadata',
        'data',
        'readable',
        'writable',
    ];

    protected $casts = [
        'metadata' => 'array',
        'data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the MCP server
     */
    public function mcpServer(): BelongsTo
    {
        return $this->belongsTo(MCPServerConfig::class, 'mcp_server_id');
    }

    /**
     * Update resource data
     */
    public function updateData(array $data): bool
    {
        if (!$this->writable) {
            return false;
        }
        return $this->update(['data' => $data]);
    }

    /**
     * Get resource URI path
     */
    public function getResourcePath(): string
    {
        return "resource://{$this->uri}";
    }

    /**
     * Validate resource access
     */
    public function canAccess(string $action): bool
    {
        if ($action === 'read') {
            return $this->readable;
        }
        if ($action === 'write') {
            return $this->writable;
        }
        return false;
    }
}
