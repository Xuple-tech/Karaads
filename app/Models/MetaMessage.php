<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class MetaMessage extends Model
{
     use \Illuminate\Database\Eloquent\Concerns\HasUlids;
    protected $keyType = 'string';
    protected $fillable = [
        'meta_account_id',
        'conversation_id',
        'message_id',
        'direction',
        'sender_id',
        'sender_name',
        'content',
        'media_attachments',
        'status',
        'sent_at',
        'received_at',
    ];

    protected $casts = [
        'media_attachments' => 'array',
        'sent_at' => 'datetime',
        'received_at' => 'datetime',
    ];

    public function metaAccount(): BelongsTo
    {
        return $this->belongsTo(MetaAccount::class);
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(MetaConversation::class, 'conversation_id', 'conversation_id');
    }

    public function draft(): HasOne
    {
        return $this->hasOne(MetaMessageDraft::class);
    }

    public function isIncoming(): bool
    {
        return $this->direction === 'incoming';
    }

    public function isOutgoing(): bool
    {
        return $this->direction === 'outgoing';
    }
}
