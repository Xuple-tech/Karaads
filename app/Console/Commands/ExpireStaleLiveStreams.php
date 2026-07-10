<?php

namespace App\Console\Commands;

use App\Events\LiveStreamEnded;
use App\Models\LiveStream;
use App\Models\Post;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Throwable;

class ExpireStaleLiveStreams extends Command
{
    protected $signature = 'live:expire-stale {--dry-run : Print stale streams without ending them}';

    protected $description = 'Expire stale live streams with no recent heartbeat';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $timeoutSeconds = max(30, (int) config('live.stale_stream_timeout_seconds', 900));
        $cutoff = now()->subSeconds($timeoutSeconds);

        $stats = [
            'checked' => 0,
            'ended' => 0,
            'skipped' => 0,
            'failed' => 0,
        ];

        LiveStream::query()
            ->where('status', 'live')
            ->chunkById(100, function ($streams) use ($cutoff, $dryRun, &$stats) {
                foreach ($streams as $stream) {
                    $stats['checked']++;

                    $activityAt = $this->resolveActivityTimestamp($stream);
                    if (!$activityAt || $activityAt->greaterThan($cutoff)) {
                        $stats['skipped']++;
                        continue;
                    }

                    if ($dryRun) {
                        $this->line("stale_live_stream {$stream->id} host={$stream->user_id}");
                        continue;
                    }

                    try {
                        $stream->forceFill([
                            'status' => 'ended',
                            'ended_at' => now(),
                        ])->save();

                        $this->createReplayPostIfMissing($stream);

                        LiveStreamEnded::dispatch($stream);
                        $stats['ended']++;
                    } catch (Throwable $e) {
                        $stats['failed']++;
                        $this->warn("failed_to_end_live {$stream->id} error={$e->getMessage()}");
                    }
                }
            }, 'id');

        $this->info(
            'live:expire-stale complete ' .
            "checked={$stats['checked']} ended={$stats['ended']} " .
            "skipped={$stats['skipped']} failed={$stats['failed']} " .
            'dry_run=' . ($dryRun ? 'true' : 'false')
        );

        return self::SUCCESS;
    }

    private function resolveActivityTimestamp(LiveStream $stream): ?Carbon
    {
        return $stream->last_activity_at
            ?? $stream->started_at
            ?? $stream->updated_at
            ?? $stream->created_at;
    }

    private function createReplayPostIfMissing(LiveStream $stream): void
    {
        if ($stream->replay_post_id) {
            return;
        }

        $post = Post::query()->create([
            'id' => (string) Str::uuid(),
            'user_id' => $stream->user_id,
            'content' => "Was live: {$stream->title}",
            'type' => 'post',
            'visibility' => $stream->visibility,
        ]);

        $stream->forceFill([
            'replay_post_id' => $post->id,
        ])->save();
    }
}
