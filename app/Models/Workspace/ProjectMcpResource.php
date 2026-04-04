<?php

namespace App\Models\Workspace;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectMcpResource extends Model
{
    use HasUlids;

    protected $table = 'project_mcp_resources';

    protected $fillable = [
        'project_id',
        'project_mcp_server_id',
        'name',
        'uri',
        'mime_type',
        'contents',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(ProjectMcpServer::class, 'project_mcp_server_id');
    }
}
