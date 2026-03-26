<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AgentConversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'agent_id',
        'user_id',
        'session_id',
        'visitor_id',
        'ip_address',
        'user_agent',
        'referrer',
        'page_url',
        'title',
        'status',
        'message_count',
        'satisfaction_score',
        'tags',
        'started_at',
        'last_message_at',
        'closed_at',
        'metadata',
    ];

    protected $casts = [
        'id' => 'string',
        'agent_id' => 'string',
        'user_id' => 'string',
        'message_count' => 'integer',
        'satisfaction_score' => 'decimal:2',
        'tags' => 'array',
        'started_at' => 'datetime',
        'last_message_at' => 'datetime',
        'closed_at' => 'datetime',
        'metadata' => 'array',
        'status' => 'string',
    ];

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    // Define relationships
    public function aiAgent(): BelongsTo
    {
        return $this->belongsTo(AIAgent::class, 'agent_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    // Add relationship for messages
    public function messages(): HasMany
    {
        return $this->hasMany(AgentMessage::class, 'conversation_id', 'id');
    }

    // Scopes for common queries
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByAgent($query, $agentId)
    {
        return $query->where('agent_id', $agentId);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Helper methods
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function close(): void
    {
        $this->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);
    }

    public function reopen(): void
    {
        $this->update([
            'status' => 'active',
            'closed_at' => null,
        ]);
    }
}
