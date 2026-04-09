<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WidgetMessage extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'session_id',
        'role',
        'content',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(WidgetSession::class, 'session_id');
    }
}
