<?php

namespace App\Services\Media;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Throwable;

class CoverVariantService
{
    public function __construct(
        private readonly MediaPathService $mediaPathService,
        private readonly StorageWorkFileService $storageWorkFileService
    ) {
    }

    /**
     * @return array{sm:?string,md:?string,lg:?string,original:string}
     */
    public function generate(string $sourcePath, string $disk = 'public'): array
    {
        $variants = [
            'sm' => null,
            'md' => null,
            'lg' => null,
            'original' => $sourcePath,
        ];

        if (!Storage::disk($disk)->exists($sourcePath)) {
            return $variants;
        }

        $sizes = config('media.cover.sizes', []);
        $quality = (int) config('media.cover.quality', 82);
        $sourceWorkFile = $this->storageWorkFileService->localCopy($disk, $sourcePath);
        $sourceFullPath = $sourceWorkFile['path'];
        $imageManager = $this->makeImageManager();

        try {
            foreach ($sizes as $key => $size) {
            try {
                if ($imageManager === null) {
                    throw new \RuntimeException('No supported image driver available.');
                }

                $image = $imageManager->read($sourceFullPath);
                // Cover images are typically 16:9 aspect ratio
                [$width, $height] = $size;
                $image->scale(width: $width, height: $height);

                $variantPath = $this->mediaPathService->buildDerivedPath(
                    $sourcePath,
                    'cover_' . (string) $key,
                    'webp'
                );

                $variantFullPath = $this->storageWorkFileService->temporaryPath($variantPath);
                $image->toWebp(quality: $quality)->save($variantFullPath);
                $this->storageWorkFileService->storeLocalFile($disk, $variantPath, $variantFullPath);
                $this->storageWorkFileService->cleanup($variantFullPath);
                $variants[(string) $key] = $variantPath;
            } catch (Throwable $exception) {
                $fallbackPath = $this->fallbackCopy($sourcePath, (string) $key, $disk);

                Log::warning('Failed to generate cover variant; using fallback copy.', [
                    'source_path' => $sourcePath,
                    'variant' => $key,
                    'error' => $exception->getMessage(),
                    'fallback_path' => $fallbackPath,
                ]);

                if ($fallbackPath !== null) {
                    $variants[(string) $key] = $fallbackPath;
                }
            }
            }
        } finally {
            $this->storageWorkFileService->cleanup($sourceWorkFile['temporary'] ? $sourceFullPath : null);
        }

        return $variants;
    }

    private function makeImageManager(): ?ImageManager
    {
        if (extension_loaded('imagick')) {
            return ImageManager::imagick();
        }

        if (extension_loaded('gd')) {
            return ImageManager::gd();
        }

        return null;
    }

    private function fallbackCopy(string $sourcePath, string $variantKey, string $disk): ?string
    {
        $extension = strtolower((string) pathinfo($sourcePath, PATHINFO_EXTENSION));
        $extension = $extension !== '' ? $extension : 'jpg';
        $fallbackPath = $this->mediaPathService->buildDerivedPath(
            $sourcePath,
            'cover_' . $variantKey,
            $extension
        );

        $fallbackDirectory = dirname($fallbackPath);
        if ($fallbackDirectory !== '.') {
            Storage::disk($disk)->makeDirectory($fallbackDirectory);
        }

        if (!Storage::disk($disk)->exists($sourcePath)) {
            return null;
        }

        Storage::disk($disk)->copy($sourcePath, $fallbackPath);

        return $fallbackPath;
    }
}
