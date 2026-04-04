<?php

namespace App\Models\Workspace;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectAgentRun extends Model
{
    use HasUlids;

    protected $fillable = [
        'project_id',
        'conversation_id',
        'agent_id',
        'triggered_by_user_id',
        'source_message_id',
        'response_message_id',
        'status',
        'input_message',
        'output_message',
        'tool_calls',
        'usage',
        'billing',
        'error_message',
        'completed_at',
    ];

    protected $casts = [
        'tool_calls' => 'array',
        'usage' => 'array',
        'billing' => 'array',
        'completed_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(ProjectConversation::class, 'conversation_id');
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(ProjectAgent::class, 'agent_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'triggered_by_user_id');
    }
}
