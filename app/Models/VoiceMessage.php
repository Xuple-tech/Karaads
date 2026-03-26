<?php
// app/Models/VoiceMessage.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VoiceMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'voice_conversation_id',
        'speaker',
        'audio_file_path',
        'audio_duration',
        'transcription',
        'content',
        'started_at',
        'ended_at',
        'metadata',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'metadata' => 'array',
        'audio_duration' => 'integer',
    ];

    /**
     * Get the voice conversation that owns this message
     */
    public function voiceConversation(): BelongsTo
    {
        return $this->belongsTo(VoiceConversation::class);
    }

    /**
     * Check if message is from user
     */
    public function isFromUser(): bool
    {
        return $this->speaker === 'user';
    }

    /**
     * Check if message is from AI
     */
    public function isFromAI(): bool
    {
        return $this->speaker === 'ai';
    }

    /**
     * Get message duration in minutes
     */
    public function getDurationInMinutesAttribute(): float
    {
        return $this->audio_duration / 60;
    }

    /**
     * Check if audio file exists
     */
    public function hasAudio(): bool
    {
        return !empty($this->audio_file_path) && file_exists(storage_path('app/' . $this->audio_file_path));
    }

    /**
     * Get audio file URL for streaming
     */
    public function getAudioUrlAttribute(): ?string
    {
        if (!$this->hasAudio()) {
            return null;
        }

        return route('voice.audio.stream', $this->id);
    }

    /**
     * Scope user messages
     */
    public function scopeUserMessages($query)
    {
        return $query->where('speaker', 'user');
    }

    /**
     * Scope AI messages
     */
    public function scopeAiMessages($query)
    {
        return $query->where('speaker', 'ai');
    }
}
