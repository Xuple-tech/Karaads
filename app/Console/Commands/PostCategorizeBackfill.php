<?php

namespace App\Console\Commands;

use App\Domain\Recommendation\Services\PostCategorizationService;
use App\Models\Post;
use Illuminate\Console\Command;

class PostCategorizeBackfill extends Command
{
    protected $signature = 'posts:categorize
        {--chunk=500 : chunk size}
        {--only-missing : only categorize posts without category}';

    protected $description = 'Backfill post category fields for recommendation relevance.';

    public function handle(PostCategorizationService $categorizationService): int
    {
        $chunk = max(50, (int) $this->option('chunk'));
        $onlyMissing = (bool) $this->option('only-missing');

        $query = Post::query()->with('media');
        if ($onlyMissing) {
            $query->whereNull('primary_category');
        }

        $total = (clone $query)->count();
        $processed = 0;

        $query->chunkById($chunk, function ($posts) use ($categorizationService, &$processed, $total) {
            foreach ($posts as $post) {
                $categorization = $categorizationService->categorize(
                    (string) ($post->content ?? ''),
                    (array) ($post->hashtags ?? []),
                    $post->media->first()?->file_type,
                );

                $post->update([
                    'primary_category' => $categorization['primary_category'],
                    'category_confidence' => $categorization['confidence'],
                    'category_scores' => $categorization['scores'],
                    'hashtags' => $categorization['hashtags'],
                ]);

                $processed++;
            }

            $this->line("Categorized {$processed}/{$total} posts...");
        }, 'id');

        $this->info("Done. Categorized {$processed} posts.");

        return self::SUCCESS;
    }
}

