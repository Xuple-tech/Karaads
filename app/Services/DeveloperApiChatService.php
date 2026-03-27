<?php

namespace App\Services;

use App\Models\ApiModel;
use App\Models\DeveloperApiKey;
use Illuminate\Http\Client\ConnectionException;
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
            ->orderBy('model_type')
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
            throw new \InvalidArgumentException('Unsupported model.');
        }

        if (!$model->isTextModel()) {
            throw new \InvalidArgumentException('The requested model does not support chat completions.');
        }

        if (!$apiKey->allowsModel($model->public_id)) {
            throw new \InvalidArgumentException('This API key cannot access the requested model.');
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

        $upstreamPayload = array_filter([
            'model' => $model->upstream_model,
            'messages' => $this->injectBrandSystemPrompt($messages),
            'temperature' => $payload['temperature'] ?? null,
            'top_p' => $payload['top_p'] ?? null,
            'max_tokens' => $maxTokens,
            'stream' => false,
            'user' => $payload['user'] ?? null,
        ], fn ($value) => $value !== null);

        try {
            $response = $this->http
                ->withToken((string) config('developer-api.upstream.api_key'))
                ->acceptJson()
                ->timeout((int) config('developer-api.upstream.timeout', 60))
                ->connectTimeout((int) config('developer-api.upstream.connect_timeout', 15))
                ->withOptions([
                    'verify' => (bool) config('developer-api.upstream.verify_ssl', true),
                ])
                ->post(rtrim((string) config('developer-api.upstream.base_url'), '/') . '/chat/completions', $upstreamPayload)
                ->throw();
        } catch (ConnectionException $exception) {
            throw new \RuntimeException('Upstream model service is currently unavailable.');
        } catch (RequestException $exception) {
            throw new \RuntimeException('Upstream model request failed.');
        } catch (\Throwable $exception) {
            throw new \RuntimeException('Developer API request could not be completed.');
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

        $requestId = 'chatcmpl_' . Str::lower(Str::random(24));
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
                'user' => $payload['user'] ?? null,
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

    private function normalizeMessages(array $messages): array
    {
        return collect($messages)
            ->filter(fn ($message) => is_array($message) && isset($message['role'], $message['content']))
            ->map(fn ($message) => [
                'role' => $message['role'],
                'content' => is_string($message['content']) ? $message['content'] : json_encode($message['content'], JSON_UNESCAPED_UNICODE),
            ])
            ->values()
            ->all();
    }

    private function injectBrandSystemPrompt(array $messages): array
    {
        $systemMessages = collect($messages)->where('role', 'system')->pluck('content')->filter()->all();
        $nonSystemMessages = collect($messages)->reject(fn ($message) => $message['role'] === 'system')->values()->all();

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
