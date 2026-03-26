<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'changes',
        'description',
    ];

    protected $casts = [
        'changes' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the team
     */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /**
     * Get the user who performed the action
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get activity summary
     */
    public function getSummary(): string
    {
        $user = $this->user->name ?? 'Unknown';
        $action = $this->action;
        $entity = $this->entity_type;

        return "{$user} {$action}d {$entity} #{$this->entity_id}";
    }

    /**
     * Get recent activities
     */
    public static function getRecentActivities(Team $team, int $limit = 50)
    {
        return $team->activityLogs()
            ->with('user')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }
}
