<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMessageSource extends Model
{
    use HasUuids;

    protected $fillable = [
        'chat_message_id',
        'chat_tool_run_id',
        'position',
        'title',
        'url',
        'snippet',
        'payload',
    ];

    protected $casts = [
        'payload' => 'array',
        'position' => 'integer',
    ];

    public function message(): BelongsTo
    {
        return $this->belongsTo(ChatMessage::class, 'chat_message_id');
    }

    public function toolRun(): BelongsTo
    {
        return $this->belongsTo(ChatToolRun::class, 'chat_tool_run_id');
    }
}
