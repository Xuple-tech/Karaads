<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatToolRun extends Model
{
    use HasUuids;

    protected $fillable = [
        'chat_message_id',
        'tool_name',
        'status',
        'summary',
        'arguments',
        'result',
        'error_message',
    ];

    protected $casts = [
        'arguments' => 'array',
        'result' => 'array',
    ];

    public function message(): BelongsTo
    {
        return $this->belongsTo(ChatMessage::class, 'chat_message_id');
    }

    public function sources(): HasMany
    {
        return $this->hasMany(ChatMessageSource::class);
    }
}
