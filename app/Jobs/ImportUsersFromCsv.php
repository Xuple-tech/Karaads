<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ImportUsersFromCsv implements ShouldQueue
{
    use Queueable;

    public int $timeout = 300;
    private const CHUNK_SIZE = 1000;

    public function __construct(
        public readonly string $path,
        public readonly ?string $requestedByUserId = null
    ) {
    }

    public function handle(): void
    {
        $disk = Storage::disk('local');

        if (! $disk->exists($this->path)) {
            Log::warning('Admin user import file not found.', [
                'path' => $this->path,
                'requested_by_user_id' => $this->requestedByUserId,
            ]);

            return;
        }

        $fullPath = $disk->path($this->path);
        $handle = fopen($fullPath, 'r');

        if ($handle === false) {
            Log::error('Unable to open admin user import CSV.', [
                'path' => $this->path,
                'requested_by_user_id' => $this->requestedByUserId,
            ]);

            $disk->delete($this->path);

            return;
        }

        try {
            $headers = fgetcsv($handle);

            if ($headers === false) {
                Log::warning('Admin user import CSV is empty.', [
                    'path' => $this->path,
                    'requested_by_user_id' => $this->requestedByUserId,
                ]);

                return;
            }

            $normalizedHeaders = array_map(
                static fn ($header) => strtolower(trim((string) $header)),
                $headers
            );

            $requiredHeaders = ['name', 'email', 'phone'];
            $missing = array_values(array_diff($requiredHeaders, $normalizedHeaders));

            if ($missing !== []) {
                Log::warning('Admin user import CSV missing required columns.', [
                    'path' => $this->path,
                    'requested_by_user_id' => $this->requestedByUserId,
                    'missing' => $missing,
                ]);

                return;
            }

            $chunkIndex = 0;
            $rowsInChunk = 0;
            $dispatchedChunks = 0;
            $chunkPath = $this->startChunkFile($disk, $headers, $chunkIndex);
            $chunkHandle = fopen($disk->path($chunkPath), 'a');
            if ($chunkHandle === false) {
                Log::error('Unable to open admin user import chunk for appending.', [
                    'path' => $chunkPath,
                    'requested_by_user_id' => $this->requestedByUserId,
                ]);

                return;
            }

            while (($row = fgetcsv($handle)) !== false) {
                if ($row === [null] || count(array_filter($row, static fn ($value) => trim((string) $value) !== '')) === 0) {
                    continue;
                }

                fputcsv($chunkHandle, $row);
                $rowsInChunk++;

                if ($rowsInChunk >= self::CHUNK_SIZE) {
                    fclose($chunkHandle);
                    ProcessUsersCsvChunk::dispatch($chunkPath, $this->requestedByUserId, $chunkIndex);
                    $dispatchedChunks++;

                    $chunkIndex++;
                    $rowsInChunk = 0;
                    $chunkPath = $this->startChunkFile($disk, $headers, $chunkIndex);
                    $chunkHandle = fopen($disk->path($chunkPath), 'a');
                    if ($chunkHandle === false) {
                        Log::error('Unable to append to admin user import chunk.', [
                            'path' => $chunkPath,
                            'requested_by_user_id' => $this->requestedByUserId,
                        ]);

                        return;
                    }
                }
            }

            fclose($chunkHandle);

            if ($rowsInChunk > 0) {
                ProcessUsersCsvChunk::dispatch($chunkPath, $this->requestedByUserId, $chunkIndex);
                $dispatchedChunks++;
            } else {
                $disk->delete($chunkPath);
            }

            Log::info('Admin user CSV import split and dispatched.', [
                'path' => $this->path,
                'requested_by_user_id' => $this->requestedByUserId,
                'chunks_dispatched' => $dispatchedChunks,
                'chunk_size' => self::CHUNK_SIZE,
            ]);
        } finally {
            fclose($handle);
            $disk->delete($this->path);
        }
    }

    /**
     * @param array<int, mixed> $headers
     */
    private function startChunkFile($disk, array $headers, int $chunkIndex): string
    {
        $chunkPath = sprintf(
            'admin-imports/chunks/%s_%d.csv',
            pathinfo($this->path, PATHINFO_FILENAME),
            $chunkIndex
        );

        File::ensureDirectoryExists(dirname($disk->path($chunkPath)));

        $chunkHandle = fopen($disk->path($chunkPath), 'w');
        if ($chunkHandle === false) {
            throw new \RuntimeException('Unable to create CSV chunk file: ' . $chunkPath);
        }

        fputcsv($chunkHandle, $headers);
        fclose($chunkHandle);

        return $chunkPath;
    }
}
