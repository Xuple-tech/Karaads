<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentApiKey extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'agent_id',
        'name',
        'api_key',
        'secret_key',
        'last_used_at',
        'expires_at',
        'permissions',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
        'permissions' => 'array',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(AIAgent::class);
    }
}
