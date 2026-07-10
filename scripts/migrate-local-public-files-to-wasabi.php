<?php

use Illuminate\Support\Facades\Storage;

require __DIR__ . '/../vendor/autoload.php';

$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$limitBytes = (int) (50 * 1024 * 1024 * 1024);
$root = realpath(storage_path('app/public'));
$copiedBytes = 0;
$copiedFiles = 0;
$failedFiles = 0;
$skippedFiles = 0;

if (! $root) {
    echo '[' . now()->toDateTimeString() . '] local public storage does not exist.' . PHP_EOL;
    exit(1);
}

$log = static function (string $message): void {
    echo '[' . now()->toDateTimeString() . '] ' . $message . PHP_EOL;
};

$log('Starting local post file migration to Wasabi, capped at 50GB.');

$directories = ['posts', 'post-music'];

foreach ($directories as $directory) {
    $scanRoot = $root . DIRECTORY_SEPARATOR . $directory;
    if (! is_dir($scanRoot)) {
        continue;
    }

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($scanRoot, FilesystemIterator::SKIP_DOTS)
    );

    foreach ($iterator as $file) {
    if (! $file->isFile()) {
        continue;
    }

    $localPath = $file->getRealPath();
    if (! $localPath || ! str_starts_with($localPath, $root)) {
        $skippedFiles++;
        continue;
    }

    $relativePath = ltrim(str_replace('\\', '/', substr($localPath, strlen($root))), '/');
    if ($relativePath === '') {
        $skippedFiles++;
        continue;
    }

    $size = $file->getSize();
    if ($size <= 0) {
        $skippedFiles++;
        continue;
    }

    if (($copiedBytes + $size) > $limitBytes) {
        break;
    }

    try {
        $stream = fopen($localPath, 'rb');
        if ($stream === false) {
            throw new RuntimeException('Unable to open local file.');
        }

        try {
            Storage::disk('s3')->put($relativePath, $stream, ['visibility' => 'public']);
        } finally {
            fclose($stream);
        }

        if (! Storage::disk('s3')->exists($relativePath)) {
            throw new RuntimeException('Wasabi object was not found after upload.');
        }

        if (! @unlink($localPath)) {
            throw new RuntimeException('Copied to Wasabi, but unable to delete local file.');
        }

        $copiedBytes += $size;
        $copiedFiles++;
        $log(sprintf('copied-and-deleted %s (%0.2f GB total)', $relativePath, $copiedBytes / 1024 / 1024 / 1024));
    } catch (Throwable $e) {
        $failedFiles++;
        $log('failed ' . $relativePath . ' :: ' . $e->getMessage());
    }
    }
}

$log(sprintf(
    'Finished. Copied files: %d, skipped: %d, failed: %d, total copied: %0.2f GB.',
    $copiedFiles,
    $skippedFiles,
    $failedFiles,
    $copiedBytes / 1024 / 1024 / 1024
));
