<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentUsageStat extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'agent_id',
        'date',
        'conversations_count',
        'messages_count',
        'users_count',
        'avg_response_time',
        'satisfaction_score',
        'common_questions',
        'peak_hours',
        'knowledge_base_hits',
        'tool_usage',
    ];

    protected $casts = [
        'date' => 'date',
        'common_questions' => 'array',
        'peak_hours' => 'array',
        'tool_usage' => 'array',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(AIAgent::class);
    }
}
