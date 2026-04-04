<?php

namespace App\Models\Workspace;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectAgent extends Model
{
    use HasUlids;

    protected $fillable = [
        'project_id',
        'created_by',
        'name',
        'instructions',
        'provider',
        'model',
        'enabled_tools',
        'memory_mode',
        'status',
        'metadata',
    ];

    protected $casts = [
        'enabled_tools' => 'array',
        'metadata' => 'array',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function runs(): HasMany
    {
        return $this->hasMany(ProjectAgentRun::class, 'agent_id');
    }

    public function hasTool(string $slug): bool
    {
        return in_array($slug, $this->enabled_tools ?? [], true);
    }
}
