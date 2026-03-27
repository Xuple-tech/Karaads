<?php

namespace App\Services;

use App\Models\ApiModel;
use App\Models\DeveloperApiKey;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class DeveloperApiImageService
{
    public function __construct(
        private readonly HttpFactory $http,
        private readonly DeveloperApiBillingService $billingService,
    ) {
    }

    public function generate(DeveloperApiKey $apiKey, array $payload, string $endpoint = '/v1/images/generations'): array
    {
        $model = ApiModel::query()
            ->where('public_id', $payload['model'] ?? '')
            ->where('is_active', true)
            ->first();

        if (!$model) {
            throw new \InvalidArgumentException('Unsupported model.');
        }

        if (!$model->isImageModel()) {
            throw new \InvalidArgumentException('The requested model does not support image generation.');
        }

        if (!$apiKey->allowsModel($model->public_id)) {
            throw new \InvalidArgumentException('This API key cannot access the requested model.');
        }

        $imageCount = max(1, (int) ($payload['n'] ?? 1));
        $estimatedCost = $this->billingService->estimateImageCost($model, $imageCount);
        $this->billingService->ensureSufficientBalance($apiKey->user, $estimatedCost);

        $upstreamPayload = array_filter([
            'model' => $model->upstream_model,
            'prompt' => $payload['prompt'] ?? null,
            'n' => $imageCount,
            'size' => $payload['size'] ?? '1024x1024',
            'response_format' => $payload['response_format'] ?? 'b64_json',
        ], fn ($value) => $value !== null);

        try {
            $response = $this->http
                ->withToken((string) config('developer-api.upstream.api_key'))
                ->acceptJson()
                ->timeout((int) config('developer-api.upstream.timeout', 60))
                ->connectTimeout((int) config('developer-api.upstream.connect_timeout', 15))
                ->withOptions([
                    'verify' => (bool) config('developer-api.upstream.verify_ssl', false),
                ])
                ->post(rtrim((string) config('developer-api.upstream.base_url'), '/') . '/images/generations', $upstreamPayload)
                ->throw();
        } catch (ConnectionException $exception) {
            throw new \RuntimeException('Upstream image service is currently unavailable.');
        } catch (RequestException $exception) {
            throw new \RuntimeException('Upstream image request failed.');
        } catch (\Throwable $exception) {
            throw new \RuntimeException('Developer API image request could not be completed.');
        }

        $upstreamJson = $response->json();
        $images = Arr::get($upstreamJson, 'data');

        if (!is_array($images) || $images === []) {
            throw new \RuntimeException('Unexpected upstream image response format.');
        }

        $requestId = 'imggen_' . Str::lower(Str::random(24));
        $usageRecord = $this->billingService->recordUsageAndDebit(
            $apiKey,
            $model,
            [
                'input_tokens' => 0,
                'output_tokens' => 0,
            ],
            $endpoint,
            [
                'model' => $model->public_id,
                'prompt' => $payload['prompt'] ?? null,
                'n' => $imageCount,
                'size' => $payload['size'] ?? '1024x1024',
                'response_format' => $payload['response_format'] ?? 'b64_json',
            ],
            [
                'image_count' => count($images),
                'created' => Arr::get($upstreamJson, 'created'),
            ],
            false,
            'success',
            null,
            request()->ip(),
            request()->userAgent(),
            $requestId,
            $estimatedCost
        );

        return [
            'request_id' => $requestId,
            'model' => $model,
            'images' => $images,
            'created' => Arr::get($upstreamJson, 'created', now()->timestamp),
            'usage' => [
                'images' => count($images),
                'cost_usd' => (float) $usageRecord->cost_usd,
            ],
            'billing' => [
                'amount_charged_usd' => (float) $usageRecord->cost_usd,
                'currency' => 'USD',
            ],
        ];
    }
}
