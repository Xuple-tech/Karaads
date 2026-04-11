<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WidgetWebsiteSourcePage extends Model
{
    use HasUlids;

    protected $keyType = 'string';

    protected $fillable = [
        'website_source_id',
        'knowledge_item_id',
        'url',
        'path',
        'title',
        'status',
        'content_hash',
        'failure_reason',
        'last_crawled_at',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
        'last_crawled_at' => 'datetime',
    ];

    public function websiteSource(): BelongsTo
    {
        return $this->belongsTo(WidgetWebsiteSource::class, 'website_source_id');
    }

    public function knowledgeItem(): BelongsTo
    {
        return $this->belongsTo(WidgetKnowledgeItem::class, 'knowledge_item_id');
    }
}
