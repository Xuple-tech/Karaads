<?php

namespace App\Console\Commands;

use App\Models\Like;
use App\Models\LiveStream;
use App\Models\LiveStreamJoin;
use App\Models\LiveStreamMessage;
use App\Models\Post;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class PurgeLiveContent extends Command
{
    protected $signature = 'live:purge-content
        {--dry-run : Show what would be deleted without changing data}
        {--keep-files : Keep live archive files on disk}';

    protected $description = 'Delete all live streams, live chat/join data, live likes, and live replay posts.';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $keepFiles = (bool) $this->option('keep-files');

        $streamIds = LiveStream::query()->pluck('id')->map(fn ($id) => (string) $id)->values();
        $replayPostIds = LiveStream::query()
            ->whereNotNull('replay_post_id')
            ->pluck('replay_post_id')
            ->map(fn ($id) => (string) $id)
            ->unique()
            ->values();

        $counts = [
            'live_streams' => $streamIds->count(),
            'live_messages' => LiveStreamMessage::query()->whereIn('live_stream_id', $streamIds)->count(),
            'live_joins' => LiveStreamJoin::query()->whereIn('live_stream_id', $streamIds)->count(),
            'live_likes' => Like::query()
                ->where('likeable_type', LiveStream::class)
                ->whereIn('likeable_id', $streamIds)
                ->count(),
            'replay_posts' => Post::withTrashed()->whereIn('id', $replayPostIds)->count(),
        ];

        $this->info('live:purge-content ' . ($dryRun ? 'dry-run' : 'delete') . ' counts=' . json_encode($counts));

        if ($dryRun) {
            return self::SUCCESS;
        }

        DB::transaction(function () use ($streamIds, $replayPostIds): void {
            Like::query()
                ->where('likeable_type', LiveStream::class)
                ->whereIn('likeable_id', $streamIds)
                ->delete();

            LiveStreamMessage::query()->whereIn('live_stream_id', $streamIds)->delete();
            LiveStreamJoin::query()->whereIn('live_stream_id', $streamIds)->delete();
            LiveStream::query()->whereIn('id', $streamIds)->delete();

            Post::withTrashed()
                ->whereIn('id', $replayPostIds)
                ->get()
                ->each(fn (Post $post) => $post->forceDelete());
        });

        $streamIds->each(fn (string $streamId) => Cache::forget('live-stream-signals:' . $streamId));

        if (! $keepFiles) {
            $this->deleteArchiveFiles();
        }

        $this->info('live:purge-content complete');

        return self::SUCCESS;
    }

    private function deleteArchiveFiles(): void
    {
        foreach (['local', 'public'] as $disk) {
            try {
                Storage::disk($disk)->deleteDirectory('live/archives');
            } catch (Throwable $e) {
                $this->warn("failed_to_delete_live_archives disk={$disk} error={$e->getMessage()}");
            }
        }
    }
}
