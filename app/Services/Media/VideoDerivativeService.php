<?php

namespace App\Services\Media;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class VideoDerivativeService
{
    public function __construct(
        private readonly MediaPathService $mediaPathService,
        private readonly StorageWorkFileService $storageWorkFileService
    ) {
    }

    /**
     * @return array{status:string,processed_file_path:?string,thumbnail_path:?string,error:?string}
     */
    public function process(string $sourcePath, string $disk = 'public'): array
    {
        if (!Storage::disk($disk)->exists($sourcePath)) {
            return [
                'status' => 'failed',
                'processed_file_path' => null,
                'thumbnail_path' => null,
                'error' => 'Source video file does not exist.',
            ];
        }

        ['ffmpeg' => $ffmpeg, 'ffprobe' => $ffprobe] = $this->resolveBinaries();

        if ($ffmpeg === null || $ffprobe === null) {
            if (app()->environment('local')) {
                return [
                    'status' => 'ready',
                    'processed_file_path' => $sourcePath,
                    'thumbnail_path' => null,
                    'error' => 'FFmpeg/FFprobe not available. Using the original uploaded video in local development.',
                ];
            }

            return [
                'status' => 'skipped',
                'processed_file_path' => null,
                'thumbnail_path' => null,
                'error' => 'FFmpeg/FFprobe not available. Video derivatives were skipped. Install FFmpeg or set FFMPEG_BINARY/FFPROBE_BINARY.',
            ];
        }

        $sourceWorkFile = $this->storageWorkFileService->localCopy($disk, $sourcePath);
        $sourceFullPath = $sourceWorkFile['path'];
        $processedPath = $this->mediaPathService->buildDerivedPath($sourcePath, 'processed', 'mp4');
        $thumbnailPath = $this->mediaPathService->buildDerivedPath($sourcePath, 'thumb', 'webp');
        $processedFullPath = $this->storageWorkFileService->temporaryPath($processedPath);
        $thumbnailFullPath = $this->storageWorkFileService->temporaryPath($thumbnailPath);

        $maxLongEdge = (int) config('media.video.max_long_edge', 1080);
        $crf = (int) config('media.video.crf', 23);
        $preset = (string) config('media.video.preset', 'fast');
        $audioBitrate = (string) config('media.video.audio_bitrate', '96k');
        $thumbAt = (float) config('media.video.thumbnail_second', 1.0);
        $thumbEdge = (int) config('media.video.thumbnail_long_edge', 480);

        $scaleFilter = "scale='min({$maxLongEdge},iw)':'min({$maxLongEdge},ih)':force_original_aspect_ratio=decrease";
        $thumbFilter = "scale='min({$thumbEdge},iw)':'min({$thumbEdge},ih)':force_original_aspect_ratio=decrease";

        $videoCommand = sprintf(
            '%s -i %s -vf %s -c:v libx264 -profile:v main -level 4.0 -preset %s -crf %d -pix_fmt yuv420p -c:a aac -b:a %s -ac 2 -movflags +faststart -max_muxing_queue_size 1024 -y %s 2>&1',
            escapeshellarg($ffmpeg),
            escapeshellarg($sourceFullPath),
            escapeshellarg($scaleFilter),
            escapeshellarg($preset),
            $crf,
            escapeshellarg($audioBitrate),
            escapeshellarg($processedFullPath)
        );

        try {
            [$videoOutput, $videoExitCode] = $this->runCommand($videoCommand);
            if ($videoExitCode !== 0) {
                Log::warning('Video processing command failed', [
                    'source_path' => $sourcePath,
                    'output' => $videoOutput,
                ]);

                return [
                    'status' => 'failed',
                    'processed_file_path' => null,
                    'thumbnail_path' => null,
                    'error' => 'Unable to process video file.',
                ];
            }

            $this->storageWorkFileService->storeLocalFile($disk, $processedPath, $processedFullPath, 'video/mp4');

            $thumbCommand = sprintf(
                '%s -ss %s -i %s -frames:v 1 -vf %s -y %s 2>&1',
                escapeshellarg($ffmpeg),
                escapeshellarg((string) $thumbAt),
                escapeshellarg($sourceFullPath),
                escapeshellarg($thumbFilter),
                escapeshellarg($thumbnailFullPath)
            );

            [$thumbOutput, $thumbExitCode] = $this->runCommand($thumbCommand);
            if ($thumbExitCode !== 0) {
                Log::warning('Video thumbnail command failed', [
                    'source_path' => $sourcePath,
                    'output' => $thumbOutput,
                ]);

                return [
                    'status' => 'ready',
                    'processed_file_path' => $processedPath,
                    'thumbnail_path' => null,
                    'error' => 'Video processed, thumbnail generation failed.',
                ];
            }

            $this->storageWorkFileService->storeLocalFile($disk, $thumbnailPath, $thumbnailFullPath, 'image/webp');

            return [
                'status' => 'ready',
                'processed_file_path' => $processedPath,
                'thumbnail_path' => $thumbnailPath,
                'error' => null,
            ];
        } finally {
            $this->storageWorkFileService->cleanup($sourceWorkFile['temporary'] ? $sourceFullPath : null);
            $this->storageWorkFileService->cleanup($processedFullPath);
            $this->storageWorkFileService->cleanup($thumbnailFullPath);
        }
    }

