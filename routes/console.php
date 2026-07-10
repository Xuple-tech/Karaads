<?php

use App\Models\Story;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('stories:cleanup', function () {
    $expiredStories = Story::withTrashed()
        ->with('media')
        ->where(function ($query): void {
            $query->where('expires_at', '<=', now())
                ->orWhere('created_at', '<=', now()->subDay());
        })
        ->get();

    $deleted = 0;
    foreach ($expiredStories as $story) {
        $storyPaths = [
            $story->music_path,
        ];

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

        Storage::disk('public')->delete(array_values(array_unique(array_filter($storyPaths))));
        $story->forceDelete();
        $deleted++;
    }

    $this->info("Cleaned up {$deleted} expired stories.");
})->purpose('Delete expired stories and media files');

Schedule::command('stories:cleanup')->everyFifteenMinutes()->withoutOverlapping();
Schedule::command('calls:expire-stale')->everyMinute();
Schedule::command('live:expire-stale')->everyMinute();
Schedule::command('ads:payments:reconcile-pending --older-than=2 --limit=150')->everyMinute()->withoutOverlapping();
Schedule::command('badge:payments:reconcile-pending --older-than=1 --limit=150')->everyMinute()->withoutOverlapping();
Schedule::command('reco:rebuild')->dailyAt('02:15');
Schedule::command('reco:ml:train --apply')->dailyAt('03:00');
