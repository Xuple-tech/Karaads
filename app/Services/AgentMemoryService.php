<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\AgentMemory;
use Illuminate\Support\Collection;

/**
 * AgentMemoryService - Manages agent context and memory
 *
 * Handles:
 * - Storing conversation context
 * - Retrieving relevant memories
 * - Memory decay and cleanup
 * - Cross-conversation memory
 */
class AgentMemoryService
{
    /**
     * Store a memory for an agent
     */
    public function storeMemory(
        Agent $agent,
        string $projectId,
        string $content,
        array $metadata = [],
        ?string $chatId = null
    ): AgentMemory {
        return $agent->memories()->create([
            'project_id' => $projectId,
            'content' => $content,
            'metadata' => $metadata,
            'chat_id' => $chatId,
            'relevance_score' => 0,
        ]);
    }

    /**
     * Get relevant memories for context injection
     */
    public function getRelevantMemories(Agent $agent, string $projectId, int $limit = 5): Collection
    {
        return AgentMemory::relevantMemories($agent->id, $projectId, $limit);
    }

    /**
     * Search memories by query
     */
    public function searchMemories(Agent $agent, string $projectId, string $query, int $limit = 5): Collection
    {
        return AgentMemory::search($agent->id, $projectId, $query, $limit);
    }

    /**
     * Build memory context for prompt injection
     */
    public function buildMemoryContext(Agent $agent, string $projectId, string $currentQuery): string
    {
        $memories = $this->searchMemories($agent, $projectId, $currentQuery, 3);

        if ($memories->isEmpty()) {
            return '';
        }

        $context = "# Previous Context\n\n";
        foreach ($memories as $memory) {
            $context .= "- {$memory->content}\n";
            // Increment relevance score for reused memories
            $memory->incrementRelevance();
        }

        return $context;
    }

    /**
     * Store conversation turn as memory
     */
    public function storeConversationTurn(
        Agent $agent,
        string $projectId,
        string $userMessage,
        string $assistantResponse,
        ?string $chatId = null
    ): AgentMemory {
        $content = "User asked: {$userMessage}\nAgent responded: {$assistantResponse}";

        return $this->storeMemory($agent, $projectId, $content, [
            'type' => 'conversation',
            'user_message_length' => strlen($userMessage),
            'response_length' => strlen($assistantResponse),
        ], $chatId);
    }

    /**
     * Store tool execution result as memory
     */
    public function storeToolExecution(
        Agent $agent,
        string $projectId,
        string $toolName,
        array $result,
        ?string $chatId = null
    ): AgentMemory {
        $success = $result['success'] ?? false;
        $content = "Tool '{$toolName}' execution: " . ($success ? 'SUCCESS' : 'FAILED');

        return $this->storeMemory($agent, $projectId, $content, [
            'type' => 'tool_execution',
            'tool_name' => $toolName,
            'success' => $success,
            'result_summary' => substr(json_encode($result), 0, 500),
        ], $chatId);
    }

    /**
     * Add tag to memory
     */
    public function tagMemory(AgentMemory $memory, string $tag): void
    {
        $memory->addTag($tag);
    }

    /**
     * Increment memory relevance
     */
    public function incrementMemoryRelevance(AgentMemory $memory, int $amount = 1): void
    {
        $memory->incrementRelevance($amount);
    }

    /**
     * Get all memories for agent in project
     */
    public function getAllMemories(Agent $agent, string $projectId, int $limit = 50): Collection
    {
        return $agent->memories()
            ->where('project_id', $projectId)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Clean up old memories (older than X days)
     */
    public function cleanupOldMemories(int $daysOld = 30): int
    {
        $date = now()->subDays($daysOld);

        return AgentMemory::where('created_at', '<', $date)->delete();
    }

    /**
     * Clear all memories for an agent in a project
     */
    public function clearMemories(Agent $agent, string $projectId): int
    {
        return $agent->memories()
            ->where('project_id', $projectId)
            ->delete();
    }

    /**
     * Export memories as markdown
     */
    public function exportAsMarkdown(Agent $agent, string $projectId): string
    {
        $memories = $this->getAllMemories($agent, $projectId, 1000);

        $markdown = "# Agent Memory Export\n\n";
        $markdown .= "**Agent:** {$agent->name}\n";
        $markdown .= "**Exported:** " . now()->format('Y-m-d H:i:s') . "\n\n";

        foreach ($memories as $memory) {
            $markdown .= "## {$memory->created_at->format('Y-m-d H:i:s')}\n";
            $markdown .= $memory->content . "\n\n";
        }

        return $markdown;
    }
}
