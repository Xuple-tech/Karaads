<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\AgentMemory;
use App\Models\Projects;
use App\Services\AgentMemoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgentMemoryController extends Controller
{
    public function __construct(
        protected AgentMemoryService $service
    ) {}

    /**
     * Get agent memories
     */
    public function index(Request $request, string $projectId, string $agentId)
    {
        $project = Projects::findOrFail($projectId);
        $agent = Agent::findOrFail($agentId);

        $memories = $this->service->getAllMemories($agent, $projectId, 50);

        return response()->json([
            'success' => true,
            'memories' => $memories->map(fn ($m) => [
                'id' => $m->id,
                'content' => $m->content,
                'metadata' => $m->metadata,
                'relevance_score' => $m->relevance_score,
                'created_at' => $m->created_at,
            ]),
        ]);
    }

    /**
     * Search memories
     */
    public function search(Request $request, string $projectId, string $agentId)
    {
        $query = $request->input('q');
        $limit = $request->input('limit', 10);

        if (!$query) {
            return response()->json(['success' => false, 'error' => 'Query required']);
        }

        $agent = Agent::findOrFail($agentId);
        $memories = $this->service->searchMemories($agent, $projectId, $query, $limit);

        return response()->json([
            'success' => true,
            'memories' => $memories->map(fn ($m) => [
                'id' => $m->id,
                'content' => $m->content,
                'relevance_score' => $m->relevance_score,
            ]),
        ]);
    }

    /**
     * Get relevant memories
     */
    public function relevant(Request $request, string $projectId, string $agentId)
    {
        $limit = $request->input('limit', 5);
        $agent = Agent::findOrFail($agentId);

        $memories = $this->service->getRelevantMemories($agent, $projectId, $limit);

        return response()->json([
            'success' => true,
            'memories' => $memories->map(fn ($m) => [
                'id' => $m->id,
                'content' => $m->content,
                'relevance_score' => $m->relevance_score,
            ]),
        ]);
    }

    /**
     * Store memory
     */
    public function store(Request $request, string $projectId, string $agentId)
    {
        $request->validate([
            'content' => 'required|string',
            'metadata' => 'nullable|array',
        ]);

        $agent = Agent::findOrFail($agentId);

        $memory = $this->service->storeMemory(
            $agent,
            $projectId,
            $request->input('content'),
            $request->input('metadata', [])
        );

        return response()->json([
            'success' => true,
            'memory' => $memory,
        ]);
    }

    /**
     * Delete memory
     */
    public function destroy(string $projectId, string $agentId, string $memoryId)
    {
        $memory = AgentMemory::findOrFail($memoryId);
        $memory->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Clear all memories
     */
    public function clear(string $projectId, string $agentId)
    {
        $agent = Agent::findOrFail($agentId);
        $count = $this->service->clearMemories($agent, $projectId);

        return response()->json([
            'success' => true,
            'cleared' => $count,
        ]);
    }

    /**
     * Export memories as markdown
     */
    public function export(string $projectId, string $agentId)
    {
        $agent = Agent::findOrFail($agentId);
        $markdown = $this->service->exportAsMarkdown($agent, $projectId);

        return response()->streamDownload(function () use ($markdown) {
            echo $markdown;
        }, "agent-memories-{$agent->name}.md");
    }
}
