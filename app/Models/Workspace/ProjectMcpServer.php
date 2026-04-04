<?php

namespace App\Models\Workspace;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectMcpServer extends Model
{
    use HasUlids;

    protected $table = 'project_mcp_servers';

    protected $fillable = [
        'project_id',
        'created_by',
        'name',
        'slug',
        'type',
        'endpoint',
        'auth_type',
        'auth_config',
        'capabilities',
        'status',
    ];

    protected $casts = [
        'auth_config' => 'array',
        'capabilities' => 'array',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(ProjectMcpSession::class, 'project_mcp_server_id');
    }
}
