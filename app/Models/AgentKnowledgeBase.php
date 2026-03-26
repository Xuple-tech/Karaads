<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentKnowledgeBase extends Model
{
    protected $table = 'agent_knowledge_base';
    use HasFactory, HasUuids;

    protected $fillable = [
        'agent_id',
        'content_type', // 'faq', 'product_info', 'policy', 'custom', 'website_content'
        'title',
        'content',
        'source_url',
        'file_path',
        'file_type',
        'file_size',
        'embedding_vector',
        'metadata',
        'is_active',
        'order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(AIAgent::class,'agent_knowledge_base','id');
    }
}
