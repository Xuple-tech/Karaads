<?php

use App\Models\Post;
use App\Models\PostMedia;
use Illuminate\Support\Facades\Storage;

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$limitBytes = (int) (50 * 1024 * 1024 * 1024);
$publicRoot = storage_path('app/public');
$copiedBytes = 0;
$copiedFiles = 0;
$skippedFiles = 0;
$failedFiles = 0;

$log = static function (string $message): void {
    echo '[' . now()->toDateTimeString() . '] ' . $message . PHP_EOL;
};

$copyPath = function (?string $path) use (&$copiedBytes, &$copiedFiles, &$skippedFiles, &$failedFiles, $limitBytes, $publicRoot, $log): bool {
    $path = trim((string) $path);
    if ($path === '' || $path === '0' || str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
        $skippedFiles++;
        return true;
    }

    $localPath = realpath($publicRoot . DIRECTORY_SEPARATOR . ltrim($path, '/'));
    $localRoot = realpath($publicRoot);
    if (! $localRoot || ! $localPath || ! str_starts_with($localPath, $localRoot) || ! is_file($localPath)) {
        $skippedFiles++;
        return true;
    }

    $size = filesize($localPath) ?: 0;
    if ($size <= 0) {
        $skippedFiles++;
        return true;
    }

    if (($copiedBytes + $size) > $limitBytes) {
        return false;
    }

    try {
        if (Storage::disk('s3')->exists($path)) {
            $skippedFiles++;
            return true;
        }

        $stream = fopen($localPath, 'rb');
        if ($stream === false) {
            throw new RuntimeException('Unable to open local file.');
        }

        try {
            Storage::disk('s3')->put($path, $stream, ['visibility' => 'public']);
        } finally {
            fclose($stream);
        }

        $copiedBytes += $size;
        $copiedFiles++;
        $log(sprintf('copied %s (%0.2f GB total)', $path, $copiedBytes / 1024 / 1024 / 1024));
    } catch (Throwable $e) {
        $failedFiles++;
        $log('failed ' . $path . ' :: ' . $e->getMessage());
    }

    return true;
};

$seen = [];
$visit = function (?string $path) use (&$seen, $copyPath): bool {
    $path = trim((string) $path);
    if ($path === '' || isset($seen[$path])) {
        return true;
    }

    $seen[$path] = true;
    return $copyPath($path);
};

$log('Starting post media migration to Wasabi, capped at 50GB.');

foreach (PostMedia::query()->latest('created_at')->cursor() as $media) {
    if (! $visit($media->file_path)) {
        break;
    }
    if (! $visit($media->processed_file_path)) {
        break;
    }
    if (! $visit($media->thumbnail_path)) {
        break;
    }
    if (is_array($media->variants)) {
        foreach ($media->variants as $variantPath) {
            if (! $visit($variantPath)) {
                break 2;
            }
        }
    }
}

foreach (Post::query()->whereNotNull('music_path')->latest('created_at')->cursor() as $post) {
    if (! $visit($post->music_path)) {
        break;
    }
}

$log(sprintf(
    'Finished. Copied files: %d, skipped: %d, failed: %d, total copied: %0.2f GB.',
    $copiedFiles,
    $skippedFiles,
    $failedFiles,
    $copiedBytes / 1024 / 1024 / 1024
));
