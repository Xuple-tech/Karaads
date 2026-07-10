<?php

namespace App\Console\Commands;

use App\Services\Media\VideoDerivativeService;
use Illuminate\Console\Command;

class MediaFfmpegStatus extends Command
{
    protected $signature = 'media:ffmpeg-status';

    protected $description = 'Show FFmpeg/FFprobe binary detection status for media processing.';

    public function handle(VideoDerivativeService $videoDerivativeService): int
    {
        $binaries = $videoDerivativeService->resolveBinaries();
        $ffmpeg = $binaries['ffmpeg'];
        $ffprobe = $binaries['ffprobe'];

        $this->line('FFMPEG_BINARY (config): ' . (config('media.video.ffmpeg_binary') ?: '(not set)'));
        $this->line('FFPROBE_BINARY (config): ' . (config('media.video.ffprobe_binary') ?: '(not set)'));
        $this->newLine();

        $this->line('Detected ffmpeg: ' . ($ffmpeg ?: 'NOT FOUND'));
        $this->line('Detected ffprobe: ' . ($ffprobe ?: 'NOT FOUND'));

        if (!$ffmpeg || !$ffprobe) {
            $this->newLine();
            $this->warn('FFmpeg/FFprobe are not fully available.');
            $this->warn('Install FFmpeg or set FFMPEG_BINARY/FFPROBE_BINARY.');

            return self::FAILURE;
        }

        $this->newLine();
        $this->line('ffmpeg version: ' . $this->readVersionLine($ffmpeg));
        $this->line('ffprobe version: ' . $this->readVersionLine($ffprobe));

        $this->info('FFmpeg is ready for media processing.');

        return self::SUCCESS;
    }

    private function readVersionLine(string $binaryPath): string
    {
        $command = escapeshellarg($binaryPath) . ' -version 2>&1';
        $output = @shell_exec($command);
        if (!is_string($output) || trim($output) === '') {
            return 'unable to read version';
        }

        $line = strtok($output, "\r\n");

        return is_string($line) && $line !== '' ? $line : 'unable to read version';
    }
}

