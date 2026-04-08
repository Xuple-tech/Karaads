<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetaReplyTemplate extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'meta_account_id',
        'user_id',
        'name',
        'content',
        'category',
        'usage_count',
        'is_active',
    ];

    protected $casts = [
        'usage_count' => 'integer',
        'is_active' => 'boolean',
    ];

    public function metaAccount(): BelongsTo
    {
        return $this->belongsTo(MetaAccount::class);
    }
}
