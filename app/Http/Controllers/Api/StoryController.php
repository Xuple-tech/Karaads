<?php

namespace App\Http\Controllers\Api;

use App\Events\MessageSent;
use App\Http\Controllers\Controller;
use App\Http\Resources\StoryGroupResource;
use App\Http\Resources\StoryResource;
use App\Jobs\ProcessStoryMedia;
use App\Models\Conversation;
use App\Models\Story;
use App\Models\StoryReaction;
use App\Models\StoryView;
use App\Services\Media\MediaPathService;
use App\Services\Media\VideoDerivativeService;
use App\Services\Push\PushDispatchService;
use App\Support\UserPrivacy;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StoryController extends Controller
{
    use AuthorizesRequests;

    private const MAX_VIDEO_DURATION_SECONDS = 60;
    private const MAX_MUSIC_FILE_SIZE_KB = 20480;
    private const MAX_MUSIC_DURATION_SECONDS = 1800;

    public function __construct(
        private readonly PushDispatchService $pushDispatch,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'feed' => 'nullable|in:for-you,following',
        ]);

        $followingIds = DB::table('follows')
            ->where('follower_id', $user->id)
            ->pluck('following_id');

        $allowedUserIds = $followingIds->push($user->id)->unique();

        $stories = Story::query()
            ->active()
            ->whereIn('user_id', $allowedUserIds)
            ->with([
                'user',
                'media',
                'reactions',
                'views' => fn($query) => $query->where('viewer_id', $user->id),
            ])
            ->orderByDesc('created_at')
            ->get();

        $groups = $stories
            ->groupBy('user_id')
            ->map(function (Collection $userStories) {
                $first = $userStories->first();
                $hasUnseen = $userStories->contains(fn($story) => $story->views->isEmpty());

                return [
                    'user' => $first->user,
                    'stories' => $userStories->values(),
                    'has_unseen' => $hasUnseen,
                    'latest_story_at' => $userStories->max('created_at'),
                ];
            })
            ->sortByDesc(fn(array $group) => $group['latest_story_at'])
            ->values();

        return response()->json([
            'data' => StoryGroupResource::collection($groups)->resolve(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $maxDurationSeconds = self::MAX_VIDEO_DURATION_SECONDS;

        $validated = $request->validate([
            'caption' => 'nullable|string|max:1000',
            'media' => 'nullable|array',
            'media.*' => [
                'file',
                'mimetypes:image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime',
            ],
            'duration_seconds' => 'nullable|array',
            'duration_seconds.*' => "nullable|numeric|min:0|max:{$maxDurationSeconds}",
            'music' => [
                'nullable',
                'file',
                'mimetypes:audio/mpeg,audio/mp4,audio/x-m4a,audio/aac,audio/wav,audio/webm,audio/ogg',
                'max:' . self::MAX_MUSIC_FILE_SIZE_KB,
            ],
            'music_duration_seconds' => 'nullable|numeric|min:0|max:' . self::MAX_MUSIC_DURATION_SECONDS,
        ]);

        $files = $request->file('media', []);
        $hasImageMedia = collect($files)->contains(
            fn ($file) => str_starts_with((string) ($file->getMimeType() ?: ''), 'image/')
        );
        $hasVideoMedia = collect($files)->contains(
            fn ($file) => str_starts_with((string) ($file->getMimeType() ?: ''), 'video/')
        );
        if (empty($validated['caption']) && (!is_array($files) || count($files) === 0)) {
            return response()->json(['message' => 'A caption or at least one media file is required.'], 422);
        }

        if ($request->hasFile('music') && (!$hasImageMedia || $hasVideoMedia)) {
            return response()->json(['message' => 'Music can only be attached to stories with image media.'], 422);
        }

        $story = DB::transaction(function () use ($request, $validated, $files, $maxDurationSeconds) {
            $uploadDirectory = app(MediaPathService::class)->originalUploadDirectory('stories');
            $story = Story::create([
                'id' => (string) Str::uuid(),
                'user_id' => $request->user()->id,
                'caption' => $validated['caption'] ?? null,
                'visibility' => 'followers',
                'expires_at' => now()->addDay(),
            ]);

            if ($request->hasFile('music')) {
                $musicFile = $request->file('music');
                $musicPath = $musicFile->store(
                    app(MediaPathService::class)->originalUploadDirectory('story-music'),
                    'public',
                );

                $story->update([
                    'music_path' => $musicPath,
                    'music_title' => pathinfo($musicFile->getClientOriginalName(), PATHINFO_FILENAME),
                    'music_mime_type' => $musicFile->getMimeType(),
                    'music_duration_seconds' => $validated['music_duration_seconds'] ?? null,
                ]);
            }

            foreach ($files as $index => $file) {
                $mime = $file->getMimeType() ?: null;
                $isVideo = is_string($mime) && str_starts_with($mime, 'video/');

                $duration = $this->resolveVideoDuration(
                    filePath: $file->getRealPath() ?: null,
                    fallback: $validated['duration_seconds'][$index] ?? null,
                );

                if ($isVideo && ($duration === null || $duration > $maxDurationSeconds)) {
                    abort(422, "Each story video must be {$maxDurationSeconds} seconds or less.");
                }

                $path = $file->store($uploadDirectory, 'public');

                $media = $story->media()->create([
                    'id' => (string) Str::uuid(),
                    'file_path' => $path,
                    'thumbnail_path' => null,
                    'file_type' => $isVideo ? 'video' : 'image',
                    'mime_type' => $mime,
                    'duration_seconds' => $isVideo ? $duration : null,
                    'display_order' => $index,
                    'processing_status' => 'queued',
                ]);

                if (app()->environment('local')) {
                    ProcessStoryMedia::dispatchSync($media->id);
                } else {
                    ProcessStoryMedia::dispatch($media->id);
                }
            }

            return $story;
        });

        $story->load(['user', 'media', 'views', 'reactions']);

        return response()->json([
            'data' => (new StoryResource($story))->resolve(),
        ], 201);
    }

    public function show(Story $story, Request $request): JsonResponse
    {
        $this->authorize('view', $story);

        $story->load([
            'user',
            'media',
            'views',
            'reactions',
        ]);

        $story->setAttribute('is_viewed', $story->views->contains('viewer_id', $request->user()->id));
        $story->setAttribute('view_count', $story->views->count());

        $viewerReaction = $story->reactions->firstWhere('user_id', $request->user()->id);
        $story->setAttribute('viewer_reaction', $viewerReaction?->emoji);

        $orderedIds = Story::query()
            ->active()
            ->where('user_id', $story->user_id)
            ->orderBy('created_at')
            ->pluck('id')
            ->values();

        $index = $orderedIds->search($story->id);
        $prevId = ($index !== false && $index > 0) ? $orderedIds[$index - 1] : null;
        $nextId = ($index !== false && $index < $orderedIds->count() - 1) ? $orderedIds[$index + 1] : null;

        return response()->json([
            'data' => [
                'story' => (new StoryResource($story))->resolve(),
                'prev_story_id' => $prevId,
                'next_story_id' => $nextId,
            ],
        ]);
    }

    public function view(Story $story, Request $request): JsonResponse
    {
        $this->authorize('view', $story);

        StoryView::updateOrCreate(
            [
                'story_id' => $story->id,
                'viewer_id' => $request->user()->id,
            ],
            [
                'id' => (string) Str::uuid(),
                'viewed_at' => now(),
            ]
        );

        return response()->json([
            'data' => [
                'story_id' => $story->id,
                'viewed' => true,
            ],
        ]);
    }

    public function react(Story $story, Request $request): JsonResponse
    {
        $this->authorize('view', $story);
        $actor = $request->user();

        $validated = $request->validate([
            'emoji' => 'required|string|max:16',
        ]);

        StoryReaction::updateOrCreate(
            [
                'story_id' => $story->id,
                'user_id' => $request->user()->id,
            ],
            [
                'id' => (string) Str::uuid(),
                'emoji' => $validated['emoji'],
            ]
        );

        $story->loadMissing('user');

        if (
            $story->user &&
            (string) $story->user->id !== (string) $actor->id &&
            UserPrivacy::canMessage($actor, $story->user)
        ) {
            $conversation = $actor->conversations()
                ->where('type', 'private')
                ->whereHas('participants', fn ($query) => $query->where('users.id', $story->user->id))
                ->with('participants')
                ->first();

            if (! $conversation) {
                $conversation = Conversation::create([
                    'id' => (string) Str::uuid(),
                    'type' => 'private',
                    'name' => null,
                    'created_by' => $actor->id,
                ]);

                $conversation->participants()->attach([
                    $actor->id => [
                        'id' => (string) Str::uuid(),
                        'joined_at' => now(),
                    ],
                    $story->user->id => [
                        'id' => (string) Str::uuid(),
                        'joined_at' => now(),
                    ],
                ]);
            }

            $message = $conversation->messages()->create([
                'id' => (string) Str::uuid(),
                'user_id' => $actor->id,
                'content' => $validated['emoji'],
                'message_type' => 'text',
                'attachments' => [[
                    'id' => (string) Str::uuid(),
                    'type' => 'story_reaction',
                    'story_id' => (string) $story->id,
                    'emoji' => $validated['emoji'],
                    'label' => 'Sent from status',
                ]],
                'delivered_at' => now(),
            ]);

            $message->load('user');

            broadcast(new MessageSent($message))->toOthers();
            $this->pushDispatch->dispatchMessageNotification(
                $conversation,
                $actor,
                (string) $message->id,
                $validated['emoji'],
            );
        }

        return response()->json([
            'data' => [
                'story_id' => $story->id,
                'emoji' => $validated['emoji'],
            ],
        ]);
    }

    public function destroy(Story $story): JsonResponse
    {
        $this->authorize('delete', $story);

        $story->load('media');
        foreach ($story->media as $media) {
            $paths = [
                $media->file_path,
                $media->processed_file_path,
                $media->thumbnail_path,
            ];

            if (is_array($media->variants)) {
                $paths = array_merge($paths, array_values($media->variants));
            }

            Storage::disk('public')->delete(array_values(array_unique(array_filter($paths))));
        }

        $story->delete();

        return response()->json([
            'data' => [
                'deleted' => true,
            ],
        ]);
    }

    private function resolveVideoDuration(?string $filePath, mixed $fallback): ?float
    {
        if (is_numeric($fallback)) {
            return (float) $fallback;
        }

        if (!$filePath || !is_file($filePath)) {
            return null;
        }

        $ffprobe = app(VideoDerivativeService::class)->resolveBinaries()['ffprobe'] ?? null;
        if (!$ffprobe) {
            return null;
        }

        $escapedPath = escapeshellarg($filePath);
        $escapedFfprobe = escapeshellarg($ffprobe);
        $output = @shell_exec("{$escapedFfprobe} -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 {$escapedPath} 2>&1");

        if (!is_string($output)) {
            return null;
        }

        $duration = trim($output);
        if (!is_numeric($duration)) {
            return null;
        }

        return (float) $duration;
    }
}
