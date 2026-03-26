<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetaAutomationLog extends Model
{
     use \Illuminate\Database\Eloquent\Concerns\HasUlids;
    protected $keyType = 'string';
    protected $fillable = [
        'user_id',
        'meta_account_id',
        'meta_message_draft_id',
        'action',
        'description',
        'data',
        'error_message',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function metaAccount(): BelongsTo
    {
        return $this->belongsTo(MetaAccount::class);
    }

    public function draft(): BelongsTo
    {
        return $this->belongsTo(MetaMessageDraft::class, 'meta_message_draft_id');
    }
}
