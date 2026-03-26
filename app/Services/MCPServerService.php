<?php

namespace App\Services;

use App\Models\MCPServerConfig;
use App\Models\MCPSession;
use App\Models\MCPTool;
use App\Models\MCPLog;
use App\Models\Tool;
use App\Models\User;
use Illuminate\Support\Str;

class MCPServerService
{
    protected ToolExecutorService $toolExecutor;

    public function __construct(ToolExecutorService $toolExecutor)
    {
        $this->toolExecutor = $toolExecutor;
    }

    /**
     * Initialize internal MCP server
     */
    public function initializeInternalServer(): MCPServerConfig
    {
        // Check if already exists
        $existing = MCPServerConfig::where('slug', 'internal')->first();
        if ($existing) {
            return $existing;
        }

        $server = MCPServerConfig::create([
            'name' => 'Rhea Internal Tools',
            'slug' => 'internal',
            'description' => 'Internal MCP server for Rhea agent tools',
            'type' => 'internal',
            'protocol_version' => '1.0.0',
            'capabilities' => [
                'tools' => [],
                'resources' => [],
                'prompts' => [],
                'sampling' => false,
            ],
            'enabled' => true,
        ]);

        // Register all tools
        $this->registerAllTools($server);

        return $server;
    }

    /**
     * Register all tools in MCP format
     */
    protected function registerAllTools(MCPServerConfig $server): void
    {
        $tools = Tool::where('active', true)->get();

        foreach ($tools as $tool) {
            $this->registerTool($server, $tool);
        }
    }

    /**
     * Register a single tool
     */
    public function registerTool(MCPServerConfig $server, Tool $tool): MCPTool
    {
        // Check if already registered
        $existing = $server->tools()->where('tool_id', $tool->id)->first();
        if ($existing) {
            return $existing;
        }

        $mcpTool = MCPTool::create([
            'mcp_server_id' => $server->id,
            'tool_id' => $tool->id,
            'name' => $tool->name,
            'mcp_id' => $this->generateMCPId($tool->name),
            'description' => $tool->description,
            'input_schema' => $this->buildInputSchema($tool),
            'output_schema' => $this->buildOutputSchema($tool),
            'metadata' => [
                'category' => $tool->category,
                'rate_limit' => $tool->rate_limit,
            ],
        ]);

        return $mcpTool;
    }

    /**
     * Generate MCP-compliant tool ID
     */
    protected function generateMCPId(string $toolName): string
    {
        return 'tool_' . Str::snake($toolName);
    }

    /**
     * Build input schema from tool parameters
     */
    protected function buildInputSchema(Tool $tool): array
    {
        $parameters = $tool->parameters ?? [];
        $properties = [];
        $required = [];

        foreach ($parameters as $param => $config) {
            $properties[$param] = [
                'type' => $config['type'] ?? 'string',
                'description' => $config['description'] ?? '',
            ];

            if ($config['required'] ?? false) {
                $required[] = $param;
            }
        }

        return [
            'type' => 'object',
            'properties' => $properties,
            'required' => $required,
        ];
    }

    /**
     * Build output schema
     */
    protected function buildOutputSchema(Tool $tool): array
    {
        $returnSchema = $tool->return_schema ?? [];

        return [
            'type' => 'object',
            'properties' => $returnSchema['properties'] ?? [
                'result' => ['type' => 'string'],
                'success' => ['type' => 'boolean'],
            ],
        ];
    }

    /**
     * Create session
     */
    public function createSession(User $user, MCPServerConfig $server, array $capabilitiesRequested = []): MCPSession
    {
        $session = MCPSession::create([
            'user_id' => $user->id,
            'mcp_server_id' => $server->id,
            'session_token' => Str::random(64),
            'capabilities_offered' => $server->getCapabilities(),
            'capabilities_requested' => $capabilitiesRequested,
            'status' => 'active',
            'expires_at' => now()->addHours(24),
        ]);

        return $session;
    }

    /**
     * Handle MCP call: tools/list
     */
    public function listTools(MCPServerConfig $server): array
    {
        $tools = $server->tools()->get();

        return [
            'tools' => $tools->map(fn($tool) => $tool->getMCPSpec())->values()->toArray(),
        ];
    }

