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
        'type', // 'text' or 'image'
        'content_type', // 'text', 'markdown', 'code', 'rich_html'
        'mentions',
        'is_pinned',
        'reply_to_id',
        'agent_id',
        'tags',
    ];

    protected $casts = [
        'metadata' => 'array',
        'mentions' => 'json',
        'is_pinned' => 'boolean',
        'tags' => 'json',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
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

    /**
     * Get mentioned user IDs
     */
    public function getMentionedUserIds(): array
    {
        return $this->mentions ?? [];
    }

    /**
     * Check if user is mentioned
     */
    public function isMentionedUser(string $userId): bool
    {
        return in_array($userId, $this->getMentionedUserIds());
    }

    /**
     * Add mention to message
     */
    public function addMention(string $userId): void
    {
        $mentions = $this->getMentionedUserIds();
        if (!in_array($userId, $mentions)) {
            $mentions[] = $userId;
            $this->update(['mentions' => $mentions]);
        }
    }

    /**
     * Pin message
     */
    public function pin(): void
    {
        $this->update(['is_pinned' => true]);
    }

    /**
     * Unpin message
     */
    public function unpin(): void
    {
        $this->update(['is_pinned' => false]);
    }

    /**
     * Add tag to message
     */
    public function addTag(string $tag): void
    {
        $tags = $this->tags ?? [];
        if (!in_array($tag, $tags)) {
            $tags[] = $tag;
            $this->update(['tags' => $tags]);
        }
    }

    /**
     * Has tag
     */
    public function hasTag(string $tag): bool
    {
        return in_array($tag, $this->tags ?? []);
    }
}
