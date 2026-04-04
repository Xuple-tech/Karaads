<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Chat extends Model
{
    use HasUuids;
    protected $keyType = 'string';
    protected $fillable = [
        'conversation_id',
        'message',
        'thinking',
        'response',
        'metadata',
        'role',
        'type',
        'reply_to_id',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function imageGeneration()
    {
        return $this->hasOne(ImageGeneration::class);
    }

    /**
     * Get the files associated with this chat message.
     */
    public function files(): HasMany
    {
        return $this->hasMany(ChatFile::class);
    }

    /**
     * Get the message this is replying to
     */
    public function replyTo(): BelongsTo
    {
        return $this->belongsTo(Chat::class, 'reply_to_id');
    }

    /**
     * Get all replies to this message
     */
    public function replies(): HasMany
    {
        return $this->hasMany(Chat::class, 'reply_to_id');
    }

}
