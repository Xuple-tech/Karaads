<?php

namespace App\Http\Controllers\Api;

use App\Events\LiveChatMessageCreated;
use App\Events\LiveChatMessageUpdated;
use App\Events\LiveStreamEnded;
use App\Events\LiveStreamSignalSent;
use App\Events\LiveStreamStarted;
use App\Events\LiveStreamUpdated;
use App\Http\Controllers\Controller;
use App\Http\Resources\LiveStreamMessageResource;
use App\Http\Resources\LiveStreamResource;
use App\Models\LiveStream;
use App\Models\LiveStreamJoin;
use App\Models\LiveStreamMessage;
use App\Support\LiveStreamAccess;
use App\Support\UserPrivacy;
use Firebase\JWT\JWT;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class LiveStreamController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): AnonymousResourceCollection
    {
        $viewer = $request->user();
        $this->expireStaleLiveStreams();

        $query = LiveStream::query()
            ->with('user')
            ->withCount('likes')
            ->withExists(['likes as user_liked' => fn ($q) => $q->where('user_id', $viewer->id)])
            ->where(function ($statusQuery) {
                $statusQuery
                    ->where('status', 'live')
                    ->orWhere(function ($endedQuery) {
                        $endedQuery
                            ->where('status', 'ended')
                            ->where('ended_at', '>=', now()->subDay());
                    });
            })
            ->where(function ($visibilityQuery) use ($viewer) {
                $visibilityQuery
                    ->where('user_id', $viewer->id)
                    ->orWhere('visibility', 'everyone')
                    ->orWhere(function ($followersQuery) use ($viewer) {
                        $followersQuery->where('visibility', 'followers')
                            ->whereExists(function ($sub) use ($viewer) {
                                $sub->selectRaw('1')
                                    ->from('follows')
                                    ->whereColumn('follows.following_id', 'live_streams.user_id')
                                    ->where('follows.follower_id', $viewer->id);
                            });
                    });
            })
            ->orderByRaw("CASE WHEN status = 'live' THEN 0 ELSE 1 END")
            ->orderByDesc('started_at');

        UserPrivacy::excludeBlockedUsers($query, $viewer, 'user_id');

        $streams = $query->paginate(15);
        $streams->getCollection()->each(fn (LiveStream $stream) => $this->loadCreatorFollowState($stream, $viewer));

        return LiveStreamResource::collection($streams);
    }

    public function store(Request $request): LiveStreamResource
    {
        $validated = $request->validate([
            'title' => 'required|string|max:140',
            'description' => 'nullable|string|max:2000',
            'visibility' => 'nullable|in:everyone,followers',
            'max_viewers' => 'nullable|integer|min:1|max:200',
            'scheduled_for' => 'nullable|date',
            'thumbnail_path' => 'nullable|string|max:2048',
            'settings' => 'nullable|array',
        ]);

        $stream = LiveStream::query()->create([
            'id' => (string) Str::uuid(),
            'user_id' => (string) $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'visibility' => $validated['visibility'] ?? 'everyone',
            'status' => 'draft',
            'scheduled_for' => $validated['scheduled_for'] ?? null,
            'thumbnail_path' => $validated['thumbnail_path'] ?? null,
            'stream_mode' => 'webrtc',
            'health_status' => 'unknown',
            'settings' => $validated['settings'] ?? [],
            'max_viewers' => isset($validated['max_viewers'])
                ? (int) $validated['max_viewers']
                : (int) config('live.max_viewers_default', 50),
            'viewer_count' => 0,
            'peak_viewer_count' => 0,
        ]);

        $stream->load('user');
        $stream->loadCount('likes');
        $stream->setAttribute('user_liked', false);

        return new LiveStreamResource($stream);
    }

    public function show(LiveStream $stream, Request $request): LiveStreamResource
    {
        $this->expireIfStale($stream);
        abort_unless(LiveStreamAccess::canView($stream, $request->user()), 404);

        $stream->load('user');
        $this->loadCreatorFollowState($stream, $request->user());
        $this->loadEngagement($stream, $request->user()->id);
        $this->loadViewerJoinState($stream, (string) $request->user()->id);

        return new LiveStreamResource($stream);
    }

    public function start(LiveStream $stream, Request $request): LiveStreamResource
    {
        $this->authorize('start', $stream);

        $shouldBroadcast = $stream->status !== 'live';

        if ($shouldBroadcast) {
            LiveStream::query()
                ->where('user_id', (string) $request->user()->id)
                ->where('id', '!=', (string) $stream->id)
                ->where('status', 'live')
                ->get()
                ->each(function (LiveStream $previousStream) {
                    $previousStream->forceFill([
                        'status' => 'ended',
                        'ended_at' => $previousStream->ended_at ?? now(),
                        'health_status' => 'ended',
                    ])->save();

                    LiveStreamEnded::dispatch($previousStream);
                });

            $stream->forceFill([
                'status' => 'live',
                'started_at' => $stream->started_at ?? now(),
                'last_activity_at' => now(),
                'last_health_at' => now(),
                'health_status' => 'starting',
            ])->save();
        }

        $stream->load('user');
        $this->loadCreatorFollowState($stream, $request->user());

        if ($shouldBroadcast) {
            LiveStreamStarted::dispatch($stream);
        }

        $this->loadEngagement($stream, $request->user()->id);

        return new LiveStreamResource($stream);
    }

    public function end(LiveStream $stream, Request $request): LiveStreamResource
    {
        $this->authorize('end', $stream);

        $shouldBroadcast = $stream->status !== 'ended';

        if ($shouldBroadcast) {
            $stream->forceFill([
                'status' => 'ended',
                'ended_at' => now(),
                'health_status' => 'ended',
            ])->save();
        }

        $stream->load('user');
        $this->loadCreatorFollowState($stream, $request->user());

        if ($shouldBroadcast) {
            LiveStreamEnded::dispatch($stream);
        }

        $this->loadEngagement($stream, $request->user()->id);

        return new LiveStreamResource($stream);
    }

    public function heartbeat(LiveStream $stream, Request $request): LiveStreamResource
    {
        $this->authorize('update', $stream);

        $validated = $request->validate([
            'viewer_count' => 'nullable|integer|min:0|max:10000',
            'connection_state' => 'nullable|string|max:40',
            'quality' => 'nullable|string|max:40',
            'bitrate_kbps' => 'nullable|integer|min:0|max:1000000',
            'packet_loss' => 'nullable|numeric|min:0|max:100',
            'rtt_ms' => 'nullable|integer|min:0|max:60000',
        ]);

        $joinedViewerCount = (int) $stream->joins()->count();
        $viewerCount = isset($validated['viewer_count'])
            ? (int) $validated['viewer_count']
            : (int) $stream->viewer_count;
        $viewerCount = max($viewerCount, $joinedViewerCount);
        $healthMeta = [
            'connection_state' => $validated['connection_state'] ?? null,
            'quality' => $validated['quality'] ?? null,
            'bitrate_kbps' => $validated['bitrate_kbps'] ?? null,
            'packet_loss' => isset($validated['packet_loss']) ? (float) $validated['packet_loss'] : null,
            'rtt_ms' => $validated['rtt_ms'] ?? null,
            'viewer_count' => $viewerCount,
            'updated_at' => now()->toIso8601String(),
        ];

        $stream->forceFill([
            'viewer_count' => $viewerCount,
            'peak_viewer_count' => max((int) $stream->peak_viewer_count, $viewerCount),
            'last_activity_at' => now(),
            'last_health_at' => now(),
            'health_status' => $this->resolveHealthStatus($healthMeta),
            'health_meta' => array_filter($healthMeta, fn ($value) => $value !== null),
        ])->save();
        $stream->load('user');
        $stream->loadCount(['likes', 'messages as comments_count']);
        LiveStreamUpdated::dispatch($stream);

        $this->loadEngagement($stream, $request->user()->id);

        return new LiveStreamResource($stream);
    }

    public function join(LiveStream $stream, Request $request): LiveStreamResource
    {
        $this->expireIfStale($stream);
        abort_unless($stream->status === 'live', 404);
        abort_unless(LiveStreamAccess::canView($stream, $request->user()), 404);

        if ((string) $request->user()->id !== (string) $stream->user_id) {
            $join = LiveStreamJoin::query()->firstOrNew([
                'live_stream_id' => (string) $stream->id,
                'user_id' => (string) $request->user()->id,
            ]);

            $join->exists ? $join->touch() : $join->save();
        }

        $viewerCount = (int) $stream->joins()->count();
        $stream->forceFill([
            'viewer_count' => $viewerCount,
            'peak_viewer_count' => max((int) $stream->peak_viewer_count, $viewerCount),
            'last_activity_at' => now(),
        ])->save();

        $stream->load('user');
        $stream->loadCount(['likes', 'messages as comments_count']);
        $this->loadCreatorFollowState($stream, $request->user());
        $this->loadEngagement($stream, (string) $request->user()->id);
        $stream->setAttribute('viewer_joined', true);
        LiveStreamUpdated::dispatch($stream);

        $this->rememberAndBroadcastSignal((string) $stream->id, [
            'type' => 'viewer-join',
            'from' => (string) $request->user()->id,
            'to' => (string) $stream->user_id,
            'force' => true,
        ]);

        return new LiveStreamResource($stream);
    }

    public function signal(LiveStream $stream, Request $request): JsonResponse
    {
        abort_unless($stream->status === 'live', 404);
        abort_unless(LiveStreamAccess::canView($stream, $request->user()), 404);

        $validated = $request->validate([
            'type' => 'required|string|in:viewer-join,offer,answer,ice,reaction',
            'to' => 'nullable|string|max:80',
            'sdp' => 'nullable|string|max:200000',
            'candidate' => 'nullable|array',
            'reaction' => 'nullable|string|max:16',
            'force' => 'nullable|boolean',
        ]);

        $signal = [
            'type' => $validated['type'],
            'from' => (string) $request->user()->id,
        ];

        if (! empty($validated['to'])) {
            $signal['to'] = (string) $validated['to'];
        }

        if (array_key_exists('sdp', $validated)) {
            $signal['sdp'] = $validated['sdp'];
        }

        if (array_key_exists('candidate', $validated)) {
            $signal['candidate'] = $validated['candidate'];
        }

        if (array_key_exists('reaction', $validated)) {
            $signal['reaction'] = $validated['reaction'];
        }

        if (array_key_exists('force', $validated)) {
            $signal['force'] = (bool) $validated['force'];
        }

        if ($validated['type'] === 'reaction') {
            $stream->increment('reaction_count');
            $stream->refresh();
            $stream->load('user');
            $stream->loadCount(['likes', 'messages as comments_count']);
            LiveStreamUpdated::dispatch($stream);
        }

        $signal = $this->rememberAndBroadcastSignal((string) $stream->id, $signal);

        return response()->json(['ok' => true, 'id' => $signal['id']]);
    }

    public function signals(LiveStream $stream, Request $request): JsonResponse
    {
        abort_unless($stream->status === 'live', 404);
        abort_unless(LiveStreamAccess::canView($stream, $request->user()), 404);

        $since = (int) $request->integer('since');
        $signals = collect(Cache::get($this->signalCacheKey((string) $stream->id), []))
            ->filter(fn (array $signal) => (int) ($signal['id'] ?? 0) > $since)
            ->values()
            ->all();

        return response()->json(['data' => $signals]);
    }

    public function toggleLike(LiveStream $stream, Request $request): JsonResponse
    {
        abort_unless(LiveStreamAccess::canView($stream, $request->user()), 404);

        $userId = (string) $request->user()->id;
        $existing = $stream->likes()
            ->where('user_id', $userId)
            ->first();

        if ($existing) {
            $existing->delete();
            $liked = false;
        } else {
            $stream->likes()->create([
                'id' => (string) Str::uuid(),
                'user_id' => $userId,
                'likeable_type' => LiveStream::class,
            ]);
            $liked = true;
        }

        $likesCount = $stream->likes()->count();
        $stream->setAttribute('likes_count', $likesCount);
        $stream->setAttribute('user_liked', $liked);

        return response()->json([
            'liked' => $liked,
            'likes_count' => $likesCount,
        ]);
    }

    public function chatIndex(LiveStream $stream, Request $request): AnonymousResourceCollection
    {
        abort_unless(LiveStreamAccess::canView($stream, $request->user()), 404);

        $messages = LiveStreamMessage::query()
            ->where('live_stream_id', $stream->id)
            ->where('is_deleted', false)
            ->with('user')
            ->orderByDesc('is_pinned')
            ->orderByDesc('pinned_at')
            ->latest()
            ->paginate(50);

        return LiveStreamMessageResource::collection($messages);
    }

    public function chatStore(LiveStream $stream, Request $request): LiveStreamMessageResource
    {
        abort_unless(LiveStreamAccess::canView($stream, $request->user()), 404);

        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $message = LiveStreamMessage::query()->create([
            'id' => (string) Str::uuid(),
            'live_stream_id' => (string) $stream->id,
            'user_id' => (string) $request->user()->id,
            'message' => $validated['message'],
        ]);

        $message->load('user');

        LiveChatMessageCreated::dispatch($message);
        $stream->load('user');
        $stream->loadCount(['likes', 'messages as comments_count']);
        LiveStreamUpdated::dispatch($stream);

        return new LiveStreamMessageResource($message);
    }

    public function pinChatMessage(LiveStream $stream, LiveStreamMessage $message, Request $request): LiveStreamMessageResource
    {
        $this->authorize('update', $stream);
        abort_unless((string) $message->live_stream_id === (string) $stream->id, 404);

        LiveStreamMessage::query()
            ->where('live_stream_id', (string) $stream->id)
            ->where('id', '!=', (string) $message->id)
            ->update(['is_pinned' => false, 'pinned_at' => null]);

        $message->forceFill([
            'is_pinned' => ! $message->is_pinned,
            'pinned_at' => $message->is_pinned ? null : now(),
        ])->save();
        $message->load('user');

        LiveChatMessageUpdated::dispatch($message);

        return new LiveStreamMessageResource($message);
    }

    public function deleteChatMessage(LiveStream $stream, LiveStreamMessage $message, Request $request): JsonResponse
    {
        abort_unless((string) $message->live_stream_id === (string) $stream->id, 404);
        abort_unless(
            (string) $request->user()->id === (string) $stream->user_id
                || (string) $request->user()->id === (string) $message->user_id,
            403
        );

        $message->forceFill([
            'is_deleted' => true,
            'is_pinned' => false,
            'pinned_at' => null,
        ])->save();
        $message->load('user');

        LiveChatMessageUpdated::dispatch($message);

        return response()->json(['ok' => true]);
    }

    public function share(LiveStream $stream, Request $request): JsonResponse
    {
        abort_unless(LiveStreamAccess::canView($stream, $request->user()), 404);

        $stream->increment('share_count');

        return response()->json([
            'ok' => true,
            'share_count' => (int) $stream->refresh()->share_count,
        ]);
    }

    public function analytics(LiveStream $stream, Request $request): JsonResponse
    {
        $this->authorize('viewAnalytics', $stream);

        return response()->json([
            'data' => [
                'stream_id' => (string) $stream->id,
                'status' => $stream->status,
                'viewer_count' => (int) $stream->viewer_count,
                'peak_viewer_count' => (int) $stream->peak_viewer_count,
                'likes_count' => (int) $stream->likes()->count(),
                'reaction_count' => (int) $stream->reaction_count,
                'share_count' => (int) $stream->share_count,
                'comments_count' => (int) $stream->messages()->where('is_deleted', false)->count(),
                'joins_count' => (int) $stream->joins()->count(),
                'total_watch_seconds' => (int) $stream->total_watch_seconds,
                'health_status' => $stream->health_status ?? 'unknown',
                'health_meta' => $stream->health_meta ?? [],
                'last_health_at' => $stream->last_health_at?->toIso8601String(),
                'started_at' => $stream->started_at?->toIso8601String(),
                'ended_at' => $stream->ended_at?->toIso8601String(),
            ],
        ]);
    }

    public function livekitToken(LiveStream $stream, Request $request): JsonResponse
    {
        $this->expireIfStale($stream);
        abort_unless(LiveStreamAccess::canView($stream, $request->user()), 404);

        $enabled = (bool) config('live.livekit.enabled', false);
        $url = (string) config('live.livekit.url', '');
        $apiKey = (string) config('live.livekit.api_key', '');
        $apiSecret = (string) config('live.livekit.api_secret', '');

        if (! $enabled) {
            return response()->json([
                'enabled' => false,
                'message' => 'LiveKit is not enabled.',
            ]);
        }

        if ($url === '' || $apiKey === '' || $apiSecret === '') {
            return response()->json([
                'enabled' => false,
                'message' => 'LiveKit is not configured.',
            ], 503);
        }

        $ownsStream = (string) $stream->user_id === (string) $request->user()->id;
        $requestedRole = $request->input('role') === 'host' ? 'host' : 'viewer';
        $isHostSession = $ownsStream && $requestedRole === 'host';

        if ($isHostSession) {
            $this->authorize('start', $stream);
        } else {
            abort_unless($stream->status === 'live', 404);
        }

        $roomName = $this->livekitRoomName($stream);
        $sessionId = Str::of((string) $request->input('session_id', ''))
            ->replaceMatches('/[^A-Za-z0-9_-]/', '')
            ->limit(32, '')
            ->toString();
        $identity = $isHostSession
            ? (string) $request->user()->id
            : sprintf('%s-viewer-%s', $request->user()->id, $sessionId !== '' ? $sessionId : Str::random(10));
        $now = time();
        $ttl = max(300, (int) config('live.livekit.token_ttl_seconds', 21600));

        $token = JWT::encode([
            'iss' => $apiKey,
            'sub' => $identity,
            'name' => $request->user()->name ?? $identity,
            'nbf' => $now - 10,
            'iat' => $now,
            'exp' => $now + $ttl,
            'video' => [
                'roomJoin' => true,
                'room' => $roomName,
                'canPublish' => $isHostSession,
                'canPublishData' => true,
                'canSubscribe' => true,
            ],
        ], $apiSecret, 'HS256');

        return response()->json([
            'enabled' => true,
            'url' => $url,
            'token' => $token,
            'room' => $roomName,
            'identity' => $identity,
            'role' => $isHostSession ? 'host' : 'viewer',
        ]);
    }

    private function rememberAndBroadcastSignal(string $streamId, array $signal): array
    {
        $signal['id'] = $this->nextSignalId();
        $signal['sent_at'] = now()->toIso8601String();

        $this->rememberSignal($streamId, $signal);
        LiveStreamSignalSent::dispatch($streamId, $signal);

        return $signal;
    }

    private function rememberSignal(string $streamId, array $signal): void
    {
        $key = $this->signalCacheKey($streamId);
        $signals = Cache::get($key, []);
        $signals[] = $signal;

        Cache::put($key, array_slice($signals, -240), now()->addMinutes(3));
    }

    private function signalCacheKey(string $streamId): string
    {
        return 'live-stream-signals:' . $streamId;
    }

    private function nextSignalId(): int
    {
        return (int) floor(microtime(true) * 1000000);
    }

    private function loadEngagement(LiveStream $stream, string $userId): void
    {
        $stream->loadCount('likes');
        $stream->loadExists(['likes as user_liked' => fn ($q) => $q->where('user_id', $userId)]);
    }

    private function loadViewerJoinState(LiveStream $stream, string $userId): void
    {
        $stream->setAttribute(
            'viewer_joined',
            (string) $stream->user_id === $userId
                || LiveStreamJoin::query()
                    ->where('live_stream_id', (string) $stream->id)
                    ->where('user_id', $userId)
                    ->exists()
        );
    }

    private function loadCreatorFollowState(LiveStream $stream, $viewer): void
    {
        if (! $viewer || ! $stream->relationLoaded('user') || ! $stream->user) {
            return;
        }

        if ((string) $stream->user->id === (string) $viewer->id) {
            $stream->user->setAttribute('is_following', false);

            return;
        }

        $stream->user->loadExists([
            'followers as is_following' => function ($q) use ($viewer) {
                $q->where('users.id', $viewer->id);
            },
        ]);
    }

    private function resolveHealthStatus(array $healthMeta): string
    {
        $state = strtolower((string) ($healthMeta['connection_state'] ?? ''));
        $packetLoss = (float) ($healthMeta['packet_loss'] ?? 0);
        $rtt = (int) ($healthMeta['rtt_ms'] ?? 0);

        if (in_array($state, ['failed', 'closed', 'disconnected'], true)) {
            return 'degraded';
        }

        if ($packetLoss >= 8 || $rtt >= 1200) {
            return 'degraded';
        }

        if ($state === 'connected' || $state === 'connecting' || $state === '') {
            return 'healthy';
        }

        return 'unknown';
    }

    private function expireStaleLiveStreams(): void
    {
        $cutoff = now()->subSeconds($this->staleTimeoutSeconds());

        LiveStream::query()
            ->where('status', 'live')
            ->where(function ($query) use ($cutoff) {
                $query
                    ->whereNull('last_activity_at')
                    ->orWhere('last_activity_at', '<', $cutoff);
            })
            ->get()
            ->each(fn (LiveStream $stream) => $this->expireIfStale($stream));
    }

    private function expireIfStale(LiveStream $stream): void
    {
        if ($stream->status !== 'live') {
            return;
        }

        $activityAt = $stream->last_activity_at ?? $stream->started_at ?? $stream->updated_at ?? $stream->created_at;
        if ($activityAt && $activityAt->greaterThan(now()->subSeconds($this->staleTimeoutSeconds()))) {
            return;
        }

        $stream->forceFill([
            'status' => 'ended',
            'ended_at' => $stream->ended_at ?? now(),
            'health_status' => 'ended',
        ])->save();

        LiveStreamEnded::dispatch($stream);
    }

    private function staleTimeoutSeconds(): int
    {
        return max(300, (int) config('live.stale_stream_timeout_seconds', 300));
    }

    private function livekitRoomName(LiveStream $stream): string
    {
        return 'kara-live-' . $stream->id;
    }
}
