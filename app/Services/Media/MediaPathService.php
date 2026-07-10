<?php

namespace App\Services\Media;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class MediaPathService
{
    public function originalUploadDirectory(string $collection): string
    {
        $collection = trim($collection, " \t\n\r\0\x0B/");
        $storeInSubdir = (bool) config('media.paths.store_originals_in_subdir', true);
        $originalSubdir = trim((string) config('media.paths.original_subdir', 'original'), " \t\n\r\0\x0B/");

        if (!$storeInSubdir || $originalSubdir === '') {
            return $collection;
        }

        if ($collection === '') {
            return $originalSubdir;
        }

        return "{$collection}/{$originalSubdir}";
    }

    public function toUrl(?string $path, string $disk = 'public'): ?string
    {
        $path = trim($path);

        if (!$path || $path === '0') {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://'])) {
            $appPublicPath = $this->pathFromAppPublicUrl($path);

            if ($appPublicPath === null) {
                return $path;
            }

            $path = $appPublicPath;
        } else {
            $path = $this->normalizePublicPath($path);
        }

        if (app()->environment('local')) {
            return '/storage/' . ltrim($path, '/');
        }

        if ($disk === 'public') {
            if ((string) config('filesystems.disks.public.driver') === 's3') {
                try {
                    return Storage::disk('public')->temporaryUrl(ltrim($path, '/'), now()->addHours(6));
                } catch (Throwable) {
                    // Fall back to the lightweight media redirect route if the S3 adapter cannot sign.
                }
            }

            return route('media.asset', [
                'encodedPath' => rtrim(strtr(base64_encode(ltrim($path, '/')), '+/', '-_'), '='),
            ]);
        }

        return Storage::disk($disk)->url($path);
    }

    private function normalizePublicPath(string $path): string
    {
        $path = ltrim($path, '/');

        foreach (['storage/', 'media/'] as $prefix) {
            if (Str::startsWith($path, $prefix)) {
                return Str::after($path, $prefix);
            }
        }

        return $path;
    }

    private function pathFromAppPublicUrl(string $url): ?string
    {
        $parts = parse_url($url);
        $path = ltrim((string) ($parts['path'] ?? ''), '/');
        $host = (string) ($parts['host'] ?? '');
        $appHost = (string) parse_url((string) config('app.url'), PHP_URL_HOST);

        if ($host !== $appHost) {
            return null;
        }

        foreach (['storage/', 'media/'] as $prefix) {
            if (Str::startsWith($path, $prefix)) {
                return Str::after($path, $prefix);
            }
        }

        return null;
    }

    /**
     * @param  array<string, string|null>|null  $paths
     * @return array<string, string|null>|null
     */
    public function mapToUrls(?array $paths, string $disk = 'public'): ?array
    {
        if ($paths === null) {
            return null;
        }

        $urls = [];
        foreach ($paths as $key => $path) {
            $urls[$key] = $this->toUrl($path, $disk);
        }

        return $urls;
    }

    public function deletePath(?string $path, string $disk = 'public'): void
    {
        $path = trim($path);

        if (!$path || $path === '0' || Str::startsWith($path, ['http://', 'https://'])) {
            return;
        }

        Storage::disk($disk)->delete($path);
    }

    /**
     * @param  iterable<string|null>  $paths
     */
    public function deleteMany(iterable $paths, string $disk = 'public'): void
    {
        $deletable = [];

        foreach ($paths as $path) {
            $path = trim((string) $path);

            if (!$path || $path === '0' || Str::startsWith($path, ['http://', 'https://'])) {
                continue;
            }

            $deletable[] = $path;
        }

        if ($deletable !== []) {
            Storage::disk($disk)->delete($deletable);
        }
    }

    public function buildDerivedPath(string $sourcePath, string $suffix, string $extension): string
    {
        $normalizedSource = str_replace('\\', '/', $sourcePath);
        $directory = trim(dirname($normalizedSource), '.');
        $filename = pathinfo($normalizedSource, PATHINFO_FILENAME);
        $derivedDirectory = $this->resolveDerivedDirectory($directory);
        $base = $derivedDirectory !== '' ? "{$derivedDirectory}/{$filename}" : $filename;

        return "{$base}_{$suffix}.{$extension}";
    }

    private function resolveDerivedDirectory(string $directory): string
    {
        $directory = trim($directory, '/');
        if ($directory === '') {
            return trim((string) config('media.paths.derived_subdir', 'derived'), '/');
        }

        $segments = array_values(array_filter(explode('/', $directory), static fn (string $segment): bool => $segment !== ''));
        if ($segments === []) {
            return trim((string) config('media.paths.derived_subdir', 'derived'), '/');
        }

        $originalSubdir = trim((string) config('media.paths.original_subdir', 'original'), '/');
        $derivedSubdir = trim((string) config('media.paths.derived_subdir', 'derived'), '/');
        $lastSegment = $segments[count($segments) - 1];

        if ($lastSegment === $originalSubdir || $lastSegment === $derivedSubdir) {
            array_pop($segments);
        }

        $root = implode('/', $segments);

        return $root !== '' ? "{$root}/{$derivedSubdir}" : $derivedSubdir;
    }
}
