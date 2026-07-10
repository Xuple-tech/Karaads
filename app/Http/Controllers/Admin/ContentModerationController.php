<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContentReport;
use App\Models\Post;
use App\Models\Comment;
use App\Services\Post\PostRewardService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ContentModerationController extends Controller
{
    public function __construct(private readonly PostRewardService $postRewardService)
    {
    }

    public function posts(Request $request)
    {
        $query = Post::withTrashed()->with(['user', 'media'])->latest();
        $validationOnly = $request->boolean('validation');

        if ($validationOnly) {
            $query->where(function ($validationQuery): void {
                $validationQuery
                    ->whereNotNull('content_validated_at')
                    ->orWhereNotNull('content_validation_summary')
                    ->orWhereNotNull('content_validation_score')
                    ->orWhereNotNull('content_validation_flags');
            });
        }

        if ($request->filled('search')) {
            $search = (string) $request->string('search');
            $query->where(function ($searchQuery) use ($search): void {
                $searchQuery
                    ->where('content', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($userQuery) use ($search): void {
                        $userQuery
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('username', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $status = (string) $request->string('status');
            if ($status === 'disabled') {
                $query->onlyTrashed();
            } elseif ($status === 'active') {
                $query->whereNull('deleted_at');
            }
        }

        if ($request->filled('validation_status')) {
            $query->where('content_validation_status', (string) $request->string('validation_status'));
        }

        $validationStats = null;
        if ($validationOnly) {
            $validationStats = Post::query()
                ->selectRaw('content_validation_status, count(*) as aggregate')
                ->where(function ($validationQuery): void {
                    $validationQuery
                        ->whereNotNull('content_validated_at')
                        ->orWhereNotNull('content_validation_summary')
                        ->orWhereNotNull('content_validation_score')
                        ->orWhereNotNull('content_validation_flags');
                })
                ->groupBy('content_validation_status')
                ->pluck('aggregate', 'content_validation_status')
                ->map(fn ($count) => (int) $count)
                ->all();
        }

        $posts = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Content/Posts', [
            'posts' => $posts,
            'filters' => $request->only(['search', 'status', 'validation', 'validation_status']),
            'validationOnly' => $validationOnly,
            'validationStats' => $validationStats,
        ]);
    }

    public function pendingPosts()
    {
        return redirect()->route('admin.content.posts', [
            'validation' => 1,
            'validation_status' => 'needs_review',
        ]);
    }

    public function reportedPosts()
    {
        $posts = Post::query()
            ->with(['user', 'media'])
            ->whereHas('reports', function ($query): void {
                $query->where('status', ContentReport::STATUS_OPEN);
            })
            ->withCount(['reports as open_reports_count' => function ($query): void {
                $query->where('status', ContentReport::STATUS_OPEN);
            }])
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Content/Posts', [
            'posts' => $posts,
            'filters' => ['reported' => true],
        ]);
    }

    public function previewPost(string $post)
    {
        $postModel = Post::withTrashed()
            ->with(['user', 'media'])
            ->findOrFail($post);

        $mediaHtml = $postModel->media
            ->sortBy('order')
            ->map(function ($media): string {
                $path = $media->processed_file_path ?: $media->file_path;
                $src = $this->mediaUrl((string) $path);
                $mime = (string) ($media->mime_type ?? '');
                $type = (string) ($media->file_type ?? '');

                if ($type === 'video' || Str::startsWith($mime, 'video/')) {
                    $poster = $media->thumbnail_path ? ' poster="' . e($this->mediaUrl((string) $media->thumbnail_path)) . '"' : '';

                    return '<video controls playsinline preload="metadata"' . $poster . ' src="' . e($src) . '"></video>';
                }

                return '<img src="' . e($src) . '" alt="Post media" loading="lazy">';
            })
            ->implode('');

        if ($mediaHtml === '') {
            $mediaHtml = '<div class="empty-media">No media attached to this post.</div>';
        }

        $flags = collect((array) ($postModel->content_validation_flags ?? []))
            ->flatMap(fn ($items) => is_array($items) ? $items : [$items])
            ->filter()
            ->map(fn ($item) => '<li>' . e((string) $item) . '</li>')
            ->implode('');

        $html = '<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Admin Post Preview</title>
<style>
    :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #070a12; color: #f8fafc; }
    .shell { min-height: 100vh; padding: 18px; display: grid; gap: 16px; grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr); }
    .media { min-height: calc(100vh - 36px); display: grid; place-items: center; gap: 12px; border: 1px solid rgba(148,163,184,.18); border-radius: 28px; background: radial-gradient(circle at top, rgba(244,63,94,.18), transparent 34%), #0f172a; overflow: hidden; padding: 14px; }
    img, video { max-width: 100%; max-height: calc(100vh - 76px); border-radius: 22px; object-fit: contain; background: #020617; box-shadow: 0 24px 80px rgba(0,0,0,.38); }
    .panel { border: 1px solid rgba(148,163,184,.18); border-radius: 28px; background: rgba(15,23,42,.88); padding: 20px; box-shadow: 0 18px 60px rgba(0,0,0,.24); }
    .stack { display: grid; gap: 16px; align-content: start; }
    .eyebrow { margin: 0 0 8px; color: #fb7185; font-size: 11px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; }
    h1 { margin: 0; font-size: 24px; line-height: 1.15; }
    .muted { color: #94a3b8; }
    .caption { white-space: pre-wrap; line-height: 1.6; }
    .badges { display: flex; flex-wrap: wrap; gap: 8px; }
    .badge { border-radius: 999px; border: 1px solid rgba(148,163,184,.2); background: rgba(255,255,255,.06); padding: 7px 10px; font-size: 12px; color: #e2e8f0; }
    ul { margin: 8px 0 0; padding-left: 18px; color: #cbd5e1; }
    li { margin: 6px 0; }
    .empty-media { color: #94a3b8; border: 1px dashed rgba(148,163,184,.24); border-radius: 20px; padding: 24px; }
    @media (max-width: 860px) { .shell { grid-template-columns: 1fr; } .media { min-height: 56vh; } }
</style>
</head>
<body>
<main class="shell">
    <section class="media">' . $mediaHtml . '</section>
    <aside class="stack">
        <section class="panel">
            <p class="eyebrow">Post owner</p>
            <h1>' . e($postModel->user?->name ?? 'Unknown user') . '</h1>
            <p class="muted">@' . e($postModel->user?->username ?? 'unknown') . '</p>
        </section>
        <section class="panel">
            <p class="eyebrow">Caption</p>
            <div class="caption">' . e($postModel->content ?: 'Media post without caption') . '</div>
        </section>
        <section class="panel">
            <p class="eyebrow">Validation</p>
            <div class="badges">
                <span class="badge">Status: ' . e($postModel->content_validation_status ?: 'Not recorded') . '</span>
                <span class="badge">Score: ' . e((string) ($postModel->content_validation_score ?? 'N/A')) . '</span>
                <span class="badge">Views: ' . e((string) ($postModel->view_count ?? 0)) . '</span>
            </div>
            <p class="muted">' . e($postModel->content_validation_summary ?: 'No validation summary recorded.') . '</p>
            ' . ($flags ? '<ul>' . $flags . '</ul>' : '') . '
        </section>
    </aside>
</main>
</body>
</html>';

        return response($html);
    }

    private function mediaUrl(string $path): string
    {
        if (Str::startsWith($path, ['http://', 'https://', '//'])) {
            return $path;
        }

        return asset('storage/' . ltrim($path, '/'));
    }

    public function comments(Request $request)
    {
        $query = Comment::with(['user', 'post'])->latest();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('content', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                  });
        }

        $comments = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Content/Comments', [
            'comments' => $comments,
            'filters' => $request->only(['search']),
        ]);
    }

    public function reportedComments()
    {
        $comments = Comment::query()
            ->with(['user', 'post'])
            ->whereHas('reports', function ($query): void {
                $query->where('status', ContentReport::STATUS_OPEN);
            })
            ->withCount(['reports as open_reports_count' => function ($query): void {
                $query->where('status', ContentReport::STATUS_OPEN);
            }])
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Content/Comments', [
            'comments' => $comments,
            'filters' => ['reported' => true],
        ]);
    }

    public function approvePost(Post $post)
    {
        if ($post->trashed()) {
            $post->restore();
        }

        $post->forceFill([
            'content_validation_status' => 'approved',
            'content_validation_summary' => 'Approved by admin review.',
            'content_validation_flags' => [
                'violations' => [],
                'warnings' => [],
            ],
            'content_validated_at' => now(),
        ])->save();

        $this->postRewardService->syncReward($post, $this->longestVideoDurationForPost($post));

        return back()->with('success', 'Post approved successfully.');
    }

    public function rejectPost(Post $post)
    {
        $post->forceFill([
            'content_validation_status' => 'rejected',
            'content_validation_summary' => 'Rejected by admin review.',
            'reward_status' => 'blocked',
            'reward_amount' => 0,
            'reward_reason' => 'Reward blocked because the post was rejected by admin review.',
            'rewarded_at' => null,
        ])->save();

        $post->delete();
        return back()->with('success', 'Post removed successfully.');
    }

    public function disablePost(Post $post)
    {
        if ($post->trashed()) {
            return back()->with('info', 'Post is already disabled.');
        }

        $post->delete();

        return back()->with('success', 'Post disabled successfully.');
    }

    public function enablePost(string $post)
    {
        $postModel = Post::withTrashed()->findOrFail($post);

        if (! $postModel->trashed()) {
            return back()->with('info', 'Post is already active.');
        }

        $postModel->restore();

        return back()->with('success', 'Post enabled successfully.');
    }

    public function featurePost(Post $post)
    {
        // Assuming we might add is_featured later, for now do nothing or toggle is_pinned if that's what we want
        return back()->with('info', 'Feature post not implemented yet.');
    }

    public function pinPost(Post $post)
    {
        $post->is_pinned = !$post->is_pinned;
        $post->save();
        
        return back()->with('success', $post->is_pinned ? 'Post pinned successfully.' : 'Post unpinned successfully.');
    }

    private function longestVideoDurationForPost(Post $post): ?float
    {
        $duration = $post->media()
            ->where('file_type', 'video')
            ->whereNotNull('duration')
            ->max('duration');

        return $duration !== null ? (float) $duration : null;
    }

    public function approveComment(Comment $comment)
    {
        if ($comment->trashed()) {
            $comment->restore();
            return back()->with('success', 'Comment restored successfully.');
        }
        return back()->with('info', 'Comment is already active.');
    }

    public function rejectComment(Comment $comment)
    {
        $comment->delete();
        return back()->with('success', 'Comment removed successfully.');
    }

    public function reports(Request $request)
    {
        $query = ContentReport::query()
            ->with(['reporter', 'post.user', 'comment.user', 'reviewer'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', (string) $request->string('status'));
        }

        $reports = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Content/Reports', [
            'reports' => $reports,
            'filters' => $request->only(['status']),
            'statuses' => [ContentReport::STATUS_OPEN, ContentReport::STATUS_RESOLVED],
        ]);
    }

    public function resolveReport(Request $request, ContentReport $report)
    {
        $request->validate([
            'resolution_note' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($report->status === ContentReport::STATUS_RESOLVED) {
            return back()->with('info', 'Report is already resolved.');
        }

        $report->update([
            'status' => ContentReport::STATUS_RESOLVED,
            'reviewed_by' => auth('admin')->id(),
            'resolved_at' => now(),
            'resolution_note' => $request->input('resolution_note'),
        ]);

        return back()->with('success', 'Report resolved successfully.');
    }
}
