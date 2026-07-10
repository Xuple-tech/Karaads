<?php

namespace App\Jobs;

use App\Models\PostMedia;
use App\Services\Media\ImageDerivativeService;
use App\Services\Media\MediaPathService;
use App\Services\Media\VideoDerivativeService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Str;

class ProcessPostMedia implements ShouldQueue
{
    use Queueable;

    public int $timeout = 3600;
    public int $tries = 2;

    public function __construct(
        public readonly string $postMediaId
    ) {
    }

    public function handle(
        ImageDerivativeService $imageDerivativeService,
        VideoDerivativeService $videoDerivativeService,
        MediaPathService $mediaPathService
    ): void {
        $media = PostMedia::query()->find($this->postMediaId);
        if (!$media) {
            return;
        }

        if (! $this->hasUsablePath($media->file_path)) {
            $media->forceFill([
                'processing_status' => 'failed',
                'processing_error' => 'Source media path is missing because storage failed during upload.',
                'processed_at' => now(),
            ])->save();

            return;
        }

        $previousDerivativePaths = $this->collectDerivativePaths($media);

        $media->forceFill([
            'processing_status' => 'processing',
            'processing_error' => null,
        ])->save();

        $isVideo = $media->file_type === 'video' || Str::startsWith((string) $media->mime_type, 'video/');

        if ($isVideo) {
            $sourcePath = $media->file_path;
            $result = $videoDerivativeService->process($media->file_path);
            $newDerivativePaths = array_values(array_filter([
                $result['processed_file_path'],
                $result['thumbnail_path'],
            ]));
            $processedPath = $result['processed_file_path'];
            $isReady = $result['status'] === 'ready' && $this->hasUsablePath($processedPath);

            $media->forceFill([
                'file_path' => $isReady ? $processedPath : $media->file_path,
                'processed_file_path' => $processedPath,
                'thumbnail_path' => $result['thumbnail_path'],
                'variants' => [
                    'original' => $isReady ? null : $sourcePath,
                    'processed' => $processedPath,
                    'thumb' => $result['thumbnail_path'],
                ],
                'processing_status' => $result['status'],
                'processing_error' => $result['error'],
                'processed_at' => now(),
            ])->save();

            $this->deleteStaleDerivativePaths($mediaPathService, $previousDerivativePaths, $newDerivativePaths);
            if ($isReady && $sourcePath !== $processedPath) {
                $mediaPathService->deletePath($sourcePath);
            }

            return;
        }

        $variants = $imageDerivativeService->generateVariants($media->file_path);
        $thumbnailPath = $variants['thumb'] ?? null;
        $mediumPath = $variants['medium'] ?? null;
        $newDerivativePaths = array_values(array_filter(array_merge(
            [$thumbnailPath, $mediumPath],
            array_values($variants)
        )));

        $media->forceFill([
            'processed_file_path' => $mediumPath,
            'thumbnail_path' => $thumbnailPath ?? $media->thumbnail_path,
            'variants' => array_merge(['original' => $media->file_path], $variants),
            'processing_status' => $variants === [] ? 'failed' : 'ready',
            'processing_error' => $variants === [] ? 'Unable to generate image derivatives.' : null,
            'processed_at' => now(),
        ])->save();

        $this->deleteStaleDerivativePaths($mediaPathService, $previousDerivativePaths, $newDerivativePaths);
    }

    private function hasUsablePath(?string $path): bool
    {
        $path = trim((string) $path);

        return $path !== '' && $path !== '0';
    }

    /**
     * @return array<int, string>
     */
    private function collectDerivativePaths(PostMedia $media): array
    {
        $paths = [
            $media->processed_file_path,
            $media->thumbnail_path,
        ];

        if (is_array($media->variants)) {
            foreach ($media->variants as $key => $path) {
                if ($key === 'original') {
                    continue;
                }

                $paths[] = $path;
            }
        }

        return array_values(array_unique(array_filter($paths)));
    }

    /**
     * @param  array<int, string>  $previousPaths
     * @param  array<int, string>  $newPaths
     */
    private function deleteStaleDerivativePaths(
        MediaPathService $mediaPathService,
        array $previousPaths,
        array $newPaths
    ): void {
        $stalePaths = array_values(array_diff($previousPaths, array_values(array_unique($newPaths))));
        if ($stalePaths !== []) {
            $mediaPathService->deleteMany($stalePaths);
        }
    }
}
