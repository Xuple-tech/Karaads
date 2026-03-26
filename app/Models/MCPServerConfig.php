<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MCPServerConfig extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'type',
        'protocol_version',
        'capabilities',
        'settings',
        'endpoint',
        'authentication',
        'enabled',
    ];

    protected $casts = [
        'capabilities' => 'array',
        'settings' => 'array',
        'authentication' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get all tools for this MCP server
     */
    public function tools(): HasMany
    {
        return $this->hasMany(MCPTool::class, 'mcp_server_id');
    }

    /**
     * Get all resources
     */
    public function resources(): HasMany
    {
        return $this->hasMany(MCPResource::class, 'mcp_server_id');
    }

    /**
     * Get all sessions
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(MCPSession::class, 'mcp_server_id');
    }

    /**
     * Get all logs
     */
    public function logs(): HasMany
    {
        return $this->hasMany(MCPLog::class, 'mcp_server_id');
    }

    /**
     * Get server capabilities
     */
    public function getCapabilities(): array
    {
        return $this->capabilities ?? [
            'tools' => [],
            'resources' => [],
            'prompts' => [],
            'sampling' => false,
        ];
    }

    /**
     * Check if tool is available
     */
    public function hasTool(string $toolName): bool
    {
        return $this->tools()->where('name', $toolName)->exists();
    }

    /**
     * Register a tool
     */
    public function registerTool(Tool $tool, string $mcpId, array $inputSchema, array $outputSchema): MCPTool
    {
        return $this->tools()->create([
            'tool_id' => $tool->id,
            'name' => $tool->name,
            'mcp_id' => $mcpId,
            'description' => $tool->description,
            'input_schema' => $inputSchema,
            'output_schema' => $outputSchema,
        ]);
    }

    /**
     * Get active sessions count
     */
    public function getActiveSessions(): int
    {
        return $this->sessions()->where('status', 'active')->count();
    }
}
