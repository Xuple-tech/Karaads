<?php

namespace App\Services\Media;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class StorageWorkFileService
{
    public function localCopy(string $disk, string $path): array
    {
        if ($this->isLocalDisk($disk)) {
            return [
                'path' => Storage::disk($disk)->path($path),
                'temporary' => false,
            ];
        }

        $temporaryPath = $this->temporaryPath($path);
        $contents = Storage::disk($disk)->get($path);

        if ($contents === null) {
            throw new RuntimeException('Unable to read source media from storage.');
        }

        file_put_contents($temporaryPath, $contents);

        return [
            'path' => $temporaryPath,
            'temporary' => true,
        ];
    }

    public function temporaryPath(string $path): string
    {
        $directory = storage_path('app/media-work');
        if (!is_dir($directory)) {
            mkdir($directory, 0775, true);
        }

        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $suffix = $extension !== '' ? ".{$extension}" : '.tmp';

        return $directory . DIRECTORY_SEPARATOR . (string) Str::uuid() . $suffix;
    }

    public function storeLocalFile(string $disk, string $targetPath, string $localPath, ?string $contentType = null): void
    {
        $stream = fopen($localPath, 'rb');
        if ($stream === false) {
            throw new RuntimeException('Unable to open processed media for storage.');
        }

        try {
            Storage::disk($disk)->put($targetPath, $stream, [
                'visibility' => 'public',
                'ContentType' => $contentType ?: $this->guessContentType($localPath),
                'CacheControl' => 'public, max-age=31536000, immutable',
            ]);
        } finally {
            fclose($stream);
        }
    }

    public function cleanup(?string $path): void
    {
        if (!$path || !str_starts_with($path, storage_path('app/media-work'))) {
            return;
        }

        if (is_file($path)) {
            @unlink($path);
        }
    }

    private function isLocalDisk(string $disk): bool
    {
        return (string) config("filesystems.disks.{$disk}.driver", 'local') === 'local';
    }

    private function guessContentType(string $localPath): string
    {
        $mime = is_file($localPath) ? @mime_content_type($localPath) : false;

        return is_string($mime) && $mime !== '' ? $mime : 'application/octet-stream';
    }
}
