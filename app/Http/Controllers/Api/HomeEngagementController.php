<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Like;
use App\Models\LiveStream;
use App\Models\LiveStreamJoin;
use App\Models\LiveStreamMessage;
use App\Models\Post;
use App\Models\PostView;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeEngagementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->recentEngagement(),
        ]);
    }

    public static function recentEngagement(int $limit = 24): array
    {
        $items = collect();

        PostView::query()
            ->with(['user:id,name,username,avatar', 'post.user:id,name,username'])
            ->latest('updated_at')
            ->limit(10)
            ->get()
            ->each(fn (PostView $view) => $items->push(self::postActivity('view', 'viewed a post', $view->user, $view->post, $view->updated_at)));

        Like::query()
            ->where('likeable_type', Post::class)
            ->with(['user:id,name,username,avatar', 'post.user:id,name,username'])
            ->latest()
            ->limit(10)
            ->get()
            ->each(fn (Like $like) => $items->push(self::postActivity('like', 'liked a post', $like->user, $like->post, $like->created_at)));

        Comment::query()
            ->with(['user:id,name,username,avatar', 'post.user:id,name,username'])
            ->latest()
            ->limit(10)
            ->get()
            ->each(fn (Comment $comment) => $items->push(self::postActivity('comment', 'commented on a post', $comment->user, $comment->post, $comment->created_at, $comment->content)));

        LiveStreamJoin::query()
            ->with(['user:id,name,username,avatar', 'stream.user:id,name,username'])
            ->latest('updated_at')
            ->limit(10)
            ->get()
            ->each(fn (LiveStreamJoin $join) => $items->push(self::liveActivity('join', 'joined a live', $join->user, $join->stream, $join->updated_at)));

        LiveStreamMessage::query()
            ->with(['user:id,name,username,avatar', 'liveStream.user:id,name,username'])
            ->latest()
            ->limit(10)
            ->get()
            ->each(fn (LiveStreamMessage $message) => $items->push(self::liveActivity('live_comment', 'commented in a live', $message->user, $message->liveStream, $message->created_at, $message->message)));

        return $items
            ->filter(fn ($item) => is_array($item))
            ->sortByDesc('created_at')
            ->take($limit)
            ->values()
            ->all();
    }

    private static function postActivity(string $type, string $action, $user, ?Post $post, $createdAt, ?string $content = null): ?array
    {
        if (! $user || ! $post) {
            return null;
        }

        return [
            'id' => "{$type}-{$post->id}-{$user->id}-" . optional($createdAt)->timestamp,
            'type' => $type,
            'action' => $action,
            'content' => $content ?: $post->content,
            'created_at' => optional($createdAt)?->toISOString(),
            'target_url' => '/posts/' . $post->id,
            'user' => self::userPayload($user),
            'target' => [
                'id' => $post->id,
                'title' => $post->content ? str($post->content)->limit(80)->toString() : 'Post',
                'owner' => self::userPayload($post->user),
            ],
        ];
    }

    private static function liveActivity(string $type, string $action, $user, ?LiveStream $stream, $createdAt, ?string $content = null): ?array
    {
        if (! $user || ! $stream) {
            return null;
        }

        return [
            'id' => "{$type}-{$stream->id}-{$user->id}-" . optional($createdAt)->timestamp,
            'type' => $type,
            'action' => $action,
            'content' => $content ?: $stream->title,
            'created_at' => optional($createdAt)?->toISOString(),
            'target_url' => '/live/' . $stream->id,
            'user' => self::userPayload($user),
            'target' => [
                'id' => $stream->id,
                'title' => $stream->title,
                'owner' => self::userPayload($stream->user),
            ],
        ];
    }

    private static function userPayload($user): ?array
    {
        if (! $user) {
            return null;
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'avatar' => $user->avatar_url ?? $user->avatar ?? null,
        ];
    }
}
