<?php

namespace App\Http\Controllers\Api\V2;

use App\Domain\AdsV2\Services\AdPricingService;
use App\Http\Controllers\Controller;
use App\Models\AdsV2\AdCampaign;
use App\Models\AdsV2\AdCreative;
use App\Models\AdsV2\AdEvent;
use App\Models\AdsV2\AdPayment;
use App\Models\Post;
use App\Models\PostMedia;
use App\Services\Media\VideoDerivativeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class AdsCreativeController extends Controller
{
    private const MAX_CREATIVE_UPLOAD_KB = 10 * 1024 * 1024;

    public function __construct(
        private readonly VideoDerivativeService $videoDerivativeService,
        private readonly AdPricingService $pricing,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $campaignId = $request->query('campaign_id');

        $query = AdCreative::query()->with('campaign');

        if ($campaignId) {
            $query->where('campaign_id', $campaignId);
        } else {
            $query->whereHas('campaign', fn ($q) => $q->where('user_id', $request->user()?->id));
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'campaign_id' => 'required|uuid|exists:ad_campaigns_v2,id',
            'source_type' => 'required|in:internal,external',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'media' => 'nullable|file|max:' . self::MAX_CREATIVE_UPLOAD_KB . '|mimetypes:image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime',
            'media_url' => 'nullable|string|max:2048',
            'media_type' => 'nullable|in:image,video,html',
            'duration_seconds' => 'nullable|numeric|min:0|max:3600',
            'target_url' => 'nullable|url|max:2048',
            'render_mode' => 'required|in:internal_asset,script_tag,iframe_embed,server_response',
            'external_payload' => 'nullable|array',
        ]);

        $campaign = AdCampaign::findOrFail($validated['campaign_id']);
        if ($campaign->user_id !== $request->user()?->id) {
            abort(403, 'Unauthorized campaign access.');
        }

        $mediaPayload = $this->resolveMediaPayload($request, $validated, $campaign);
        $this->assertCreativeMediaMatchesCampaign($campaign, $mediaPayload['media_type'] ?? null);

        $creative = AdCreative::create([
            ...$validated,
            ...$mediaPayload,
            'status' => 'draft',
            'quality_score' => 1,
        ]);

        return response()->json([
            'message' => 'Creative created.',
            'creative' => $creative,
        ], 201);
    }

    public function update(Request $request, AdCreative $creative): JsonResponse
    {
        if ($creative->campaign?->user_id !== $request->user()?->id) {
            abort(403, 'Unauthorized creative access.');
        }

        $validated = $request->validate([
            'status' => 'sometimes|in:draft,in_review,paused',
            'source_type' => 'sometimes|in:internal,external',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'media' => 'nullable|file|max:' . self::MAX_CREATIVE_UPLOAD_KB . '|mimetypes:image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime',
            'media_url' => 'nullable|string|max:2048',
            'media_type' => 'nullable|in:image,video,html',
            'duration_seconds' => 'nullable|numeric|min:0|max:3600',
            'target_url' => 'nullable|url|max:2048',
            'render_mode' => 'sometimes|in:internal_asset,script_tag,iframe_embed,server_response',
            'external_payload' => 'nullable|array',
        ]);

        $mediaPayload = $this->resolveMediaPayload($request, $validated, $creative->campaign, $creative);
        $resolvedMediaType = $mediaPayload['media_type'] ?? $creative->media_type;
        $this->assertCreativeMediaMatchesCampaign($creative->campaign, $resolvedMediaType);

        unset($validated['media'], $validated['duration_seconds']);
        $updatePayload = [
            ...$validated,
            ...$mediaPayload,
        ];

        $requestKeys = collect(array_keys($request->except(['_token', '_method'])));
        $statusOnlyPause = $requestKeys->count() === 1
            && $requestKeys->contains('status')
            && $request->input('status') === 'paused';
        if (! $statusOnlyPause && $creative->isAdminApproved()) {
            $updatePayload['status'] = 'in_review';
            $updatePayload['approved_at'] = null;
            $updatePayload['approved_by'] = null;
            $updatePayload['rejected_at'] = null;
            $updatePayload['rejection_reason'] = null;
        }

        $creative->update($updatePayload);

        return response()->json([
            'message' => 'Creative updated.',
            'creative' => $creative->fresh(),
        ]);
    }

    public function show(Request $request, AdCreative $creative): JsonResponse
    {
        $campaign = $creative->campaign;

        if (! $campaign || $campaign->user_id !== $request->user()?->id) {
            abort(403, 'Unauthorized creative access.');
        }

        $impressions = AdEvent::where('creative_id', $creative->id)
            ->where('event_type', 'impression')
            ->count();

        $clicks = AdEvent::where('creative_id', $creative->id)
            ->where('event_type', 'click')
            ->count();

        $reach = AdEvent::where('creative_id', $creative->id)
            ->where('event_type', 'impression')
            ->whereRaw('COALESCE(viewer_user_id, fingerprint, session_id, ip_address) IS NOT NULL')
            ->selectRaw('COUNT(DISTINCT COALESCE(viewer_user_id, fingerprint, session_id, ip_address)) as aggregate')
            ->value('aggregate');

        $spend = (float) ($campaign->spent ?? 0);
        $budgetTotal = (float) ($campaign->budget_total ?? 0);
        $ctr = $impressions > 0 ? ($clicks / $impressions) * 100 : 0.0;
        $balanceRemaining = max(0, $budgetTotal - $spend);

        $wallet = $campaign->account?->wallet;

        $latestPayment = null;
        if ($wallet) {
            $latestPayment = AdPayment::where('ad_wallet_id', $wallet->id)
                ->where('meta->campaign_id', $campaign->id)
                ->latest()
                ->first();
        }

        return response()->json([
            'creative' => $creative->fresh(['campaign']),
            'campaign' => $campaign->fresh(),
            'metrics' => [
                'impressions' => $impressions,
                'clicks' => $clicks,
                'reach' => (int) $reach,
                'reach_today' => $this->reachToday($creative->id),
                'daily_reach' => $this->dailyReach($creative->id),
                'gender_breakdown' => $this->genderBreakdown($creative->id, (int) $reach),
                'ctr' => $ctr,
                'spend' => $spend,
                'budget_total' => $budgetTotal,
                'balance_remaining' => $balanceRemaining,
                'last_funded_at' => $campaign->last_funded_at,
            ],
            'wallet' => $wallet,
            'latest_payment' => $latestPayment,
        ]);
    }

    /**
     * @return array<int, array{date:string,label:string,reach:int,spend:float}>
     */
    private function dailyReach(string $creativeId): array
    {
        $start = now()->subDays(6)->startOfDay();
        $identity = $this->reachIdentityExpression();

        $rows = AdEvent::query()
            ->where('creative_id', $creativeId)
            ->where('event_type', 'impression')
            ->where('created_at', '>=', $start)
            ->whereRaw("{$identity} IS NOT NULL")
            ->selectRaw("DATE(created_at) as event_date, COUNT(DISTINCT {$identity}) as reach, SUM(CASE WHEN is_billable = 1 THEN billed_amount ELSE 0 END) as spend")
            ->groupByRaw('DATE(created_at)')
            ->get()
            ->keyBy('event_date');

        return collect(range(0, 6))
            ->map(function (int $offset) use ($rows, $start) {
                $date = $start->copy()->addDays($offset);
                $key = $date->toDateString();
                $row = $rows->get($key);

                return [
                    'date' => $key,
                    'label' => $date->format('D'),
                    'reach' => (int) ($row->reach ?? 0),
                    'spend' => (float) ($row->spend ?? 0),
                ];
            })
            ->values()
            ->all();
    }

    private function reachToday(string $creativeId): int
    {
        $identity = $this->reachIdentityExpression();

        return (int) AdEvent::query()
            ->where('creative_id', $creativeId)
            ->where('event_type', 'impression')
            ->whereDate('created_at', now()->toDateString())
            ->whereRaw("{$identity} IS NOT NULL")
            ->selectRaw("COUNT(DISTINCT {$identity}) as aggregate")
            ->value('aggregate');
    }

    /**
     * @return array{male:int,female:int,unknown:int,total:int}
     */
    private function genderBreakdown(string $creativeId, int $fallbackReach): array
    {
        $genderColumn = $this->genderColumn();
        if (! $genderColumn) {
            return ['male' => 0, 'female' => 0, 'unknown' => $fallbackReach, 'total' => $fallbackReach];
        }

        $identity = $this->reachIdentityExpression('ad_events_v2');
        $gender = "CASE
            WHEN ad_events_v2.viewer_user_id IS NULL THEN 'unknown'
            WHEN LOWER(users.{$genderColumn}) IN ('male', 'm', 'man') THEN 'male'
            WHEN LOWER(users.{$genderColumn}) IN ('female', 'f', 'woman') THEN 'female'
            ELSE 'unknown'
        END";

        $rows = AdEvent::query()
            ->leftJoin('users', 'users.id', '=', 'ad_events_v2.viewer_user_id')
            ->where('ad_events_v2.creative_id', $creativeId)
            ->where('ad_events_v2.event_type', 'impression')
            ->whereRaw("{$identity} IS NOT NULL")
            ->selectRaw("{$gender} as gender_group, COUNT(DISTINCT {$identity}) as reach")
            ->groupBy('gender_group')
            ->pluck('reach', 'gender_group');

        $male = (int) ($rows['male'] ?? 0);
        $female = (int) ($rows['female'] ?? 0);
        $unknown = (int) ($rows['unknown'] ?? 0);

        return [
            'male' => $male,
            'female' => $female,
            'unknown' => $unknown,
            'total' => $male + $female + $unknown,
        ];
    }

    private function reachIdentityExpression(string $table = 'ad_events_v2'): string
    {
        return "COALESCE({$table}.viewer_user_id, {$table}.fingerprint, {$table}.session_id, {$table}.ip_address)";
    }

    private function genderColumn(): ?string
    {
        foreach (['gender', 'sex'] as $column) {
            if (Schema::hasColumn('users', $column)) {
                return $column;
            }
        }

        return null;
    }

    /**
     * @return array{media_url:?string,media_type:?string,duration_seconds:?float}
     */
    private function resolveMediaPayload(Request $request, array $validated, AdCampaign $campaign, ?AdCreative $existingCreative = null): array
    {
        $sourceType = (string) ($validated['source_type'] ?? $existingCreative?->source_type ?? 'internal');
        $isBoostedPostCreative = $campaign->promotion_type === 'boosted' && $campaign->post_id;
        $mediaUrl = array_key_exists('media_url', $validated)
            ? $validated['media_url']
            : $existingCreative?->media_url;
        $mediaType = array_key_exists('media_type', $validated)
            ? $validated['media_type']
            : $existingCreative?->media_type;
        $durationSeconds = array_key_exists('duration_seconds', $validated)
            ? (is_numeric($validated['duration_seconds']) ? (float) $validated['duration_seconds'] : null)
            : ($existingCreative?->duration_seconds !== null ? (float) $existingCreative->duration_seconds : null);

        if ($request->hasFile('media')) {
            $path = $request->file('media')->store('ads/v2', 'public');
            $mediaUrl = '/storage/' . $path;
            $mime = (string) ($request->file('media')->getMimeType() ?? '');
            $mediaType = Str::startsWith($mime, 'video') ? 'video' : 'image';
            $durationSeconds = $mediaType === 'video'
                ? $this->resolveVideoDuration($request->file('media')->getRealPath() ?: null, $validated['duration_seconds'] ?? null)
                : null;
        }

        if ($isBoostedPostCreative) {
            $boostedMedia = $this->resolveBoostedPostMedia($campaign->post_id);
            if (! $boostedMedia) {
                abort(422, 'Boosted campaigns require a post with image or video media.');
            }

            $mediaUrl = $this->toPublicStorageUrl($boostedMedia->processed_file_path ?: $boostedMedia->file_path);
            $mediaType = $boostedMedia->file_type === 'video' ? 'video' : 'image';
            $durationSeconds = $mediaType === 'video'
                ? (is_numeric($boostedMedia->duration) ? (float) $boostedMedia->duration : $durationSeconds)
                : null;
        }

        if ($sourceType === 'internal' && (! $mediaUrl || ! $mediaType)) {
            abort(422, 'Internal creatives require image or video media.');
        }

        if ($mediaType === 'video' && ! $isBoostedPostCreative) {
            $maxVideoDuration = $this->pricing->maxVideoDurationSeconds();
            if ($durationSeconds === null) {
                abort(422, "Unable to resolve video duration. Please upload a valid video file not longer than {$maxVideoDuration} seconds.");
            }

            if ($durationSeconds > $maxVideoDuration) {
                abort(422, "Ad video duration must be {$maxVideoDuration} seconds or less.");
            }
        } else {
            $durationSeconds = null;
        }

        unset($validated['media'], $validated['duration_seconds']);

        return [
            'media_url' => $mediaUrl,
            'media_type' => $mediaType,
            'duration_seconds' => $durationSeconds,
        ];
    }

    private function assertCreativeMediaMatchesCampaign(AdCampaign $campaign, ?string $mediaType): void
    {
        $campaignMediaType = $this->pricing->normalizeMediaType($campaign->pricing_media_type);
        $creativeMediaType = $this->pricing->normalizeMediaType($mediaType);

        if ($campaignMediaType !== $creativeMediaType) {
            abort(422, "Creative media type must match campaign pricing media type ({$campaignMediaType}).");
        }
    }

    private function resolveVideoDuration(?string $filePath, mixed $fallback): ?float
    {
        if (is_numeric($fallback)) {
            return (float) $fallback;
        }

        if (! $filePath || ! is_file($filePath)) {
            return null;
        }

        $ffprobe = $this->videoDerivativeService->resolveBinaries()['ffprobe'] ?? null;
        if (! $ffprobe) {
            return null;
        }

        $escapedPath = escapeshellarg($filePath);
        $escapedFfprobe = escapeshellarg($ffprobe);
        $output = @shell_exec("{$escapedFfprobe} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 {$escapedPath} 2>&1");

        if (! is_string($output)) {
            return null;
        }

        $duration = trim($output);

        return is_numeric($duration) ? (float) $duration : null;
    }

    private function resolveBoostedPostMedia(string $postId): ?PostMedia
    {
        $post = Post::query()
            ->with('media')
            ->find($postId);

        if (! $post) {
            return null;
        }

        return $post->media->first(fn (PostMedia $media) => in_array($media->file_type, ['image', 'video'], true));
    }

    private function toPublicStorageUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://', '/storage/'])) {
            return $path;
        }

        return '/storage/' . ltrim($path, '/');
    }
}
