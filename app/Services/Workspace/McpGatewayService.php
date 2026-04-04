<?php

namespace App\Services\Workspace;

use App\Models\User;
use App\Models\Workspace\Project;
use App\Models\Workspace\ProjectMcpLog;
use App\Models\Workspace\ProjectMcpResource;
use App\Models\Workspace\ProjectMcpServer;
use App\Models\Workspace\ProjectMcpSession;
use Illuminate\Support\Str;

class McpGatewayService
{
    public function __construct(
        protected BillingGateService $billingGate,
        protected ToolRegistryService $tools,
    ) {
    }

    public function listServers(Project $project)
    {
        return $project->mcpServers()->orderBy('created_at')->get();
    }

    public function createServer(Project $project, User $user, array $data): ProjectMcpServer
    {
        $gate = $this->billingGate->canAttachMcpServer($project, $user);
        abort_unless($gate['allowed'], 422, $gate['reason']);

        return ProjectMcpServer::create([
            'project_id' => $project->id,
            'created_by' => $user->id,
            'name' => $data['name'],
            'slug' => $data['slug'] ?? Str::slug($data['name']),
            'type' => $data['type'] ?? 'external',
            'endpoint' => $data['endpoint'] ?? null,
            'auth_type' => $data['auth_type'] ?? 'none',
            'auth_config' => $data['auth_config'] ?? [],
            'capabilities' => $data['capabilities'] ?? ['tools' => true, 'resources' => true],
            'status' => $data['status'] ?? 'active',
        ]);
    }

    public function initialize(Project $project): array
    {
        return [
            'protocolVersion' => '1.0.0',
            'capabilities' => [
                'tools' => true,
                'resources' => true,
                'logging' => true,
            ],
            'serverInfo' => [
                'name' => $project->title . ' Workspace MCP',
                'version' => '1.0.0',
            ],
        ];
    }

    public function createSession(Project $project, User $user, array $capabilitiesRequested = [], ?ProjectMcpServer $server = null): ProjectMcpSession
    {
        return ProjectMcpSession::create([
            'project_id' => $project->id,
            'project_mcp_server_id' => $server?->id,
            'created_by' => $user->id,
            'session_token' => Str::random(64),
            'status' => 'active',
            'capabilities_requested' => $capabilitiesRequested,
            'capabilities_offered' => [
                'tools' => true,
                'resources' => true,
                'logging' => true,
            ],
            'expires_at' => now()->addHours(24),
            'last_used_at' => now(),
        ]);
    }

    public function listTools(Project $project, ProjectMcpSession $session): array
    {
        $session->update(['last_used_at' => now()]);

        return [
            'tools' => $project->tools()->where('status', 'active')->get()->map(function ($tool) {
                return [
                    'name' => $tool->slug,
                    'description' => $tool->description,
                    'inputSchema' => $tool->input_schema ?? ['type' => 'object', 'properties' => []],
                ];
            })->values()->all(),
        ];
    }

    public function callTool(Project $project, ProjectMcpSession $session, User $user, string $toolName, array $arguments): array
    {
        $session->update(['last_used_at' => now()]);
        $tool = $project->tools()->where('slug', $toolName)->firstOrFail();
        $result = $this->tools->execute($project, $tool, $arguments);
        $billing = $this->billingGate->recordUsage($project, $user, 'mcp_tool_call', 1, ['tool' => $toolName]);

        $this->log($project, $session, $user, 'tools/call', $toolName, $arguments, $result, 'success', $billing['amount']);

        return [
            'content' => [[
                'type' => 'text',
                'text' => json_encode($result),
            ]],
        ];
    }

    public function listResources(Project $project, ProjectMcpSession $session): array
    {
        $session->update(['last_used_at' => now()]);

        return [
            'resources' => ProjectMcpResource::query()
                ->where('project_id', $project->id)
                ->get()
                ->map(fn (ProjectMcpResource $resource) => [
                    'uri' => $resource->uri,
                    'name' => $resource->name,
                    'mimeType' => $resource->mime_type,
                ])->values()->all(),
        ];
    }

    public function readResource(Project $project, ProjectMcpSession $session, User $user, string $uri): array
    {
        $session->update(['last_used_at' => now()]);
        $resource = ProjectMcpResource::query()
            ->where('project_id', $project->id)
            ->where('uri', $uri)
            ->firstOrFail();

        $response = [
            'contents' => [[
                'uri' => $resource->uri,
                'mimeType' => $resource->mime_type,
                'text' => $resource->contents ?? '',
            ]],
        ];

        $billing = $this->billingGate->recordUsage($project, $user, 'mcp_resource_read', 1, ['uri' => $uri]);
        $this->log($project, $session, $user, 'resources/read', $uri, ['uri' => $uri], $response, 'success', $billing['amount']);

        return $response;
    }

    public function validateSession(Project $project, string $token): ?ProjectMcpSession
    {
        return ProjectMcpSession::query()
            ->where('project_id', $project->id)
            ->where('session_token', $token)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->first();
    }

    public function revokeSession(ProjectMcpSession $session): void
    {
        $session->update(['status' => 'revoked']);
    }

    protected function log(
        Project $project,
        ProjectMcpSession $session,
        User $user,
        string $method,
        ?string $target,
        array $request,
        array $response,
        string $status,
        float $billedUnits = 0
    ): void {
        ProjectMcpLog::create([
            'project_id' => $project->id,
            'project_mcp_server_id' => $session->project_mcp_server_id,
            'project_mcp_session_id' => $session->id,
            'created_by' => $user->id,
            'method' => $method,
            'target' => $target,
            'request_payload' => $request,
            'response_payload' => $response,
            'status' => $status,
            'billed_units' => $billedUnits,
        ]);
    }
}
