<?php

namespace App\Models\Workspace;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasUuids;

    protected $table = 'projects';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'project_type',
        'status',
        'visibility',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(ProjectMember::class, 'project_id');
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(ProjectConversation::class, 'project_id');
    }

    public function agents(): HasMany
    {
        return $this->hasMany(ProjectAgent::class, 'project_id');
    }

    public function tools(): HasMany
    {
        return $this->hasMany(ProjectTool::class, 'project_id');
    }

    public function mcpServers(): HasMany
    {
        return $this->hasMany(ProjectMcpServer::class, 'project_id');
    }

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        return $query->where('user_id', $user->id)
            ->orWhereIn('id', ProjectMember::query()->where('user_id', $user->id)->select('project_id'));
    }

    public function isOwnedBy(User $user): bool
    {
        return $this->user_id === $user->id;
    }

    public function hasMember(User $user): bool
    {
        return $this->members()->where('user_id', $user->id)->exists();
    }
}
