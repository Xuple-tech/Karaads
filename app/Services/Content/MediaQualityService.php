<?php

namespace App\Services\Content;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MediaQualityService
{
    /**
     * @param  array<int, UploadedFile>  $uploadedMedia
     * @param  array<int, float|null>  $mediaDurationSeconds
     * @return array{
     *     passed: bool,
     *     violations: array<int, string>,
     *     warnings: array<int, string>,
     *     trace: array<int, array<string, mixed>>
     * }
     */
    public function validateUploads(array $uploadedMedia, array $mediaDurationSeconds = []): array
    {
        if (! (bool) config('media.quality.enabled', true) || $uploadedMedia === []) {
            return $this->emptyResult();
        }

        $violations = [];
        $warnings = [];
        $trace = [];

        foreach ($uploadedMedia as $index => $file) {
            if (! $file instanceof UploadedFile || ! $file->isValid()) {
                continue;
            }

            $mimeType = (string) $file->getMimeType();
            $result = Str::startsWith($mimeType, 'video/')
                ? $this->inspectVideo($file, $mediaDurationSeconds[$index] ?? null)
                : $this->inspectImage($file);

            $trace[] = [
                'rule' => 'media_quality',
                'severity' => $result['passed'] ? ($result['warnings'] === [] ? 'info' : 'warning') : 'error',
                'passed' => $result['passed'],
                'message' => $result['message'],
                'meta' => array_merge($result['meta'], [
                    'index' => $index,
                    'mime_type' => $mimeType,
                    'name' => $file->getClientOriginalName(),
                ]),
            ];

            // Emit a dedicated trace entry so PostRewardService can block rewards for blurry videos.
            if (! empty($result['meta']['blur_detected'])) {
                $trace[] = [
                    'rule'     => 'video_blur',
                    'severity' => 'warning',
                    'passed'   => false,
                    'message'  => 'Blurry video detected — reward eligibility blocked.',
                    'meta'     => [
                        'index'      => $index,
                        'blur_score' => $result['meta']['blur_score'] ?? null,
                        'threshold'  => $result['meta']['threshold'] ?? null,
                    ],
                ];
            }

            if (! $result['passed']) {
                $violations[] = $result['message'];
            }

            $warnings = array_merge($warnings, $result['warnings']);
        }

        return [
            'passed' => $violations === [],
            'violations' => array_values(array_unique($violations)),
            'warnings' => array_values(array_unique($warnings)),
            'trace' => $trace,
        ];
    }

    /**
     * @return array{passed: bool, message: string, warnings: array<int, string>, meta: array<string, mixed>}
     */
    private function inspectImage(UploadedFile $file): array
    {
        $path = $file->getRealPath();
        if (! $path || ! is_readable($path)) {
            return $this->warningResult('We could not check the image quality, so it was allowed for now.', [
                'reason' => 'unreadable_file',
            ]);
        }

        $size = @getimagesize($path);
        if (! is_array($size)) {
            return $this->warningResult('We could not read the image quality, so it was allowed for now.', [
                'reason' => 'invalid_image_size',
            ]);
        }

        [$width, $height] = [(int) $size[0], (int) $size[1]];
        $minLongEdge = (int) config('media.quality.min_image_long_edge', 360);
        if (max($width, $height) < $minLongEdge) {
            return $this->failedResult(
                "This image is too small or blurry to post. Upload a clearer image that is at least {$minLongEdge}px on the longest side.",
                ['width' => $width, 'height' => $height, 'min_long_edge' => $minLongEdge],
            );
        }

        $score = $this->blurScoreFromImagePath($path);
        if ($score === null) {
            return $this->warningResult('We could not calculate image sharpness, so it was allowed for now.', [
                'width' => $width,
                'height' => $height,
                'reason' => 'sharpness_unavailable',
            ]);
        }

        $threshold = (float) config('media.quality.image_blur_threshold', 45);
        if ($score < $threshold) {
            return $this->failedResult(
                'This image looks too blurry to post. Please upload a clearer image.',
                ['width' => $width, 'height' => $height, 'blur_score' => round($score, 2), 'threshold' => $threshold],
            );
        }

        return $this->passedResult('Image sharpness looks acceptable.', [
            'width' => $width,
            'height' => $height,
            'blur_score' => round($score, 2),
            'threshold' => $threshold,
        ]);
    }

