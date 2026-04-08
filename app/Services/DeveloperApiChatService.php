<?php

namespace App\Services;

use App\Models\ApiModel;
use App\Models\DeveloperApiKey;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class DeveloperApiChatService
{
    public function __construct(
        private readonly HttpFactory $http,
        private readonly DeveloperApiBillingService $billingService,
    ) {
    }

    public function listModels()
    {
        return ApiModel::query()
            ->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('model_type')->orWhere('model_type', 'text'))
            ->orderBy('public_id')
            ->get();
    }

    public function complete(DeveloperApiKey $apiKey, array $payload, string $endpoint = '/v1/chat/completions'): array
    {
        $model = ApiModel::query()
            ->where('public_id', $payload['model'] ?? '')
            ->where('is_active', true)
            ->first();

        if (!$model) {
            throw new \InvalidArgumentException('The model `' . ($payload['model'] ?? '') . '` does not exist.');
        }

        if (!$apiKey->allowsModel($model->public_id)) {
            throw new \InvalidArgumentException('This API key does not have access to the requested model.');
        }

        $messages = $this->normalizeMessages($payload['messages'] ?? []);
        if ($messages === []) {
            throw new \InvalidArgumentException('At least one message is required.');
        }

        $maxTokens = (int) ($payload['max_tokens'] ?? config('developer-api.default_max_tokens'));

        $estimatedInput = $this->billingService->estimateTokens($messages);
        $estimatedOutput = max(1, $maxTokens);
        $estimatedCost = $this->billingService->estimateRequestCost($model, $estimatedInput, $estimatedOutput);

        $this->billingService->ensureSufficientBalance($apiKey->user, $estimatedCost);

        [$baseUrl, $upstreamKey] = $this->resolveUpstreamCredentials($model);

        $upstreamPayload = array_filter([
            'model' => $model->upstream_model,
            'messages' => $this->injectBrandSystemPrompt($messages),
            'temperature' => $payload['temperature'] ?? null,
            'top_p' => $payload['top_p'] ?? null,
            'max_tokens' => $maxTokens,
            'stream' => false,
            'user' => isset($payload['user']) ? hash('sha256', (string) $payload['user']) : null,
        ], fn ($value) => $value !== null);

        try {
            $response = $this->http
                ->withToken($upstreamKey)
                ->acceptJson()
                ->timeout(120)
                ->when(!app()->isProduction(), fn ($r) => $r->withoutVerifying())
                ->post(rtrim($baseUrl, '/') . '/chat/completions', $upstreamPayload)
                ->throw();
        } catch (RequestException $exception) {
            throw new \RuntimeException('Upstream model request failed.');
        }

        $upstreamJson = $response->json();
        $content = Arr::get($upstreamJson, 'choices.0.message.content');
        if (!is_string($content)) {
            throw new \RuntimeException('Unexpected upstream response format.');
        }

        $usage = Arr::get($upstreamJson, 'usage');
        $isEstimated = !is_array($usage);
        $usageData = [
            'input_tokens' => (int) ($usage['prompt_tokens'] ?? $estimatedInput),
            'output_tokens' => (int) ($usage['completion_tokens'] ?? $this->billingService->estimateTokens($content)),
        ];

        $requestId = 'chatcmpl-' . Str::lower(Str::random(24));

        $usageRecord = $this->billingService->recordUsageAndDebit(
            $apiKey,
            $model,
            $usageData,
            $endpoint,
            [
                'model' => $model->public_id,
                'messages' => $payload['messages'] ?? [],
                'temperature' => $payload['temperature'] ?? null,
                'top_p' => $payload['top_p'] ?? null,
                'max_tokens' => $maxTokens,
                'stream' => (bool) ($payload['stream'] ?? false),
            ],
            [
                'upstream_object' => Arr::get($upstreamJson, 'object'),
                'finish_reason' => Arr::get($upstreamJson, 'choices.0.finish_reason', 'stop'),
            ],
            $isEstimated,
            'success',
            null,
            request()->ip(),
            request()->userAgent(),
            $requestId
        );

        return [
            'request_id' => $requestId,
            'content' => $content,
            'finish_reason' => Arr::get($upstreamJson, 'choices.0.finish_reason', 'stop'),
            'model' => $model,
            'usage' => [
                'prompt_tokens' => $usageRecord->input_tokens,
                'completion_tokens' => $usageRecord->output_tokens,
                'total_tokens' => $usageRecord->total_tokens,
            ],
            'cost_usd' => (float) $usageRecord->cost_usd,
        ];
    }

    private function resolveUpstreamCredentials(ApiModel $model): array
    {
        $provider = strtolower((string) $model->upstream_provider);

        return match (true) {
            str_contains($provider, 'deepseek') => [
                env('DEEPSEEK_API_BASE_URL', 'https://api.deepseek.com/v1'),
                env('DEEPSEEK_API_KEY', ''),
            ],
            str_contains($provider, 'openai') => [
                env('OPENAI_API_BASE_URL', 'https://api.openai.com/v1'),
                env('OPENAI_API_KEY', ''),
            ],
            default => [
                (string) config('developer-api.upstream.base_url', 'https://api.x.ai/v1'),
                (string) config('developer-api.upstream.api_key', ''),
            ],
        };
    }

    private function normalizeMessages(array $messages): array
    {
        return collect($messages)
            ->filter(fn ($msg) => is_array($msg) && isset($msg['role'], $msg['content']))
            ->map(fn ($msg) => [
                'role' => $msg['role'],
                'content' => is_string($msg['content'])
                    ? $msg['content']
                    : json_encode($msg['content'], JSON_UNESCAPED_UNICODE),
            ])
            ->values()
            ->all();
    }

    private function injectBrandSystemPrompt(array $messages): array
    {
        $systemMessages = collect($messages)->where('role', 'system')->pluck('content')->filter()->all();
        $nonSystemMessages = collect($messages)->reject(fn ($msg) => $msg['role'] === 'system')->values()->all();

        $systemPrompt = trim((string) config('developer-api.brand_system_prompt'));
        if ($systemMessages !== []) {
            $systemPrompt .= "\n\nAdditional system instructions:\n" . implode("\n", $systemMessages);
        }

        array_unshift($nonSystemMessages, [
            'role' => 'system',
            'content' => $systemPrompt,
        ]);

        return $nonSystemMessages;
    }
}
