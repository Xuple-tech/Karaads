<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Conversation extends Model
{
    use HasUlids;
    protected $keyType = 'string';
    protected $fillable = [
        'user_id',
        'projects_id',
        'title',
        'context',
        'description',
        'canvas_mode',
        'ai_generated_title',
        'title_generated_at',
        'type',
    ];

    protected $casts = [
        'context' => 'array',
        'canvas_mode' => 'boolean',
        'ai_generated_title' => 'boolean',
        'title_generated_at' => 'datetime',
    ];

    public function chats(): HasMany
    {
        return $this->hasMany(Chat::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function voiceConversations(): HasMany
    {
        return $this->hasMany(VoiceConversation::class, 'conversation_id');
    }

    public function hasVoiceConversations(): bool
    {
        return $this->voiceConversations()->exists();
    }
    public function project(): BelongsTo
    {
        return $this->belongsTo(Projects::class, 'projects_id');
    }

    public function shares(): HasMany
    {
        return $this->hasMany(ConversationShare::class);
    }

    /**
     * Get active share for this conversation
     */
    public function getActiveShare()
    {
        return $this->shares()->active()->first();
    }
}