    /**
     * Handle MCP call: tools/call
     */
    public function callTool(MCPSession $session, string $toolName, array $arguments): array
    {
        $startTime = microtime(true);

        try {
            // Find MCP tool
            $mcpTool = MCPTool::where('mcp_id', $toolName)
                ->where('mcp_server_id', $session->mcp_server_id)
                ->first();

            if (!$mcpTool) {
                throw new \Exception("Tool not found: {$toolName}");
            }

            // Validate input
            if (!$mcpTool->validateInput($arguments)) {
                throw new \Exception("Invalid input for tool {$toolName}");
            }

            // Execute tool
            $result = $this->toolExecutor->execute(
                $mcpTool->tool->name,
                $arguments,
                $session->user
            );

            $responseTime = (microtime(true) - $startTime) * 1000;

            // Record execution
            $mcpTool->recordCall();
            $session->recordActivity();

            // Log
            MCPLog::create([
                'session_id' => $session->id,
                'mcp_server_id' => $session->mcp_server_id,
                'method' => 'tools/call',
                'tool_name' => $toolName,
                'request_data' => $arguments,
                'response_data' => $result,
                'response_time_ms' => (int)$responseTime,
                'status' => 'success',
            ]);

            return [
                'content' => [
                    [
                        'type' => 'text',
                        'text' => json_encode($result),
                    ],
                ],
            ];

        } catch (\Exception $e) {
            $responseTime = (microtime(true) - $startTime) * 1000;

            MCPLog::create([
                'session_id' => $session->id,
                'mcp_server_id' => $session->mcp_server_id,
                'method' => 'tools/call',
                'tool_name' => $toolName,
                'request_data' => $arguments,
                'response_time_ms' => (int)$responseTime,
                'status' => 'error',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle MCP call: resources/list
     */
    public function listResources(MCPServerConfig $server): array
    {
        $resources = $server->resources()->get();

        return [
            'resources' => $resources->map(function ($resource) {
                return [
                    'uri' => $resource->getResourcePath(),
                    'name' => $resource->name,
                    'mimeType' => $resource->mime_type,
                ];
            })->values()->toArray(),
        ];
    }

    /**
     * Handle MCP call: resources/read
     */
    public function readResource(MCPSession $session, string $uri): array
    {
        $startTime = microtime(true);

        try {
            // Parse URI
            $uriParts = explode('://', $uri);
            if ($uriParts[0] !== 'resource') {
                throw new \Exception('Invalid resource URI');
            }

            $resource = $session->mcpServer->resources()
                ->where('uri', $uriParts[1])
                ->first();

            if (!$resource || !$resource->canAccess('read')) {
                throw new \Exception('Resource not accessible');
            }

            $responseTime = (microtime(true) - $startTime) * 1000;

            MCPLog::create([
                'session_id' => $session->id,
                'mcp_server_id' => $session->mcp_server_id,
                'method' => 'resources/read',
                'request_data' => ['uri' => $uri],
                'response_time_ms' => (int)$responseTime,
                'status' => 'success',
            ]);

            return [
                'contents' => [
                    [
                        'uri' => $uri,
                        'mimeType' => $resource->mime_type,
                        'text' => json_encode($resource->data),
                    ],
                ],
            ];

        } catch (\Exception $e) {
            $responseTime = (microtime(true) - $startTime) * 1000;

            MCPLog::create([
                'session_id' => $session->id,
                'mcp_server_id' => $session->mcp_server_id,
                'method' => 'resources/read',
                'request_data' => ['uri' => $uri],
                'response_time_ms' => (int)$responseTime,
                'status' => 'error',
                'error_message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Get session info
     */
    public function getSessionInfo(MCPSession $session): array
    {
        return $session->getInfo();
    }

    /**
     * Get server statistics
     */
    public function getServerStats(MCPServerConfig $server): array
    {
        $logs = $server->logs()->where('created_at', '>=', now()->subDays(1))->get();

        return [
            'server_id' => $server->id,
            'name' => $server->name,
            'enabled' => $server->enabled,
            'active_sessions' => $server->getActiveSessions(),
            'total_tools' => $server->tools()->count(),
            'total_resources' => $server->resources()->count(),
            'total_requests_24h' => $logs->count(),
            'successful_requests' => $logs->where('status', 'success')->count(),
            'failed_requests' => $logs->where('status', 'error')->count(),
            'average_response_time_ms' => (int)$logs->avg('response_time_ms'),
        ];
    }
}
