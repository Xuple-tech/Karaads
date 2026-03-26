<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetaMessageDraft extends Model
{
     use \Illuminate\Database\Eloquent\Concerns\HasUlids;
    protected $keyType = 'string';
    protected $fillable = [
        'meta_message_id',
        'meta_conversation_id',
        'original_message',
        'draft_reply',
        'ai_analysis',
        'sentiment',
        'category',
        'confidence_score',
        'status',
        'auto_approved',
        'user_modifications',
    ];

    protected $casts = [
        'auto_approved' => 'boolean',
        'confidence_score' => 'decimal:2',
        'user_modifications' => 'array',
    ];

    public function message(): BelongsTo
    {
        return $this->belongsTo(MetaMessage::class, 'meta_message_id');
    }

    public function metaConversation(): BelongsTo
    {
        return $this->belongsTo(MetaConversation::class, 'meta_conversation_id');
    }

    public function conversation(): BelongsTo
    {
        return $this->metaConversation();
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isSent(): bool
    {
        return $this->status === 'sent';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }
}
