<?php

namespace App\Services\Media;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Throwable;

class ImageDerivativeService
{
    public function __construct(
        private readonly MediaPathService $mediaPathService,
        private readonly StorageWorkFileService $storageWorkFileService
    ) {
    }

    /**
     * @return array<string, string>
     */
    public function generateVariants(string $sourcePath, string $disk = 'public'): array
    {
        if (!Storage::disk($disk)->exists($sourcePath)) {
            return [];
        }

        $variantConfig = config('media.image.variants', []);
        $quality = (int) config('media.image.quality', 82);
        $sourceWorkFile = $this->storageWorkFileService->localCopy($disk, $sourcePath);
        $sourceFullPath = $sourceWorkFile['path'];
        $imageManager = $this->makeImageManager();
        $generated = [];

        try {
            foreach ($variantConfig as $variant => $maxEdge) {
            try {
                if ($imageManager === null) {
                    throw new \RuntimeException('No supported image driver available.');
                }

                $image = $imageManager->read($sourceFullPath);
                $this->scaleToMaxEdge($image, (int) $maxEdge);

                $variantPath = $this->mediaPathService->buildDerivedPath($sourcePath, (string) $variant, 'webp');
                $variantFullPath = $this->storageWorkFileService->temporaryPath($variantPath);
                $image->toWebp(quality: $quality)->save($variantFullPath);
                $this->storageWorkFileService->storeLocalFile($disk, $variantPath, $variantFullPath, 'image/webp');
                $this->storageWorkFileService->cleanup($variantFullPath);
                $generated[(string) $variant] = $variantPath;
            } catch (Throwable $exception) {
                $fallbackPath = $this->fallbackCopy($sourcePath, (string) $variant, $disk);

                Log::warning('Failed to generate image derivative; using fallback copy.', [
                    'source_path' => $sourcePath,
                    'variant' => $variant,
                    'error' => $exception->getMessage(),
                    'fallback_path' => $fallbackPath,
                ]);

                if ($fallbackPath !== null) {
                    $generated[(string) $variant] = $fallbackPath;
                }
            }
            }
        } finally {
            $this->storageWorkFileService->cleanup($sourceWorkFile['temporary'] ? $sourceFullPath : null);
        }

        return $generated;
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

    private function scaleToMaxEdge(mixed $image, int $maxEdge): void
    {
        $width = (int) $image->width();
        $height = (int) $image->height();

        if ($width <= 0 || $height <= 0) {
            return;
        }

        if ($width >= $height) {
            $targetWidth = min($width, $maxEdge);
            $image->scale(width: $targetWidth);

            return;
        }

        $targetHeight = min($height, $maxEdge);
        $image->scale(height: $targetHeight);
    }

    private function fallbackCopy(string $sourcePath, string $variant, string $disk): ?string
    {
        $extension = strtolower((string) pathinfo($sourcePath, PATHINFO_EXTENSION));
        $extension = $extension !== '' ? $extension : 'jpg';
        $fallbackPath = $this->mediaPathService->buildDerivedPath($sourcePath, $variant, $extension);

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
