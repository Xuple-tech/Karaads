<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MCPTool extends Model
{
    use HasFactory;

    protected $fillable = [
        'mcp_server_id',
        'tool_id',
        'name',
        'mcp_id',
        'description',
        'input_schema',
        'output_schema',
        'metadata',
        'call_count',
        'last_called_at',
    ];

    protected $casts = [
        'input_schema' => 'array',
        'output_schema' => 'array',
        'metadata' => 'array',
        'last_called_at' => 'datetime',
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
     * Get the tool
     */
    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }

    /**
     * Record a call
     */
    public function recordCall(): void
    {
        $this->increment('call_count');
        $this->update(['last_called_at' => now()]);
    }

    /**
     * Get MCP tool specification
     */
    public function getMCPSpec(): array
    {
        return [
            'name' => $this->mcp_id,
            'description' => $this->description,
            'inputSchema' => [
                'type' => 'object',
                'properties' => $this->input_schema['properties'] ?? [],
                'required' => $this->input_schema['required'] ?? [],
            ],
        ];
    }

    /**
     * Validate input against schema
     */
    public function validateInput(array $input): bool
    {
        $required = $this->input_schema['required'] ?? [];
        foreach ($required as $field) {
            if (!isset($input[$field])) {
                return false;
            }
        }
        return true;
    }
}
