<?php

require __DIR__ . '/vendor/autoload.php';

$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$s3 = Illuminate\Support\Facades\Storage::disk('s3');
$bucket = (string) config('filesystems.disks.s3.bucket');
$localRoot = storage_path('app/public');
$badPrefix = str_replace('\\', '/', trim($localRoot, '/') . '/');
$client = $s3->getClient();

$copiedLocal = 0;
$copiedBadPrefix = 0;
$skipped = 0;
$missing = 0;
$failed = 0;

$restorePath = static function (?string $path) use ($s3, $client, $bucket, $localRoot, $badPrefix, &$copiedLocal, &$copiedBadPrefix, &$skipped, &$missing, &$failed): void {
    $path = ltrim((string) $path, '/');
    if ($path === '' || str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
        return;
    }

    try {
        if ($s3->exists($path)) {
            $skipped++;
            return;
        }

        $localPath = $localRoot . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $path);
        if (is_file($localPath)) {
            $stream = fopen($localPath, 'rb');
            if ($stream !== false) {
                $s3->put($path, $stream, ['visibility' => 'public']);
                fclose($stream);
                $copiedLocal++;
                return;
            }
        }

        $sourceKey = $badPrefix . $path;
        if ($s3->exists($sourceKey)) {
            $client->copyObject([
                'Bucket' => $bucket,
                'CopySource' => rawurlencode($bucket . '/' . $sourceKey),
                'Key' => $path,
                'ACL' => 'public-read',
            ]);
            $copiedBadPrefix++;
            return;
        }

        $missing++;
    } catch (Throwable $exception) {
        $failed++;
        echo "failed {$path} {$exception->getMessage()}" . PHP_EOL;
    }
};

$paths = [];
foreach (App\Models\PostMedia::query()->get(['file_path', 'processed_file_path', 'thumbnail_path', 'variants']) as $media) {
    foreach (['file_path', 'processed_file_path', 'thumbnail_path'] as $field) {
        $paths[] = $media->{$field};
    }

    if (is_array($media->variants)) {
        foreach ($media->variants as $variantPath) {
            $paths[] = $variantPath;
        }
    }
}

foreach (array_unique(array_filter($paths)) as $path) {
    $restorePath($path);
}

echo "post_media copied_local={$copiedLocal} copied_bad_prefix={$copiedBadPrefix} skipped={$skipped} missing={$missing} failed={$failed}" . PHP_EOL;
