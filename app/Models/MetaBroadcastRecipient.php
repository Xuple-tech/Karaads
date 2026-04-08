<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetaBroadcastRecipient extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'broadcast_id',
        'participant_id',
        'participant_name',
        'conversation_id',
        'status',
        'error_message',
    ];

    public function broadcast(): BelongsTo
    {
        return $this->belongsTo(MetaBroadcast::class);
    }
}
