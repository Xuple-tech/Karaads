<?php

namespace App\Http\Controllers;

use App\Models\Tool;
use App\Services\ToolExecutorService;
use Illuminate\Http\Request;

/**
 * AgentToolController - Manage global tools and execute them
 *
 * Tools are created and managed globally by admins.
 * Agents can dynamically call any active tool by name at runtime.
 */
class AgentToolController extends Controller
{
    protected ToolExecutorService $toolExecutor;

    public function __construct(ToolExecutorService $toolExecutor)
    {
        $this->toolExecutor = $toolExecutor;
    }

    /**
     * Get all available tools
     * GET /api/tools
     */
    public function index()
    {
        $tools = Tool::active()
            ->get()
            ->map(fn ($tool) => $this->formatTool($tool));

        return response()->json([
            'data' => $tools,
            'categories' => $tools->pluck('category')->unique()->values(),
            'total' => $tools->count(),
        ]);
    }

    /**
     * Get tool by name
     * GET /api/tools/{toolName}
     */
    public function show($toolName)
    {
        $tool = Tool::byName($toolName);

        if (!$tool || !$tool->is_active) {
            return response()->json(['error' => 'Tool not found or inactive'], 404);
        }

        return response()->json($this->formatToolDetailed($tool));
    }

    /**
     * Create a new tool (Admin only)
     * POST /api/tools
     */
    public function store(Request $request)
    {
        $this->authorize('isAdmin');

        $validated = $request->validate([
            'name' => 'required|string|unique:tools',
            'display_name' => 'required|string',
            'description' => 'required|string',
            'category' => 'required|string',
            'icon_url' => 'nullable|string|url',
            'parameters' => 'required|array',
            'return_schema' => 'required|array',
            'rate_limit' => 'required|integer|min:1',
            'requires_api_key' => 'nullable|boolean',
            'configuration' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $tool = Tool::create([
            ...$validated,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Tool created successfully',
            'data' => $this->formatToolDetailed($tool),
        ], 201);
    }

    /**
     * Update a tool (Admin only)
     * PUT /api/tools/{toolName}
     */
    public function update(Request $request, $toolName)
    {
        $this->authorize('isAdmin');

        $tool = Tool::byName($toolName);
        if (!$tool) {
            return response()->json(['error' => 'Tool not found'], 404);
        }

        $validated = $request->validate([
            'display_name' => 'nullable|string',
            'description' => 'nullable|string',
            'category' => 'nullable|string',
            'icon_url' => 'nullable|string|url',
            'parameters' => 'nullable|array',
            'return_schema' => 'nullable|array',
            'rate_limit' => 'nullable|integer|min:1',
            'requires_api_key' => 'nullable|boolean',
            'configuration' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $tool->update(array_filter($validated, fn ($v) => $v !== null));

        return response()->json([
            'message' => 'Tool updated successfully',
            'data' => $this->formatToolDetailed($tool),
        ]);
    }

    /**
     * Delete a tool (Admin only)
     * DELETE /api/tools/{toolName}
     */
    public function destroy($toolName)
    {
        $this->authorize('isAdmin');

        $tool = Tool::byName($toolName);
        if (!$tool) {
            return response()->json(['error' => 'Tool not found'], 404);
        }

        $tool->delete();

        return response()->json(['message' => 'Tool deleted successfully']);
    }

    /**
     * Execute a tool
     * POST /api/tools/{toolName}/execute
     */
    public function execute(Request $request, $toolName)
    {
        $tool = Tool::byName($toolName);
        if (!$tool || !$tool->is_active) {
            return response()->json(['error' => 'Tool not found or inactive'], 404);
        }

        // Execute tool (agents are optional, tools can be called standalone)
        $result = $this->toolExecutor->execute($toolName, $request->all());

        return response()->json($result);
    }

    /**
     * Test a tool with sample data
     * POST /api/tools/{toolName}/test
     */
    public function test(Request $request, $toolName)
    {
        $tool = Tool::byName($toolName);
        if (!$tool || !$tool->is_active) {
            return response()->json(['error' => 'Tool not found or inactive'], 404);
        }

        $parameters = $request->validate([
            'parameters' => 'required|array',
        ])['parameters'];

        $result = $this->toolExecutor->execute($toolName, $parameters);

        return response()->json([
            'tool' => $toolName,
            'test_result' => $result,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Get tool execution guidelines and examples
     * GET /api/tools/{toolName}/guidelines
     */
    public function guidelines($toolName)
    {
        $tool = Tool::byName($toolName);
        if (!$tool) {
            return response()->json(['error' => 'Tool not found'], 404);
        }

        return response()->json([
            'tool' => $this->formatToolDetailed($tool),
            'guidelines' => $this->getToolGuidelines($toolName),
            'examples' => $this->getToolExamples($toolName),
        ]);
    }

    /**
     * Format tool data for API response
     */
    protected function formatTool(Tool $tool): array
    {
        return [
            'id' => $tool->id,
            'name' => $tool->name,
            'display_name' => $tool->display_name,
            'description' => $tool->description,
            'category' => $tool->category,
            'icon_url' => $tool->icon_url,
            'rate_limit' => $tool->rate_limit,
            'is_active' => $tool->is_active,
        ];
    }

    /**
     * Format detailed tool data
     */
    protected function formatToolDetailed(Tool $tool): array
    {
        return [
            'id' => $tool->id,
            'name' => $tool->name,
            'display_name' => $tool->display_name,
            'description' => $tool->description,
            'category' => $tool->category,
            'icon_url' => $tool->icon_url,
            'parameters' => $tool->getParametersSchema(),
            'return_schema' => $tool->getReturnSchema(),
            'rate_limit' => $tool->rate_limit,
            'requires_api_key' => $tool->requires_api_key,
            'configuration' => $tool->configuration,
            'is_active' => $tool->is_active,
            'created_at' => $tool->created_at?->toIso8601String(),
            'updated_at' => $tool->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Get guidelines for a specific tool
     */
    protected function getToolGuidelines(string $toolName): array
    {
        return match ($toolName) {
            'web_search' => [
                'Use specific keywords for better results',
                'Limit results to 5-10 for performance',
                'Combine multiple searches for thorough research',
                'Consider using operator words like "site:", "filetype:"',
            ],
            'web_fetch' => [
                'Always verify the URL is accessible',
                'Large pages may be truncated to 5000 characters',
                'Use extract parameter to get specific content',
                'Handle timeouts gracefully (15s limit)',
            ],
            'file_read' => [
                'File size limited to 100KB',
                'Use relative paths from project storage',
                'Check file permissions before reading',
                'UTF-8 encoding recommended',
            ],
            'file_create' => [
                'Prevent overwriting by default',
                'Set overwrite=true only when necessary',
                'Use secure file paths',
                'Consider file size limits',
            ],
            'api_call' => [
                'Authenticate with required headers/tokens',
                'Set appropriate timeouts',
                'Handle rate limiting from external APIs',
                'Validate response status codes',
            ],
            'code_execute' => [
                'Sandboxed environment - malicious code prevented',
                'Use PHP, Python, or JavaScript',
                'Query results limited to prevent abuse',
                'Timeouts set to 10 seconds',
            ],
            'send_email' => [
                'Verify email format is valid',
                'Include clear subject lines',
                'Template variables supported',
                'Check rate limits (30 per minute)',
            ],
            'get_weather' => [
                'Use city names or coordinates',
                'Real-time data from Open-Meteo API',
                'No API key required',
                'Supports multiple weather parameters',
            ],
            'database_query' => [
                'SELECT queries only (read-only)',
                'JOIN across multiple tables supported',
                'Use LIMIT for large result sets',
                'Indexes on common fields for performance',
            ],
            'image_generate' => [
                'Detailed prompts produce better results',
                'Include style, mood, and composition details',
                'Consider content policy restrictions',
                'Generated images stored securely',
            ],
            'data_analysis' => [
                'Supports JSON arrays or CSV data',
                'Analysis types: summary, correlation, trend, statistical',
                'Automatic numeric field detection',
                'Ideal for dataset insights and patterns',
            ],
            'text_process' => [
                'Operations: summarize, sentiment, entities, translate, keywords, wordcount',
                'NLP-powered text understanding',
                'Keyword extraction removes common stop words',
                'Entity recognition for emails, URLs, and names',
            ],
            'schedule_task' => [
                'Schedule tasks for future execution',
                'Supports any tool execution',
                'Time format: ISO 8601 or human-readable',
                'Cannot schedule tasks in the past',
            ],
            'knowledge_search' => [
                'Searches agent memory and context',
                'Similarity-based semantic matching',
                'Configurable similarity threshold',
                'Returns relevant knowledge with confidence scores',
            ],
            default => [],
        };
    }

    /**
     * Get example usage for a specific tool
     */
    protected function getToolExamples(string $toolName): array
    {
        return match ($toolName) {
            'web_search' => [
                [
                    'description' => 'Search for a topic',
                    'parameters' => ['query' => 'Laravel database optimization', 'limit' => 5],
                ],
            ],
            'web_fetch' => [
                [
                    'description' => 'Extract text from a page',
                    'parameters' => ['url' => 'https://example.com/article', 'extract' => 'text'],
                ],
            ],
            'api_call' => [
                [
                    'description' => 'GET request to API',
                    'parameters' => ['url' => 'https://api.example.com/users', 'method' => 'GET'],
                ],
            ],
            'code_execute' => [
                [
                    'description' => 'Execute PHP code',
                    'parameters' => ['code' => 'return 2 + 2;', 'language' => 'php'],
                ],
            ],
            'image_generate' => [
                [
                    'description' => 'Generate an image',
                    'parameters' => [
                        'prompt' => 'A serene mountain landscape at sunset',
                        'style' => 'realistic',
                        'size' => '512x512',
                    ],
                ],
            ],
            'data_analysis' => [
                [
                    'description' => 'Analyze dataset',
                    'parameters' => [
                        'data' => json_encode([
                            ['name' => 'Alice', 'age' => 25, 'score' => 85],
                            ['name' => 'Bob', 'age' => 30, 'score' => 92],
                        ]),
                        'analysis_type' => 'summary',
                    ],
                ],
            ],
            'text_process' => [
                [
                    'description' => 'Summarize text',
                    'parameters' => [
                        'text' => 'Lorem ipsum dolor sit amet. Consectetur adipiscing elit. Sed do eiusmod tempor.',
                        'operation' => 'summarize',
                    ],
                ],
                [
                    'description' => 'Extract keywords',
                    'parameters' => [
                        'text' => 'Machine learning and artificial intelligence are transforming technology.',
                        'operation' => 'keywords',
                        'options' => ['limit' => 5],
                    ],
                ],
            ],
            'schedule_task' => [
                [
                    'description' => 'Schedule a task',
                    'parameters' => [
                        'task_name' => 'send_report',
                        'execute_at' => '2024-12-25 10:00:00',
                        'task_data' => ['recipient' => 'user@example.com'],
                    ],
                ],
            ],
            'knowledge_search' => [
                [
                    'description' => 'Search knowledge base',
                    'parameters' => [
                        'query' => 'database optimization',
                        'limit' => 5,
                        'threshold' => 0.6,
                    ],
                ],
            ],
            default => [],
        };
    }
}
