<?php

namespace App\Console\Commands;

use App\Jobs\ProcessPostMedia;
use App\Jobs\ProcessStoryMedia;
use App\Jobs\ProcessUserAvatar;
use App\Models\PostMedia;
use App\Models\StoryMedia;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class MediaBackfillDerivatives extends Command
{
    protected $signature = 'media:backfill-derivatives
        {--posts : Backfill post media}
        {--stories : Backfill story media}
        {--avatars : Backfill avatar variants}
        {--chunk=100 : Batch size for chunked queries}
        {--only-missing=1 : Queue only media missing derivatives (1/0)}';

    protected $description = 'Queue derivative processing for posts, stories, and profile avatars.';

    public function handle(): int
    {
        $chunk = max(1, (int) $this->option('chunk'));
        $onlyMissing = $this->resolveOnlyMissing();

        $runPosts = (bool) $this->option('posts');
        $runStories = (bool) $this->option('stories');
        $runAvatars = (bool) $this->option('avatars');
        if (!$runPosts && !$runStories && !$runAvatars) {
            $runPosts = $runStories = $runAvatars = true;
        }

        $queued = [
            'posts' => 0,
            'stories' => 0,
            'avatars' => 0,
        ];

        if ($runPosts) {
            $query = PostMedia::query();
            if ($onlyMissing) {
                $query->where(fn(Builder $builder) => $builder
                    ->whereNull('processing_status')
                    ->orWhere('processing_status', '!=', 'ready')
                    ->orWhereNull('variants'));
            }

            $query->chunkById($chunk, function ($items) use (&$queued): void {
                foreach ($items as $item) {
                    ProcessPostMedia::dispatch($item->id);
                    $queued['posts']++;
                }
            });
        }

        if ($runStories) {
            $query = StoryMedia::query();
            if ($onlyMissing) {
                $query->where(fn(Builder $builder) => $builder
                    ->whereNull('processing_status')
                    ->orWhere('processing_status', '!=', 'ready')
                    ->orWhereNull('variants'));
            }

            $query->chunkById($chunk, function ($items) use (&$queued): void {
                foreach ($items as $item) {
                    ProcessStoryMedia::dispatch($item->id);
                    $queued['stories']++;
                }
            });
        }

        if ($runAvatars) {
            $query = User::query()->whereNotNull('avatar');
            if ($onlyMissing) {
                $query->where(fn(Builder $builder) => $builder
                    ->whereNull('avatar_processing_status')
                    ->orWhere('avatar_processing_status', '!=', 'ready')
                    ->orWhereNull('avatar_variants'));
            }

            $query->chunkById($chunk, function ($users) use (&$queued): void {
                foreach ($users as $user) {
                    $sourcePath = is_array($user->avatar_variants)
                        ? ($user->avatar_variants['original'] ?? null)
                        : null;
                    $sourcePath = $sourcePath ?: $user->avatar;

                    if (!$sourcePath || Str::startsWith($sourcePath, ['http://', 'https://'])) {
                        continue;
                    }

                    ProcessUserAvatar::dispatch($user->id, $sourcePath);
                    $queued['avatars']++;
                }
            });
        }

        $this->info("Queued {$queued['posts']} post media jobs.");
        $this->info("Queued {$queued['stories']} story media jobs.");
        $this->info("Queued {$queued['avatars']} avatar jobs.");

        return self::SUCCESS;
    }

    private function resolveOnlyMissing(): bool
    {
        $option = $this->option('only-missing');

        if ($option === null || $option === '') {
            return true;
        }

        $parsed = filter_var($option, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);

        return $parsed ?? true;
    }
}

