<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CallSession extends Model
{
    use HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'conversation_id',
        'initiator_id',
        'mode',
        'status',
        'max_participants',
        'join_token_hash',
        'join_token_expires_at',
        'accepted_at',
        'ended_at',
        'last_activity_at',
        'record_persisted_at',
    ];

    protected function casts(): array
    {
        return [
            'max_participants' => 'integer',
            'join_token_expires_at' => 'datetime',
            'accepted_at' => 'datetime',
            'ended_at' => 'datetime',
            'last_activity_at' => 'datetime',
            'record_persisted_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function initiator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'initiator_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(CallSessionParticipant::class);
    }

    public function joinRequests(): HasMany
    {
        return $this->hasMany(CallJoinRequest::class);
    }
}
