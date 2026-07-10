<?php

namespace App\Http\Controllers\Api\V2;

use App\Domain\AdsV2\Services\DeliveryRankingService;
use App\Http\Controllers\Controller;
use App\Models\AdsV2\AdDelivery;
use App\Models\AdsV2\AdPlacement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use Throwable;

class AdsDeliveryController extends Controller
{
    private const BASELINE_PLACEMENTS_CACHE_KEY = 'ads:v2:baseline-placements-ready';
    private const MAX_CONTEXT_KEYS = 48;
    private const MAX_VIEWER_KEYS = 32;
    private const MAX_DEVICE_KEYS = 32;
    private const MAX_NESTED_DEPTH = 4;
    private const MAX_NESTED_ITEMS = 24;
    private const MAX_STRING_LENGTH = 255;

    public function __construct(private readonly DeliveryRankingService $rankingService) {}

    public function request(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'surface' => 'required|in:feed,moments,profile',
            'slot' => 'required|string|max:100',
            'session_id' => 'required|string|max:128',
            'count' => 'nullable|integer|min:1|max:20',
            'allow_repeat_creative' => 'nullable|boolean',
            'context' => 'nullable|array|max:' . self::MAX_CONTEXT_KEYS,
            'viewer' => 'nullable|array|max:' . self::MAX_VIEWER_KEYS,
            'device' => 'nullable|array|max:' . self::MAX_DEVICE_KEYS,
            'exclude_creative_ids' => 'nullable|array|max:100',
            'exclude_creative_ids.*' => 'uuid',
        ]);

        $validated = $this->normalizeValidatedPayload($validated);

        try {
            $count = (int) ($validated['count'] ?? 1);
            if ($count > 1) {
                return response()->json($this->buildBatchDeliveryPayload($request, $validated, $count));
            }

            return response()->json($this->buildSingleDeliveryPayload($request, $validated));
        } catch (Throwable $exception) {
            report($exception);

            return response()->json(array_merge(
                $this->emptyDeliveryPayload(),
                [
                    'message' => 'Ad delivery is temporarily unavailable.',
                    'error' => 'delivery_unavailable',
                ],
            ));
        }
    }

    private function buildBatchDeliveryPayload(Request $request, array $validated, int $count): array
    {
        $targetCount = max(1, min(20, $count));
        $items = [];
        $allowRepeatCreative = (bool) ($validated['allow_repeat_creative'] ?? false);
        $baseExcludeCreativeIds = array_values(array_filter((array) ($validated['exclude_creative_ids'] ?? [])));
        $excludeCreativeIds = $baseExcludeCreativeIds;
        $baseSessionId = (string) $validated['session_id'];

        $maxAttempts = max(8, $targetCount * 3);
        $misses = 0;
        for ($attempt = 1; $attempt <= $maxAttempts && count($items) < $targetCount; $attempt++) {
            $attemptPayload = $validated;
            $attemptPayload['exclude_creative_ids'] = $allowRepeatCreative
                ? $baseExcludeCreativeIds
                : array_values(array_unique($excludeCreativeIds));
            $attemptPayload['session_id'] = $this->sessionIdForAttempt($baseSessionId, $attempt);

            $item = $this->buildSingleDeliveryPayload($request, $attemptPayload);
            $creativeId = (string) ($item['creative']['id'] ?? '');
            $deliveryId = (string) ($item['delivery_id'] ?? '');
            if ($deliveryId === '') {
                $misses += 1;
                if ($misses >= 4) {
                    break;
                }
                continue;
            }

            if (! $allowRepeatCreative && $creativeId !== '') {
                $excludeCreativeIds[] = $creativeId;
            }
            $items[] = $item;
            $misses = 0;
        }

        return [
            'items' => $items,
            'count' => count($items),
        ];
    }

    private function buildSingleDeliveryPayload(Request $request, array $validated): array
    {
        [$placement, $selected] = $this->resolvePlacementAndCreative($request, $validated);
        if (! $placement) {
            return $this->emptyDeliveryPayload();
        }

        $sourceType = 'internal';
        $renderMode = 'internal_asset';
        $creativePayload = null;
        $campaignId = null;
        $creativeId = null;
        $score = 0;
        $recoMeta = null;

        if ($selected) {
            $creative = $selected['creative'];
            $campaignId = $selected['campaign']->id;
            $creativeId = $creative->id;
            $score = (float) $selected['score'];
            $creativePayload = [
                'id' => $creative->id,
                'title' => $creative->title,
                'description' => $creative->description,
                'media_url' => $this->publicMediaUrl($creative->media_url),
                'media_type' => $creative->media_type,
                'target_url' => $creative->target_url,
                'external_payload' => $creative->external_payload,
            ];
            $renderMode = $creative->render_mode;
            $sourceType = $creative->source_type;
            $recoMeta = [
                'score' => $score,
                'top_features' => $selected['breakdown'] ?? [],
                'fallback_used' => $selected['fallback_used'] ?? null,
            ];
        } elseif ($this->allowsExternalFallback($validated) && $placement->adapter && in_array($placement->source_type, ['external', 'mixed'], true)) {
            $sourceType = 'external';
            $renderMode = $placement->adapter->adapter_type;
            $creativePayload = [
                'title' => $placement->name,
                'description' => 'External ad adapter fallback',
                'external_payload' => $placement->adapter->config,
                'target_url' => $placement->adapter->config['target_url'] ?? null,
            ];
        } else {
            return $this->emptyDeliveryPayload($placement);
        }

        $delivery = AdDelivery::create([
            'placement_id' => $placement->id,
            'campaign_id' => $campaignId,
            'creative_id' => $creativeId,
            'viewer_user_id' => $request->user()?->id,
            'source_type' => $sourceType,
            'status' => 'served',
            'score' => $score,
            'session_id' => $validated['session_id'],
            'fingerprint' => $this->fingerprint($request, $validated['session_id']),
            'served_at' => now(),
            'expires_at' => now()->addMinutes(15),
        ]);

        $signature = hash_hmac('sha256', $delivery->id . '|' . $validated['session_id'], (string) config('app.key'));
        $delivery->signature = $signature;
        $delivery->save();

        return [
            'delivery_id' => $delivery->id,
            'creative' => $creativePayload,
            'tracking' => [
                'signature' => $signature,
                'session_id' => $validated['session_id'],
                'expires_at' => optional($delivery->expires_at)->toIso8601String(),
            ],
            'landing' => [
                'target_url' => $creativePayload['target_url'] ?? null,
            ],
            'render_mode' => $renderMode,
            'source_type' => $sourceType,
            'status' => $delivery->status,
            'reco' => $this->shouldExposeRecoDebug() ? $recoMeta : null,
            'placement' => [
                'surface' => $placement->surface,
                'slot' => $placement->slot,
            ],
        ];
    }

    /**
     * Try requested slot first, then progressively fall back to other active placements.
     *
     * @return array{0: ?AdPlacement, 1: ?array}
     */
    private function resolvePlacementAndCreative(Request $request, array $validated): array
    {
        $this->ensureBaselinePlacements();

        $placements = AdPlacement::query()
            ->with('adapter')
            ->where('status', true)
            ->get()
            ->sortBy(function (AdPlacement $placement) use ($validated) {
                if ($placement->surface === $validated['surface'] && $placement->slot === $validated['slot']) {
                    return 0;
                }

                if ($placement->surface === $validated['surface']) {
                    return 1;
                }

                return 2;
            })
            ->values();

        if ($placements->isEmpty()) {
            return [null, null];
        }

        $viewerPayload = array_merge($validated['viewer'] ?? [], [
            'id' => $request->user()?->id,
        ]);
        $devicePayload = $validated['device'] ?? [];
        $requestedContext = $validated['context'] ?? [];
        $excludeCreativeIds = array_values(array_filter((array) ($validated['exclude_creative_ids'] ?? [])));

        foreach ($placements as $candidatePlacement) {
            $selected = $this->rankingService->selectCreative($candidatePlacement, [
                'surface' => $candidatePlacement->surface,
                'slot' => $candidatePlacement->slot,
                'context' => array_merge($requestedContext, [
                    'requested_surface' => $validated['surface'],
                    'requested_slot' => $validated['slot'],
                ]),
                'viewer' => $viewerPayload,
                'device' => $devicePayload,
                'exclude_creative_ids' => $excludeCreativeIds,
            ]);

            if ($selected) {
                return [$candidatePlacement, $selected];
            }
        }

        $fallbackPlacement = $placements->first();
        if ($fallbackPlacement instanceof AdPlacement) {
            $hardFallback = $this->rankingService->selectAnyCreative($fallbackPlacement, [
                'exclude_creative_ids' => $excludeCreativeIds,
            ]);

            if ($hardFallback) {
                return [$fallbackPlacement, $hardFallback];
            }
        }

        if (! $this->allowsExternalFallback($validated)) {
            return [$fallbackPlacement instanceof AdPlacement ? $fallbackPlacement : null, null];
        }

        $externalFallback = $placements->first(function (AdPlacement $candidatePlacement) {
            return $candidatePlacement->adapter
                && in_array($candidatePlacement->source_type, ['external', 'mixed'], true);
        });

        if ($externalFallback instanceof AdPlacement) {
            return [$externalFallback, null];
        }

        return [$fallbackPlacement instanceof AdPlacement ? $fallbackPlacement : null, null];
    }

    private function ensureBaselinePlacements(): void
    {
        if (Cache::get(self::BASELINE_PLACEMENTS_CACHE_KEY)) {
            return;
        }

        $defaults = [
            ['name' => 'Feed Main', 'surface' => 'feed', 'slot' => 'main', 'source_type' => 'mixed'],
            ['name' => 'Feed Following', 'surface' => 'feed', 'slot' => 'following', 'source_type' => 'mixed'],
            ['name' => 'Feed Mid-roll', 'surface' => 'feed', 'slot' => 'midroll', 'source_type' => 'mixed'],
            ['name' => 'Moments Main', 'surface' => 'moments', 'slot' => 'main', 'source_type' => 'mixed'],
            ['name' => 'Moments Mid-roll', 'surface' => 'moments', 'slot' => 'midroll', 'source_type' => 'mixed'],
            ['name' => 'Moments Story', 'surface' => 'moments', 'slot' => 'story', 'source_type' => 'mixed'],
            ['name' => 'Moments Rewarded', 'surface' => 'moments', 'slot' => 'rewarded', 'source_type' => 'internal'],
            ['name' => 'Profile Main', 'surface' => 'profile', 'slot' => 'main', 'source_type' => 'mixed'],
            ['name' => 'Profile Header', 'surface' => 'profile', 'slot' => 'header', 'source_type' => 'mixed'],
        ];

        foreach ($defaults as $placement) {
            $model = AdPlacement::firstOrCreate(
                ['surface' => $placement['surface'], 'slot' => $placement['slot']],
                [
                    'name' => $placement['name'],
                    'source_type' => $placement['source_type'],
                    'status' => true,
                ],
            );

            if (! $model->status) {
                $model->status = true;
                $model->save();
            }
        }

        Cache::put(self::BASELINE_PLACEMENTS_CACHE_KEY, true, now()->addMinutes(30));
    }

    private function fingerprint(Request $request, string $sessionId): string
    {
        return hash('sha256', implode('|', [
            $sessionId,
            (string) $request->ip(),
            (string) $request->userAgent(),
            (string) ($request->user()?->id ?? Str::uuid()),
        ]));
    }

    private function shouldExposeRecoDebug(): bool
    {
        return (bool) config('app.debug') && filter_var(env('RECO_DEBUG_RESPONSE', false), FILTER_VALIDATE_BOOLEAN);
    }

    private function allowsExternalFallback(array $validated): bool
    {
        $context = (array) ($validated['context'] ?? []);

        return filter_var($context['allow_external_fallback'] ?? false, FILTER_VALIDATE_BOOLEAN);
    }

    private function publicMediaUrl(?string $mediaUrl): ?string
    {
        if (! is_string($mediaUrl) || trim($mediaUrl) === '') {
            return $mediaUrl;
        }

        $mediaUrl = trim($mediaUrl);
        if (Str::startsWith($mediaUrl, '/storage/')) {
            return '/media/' . ltrim(Str::after($mediaUrl, '/storage/'), '/');
        }

        return $mediaUrl;
    }

    private function emptyDeliveryPayload(?AdPlacement $placement = null): array
    {
        return [
            'delivery_id' => null,
            'creative' => null,
            'tracking' => null,
            'landing' => [
                'target_url' => null,
            ],
            'render_mode' => null,
            'source_type' => null,
            'status' => 'empty',
            'message' => 'No eligible ad inventory.',
            'placement' => $placement ? [
                'surface' => $placement->surface,
                'slot' => $placement->slot,
            ] : null,
        ];
    }

    private function sessionIdForAttempt(string $sessionId, int $attempt): string
    {
        $suffix = '-b' . $attempt;
        $maxLength = 128;
        $baseLength = max(0, $maxLength - strlen($suffix));

        return substr($sessionId, 0, $baseLength) . $suffix;
    }

    private function normalizeValidatedPayload(array $validated): array
    {
        $validated['context'] = $this->sanitizeStructuredPayload(
            (array) ($validated['context'] ?? []),
            self::MAX_CONTEXT_KEYS,
        );
        $validated['viewer'] = $this->sanitizeStructuredPayload(
            (array) ($validated['viewer'] ?? []),
            self::MAX_VIEWER_KEYS,
        );
        $validated['device'] = $this->sanitizeStructuredPayload(
            (array) ($validated['device'] ?? []),
            self::MAX_DEVICE_KEYS,
        );
        $validated['exclude_creative_ids'] = array_values(array_slice(array_unique(array_filter(
            array_map(
                static fn ($id) => is_string($id) ? $id : '',
                (array) ($validated['exclude_creative_ids'] ?? []),
            ),
            static fn (string $id) => $id !== '',
        )), 0, 100));

        return $validated;
    }

    private function sanitizeStructuredPayload(array $payload, int $maxKeys): array
    {
        $limitedPayload = array_slice($payload, 0, $maxKeys, true);
        $sanitizedPayload = [];

        foreach ($limitedPayload as $key => $value) {
            if (! is_string($key) && ! is_int($key)) {
                continue;
            }

            $normalizedKey = is_string($key) ? substr($key, 0, 64) : $key;
            $sanitizedPayload[$normalizedKey] = $this->sanitizeStructuredValue($value, 1);
        }

        return $sanitizedPayload;
    }

    private function sanitizeStructuredValue(mixed $value, int $depth): mixed
    {
        if (is_array($value)) {
            if ($depth >= self::MAX_NESTED_DEPTH) {
                return [];
            }

            $limitedPayload = array_slice($value, 0, self::MAX_NESTED_ITEMS, true);
            $sanitizedPayload = [];
            foreach ($limitedPayload as $key => $nestedValue) {
                if (! is_string($key) && ! is_int($key)) {
                    continue;
                }

                $normalizedKey = is_string($key) ? substr($key, 0, 64) : $key;
                $sanitizedPayload[$normalizedKey] = $this->sanitizeStructuredValue($nestedValue, $depth + 1);
            }

            return $sanitizedPayload;
        }

        if (is_string($value)) {
            return mb_substr($value, 0, self::MAX_STRING_LENGTH);
        }

        if (is_int($value) || is_float($value) || is_bool($value) || $value === null) {
            return $value;
        }

        if (is_object($value) && method_exists($value, '__toString')) {
            return mb_substr((string) $value, 0, self::MAX_STRING_LENGTH);
        }

        return null;
    }
}
