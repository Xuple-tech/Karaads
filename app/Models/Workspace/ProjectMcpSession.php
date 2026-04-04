<?php

namespace App\Models\Workspace;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectMcpSession extends Model
{
    use HasUlids;

    protected $table = 'project_mcp_sessions';

    protected $fillable = [
        'project_id',
        'project_mcp_server_id',
        'created_by',
        'session_token',
        'status',
        'capabilities_requested',
        'capabilities_offered',
        'expires_at',
        'last_used_at',
    ];

    protected $casts = [
        'capabilities_requested' => 'array',
        'capabilities_offered' => 'array',
        'expires_at' => 'datetime',
        'last_used_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(ProjectMcpServer::class, 'project_mcp_server_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(ProjectMcpLog::class, 'project_mcp_session_id');
    }
}