    /**
     * @return array{ffmpeg:?string,ffprobe:?string}
     */
    public function resolveBinaries(): array
    {
        $configuredFfmpeg = $this->resolveConfiguredBinary((string) config('media.video.ffmpeg_binary', ''));
        $configuredFfprobe = $this->resolveConfiguredBinary((string) config('media.video.ffprobe_binary', ''));

        return [
            'ffmpeg' => $configuredFfmpeg ?? $this->findBinary(['ffmpeg', 'ffmpeg.exe']),
            'ffprobe' => $configuredFfprobe ?? $this->findBinary(['ffprobe', 'ffprobe.exe']),
        ];
    }

    private function resolveConfiguredBinary(string $configured): ?string
    {
        $configured = trim($configured);
        $configured = trim($configured, '"\'');

        if ($configured === '') {
            return null;
        }

        if (is_file($configured)) {
            return $configured;
        }

        // Allow configured command name (e.g. "ffmpeg") in addition to absolute paths.
        return $this->findBinary([$configured]);
    }

    /**
     * @param  array<int, string>  $candidates
     */
    private function findBinary(array $candidates): ?string
    {
        foreach ($candidates as $candidate) {
            $path = $this->findSingleBinary($candidate);
            if ($path !== null) {
                return $path;
            }
        }

        return null;
    }

    private function findSingleBinary(string $binary): ?string
    {
        if ($binary === '') {
            return null;
        }

        if ($this->looksLikePath($binary) && is_file($binary)) {
            return $binary;
        }

        $command = PHP_OS_FAMILY === 'Windows'
            ? 'where ' . $binary . ' 2>nul'
            : 'command -v ' . escapeshellarg($binary) . ' 2>/dev/null';

        $output = trim((string) @shell_exec($command));
        if ($output === '') {
            return null;
        }

        $lines = preg_split('/\r\n|\r|\n/', $output);
        foreach ($lines as $line) {
            $line = trim((string) $line, "\"' ");
            if ($line !== '' && is_file($line)) {
                return $line;
            }
        }

        return null;
    }

    private function looksLikePath(string $value): bool
    {
        return str_contains($value, DIRECTORY_SEPARATOR)
            || str_contains($value, '/')
            || str_contains($value, '\\')
            || preg_match('/^[A-Za-z]:[\\\\\\/]/', $value) === 1;
    }

    /**
     * @return array{0:string,1:int}
     */
    private function runCommand(string $command): array
    {
        $output = [];
        $exitCode = 0;
        @exec($command, $output, $exitCode);

        return [implode("\n", $output), $exitCode];
    }
}