    /**
     * @return array{passed: bool, message: string, warnings: array<int, string>, meta: array<string, mixed>}
     */
    private function inspectVideo(UploadedFile $file, ?float $durationSeconds): array
    {
        $path = $file->getRealPath();
        if (! $path || ! is_readable($path)) {
            return $this->warningResult('We could not check the video quality, so it was allowed for now.', [
                'reason' => 'unreadable_file',
            ]);
        }

        $ffmpeg = $this->resolveFfmpegBinary();
        if ($ffmpeg === null) {
            return $this->warningResult('Video quality check is not available on this server yet, so the video was allowed for now.', [
                'reason' => 'ffmpeg_missing',
            ]);
        }

        $sampleCount = max(1, min(5, (int) config('media.quality.video_sample_count', 3)));
        $duration = $durationSeconds !== null && $durationSeconds > 0 ? $durationSeconds : 12.0;
        $seconds = $this->videoSampleSeconds($duration, $sampleCount);
        $scores = [];
        $dimensions = [];

        foreach ($seconds as $second) {
            $framePath = tempnam(sys_get_temp_dir(), 'karaads-video-quality-');
            if ($framePath === false) {
                continue;
            }
            $framePath .= '.jpg';

            $command = sprintf(
                '%s -hide_banner -loglevel error -ss %s -i %s -frames:v 1 -vf %s -y %s 2>&1',
                escapeshellarg($ffmpeg),
                escapeshellarg((string) max(0.1, $second)),
                escapeshellarg($path),
                escapeshellarg('scale=480:-1:force_original_aspect_ratio=decrease'),
                escapeshellarg($framePath),
            );

            $output = [];
            $exitCode = 1;
            @exec($command, $output, $exitCode);

            if ($exitCode === 0 && is_file($framePath)) {
                $score = $this->blurScoreFromImagePath($framePath);
                $size = @getimagesize($framePath);
                if ($score !== null) {
                    $scores[] = $score;
                }
                if (is_array($size)) {
                    $dimensions[] = [(int) $size[0], (int) $size[1]];
                }
            }

            @unlink($framePath);
        }

        if ($scores === []) {
            return $this->warningResult('We could not sample video frames for quality, so the video was allowed for now.', [
                'reason' => 'no_video_frames',
                'duration_seconds' => $durationSeconds,
            ]);
        }

        $minLongEdge = (int) config('media.quality.min_video_long_edge', 360);
        $smallFrame = collect($dimensions)->contains(fn (array $dimension) => max($dimension) < $minLongEdge);
        if ($smallFrame) {
            return $this->failedResult(
                "This video is too small or blurry to post. Upload a clearer video that is at least {$minLongEdge}px on the longest side.",
                ['dimensions' => $dimensions, 'min_long_edge' => $minLongEdge],
            );
        }

        sort($scores);
        $medianScore = $scores[(int) floor(count($scores) / 2)];
        $threshold = (float) config('media.quality.video_blur_threshold', 38);
        if ($medianScore < $threshold) {
            // Blurry videos are allowed to upload but will not earn creator rewards.
            return [
                'passed'   => true,
                'message'  => 'This video appears blurry. It has been published, but blurry videos are not eligible for creator earnings.',
                'warnings' => ['This video appears blurry and will not earn creator rewards.'],
                'meta'     => [
                    'blur_detected'  => true,
                    'blur_score'     => round($medianScore, 2),
                    'threshold'      => $threshold,
                    'sample_scores'  => array_map(fn ($score) => round($score, 2), $scores),
                ],
            ];
        }

        return $this->passedResult('Video sharpness looks acceptable.', [
            'blur_score' => round($medianScore, 2),
            'threshold' => $threshold,
            'sample_scores' => array_map(fn ($score) => round($score, 2), $scores),
        ]);
    }

