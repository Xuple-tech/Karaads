<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MetaConversation extends Model
{
     use \Illuminate\Database\Eloquent\Concerns\HasUlids;
    protected $keyType = 'string';
    protected $fillable = [
        'meta_account_id',
        'conversation_id',
        'participant_id',
        'participant_name',
        'last_message',
        'unread_count',
        'last_message_at',
        'is_archived',
        'metadata',
    ];

    protected $casts = [
        'is_archived' => 'boolean',
        'metadata' => 'array',
        'last_message_at' => 'datetime',
    ];

    public function metaAccount(): BelongsTo
    {
        return $this->belongsTo(MetaAccount::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(MetaMessage::class, 'conversation_id', 'conversation_id');
    }

    public function drafts(): HasMany
    {
        return $this->hasMany(MetaMessageDraft::class, 'meta_conversation_id');
    }

    public function hasUnreadMessages(): bool
    {
        return $this->unread_count > 0;
    }
}
