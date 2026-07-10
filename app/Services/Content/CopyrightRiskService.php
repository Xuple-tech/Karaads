<?php

namespace App\Services\Content;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CopyrightRiskService
{
    private const WARNING_MESSAGE = 'Copyright warning: this video appears to contain a TikTok/platform watermark or copied-content signal. It was published, but it is not eligible for creator earnings.';

    /**
     * @param  array<int, UploadedFile>  $uploadedMedia
     * @return array{has_risk: bool, warnings: array<int, string>, trace: array<int, array<string, mixed>>}
     */
    public function inspectUploads(string $content, array $uploadedMedia): array
    {
        if (! (bool) config('media.copyright.enabled', true) || $uploadedMedia === []) {
            return $this->emptyResult();
        }

        $warnings = [];
        $trace = [];
        $contentSignals = $this->signalsFromText($content);

        foreach ($uploadedMedia as $index => $file) {
            if (! $file instanceof UploadedFile || ! $file->isValid()) {
                continue;
            }

            $mimeType = (string) $file->getMimeType();
            if (! Str::startsWith($mimeType, 'video/')) {
                continue;
            }

            $signals = array_values(array_unique(array_merge(
                $contentSignals,
                $this->signalsFromText($file->getClientOriginalName()),
                $this->signalsFromVideoFrames($file),
            )));

            $hasRisk = $signals !== [];
            $trace[] = [
                'rule' => 'copyright_watermark_risk',
                'severity' => $hasRisk ? 'warning' : 'info',
                'passed' => ! $hasRisk,
                'message' => $hasRisk
                    ? self::WARNING_MESSAGE
                    : 'No common platform watermark or copied-content signals were detected.',
                'meta' => [
                    'index' => $index,
                    'mime_type' => $mimeType,
                    'name' => $file->getClientOriginalName(),
                    'signals' => $signals,
                ],
            ];

            if ($hasRisk) {
                $warnings[] = self::WARNING_MESSAGE;
            }
        }

        return [
            'has_risk' => $warnings !== [],
            'warnings' => array_values(array_unique($warnings)),
            'trace' => $trace,
        ];
    }

    /**
     * @return array<int, string>
     */
    private function signalsFromText(?string $text): array
    {
        $normalized = $this->normalizeText((string) $text);
        if ($normalized === '') {
            return [];
        }

        $patterns = [
            'tiktok' => '/\b(?:tiktok|tik tok|douyin|vm tiktok|vt tiktok)\b/u',
            'capcut' => '/\b(?:capcut|cap cut)\b/u',
            'instagram' => '/\b(?:instagram|insta|ig reels?|reels)\b/u',
            'facebook' => '/\b(?:facebook|fb watch|fb reels?)\b/u',
            'youtube' => '/\b(?:youtube|youtu be|yt shorts?|shorts)\b/u',
            'snapchat' => '/\b(?:snapchat|snap)\b/u',
            'likee' => '/\b(?:likee|kwai|triller|bilibili)\b/u',
            'watermark' => '/\b(?:watermark|water mark|screen ?record(?:ed|ing)?|reupload(?:ed)?|repost(?:ed)?|copied from|downloaded from)\b/u',
            'copyright' => '/\b(?:no copyright intended|i do not own|copyright belongs|all rights reserved)\b/u',
            'social_handle' => '/(?:^|\s)@[\p{L}\p{N}_\-.]{3,}/u',
        ];

        $signals = [];
        foreach ($patterns as $name => $pattern) {
            if (preg_match($pattern, $normalized) === 1) {
                $signals[] = $name;
            }
        }

        return $signals;
    }

    /**
     * @return array<int, string>
     */
    private function signalsFromVideoFrames(UploadedFile $file): array
    {
        $path = $file->getRealPath();
        if (! $path || ! is_readable($path)) {
            return [];
        }

        $ffmpeg = $this->resolveBinary('ffmpeg', (string) config('media.video.ffmpeg_binary', ''));
        $tesseract = $this->resolveBinary('tesseract', (string) config('media.copyright.tesseract_binary', ''));
        if ($ffmpeg === null || $tesseract === null) {
            Log::info('Copyright watermark OCR unavailable.', [
                'ffmpeg_available' => $ffmpeg !== null,
                'tesseract_available' => $tesseract !== null,
            ]);

            return [];
        }

        $signals = [];
        foreach ([0.8, 2.5, 5.0] as $second) {
            $framePath = tempnam(sys_get_temp_dir(), 'karaads-watermark-');
            if ($framePath === false) {
                continue;
            }
            $framePath .= '.jpg';

            $command = sprintf(
                '%s -hide_banner -loglevel error -ss %s -i %s -frames:v 1 -vf %s -y %s 2>&1',
                escapeshellarg($ffmpeg),
                escapeshellarg((string) $second),
                escapeshellarg($path),
                escapeshellarg('scale=960:-1:force_original_aspect_ratio=decrease'),
                escapeshellarg($framePath),
            );

            $output = [];
            $exitCode = 1;
            @exec($command, $output, $exitCode);
            if ($exitCode !== 0 || ! is_file($framePath)) {
                @unlink($framePath);
                continue;
            }

            $ocrCommand = sprintf(
                '%s %s stdout --psm 6 2>/dev/null',
                escapeshellarg($tesseract),
                escapeshellarg($framePath),
            );

            $ocrOutput = [];
            $ocrExitCode = 1;
            @exec($ocrCommand, $ocrOutput, $ocrExitCode);
            @unlink($framePath);

            if ($ocrExitCode !== 0 || $ocrOutput === []) {
                continue;
            }

            $signals = array_values(array_unique(array_merge(
                $signals,
                $this->signalsFromText(implode(' ', $ocrOutput)),
            )));
        }

        return $signals;
    }

    private function resolveBinary(string $binary, string $configured = ''): ?string
    {
        $candidates = array_values(array_filter([
            trim($configured),
            '/usr/bin/'.$binary,
            '/usr/local/bin/'.$binary,
            '/opt/homebrew/bin/'.$binary,
        ]));

        foreach ($candidates as $candidate) {
            if (is_file($candidate) && is_executable($candidate)) {
                return $candidate;
            }
        }

        $output = [];
        $exitCode = 1;
        @exec('command -v '.escapeshellarg($binary).' 2>/dev/null', $output, $exitCode);
        if ($exitCode === 0 && isset($output[0]) && is_executable($output[0])) {
            return $output[0];
        }

        return null;
    }

    private function normalizeText(string $text): string
    {
        $normalized = Str::lower($text);
        $normalized = preg_replace('/https?:\/\/|www\./u', ' ', $normalized) ?? $normalized;
        $normalized = preg_replace('/[^\p{L}\p{N}@._\-\s]+/u', ' ', $normalized) ?? $normalized;
        $normalized = preg_replace('/[_\-.]+/u', ' ', $normalized) ?? $normalized;
        $normalized = preg_replace('/\s+/u', ' ', $normalized) ?? $normalized;

        return trim($normalized);
    }

    /**
     * @return array{has_risk: false, warnings: array<int, string>, trace: array<int, array<string, mixed>>}
     */
    private function emptyResult(): array
    {
        return [
            'has_risk' => false,
            'warnings' => [],
            'trace' => [],
        ];
    }
}
