<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMessageAttachment extends Model
{
    use HasUuids;

    protected $fillable = [
        'chat_message_id',
        'legacy_chat_file_id',
        'kind',
        'name',
        'mime_type',
        'size',
        'url',
        'path',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array',
        'size' => 'integer',
    ];

    public function message(): BelongsTo
    {
        return $this->belongsTo(ChatMessage::class, 'chat_message_id');
    }
}
