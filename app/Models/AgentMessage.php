<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AgentMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'conversation_id',
        'agent_id',
        'user_id',
        'sender_type',
        'content',
        'content_parsed',
        'model',
        'tokens_used',
        'processing_time',
        'attachments',
        'is_read',
        'read_at',
        'feedback',
        'feedback_comment',
        'metadata',
        // Add to $fillable array:
        'tool_calls',
        'tool_responses',


    ];

    protected $casts = [
        'id' => 'string',
        'conversation_id' => 'string',
        'agent_id' => 'string',
        'user_id' => 'string',
        'sender_type' => 'string',
        'content_parsed' => 'array',
        'tokens_used' => 'integer',
        'processing_time' => 'decimal:2',
        'attachments' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'feedback' => 'string',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        // Add to $casts array:
        'tool_calls' => 'array',
        'tool_responses' => 'array',
    ];

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    // Define relationships
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(AgentConversation::class, 'conversation_id', 'id');
    }

    public function aiAgent(): BelongsTo
    {
        return $this->belongsTo(AiAgent::class, 'agent_id', 'id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    // Scopes
    public function scopeFromUser($query)
    {
        return $query->where('sender_type', 'user');
    }

    public function scopeFromAgent($query)
    {
        return $query->where('sender_type', 'agent');
    }

    public function scopeFromSystem($query)
    {
        return $query->where('sender_type', 'system');
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    public function scopeByConversation($query, $conversationId)
    {
        return $query->where('conversation_id', $conversationId);
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
    public function isFromUser(): bool
    {
        return $this->sender_type === 'user';
    }

    public function isFromAgent(): bool
    {
        return $this->sender_type === 'agent';
    }

    public function isFromSystem(): bool
    {
        return $this->sender_type === 'system';
    }

    public function isUnread(): bool
    {
        return !$this->is_read;
    }

    public function isRead(): bool
    {
        return $this->is_read;
    }

    public function markAsRead(): void
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    public function hasAttachments(): bool
    {
        return !empty($this->attachments);
    }

    public function hasFeedback(): bool
    {
        return !is_null($this->feedback);
    }

    public function getFeedbackLabel(): string
    {
        return match ($this->feedback) {
            'positive' => 'Positive',
            'negative' => 'Negative',
            'neutral' => 'Neutral',
            default => 'No Feedback',
        };
    }
}
