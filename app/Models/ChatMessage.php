<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatMessage extends Model
{
    use HasUuids;

    protected $fillable = [
        'conversation_id',
        'legacy_chat_id',
        'reply_to_id',
        'role',
        'status',
        'provider',
        'model',
        'type',
        'content_markdown',
        'content_text',
        'thinking',
        'error_message',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(ChatMessageAttachment::class);
    }

    public function toolRuns(): HasMany
    {
        return $this->hasMany(ChatToolRun::class);
    }

    public function sources(): HasMany
    {
        return $this->hasMany(ChatMessageSource::class);
    }

    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reply_to_id');
    }
}
