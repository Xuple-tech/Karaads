<?php

namespace App\Jobs;

use App\Models\LiveStream;
use App\Models\Post;
use App\Models\PostMedia;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class FinalizeLiveArchive implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly string $streamId,
        public readonly string $hostUserId,
        public readonly string $uploadId,
        public readonly int $totalChunks,
    ) {}

    public function handle(): void
    {
        $stream = LiveStream::query()->find($this->streamId);
        if (! $stream) {
            throw new \RuntimeException('Live stream was not found.');
        }

        if ((string) $stream->user_id !== (string) $this->hostUserId) {
            throw new \RuntimeException('Only the live host can finalize this archive.');
        }

        $basePath = "live/archives/{$stream->id}/{$this->uploadId}";
        $localDisk = Storage::disk('local');

        if ($this->totalChunks < 1) {
            throw new \RuntimeException('No recorded video chunks were received for this live stream.');
        }

        if (! $localDisk->exists($basePath)) {
            throw new \RuntimeException('The live archive upload folder was not found.');
        }

        $mimeType = (string) data_get($stream->settings, 'active_archive_mime_type', 'video/webm');
        $extension = str_contains($mimeType, 'mp4') ? 'mp4' : 'webm';
        $assembledPath = "live/archives/{$stream->id}/assembled-{$this->uploadId}.{$extension}";
        $assembledFullPath = $localDisk->path($assembledPath);

        if (! is_dir(dirname($assembledFullPath))) {
            mkdir(dirname($assembledFullPath), 0755, true);
        }

        $output = fopen($assembledFullPath, 'wb');
        if ($output === false) {
            throw new \RuntimeException('Unable to create the assembled live archive file.');
        }

        try {
            for ($index = 0; $index < $this->totalChunks; $index++) {
                $chunkPath = "{$basePath}/{$index}.part";
                if (! $localDisk->exists($chunkPath)) {
                    throw new \RuntimeException("Missing chunk {$index}");
                }

                $chunkFullPath = $localDisk->path($chunkPath);
                $input = fopen($chunkFullPath, 'rb');
                if ($input === false) {
                    throw new \RuntimeException("Unable to open chunk {$index}");
                }

                stream_copy_to_stream($input, $output);
                fclose($input);
            }
        } catch (Throwable $e) {
            fclose($output);
            throw $e;
        }

        fclose($output);

        $finalFileName = "{$stream->id}.{$extension}";
        $finalPath = "live/archives/{$finalFileName}";

        Storage::disk('public')->putFileAs('live/archives', new \Illuminate\Http\File($assembledFullPath), $finalFileName);

        $post = Post::query()->create([
            'id' => (string) Str::uuid(),
            'user_id' => $stream->user_id,
            'content' => "Was live: {$stream->title}",
            'type' => 'post',
            'visibility' => $stream->visibility,
        ]);

        PostMedia::query()->create([
            'id' => (string) Str::uuid(),
            'post_id' => $post->id,
            'file_path' => $finalPath,
            'file_type' => 'video',
            'mime_type' => $mimeType ?: 'video/webm',
            'variants' => ['original' => $finalPath],
            'processing_status' => 'skipped',
            'processing_error' => null,
            'processed_at' => now(),
        ]);

        $stream->forceFill([
            'replay_post_id' => $post->id,
            'ended_at' => $stream->ended_at ?? now(),
            'status' => 'ended',
        ])->save();

        $this->cleanup($localDisk, $basePath, $assembledPath);
    }

    private function cleanup($localDisk, string $basePath, string $assembledPath): void
    {
        try {
            $localDisk->deleteDirectory($basePath);
            $localDisk->delete($assembledPath);
        } catch (Throwable) {
            // ignore cleanup failures
        }
    }
}
