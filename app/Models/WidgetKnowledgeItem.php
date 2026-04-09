<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WidgetKnowledgeItem extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'widget_id',
        'user_id',
        'name',
        'type',
        'content',
        'source_url',
        'status',
    ];

    public function widget(): BelongsTo
    {
        return $this->belongsTo(WidgetConfig::class, 'widget_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