    private function blurScoreFromImagePath(string $path): ?float
    {
        if (! function_exists('imagecreatefromstring')) {
            return null;
        }

        $contents = @file_get_contents($path);
        if ($contents === false) {
            return null;
        }

        $source = @imagecreatefromstring($contents);
        if (! $source) {
            return null;
        }

        $sourceWidth = imagesx($source);
        $sourceHeight = imagesy($source);
        $maxEdge = max($sourceWidth, $sourceHeight);
        if ($sourceWidth < 3 || $sourceHeight < 3 || $maxEdge < 1) {
            imagedestroy($source);

            return 0.0;
        }

        $scale = min(1, 256 / $maxEdge);
        $width = max(3, (int) round($sourceWidth * $scale));
        $height = max(3, (int) round($sourceHeight * $scale));
        $image = imagecreatetruecolor($width, $height);
        if (! $image) {
            imagedestroy($source);

            return null;
        }

        imagecopyresampled($image, $source, 0, 0, 0, 0, $width, $height, $sourceWidth, $sourceHeight);
        imagefilter($image, IMG_FILTER_GRAYSCALE);

        $values = [];
        for ($y = 1; $y < $height - 1; $y++) {
            for ($x = 1; $x < $width - 1; $x++) {
                $center = $this->grayAt($image, $x, $y);
                $laplacian = (4 * $center)
                    - $this->grayAt($image, $x - 1, $y)
                    - $this->grayAt($image, $x + 1, $y)
                    - $this->grayAt($image, $x, $y - 1)
                    - $this->grayAt($image, $x, $y + 1);
                $values[] = $laplacian;
            }
        }

        imagedestroy($image);
        imagedestroy($source);

        if ($values === []) {
            return null;
        }

        $mean = array_sum($values) / count($values);
        $variance = 0.0;
        foreach ($values as $value) {
            $variance += ($value - $mean) ** 2;
        }

        return $variance / count($values);
    }

    private function grayAt(\GdImage $image, int $x, int $y): int
    {
        return imagecolorat($image, $x, $y) & 0xFF;
    }

    private function resolveFfmpegBinary(): ?string
    {
        $configured = trim((string) config('media.video.ffmpeg_binary', ''));
        $candidates = array_filter([
            $configured,
            '/usr/bin/ffmpeg',
            '/usr/local/bin/ffmpeg',
            '/opt/homebrew/bin/ffmpeg',
        ]);

        foreach ($candidates as $candidate) {
            if (is_file($candidate) && is_executable($candidate)) {
                return $candidate;
            }
        }

        $output = [];
        $exitCode = 1;
        @exec('command -v ffmpeg 2>/dev/null', $output, $exitCode);
        if ($exitCode === 0 && isset($output[0]) && is_executable($output[0])) {
            return $output[0];
        }

        Log::info('FFmpeg binary unavailable for media quality validation.');

        return null;
    }

    /**
     * @return array<int, float>
     */
    private function videoSampleSeconds(float $duration, int $sampleCount): array
    {
        if ($sampleCount <= 1) {
            return [min(1.0, max(0.1, $duration / 2))];
        }

        $seconds = [];
        for ($index = 1; $index <= $sampleCount; $index++) {
            $ratio = $index / ($sampleCount + 1);
            $seconds[] = max(0.1, min(max(0.1, $duration - 0.2), $duration * $ratio));
        }

        return $seconds;
    }

    /**
     * @return array{passed: bool, violations: array<int, string>, warnings: array<int, string>, trace: array<int, array<string, mixed>>}
     */
    private function emptyResult(): array
    {
        return [
            'passed' => true,
            'violations' => [],
            'warnings' => [],
            'trace' => [],
        ];
    }

    /**
     * @return array{passed: bool, message: string, warnings: array<int, string>, meta: array<string, mixed>}
     */
    private function passedResult(string $message, array $meta): array
    {
        return ['passed' => true, 'message' => $message, 'warnings' => [], 'meta' => $meta];
    }

    /**
     * @return array{passed: bool, message: string, warnings: array<int, string>, meta: array<string, mixed>}
     */
    private function failedResult(string $message, array $meta): array
    {
        return ['passed' => false, 'message' => $message, 'warnings' => [], 'meta' => $meta];
    }

    /**
     * @return array{passed: bool, message: string, warnings: array<int, string>, meta: array<string, mixed>}
     */
    private function warningResult(string $message, array $meta): array
    {
        return ['passed' => true, 'message' => $message, 'warnings' => [$message], 'meta' => $meta];
    }
}
