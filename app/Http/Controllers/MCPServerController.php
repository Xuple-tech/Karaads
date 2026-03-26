<?php

namespace App\Http\Controllers;

use App\Models\MCPServerConfig;
use App\Models\MCPSession;
use App\Services\MCPServerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MCPServerController extends Controller
{
    protected MCPServerService $mcpService;

    public function __construct(MCPServerService $mcpService)
    {
        $this->mcpService = $mcpService;
    }

    /**
     * GET /api/mcp/tools - List available MCP tools (MCP protocol endpoint)
     */
    public function toolsList(Request $request)
    {
        $this->validateMCPSession($request);

        $tools = $this->mcpService->listTools();

        return response()->json([
            'jsonrpc' => '2.0',
            'result' => [
                'tools' => $tools,
            ],
        ]);
    }

    /**
     * POST /api/mcp/tools/call - Execute MCP tool (MCP protocol endpoint)
     */
    public function toolsCall(Request $request)
    {
        $this->validateMCPSession($request);

        $validated = $request->validate([
            'jsonrpc' => 'required|in:2.0',
            'method' => 'required|in:tools/call',
            'params' => 'required|array',
            'params.name' => 'required|string',
            'params.arguments' => 'array',
        ]);

        try {
            $result = $this->mcpService->callTool(
                $validated['params']['name'],
                $validated['params']['arguments'] ?? [],
                $request->user()
            );

            return response()->json([
                'jsonrpc' => '2.0',
                'result' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'jsonrpc' => '2.0',
                'error' => [
                    'code' => -32603,
                    'message' => $e->getMessage(),
                ],
            ], 422);
        }
    }

    /**
     * GET /api/mcp/resources - List available MCP resources (MCP protocol endpoint)
     */
    public function resourcesList(Request $request)
    {
        $this->validateMCPSession($request);

        $resources = $this->mcpService->listResources();

        return response()->json([
            'jsonrpc' => '2.0',
            'result' => [
                'resources' => $resources,
            ],
        ]);
    }

    /**
     * POST /api/mcp/resources/read - Read MCP resource (MCP protocol endpoint)
     */
    public function resourcesRead(Request $request)
    {
        $this->validateMCPSession($request);

        $validated = $request->validate([
            'jsonrpc' => 'required|in:2.0',
            'method' => 'required|in:resources/read',
            'params' => 'required|array',
            'params.uri' => 'required|string',
        ]);

        try {
            $content = $this->mcpService->readResource($validated['params']['uri']);

            return response()->json([
                'jsonrpc' => '2.0',
                'result' => [
                    'contents' => [
                        [
                            'uri' => $validated['params']['uri'],
                            'mimeType' => 'text/plain',
                            'text' => $content,
                        ],
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'jsonrpc' => '2.0',
                'error' => [
                    'code' => -32602,
                    'message' => 'Resource not found',
                ],
            ], 404);
        }
    }

    /**
     * POST /api/mcp/sessions - Create MCP session
     */
    public function createSession(Request $request)
    {
        $this->middleware('auth')->handle($request, fn() => null);

        $session = $this->mcpService->createSession(
            Auth::user(),
            $request->ip(),
            $request->userAgent()
        );

        return response()->json([
            'data' => [
                'session_id' => $session->session_token,
                'expires_at' => $session->expires_at->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * POST /api/mcp/sessions/{session}/validate - Validate MCP session
     */
    public function validateSession(Request $request, MCPSession $session)
    {
        $isValid = $this->mcpService->validateSession($session);

        return response()->json([
            'valid' => $isValid,
            'expires_at' => $isValid ? $session->expires_at->toIso8601String() : null,
        ]);
    }

    /**
     * DELETE /api/mcp/sessions/{session} - Revoke MCP session
     */
    public function revokeSession(MCPSession $session)
    {
        $session->update(['revoked_at' => now()]);

        return response()->json(['message' => 'Session revoked']);
    }

    /**
     * GET /api/mcp/servers - List MCP server configurations
     */
    public function serversList()
    {
        $this->middleware('auth')->handle(request(), fn() => null);

        $servers = MCPServerConfig::where('created_by', Auth::id())
            ->select('id', 'name', 'description', 'endpoint', 'status', 'created_at')
            ->get();

        return response()->json(['data' => $servers]);
    }

    /**
     * POST /api/mcp/servers - Register MCP server
     */
    public function registerServer(Request $request)
    {
        $this->middleware('auth')->handle($request, fn() => null);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'endpoint' => 'required|url',
            'api_key' => 'nullable|string',
        ]);

        $server = MCPServerConfig::create([
            'created_by' => Auth::id(),
            'name' => $validated['name'],
            'description' => $validated['description'],
            'endpoint' => $validated['endpoint'],
            'api_key' => $validated['api_key'],
            'status' => 'inactive',
        ]);

        return response()->json(['data' => $server], 201);
    }

    /**
     * PUT /api/mcp/servers/{server} - Update MCP server configuration
     */
    public function updateServer(Request $request, MCPServerConfig $server)
    {
        $this->authorize('update', $server);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'endpoint' => 'url',
            'api_key' => 'nullable|string',
        ]);

        $server->update($validated);

        return response()->json(['data' => $server]);
    }

    /**
     * POST /api/mcp/servers/{server}/test - Test MCP server connection
     */
    public function testConnection(MCPServerConfig $server)
    {
        $this->authorize('update', $server);

        try {
            $isConnected = $this->mcpService->testServerConnection($server);

            $server->update(['status' => $isConnected ? 'active' : 'inactive']);

            return response()->json([
                'connected' => $isConnected,
                'status' => $server->status,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'connected' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * GET /api/mcp/logs - Get MCP operation logs
     */
    public function logs(Request $request)
    {
        $this->middleware('auth')->handle($request, fn() => null);

        $logs = $this->mcpService->getLogs(Auth::user(), $request->query('limit', 100));

        return response()->json(['data' => $logs]);
    }

    /**
     * POST /api/mcp/initialize - Initialize MCP server for use
     */
    public function initialize(Request $request)
    {
        $this->validateMCPSession($request);

        $config = $this->mcpService->initializeServer();

        return response()->json([
            'jsonrpc' => '2.0',
            'result' => [
                'protocolVersion' => '1.0',
                'capabilities' => [
                    'tools' => true,
                    'resources' => true,
                    'logging' => true,
                ],
                'serverInfo' => [
                    'name' => 'Rhea MCP Server',
                    'version' => '1.0.0',
                ],
            ],
        ]);
    }

    /**
     * Validate MCP session from request header
     */
    protected function validateMCPSession(Request $request)
    {
        $token = $request->bearerToken() ?? $request->header('X-MCP-Session');

        if (!$token) {
            abort(401, 'No MCP session token provided');
        }

        $session = $this->mcpService->findValidSession($token);

        if (!$session) {
            abort(401, 'Invalid or expired MCP session');
        }

        $request->setUserResolver(fn() => $session->user);
    }
}
