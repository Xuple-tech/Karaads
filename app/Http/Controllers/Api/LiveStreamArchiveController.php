<?php

namespace App\Http\Controllers\Api;

use App\Events\LiveStreamEnded;
use App\Http\Controllers\Controller;
use App\Jobs\FinalizeLiveArchive;
use App\Models\LiveStream;
use App\Support\LiveStreamAccess;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class LiveStreamArchiveController extends Controller
{
    use AuthorizesRequests;

    public function init(LiveStream $stream, Request $request): JsonResponse
    {
        $this->authorize('archive', $stream);

        $validated = $request->validate([
            'mime_type' => 'nullable|string|max:120',
        ]);

        $uploadId = (string) Str::uuid();
        $chunkSizeKb = (int) config('live.archive_chunk_size_kb', 5120);
        $basePath = $this->archiveBasePath($stream->id, $uploadId);

        Storage::disk('local')->makeDirectory($basePath);

        $settings = is_array($stream->settings) ? $stream->settings : [];
        $settings['active_archive_upload_id'] = $uploadId;
        $settings['active_archive_mime_type'] = $validated['mime_type'] ?? 'video/webm';
        $settings['active_archive_started_at'] = now()->toIso8601String();
        $stream->forceFill(['settings' => $settings])->save();

        return response()->json([
            'upload_id' => $uploadId,
            'chunk_size' => $chunkSizeKb * 1024,
        ]);
    }

    public function chunk(LiveStream $stream, Request $request): JsonResponse
    {
        $this->authorize('archive', $stream);

        $validated = $request->validate([
            'upload_id' => 'required|string|min:10',
            'chunk_index' => 'required|integer|min:0',
            'total_chunks' => 'required|integer|min:1|max:100000',
            'chunk' => 'required|file|max:51200',
        ]);

        $uploadId = (string) $validated['upload_id'];
        $chunkIndex = (int) $validated['chunk_index'];

        $basePath = $this->archiveBasePath($stream->id, $uploadId);
        Storage::disk('local')->makeDirectory($basePath);

        $chunkFile = $request->file('chunk');
        $chunkFile->storeAs($basePath, $chunkIndex . '.part', 'local');

        return response()->json(['status' => 'ok']);
    }

    public function complete(LiveStream $stream, Request $request): JsonResponse
    {
        $this->authorize('archive', $stream);

        $validated = $request->validate([
            'upload_id' => 'required|string|min:10',
            'total_chunks' => 'required|integer|min:1|max:100000',
        ]);

        try {
            FinalizeLiveArchive::dispatchSync(
                (string) $stream->id,
                (string) $request->user()->id,
                (string) $validated['upload_id'],
                (int) $validated['total_chunks']
            );
        } catch (Throwable $e) {
            return response()->json([
                'status' => 'failed',
                'message' => $e->getMessage() ?: 'Unable to finalize the live video archive.',
            ], 422);
        }

        $stream->refresh();
        $stream->load('user');

        if ($stream->status === 'ended') {
            LiveStreamEnded::dispatch($stream);
        }

        return response()->json([
            'status' => 'completed',
            'replay_post_id' => $stream->replay_post_id,
        ]);
    }

    public function chunks(LiveStream $stream, Request $request): JsonResponse
    {
        abort_unless(LiveStreamAccess::canView($stream, $request->user()), 404);

        $settings = is_array($stream->settings) ? $stream->settings : [];
        $uploadId = (string) ($settings['active_archive_upload_id'] ?? '');
        if ($uploadId === '') {
            return response()->json([
                'data' => [],
                'mime_type' => $settings['active_archive_mime_type'] ?? 'video/webm',
            ]);
        }

        $after = (int) $request->integer('after', -1);
        $basePath = $this->archiveBasePath((string) $stream->id, $uploadId);
        $files = collect(Storage::disk('local')->files($basePath))
            ->map(function (string $path): ?array {
                $name = pathinfo($path, PATHINFO_FILENAME);
                if (! ctype_digit($name)) {
                    return null;
                }

                return [
                    'index' => (int) $name,
                    'path' => $path,
                ];
            })
            ->filter()
            ->sortBy('index')
            ->values();

        $chunks = $files
            ->filter(fn (array $file) => (int) $file['index'] > $after)
            ->take(24)
            ->map(fn (array $file) => [
                'index' => (int) $file['index'],
                'url' => url("/api/live/streams/{$stream->id}/archive/chunks/{$file['index']}"),
            ])
            ->values();

        return response()->json([
            'data' => $chunks,
            'mime_type' => $settings['active_archive_mime_type'] ?? 'video/webm',
            'status' => $stream->status,
        ]);
    }

    public function showChunk(LiveStream $stream, int $chunkIndex, Request $request)
    {
        abort_unless(LiveStreamAccess::canView($stream, $request->user()), 404);

        $settings = is_array($stream->settings) ? $stream->settings : [];
        $uploadId = (string) ($settings['active_archive_upload_id'] ?? '');
        abort_if($uploadId === '', 404);

        $path = $this->archiveBasePath((string) $stream->id, $uploadId) . "/{$chunkIndex}.part";
        abort_unless(Storage::disk('local')->exists($path), 404);

        return response()->file(Storage::disk('local')->path($path), [
            'Content-Type' => $settings['active_archive_mime_type'] ?? 'video/webm',
            'Cache-Control' => 'no-store, private',
        ]);
    }

    private function archiveBasePath(string $streamId, string $uploadId): string
    {
        return "live/archives/{$streamId}/{$uploadId}";
    }
}
