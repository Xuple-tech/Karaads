<?php

use Illuminate\Support\Facades\Storage;

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$logPath = $argv[1] ?? '/tmp/karaads-posts-to-wasabi.log';
$root = realpath(storage_path('app/public'));

if (! $root || ! is_file($logPath)) {
    echo '[' . now()->toDateTimeString() . '] Missing public root or migration log.' . PHP_EOL;
    exit(1);
}

$deleted = 0;
$skipped = 0;
$failed = 0;
$bytes = 0;
$seen = [];

$handle = fopen($logPath, 'rb');
if ($handle === false) {
    echo '[' . now()->toDateTimeString() . '] Unable to open log.' . PHP_EOL;
    exit(1);
}

while (($line = fgets($handle)) !== false) {
    if (! preg_match('/\\] copied (posts\\/(?:original|derived)\\/\\S+|post-music\\/\\S+) \\(/', $line, $matches)) {
        continue;
    }

    $relativePath = $matches[1];
    if (isset($seen[$relativePath])) {
        continue;
    }
    $seen[$relativePath] = true;

    $localPath = realpath($root . DIRECTORY_SEPARATOR . $relativePath);
    if (! $localPath || ! str_starts_with($localPath, $root) || ! is_file($localPath)) {
        $skipped++;
        continue;
    }

    try {
        if (! Storage::disk('s3')->exists($relativePath)) {
            $skipped++;
            continue;
        }

        $size = filesize($localPath) ?: 0;
        if (@unlink($localPath)) {
            $deleted++;
            $bytes += $size;
            echo '[' . now()->toDateTimeString() . '] deleted ' . $relativePath . PHP_EOL;
        } else {
            $failed++;
            echo '[' . now()->toDateTimeString() . '] failed-delete ' . $relativePath . PHP_EOL;
        }
    } catch (Throwable $e) {
        $failed++;
        echo '[' . now()->toDateTimeString() . '] failed ' . $relativePath . ' :: ' . $e->getMessage() . PHP_EOL;
    }
}

fclose($handle);

echo sprintf(
    "[%s] Finished. Deleted files: %d, skipped: %d, failed: %d, freed: %0.2f GB.\n",
    now()->toDateTimeString(),
    $deleted,
    $skipped,
    $failed,
    $bytes / 1024 / 1024 / 1024
);
