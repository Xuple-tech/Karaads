<?php
// app/Models/VoiceConversation.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VoiceConversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'user_id',
        'user_audio_path',
        'ai_audio_path',
        'user_transcription',
        'ai_response_text',
        'call_duration',
        'language',
        'status',
        'voice_settings',
        'audio_format',
        'sample_rate',
    ];

    protected $casts = [
        'voice_settings' => 'array',
        'call_duration' => 'integer',
        'sample_rate' => 'integer',
    ];

    /**
     * Get the parent conversation
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }

    /**
     * Get the user that owns the voice conversation
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all voice messages in this conversation
     */
    public function voiceMessages(): HasMany
    {
        return $this->hasMany(VoiceMessage::class);
    }

    /**
     * Scope active conversations
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope completed conversations
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Get user voice messages
     */
    public function userMessages(): HasMany
    {
        return $this->voiceMessages()->where('speaker', 'user');
    }

    /**
     * Get AI voice messages
     */
    public function aiMessages(): HasMany
    {
        return $this->voiceMessages()->where('speaker', 'ai');
    }

    /**
     * Mark conversation as completed
     */
    public function markAsCompleted(): void
    {
        $this->update(['status' => 'completed']);
    }

    /**
     * Get total messages count
     */
    public function getTotalMessagesAttribute(): int
    {
        return $this->voiceMessages()->count();
    }

    /**
     * Get conversation summary
     */
    public function getSummaryAttribute(): string
    {
        $userText = $this->user_transcription ?: 'Voice message';
        return substr($userText, 0, 100) . (strlen($userText) > 100 ? '...' : '');
    }
}
