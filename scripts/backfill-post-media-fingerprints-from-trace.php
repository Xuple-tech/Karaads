<?php

use App\Models\Post;

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$updated = 0;
$skipped = 0;

Post::query()
    ->whereNotNull('content_validation_trace')
    ->with(['media' => fn ($query) => $query->orderBy('order')->orderBy('id')])
    ->chunkById(200, function ($posts) use (&$updated, &$skipped): void {
        foreach ($posts as $post) {
            $fingerprints = collect((array) ($post->content_validation_trace ?? []))
                ->filter(fn ($entry) => is_array($entry) && ($entry['rule'] ?? null) === 'media_fingerprint')
                ->flatMap(fn ($entry) => (array) data_get($entry, 'meta.fingerprints', []))
                ->filter(fn ($fingerprint) => is_string($fingerprint) && preg_match('/^[a-f0-9]{64}$/i', $fingerprint))
                ->values();

            $media = $post->media->filter(fn ($item) => empty($item->media_fingerprint))->values();

            if ($fingerprints->isEmpty() || $media->isEmpty() || $fingerprints->count() !== $media->count()) {
                $skipped++;
                continue;
            }

            foreach ($media as $index => $item) {
                $item->forceFill(['media_fingerprint' => strtolower($fingerprints[$index])])->save();
                $updated++;
            }
        }
    });

echo "Updated media fingerprints: {$updated}\n";
echo "Skipped posts: {$skipped}\n";
