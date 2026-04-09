<?php

namespace App\Services\Widget;

use App\Models\WidgetConfig;
use App\Models\WidgetTool;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class WidgetToolService
{
    public function __construct(
        private readonly WidgetToolExecutionContext $context
    ) {
    }

    public function prepareToolsForWidget(WidgetConfig $widget): array
    {
        $tools = [];
        $handlers = [];

        $widget->loadMissing('tools');

        foreach ($widget->tools->where('is_active', true) as $tool) {
            if ($tool->tool_type === 'http') {
                $functionName = $this->makeFunctionName('widget', $tool->id, $tool->name);
                $tools[] = $this->toToolSchema($functionName, $tool->description, $tool->parameters);
                $handlers[$functionName] = fn (array $arguments): array => $this->executeHttpTool($tool, $arguments);
                continue;
            }

            if ($tool->tool_type === 'mcp_server') {
                foreach ($this->discoverMcpTools($tool) as $definition) {
                    $tools[] = $definition['schema'];
                    $handlers[$definition['function_name']] = fn (array $arguments): array => $this->executeMcpTool(
                        $tool,
                        $definition['remote_name'],
                        $arguments
                    );
                }
            }
        }

        $this->context->activate($handlers);

        return $tools;
    }

    public function clearContext(): void
    {
        $this->context->clear();
    }

    private function discoverMcpTools(WidgetTool $server): array
    {
        try {
            $this->initializeMcp($server);
            $response = $this->callMcpMethod($server, 'tools/list');
            $remoteTools = data_get($response, 'result.tools', []);

            if (! is_array($remoteTools)) {
                return [];
            }

            $definitions = [];

            foreach ($remoteTools as $remoteTool) {
                $remoteName = (string) ($remoteTool['name'] ?? '');

                if ($remoteName === '') {
                    continue;
                }

                $functionName = $this->makeFunctionName('mcp', $server->id, $remoteName);
                $definitions[] = [
                    'function_name' => $functionName,
                    'remote_name' => $remoteName,
                    'schema' => $this->toToolSchema(
                        $functionName,
                        (string) ($remoteTool['description'] ?? $server->description),
                        $remoteTool['inputSchema'] ?? ['type' => 'object', 'properties' => new \stdClass()]
                    ),
                ];
            }

            return $definitions;
        } catch (\Throwable $e) {
            Log::warning('Widget MCP discovery failed', [
                'tool_id' => $server->id,
                'endpoint' => $server->endpoint_url,
                'error' => $e->getMessage(),
            ]);

            return [];
        }
    }

    private function executeHttpTool(WidgetTool $tool, array $arguments): array
    {
        $this->assertSafeUrl($tool->endpoint_url);

        $method = strtoupper($tool->method ?: 'GET');
        $headers = $this->sanitizeHeaders($tool->headers ?? []);
        $client = Http::timeout(10)->withoutRedirecting()->acceptJson()->withHeaders($headers);

        $response = match ($method) {
            'GET' => $client->get($tool->endpoint_url, $arguments),
            'DELETE' => $client->send('DELETE', $tool->endpoint_url, ['query' => $arguments]),
            default => $client->send($method, $tool->endpoint_url, ['json' => $arguments]),
        };

        $response->throw();

        return [
            'status' => $response->status(),
            'body' => $this->normalizeResponseBody($response->body(), $response->header('Content-Type')),
            'headers' => collect($response->headers())->map(fn (array $values) => implode(', ', $values))->all(),
        ];
    }

    private function executeMcpTool(WidgetTool $tool, string $remoteName, array $arguments): array
    {
        $this->initializeMcp($tool);
        $response = $this->callMcpMethod($tool, 'tools/call', [
            'name' => $remoteName,
            'arguments' => $arguments,
        ]);

        return data_get($response, 'result', $response);
    }

    private function initializeMcp(WidgetTool $tool): void
    {
        $this->callMcpMethod($tool, 'initialize', [
            'protocolVersion' => '2025-03-26',
            'capabilities' => (object) [],
            'clientInfo' => [
                'name' => 'Kwati Widget',
                'version' => '1.0.0',
            ],
        ]);
    }

    private function callMcpMethod(WidgetTool $tool, string $method, array $params = []): array
    {
        $this->assertSafeUrl($tool->endpoint_url);

        $payload = [
            'jsonrpc' => '2.0',
            'id' => (string) Str::uuid(),
            'method' => $method,
            'params' => (object) $params,
        ];

        $response = Http::timeout(15)
            ->withoutRedirecting()
            ->withHeaders($this->sanitizeHeaders($tool->headers ?? []))
            ->accept('application/json, text/event-stream')
            ->post($tool->endpoint_url, $payload);

        $response->throw();

        $contentType = strtolower((string) $response->header('Content-Type'));

        if (str_contains($contentType, 'text/event-stream')) {
            return $this->parseSseJsonResponse($response->body());
        }

        $json = $response->json();

        if (isset($json['error'])) {
            throw new \RuntimeException((string) data_get($json, 'error.message', 'Remote MCP server error'));
        }

        return is_array($json) ? $json : ['result' => $json];
    }

    private function parseSseJsonResponse(string $body): array
    {
        $frames = preg_split("/\r?\n\r?\n/", trim($body)) ?: [];
        $payload = null;

        foreach ($frames as $frame) {
            foreach (preg_split("/\r?\n/", $frame) ?: [] as $line) {
                if (! str_starts_with($line, 'data:')) {
                    continue;
                }

                $candidate = trim(substr($line, 5));
                if ($candidate === '' || $candidate === '[DONE]') {
                    continue;
                }

                $decoded = json_decode($candidate, true);
                if (is_array($decoded)) {
                    $payload = $decoded;
                }
            }
        }

        if (! is_array($payload)) {
            throw new \RuntimeException('Remote MCP server returned an invalid SSE payload.');
        }

        if (isset($payload['error'])) {
            throw new \RuntimeException((string) data_get($payload, 'error.message', 'Remote MCP server error'));
        }

        return $payload;
    }

    private function toToolSchema(string $functionName, string $description, ?array $parameters = null): array
    {
        return [
            'type' => 'function',
            'function' => [
                'name' => $functionName,
                'description' => $description,
                'parameters' => $parameters ?: [
                    'type' => 'object',
                    'properties' => new \stdClass(),
                ],
            ],
        ];
    }

    private function sanitizeHeaders(array $headers): array
    {
        return collect($headers)
            ->mapWithKeys(function ($value, $key) {
                $header = trim((string) $key);
                if ($header === '' || strcasecmp($header, 'Host') === 0) {
                    return [];
                }

                return [$header => (string) $value];
            })
            ->all();
    }

    private function normalizeResponseBody(string $body, ?string $contentType): mixed
    {
        if ($contentType && str_contains(strtolower($contentType), 'application/json')) {
            return json_decode($body, true) ?? Str::limit($body, 12000, '');
        }

        return Str::limit(trim($body), 12000, '');
    }

    private function makeFunctionName(string $prefix, string $id, string $name): string
    {
        $slug = strtolower(preg_replace('/[^a-zA-Z0-9_]+/', '_', $name) ?: 'tool');
        return substr($prefix . '_' . str_replace('-', '', $id) . '_' . trim($slug, '_'), 0, 64);
    }

    private function assertSafeUrl(string $url): void
    {
        $parts = parse_url($url);

        if (($parts['scheme'] ?? '') !== 'https') {
            throw new \RuntimeException('Only HTTPS tool endpoints are allowed.');
        }

        $host = strtolower((string) ($parts['host'] ?? ''));

        if ($host === '' || in_array($host, ['localhost', '127.0.0.1', '::1'], true) || str_ends_with($host, '.local')) {
            throw new \RuntimeException('Private or local endpoints are not allowed.');
        }

        $addresses = gethostbynamel($host) ?: [];

        if ($addresses === []) {
            throw new \RuntimeException('Could not resolve the tool host.');
        }

        foreach ($addresses as $address) {
            $isPublic = filter_var(
                $address,
                FILTER_VALIDATE_IP,
                FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
            );

            if (! $isPublic) {
                throw new \RuntimeException('Private or reserved network targets are not allowed.');
            }
        }
    }
}
