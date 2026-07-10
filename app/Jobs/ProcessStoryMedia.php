<?php

namespace App\Jobs;

use App\Models\StoryMedia;
use App\Services\Media\ImageDerivativeService;
use App\Services\Media\MediaPathService;
use App\Services\Media\VideoDerivativeService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Str;

class ProcessStoryMedia implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $storyMediaId
    ) {
    }

    public function handle(
        ImageDerivativeService $imageDerivativeService,
        VideoDerivativeService $videoDerivativeService,
        MediaPathService $mediaPathService
    ): void {
        $media = StoryMedia::query()->find($this->storyMediaId);
        if (!$media) {
            return;
        }

        $previousDerivativePaths = $this->collectDerivativePaths($media);

        $media->forceFill([
            'processing_status' => 'processing',
            'processing_error' => null,
        ])->save();

        $isVideo = $media->file_type === 'video' || Str::startsWith((string) $media->mime_type, 'video/');

        if ($isVideo) {
            $result = $videoDerivativeService->process($media->file_path);
            $newDerivativePaths = array_values(array_filter([
                $result['processed_file_path'],
                $result['thumbnail_path'],
            ]));

            $media->forceFill([
                'processed_file_path' => $result['processed_file_path'],
                'thumbnail_path' => $result['thumbnail_path'],
                'variants' => [
                    'original' => $media->file_path,
                    'processed' => $result['processed_file_path'],
                    'thumb' => $result['thumbnail_path'],
                ],
                'processing_status' => $result['status'],
                'processing_error' => $result['error'],
                'processed_at' => now(),
            ])->save();

            $this->deleteStaleDerivativePaths($mediaPathService, $previousDerivativePaths, $newDerivativePaths);

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

    /**
     * @return array<int, string>
     */
    private function collectDerivativePaths(StoryMedia $media): array
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
