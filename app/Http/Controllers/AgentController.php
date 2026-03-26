<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Projects;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class AgentController extends Controller
{
    /**
     * Get all available agents for the current user
     */
    public function index(Request $request): JsonResponse
    {
        $userId = auth()->id();

        $agents = Agent::visibleTo($userId)
            ->select(['id', 'name', 'description', 'avatar_url', 'type', 'capabilities', 'available_tools', 'is_system_agent'])
            ->orderBy('is_system_agent', 'desc')
            ->orderBy('name')
            ->get()
            ->map(function ($agent) {
                return [
                    'id' => $agent->id,
                    'name' => $agent->name,
                    'description' => $agent->description,
                    'avatar_url' => $agent->avatar_url,
                    'type' => $agent->type,
                    'capabilities' => $agent->getCapabilities(),
                    'available_tools' => $agent->getAvailableTools(),
                    'is_system_agent' => $agent->isSystemAgent(),
                    'badge' => $agent->isSystemAgent() ? 'System' : 'Custom'
                ];
            });

        return response()->json([
            'agents' => $agents
        ]);
    }

    /**
     * Get agent details
     */
    public function show(Agent $agent): JsonResponse
    {
        $userId = auth()->id();

        if (!$agent->isVisibleTo($userId)) {
            abort(403, 'Agent not accessible');
        }

        return response()->json([
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
                'description' => $agent->description,
                'avatar_url' => $agent->avatar_url,
                'type' => $agent->type,
                'capabilities' => $agent->getCapabilities(),
                'available_tools' => $agent->getAvailableTools(),
                'custom_instructions' => $agent->getCustomInstructions(),
                'is_system_agent' => $agent->isSystemAgent(),
                'configuration' => $agent->configuration ?? []
            ]
        ]);
    }

    /**
     * Create a custom agent
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'type' => 'required|in:automation,tool,responder',
            'capabilities' => 'array',
            'available_tools' => 'array',
            'custom_instructions' => 'nullable|string|max:2000',
            'visibility' => 'required|in:public,private',
            'avatar_url' => 'nullable|url'
        ]);

        $agent = Agent::create([
            'user_id' => auth()->id(),
            'name' => $request->name,
            'description' => $request->description,
            'type' => $request->type,
            'status' => 'active',
            'capabilities' => $request->capabilities ?? [],
            'available_tools' => $request->available_tools ?? [],
            'custom_instructions' => $request->custom_instructions,
            'visibility' => $request->visibility,
            'avatar_url' => $request->avatar_url,
            'is_system_agent' => false,
            'configuration' => [
                'max_response_length' => 2000,
                'include_examples' => true
            ]
        ]);

        return response()->json([
            'message' => 'Agent created successfully',
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
                'description' => $agent->description,
                'type' => $agent->type,
                'capabilities' => $agent->getCapabilities(),
                'available_tools' => $agent->getAvailableTools(),
                'is_system_agent' => false
            ]
        ], 201);
    }

    /**
     * Update a custom agent
     */
    public function update(Request $request, Agent $agent): JsonResponse
    {
        $userId = auth()->id();

        // Only allow updating own agents (not system agents)
        if ($agent->isSystemAgent() || $agent->user_id !== $userId) {
            abort(403, 'Cannot modify this agent');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'type' => 'required|in:automation,tool,responder',
            'capabilities' => 'array',
            'available_tools' => 'array',
            'custom_instructions' => 'nullable|string|max:2000',
            'visibility' => 'required|in:public,private',
            'avatar_url' => 'nullable|url'
        ]);

        $agent->update([
            'name' => $request->name,
            'description' => $request->description,
            'type' => $request->type,
            'capabilities' => $request->capabilities ?? [],
            'available_tools' => $request->available_tools ?? [],
            'custom_instructions' => $request->custom_instructions,
            'visibility' => $request->visibility,
            'avatar_url' => $request->avatar_url,
        ]);

        return response()->json([
            'message' => 'Agent updated successfully',
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
                'description' => $agent->description,
                'type' => $agent->type,
                'capabilities' => $agent->getCapabilities(),
                'available_tools' => $agent->getAvailableTools(),
                'is_system_agent' => false
            ]
        ]);
    }

    /**
     * Delete a custom agent
     */
    public function destroy(Agent $agent): JsonResponse
    {
        $userId = auth()->id();

        // Only allow deleting own agents (not system agents)
        if ($agent->isSystemAgent() || $agent->user_id !== $userId) {
            abort(403, 'Cannot delete this agent');
        }

        $agent->delete();

        return response()->json([
            'message' => 'Agent deleted successfully'
        ]);
    }

    /**
     * Get agents by capability for automatic selection
     */
    public function getByCapability(Request $request): JsonResponse
    {
        $request->validate([
            'capability' => 'required|string',
            'project_id' => 'nullable|string'
        ]);

        $userId = auth()->id();
        $capability = $request->capability;

        $agents = Agent::visibleTo($userId)
            ->where('status', 'active')
            ->whereJsonContains('capabilities', $capability)
            ->select(['id', 'name', 'description', 'avatar_url', 'type', 'capabilities', 'is_system_agent'])
            ->orderBy('is_system_agent', 'desc') // Prioritize system agents
            ->get()
            ->map(function ($agent) {
                return [
                    'id' => $agent->id,
                    'name' => $agent->name,
                    'description' => $agent->description,
                    'avatar_url' => $agent->avatar_url,
                    'type' => $agent->type,
                    'capabilities' => $agent->getCapabilities(),
                    'is_system_agent' => $agent->isSystemAgent(),
                    'confidence_score' => $this->calculateConfidenceScore($agent, $capability)
                ];
            })
            ->sortByDesc('confidence_score')
            ->values();

        return response()->json([
            'agents' => $agents,
            'recommended' => $agents->first() // Best match
        ]);
    }

    /**
     * Get available tools for frontend
     */
    public function getAvailableTools(): JsonResponse
    {
        $tools = [
            'code_analyzer' => 'Analyze code structure and quality',
            'syntax_checker' => 'Check code syntax and formatting',
            'formatter' => 'Format and beautify code',
            'linter' => 'Lint code for best practices',
            'test_generator' => 'Generate unit tests',
            'pandas' => 'Data manipulation and analysis',
            'matplotlib' => 'Create static visualizations',
            'seaborn' => 'Statistical data visualization',
            'plotly' => 'Interactive charts and graphs',
            'numpy' => 'Numerical computing',
            'scipy' => 'Scientific computing',
            'gantt_chart' => 'Project timeline visualization',
            'kanban_board' => 'Task management board',
            'calendar' => 'Schedule and timeline management',
            'notification_system' => 'Send alerts and reminders',
            'reporting_tools' => 'Generate project reports',
            'markdown_editor' => 'Edit and format documentation',
            'diagram_generator' => 'Create technical diagrams',
            'template_library' => 'Access document templates',
            'style_checker' => 'Check writing style and grammar',
            'version_control' => 'Track document versions',
            'unit_test_runner' => 'Execute unit tests',
            'integration_tester' => 'Run integration tests',
            'code_coverage' => 'Measure test coverage',
            'static_analyzer' => 'Static code analysis',
            'security_scanner' => 'Security vulnerability scanning'
        ];

        return response()->json(['tools' => $tools]);
    }

    /**
     * Calculate confidence score for agent capability matching
     */
    private function calculateConfidenceScore(Agent $agent, string $capability): float
    {
        $capabilities = $agent->getCapabilities();
        $tools = $agent->getAvailableTools();

        $score = 0;

        // Direct capability match
        if (in_array($capability, $capabilities)) {
            $score += 100;
        }

        // Related capability matches
        $relatedCapabilities = $this->getRelatedCapabilities($capability);
        foreach ($relatedCapabilities as $related) {
            if (in_array($related, $capabilities)) {
                $score += 50;
            }
        }

        // Tool relevance
        $relevantTools = $this->getRelevantTools($capability);
        foreach ($relevantTools as $tool) {
            if (in_array($tool, $tools)) {
                $score += 25;
            }
        }

        // System agent bonus
        if ($agent->isSystemAgent()) {
            $score += 10;
        }

        return $score;
    }

    /**
     * Get related capabilities for better matching
     */
    private function getRelatedCapabilities(string $capability): array
    {
        $relations = [
            'code_generation' => ['code_review', 'debugging', 'optimization'],
            'data_analysis' => ['visualization', 'statistical_analysis', 'reporting'],
            'project_planning' => ['task_management', 'timeline_creation', 'progress_tracking'],
            'documentation_writing' => ['technical_writing', 'content_structuring'],
            'automated_testing' => ['code_quality_analysis', 'bug_detection']
        ];

        return $relations[$capability] ?? [];
    }

    /**
     * Get relevant tools for capability
     */
    private function getRelevantTools(string $capability): array
    {
        $toolMap = [
            'code_generation' => ['code_analyzer', 'syntax_checker', 'formatter'],
            'data_analysis' => ['pandas', 'numpy', 'matplotlib', 'seaborn'],
            'project_planning' => ['gantt_chart', 'kanban_board', 'calendar'],
            'documentation_writing' => ['markdown_editor', 'template_library', 'style_checker'],
            'automated_testing' => ['unit_test_runner', 'code_coverage', 'static_analyzer']
        ];

        return $toolMap[$capability] ?? [];
    }
}
