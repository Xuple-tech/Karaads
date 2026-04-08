<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MetaBroadcast extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'meta_account_id',
        'user_id',
        'name',
        'message',
        'status',
        'recipient_count',
        'sent_count',
        'failed_count',
        'sent_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'recipient_count' => 'integer',
        'sent_count' => 'integer',
        'failed_count' => 'integer',
    ];

    public function metaAccount(): BelongsTo
    {
        return $this->belongsTo(MetaAccount::class);
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(MetaBroadcastRecipient::class, 'broadcast_id');
    }
}
