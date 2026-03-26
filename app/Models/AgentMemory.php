<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentMemory extends Model
{
    use HasUlids;

    protected $fillable = [
        'agent_id',
        'project_id',
        'chat_id',
        'content',
        'metadata',
        'relevance_score',
    ];

    protected $casts = [
        'metadata' => 'json',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Projects::class);
    }

    public function chat(): BelongsTo
    {
        return $this->belongsTo(Chat::class);
    }

    /**
     * Get memories ordered by relevance score
     */
    public static function relevantMemories(string $agentId, string $projectId, int $limit = 5)
    {
        return self::where('agent_id', $agentId)
            ->where('project_id', $projectId)
            ->orderByDesc('relevance_score')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Search memories by content
     */
    public static function search(string $agentId, string $projectId, string $query, int $limit = 5)
    {
        return self::where('agent_id', $agentId)
            ->where('project_id', $projectId)
            ->where('content', 'like', "%{$query}%")
            ->orderByDesc('relevance_score')
            ->limit($limit)
            ->get();
    }

    /**
     * Add tag to metadata
     */
    public function addTag(string $tag): void
    {
        $metadata = $this->metadata ?? [];
        $tags = $metadata['tags'] ?? [];

        if (!in_array($tag, $tags)) {
            $tags[] = $tag;
            $metadata['tags'] = $tags;
            $this->update(['metadata' => $metadata]);
        }
    }

    /**
     * Increment relevance score
     */
    public function incrementRelevance(int $amount = 1): void
    {
        $this->increment('relevance_score', $amount);
    }
}
