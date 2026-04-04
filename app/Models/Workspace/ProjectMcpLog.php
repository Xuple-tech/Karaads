<?php

namespace App\Models\Workspace;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectMcpLog extends Model
{
    use HasUlids;

    protected $table = 'project_mcp_logs';

    protected $fillable = [
        'project_id',
        'project_mcp_server_id',
        'project_mcp_session_id',
        'created_by',
        'method',
        'target',
        'request_payload',
        'response_payload',
        'status',
        'billed_units',
        'error_message',
    ];

    protected $casts = [
        'request_payload' => 'array',
        'response_payload' => 'array',
        'billed_units' => 'decimal:4',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(ProjectMcpServer::class, 'project_mcp_server_id');
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(ProjectMcpSession::class, 'project_mcp_session_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
