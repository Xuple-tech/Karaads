<?php

namespace App\Http\Controllers\Api\Workspace;

use App\Http\Controllers\Controller;
use App\Models\Workspace\Project;
use App\Models\Workspace\ProjectMcpServer;
use App\Models\Workspace\ProjectMcpSession;
use App\Services\Workspace\McpGatewayService;
use App\Services\Workspace\ProjectWorkspaceService;
use Illuminate\Http\Request;

class McpController extends Controller
{
    public function __construct(
        protected ProjectWorkspaceService $workspace,
        protected McpGatewayService $mcp,
    ) {
    }

    public function servers(Request $request, Project $project)
    {
        $project = $this->workspace->viewableProject($project, $request->user());

        return response()->json([
            'data' => $this->mcp->listServers($project),
        ]);
    }

    public function registerServer(Request $request, Project $project)
    {
        $project = $this->workspace->collaborativeProject($project, $request->user());
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'type' => 'nullable|string|max:50',
            'endpoint' => 'nullable|url',
            'auth_type' => 'nullable|string|max:50',
            'auth_config' => 'nullable|array',
            'capabilities' => 'nullable|array',
            'status' => 'nullable|string|max:50',
        ]);

        return response()->json([
            'data' => $this->mcp->createServer($project, $request->user(), $validated),
        ], 201);
    }

    public function initialize(Request $request, Project $project)
    {
        $this->workspace->viewableProject($project, $request->user());

        return response()->json([
            'jsonrpc' => '2.0',
            'result' => $this->mcp->initialize($project),
        ]);
    }

    public function createSession(Request $request, Project $project)
    {
        $this->workspace->collaborativeProject($project, $request->user());
        $validated = $request->validate([
            'capabilities_requested' => 'nullable|array',
            'server_id' => 'nullable|string',
        ]);

        $server = null;
        if (!empty($validated['server_id'])) {
            $server = ProjectMcpServer::query()
                ->where('project_id', $project->id)
                ->findOrFail($validated['server_id']);
        }

        $session = $this->mcp->createSession(
            $project,
            $request->user(),
            $validated['capabilities_requested'] ?? [],
            $server
        );

        return response()->json([
            'data' => $session,
        ], 201);
    }

    public function toolsList(Request $request, Project $project)
    {
        $session = $this->resolveSession($project, $request);

        return response()->json([
            'jsonrpc' => '2.0',
            'result' => $this->mcp->listTools($project, $session),
        ]);
    }

    public function toolsCall(Request $request, Project $project)
    {
        $session = $this->resolveSession($project, $request);
        $validated = $request->validate([
            'params.name' => 'required|string',
            'params.arguments' => 'nullable|array',
        ]);

        return response()->json([
            'jsonrpc' => '2.0',
            'result' => $this->mcp->callTool(
                $project,
                $session,
                $request->user(),
                $validated['params']['name'],
                $validated['params']['arguments'] ?? []
            ),
        ]);
    }

    public function resourcesList(Request $request, Project $project)
    {
        $session = $this->resolveSession($project, $request);

        return response()->json([
            'jsonrpc' => '2.0',
            'result' => $this->mcp->listResources($project, $session),
        ]);
    }

    public function resourcesRead(Request $request, Project $project)
    {
        $session = $this->resolveSession($project, $request);
        $validated = $request->validate([
            'params.uri' => 'required|string',
        ]);

        return response()->json([
            'jsonrpc' => '2.0',
            'result' => $this->mcp->readResource(
                $project,
                $session,
                $request->user(),
                $validated['params']['uri']
            ),
        ]);
    }

    public function revokeSession(Request $request, Project $project, ProjectMcpSession $session)
    {
        $this->workspace->collaborativeProject($project, $request->user());
        abort_unless($session->project_id === $project->id, 404);

        $this->mcp->revokeSession($session);

        return response()->json(['message' => 'Session revoked.']);
    }

    protected function resolveSession(Project $project, Request $request): ProjectMcpSession
    {
        $token = $request->bearerToken() ?: $request->header('X-MCP-Session');
        abort_unless($token, 401, 'No MCP session token provided.');

        $session = $this->mcp->validateSession($project, $token);
        abort_unless($session !== null, 401, 'Invalid or expired MCP session.');

        return $session;
    }
}
