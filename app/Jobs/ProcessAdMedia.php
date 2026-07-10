<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

use App\Models\Ad;
use App\Services\Media\StorageWorkFileService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Illuminate\Support\Str;

class ProcessAdMedia implements ShouldQueue
{
    use Queueable;

    protected $ad;

    /**
     * Create a new job instance.
     */
    public function __construct(Ad $ad)
    {
        $this->ad = $ad;
    }

    /**
     * Execute the job.
     */
    public function handle(StorageWorkFileService $storageWorkFileService): void
    {
        $ad = $this->ad->fresh();
        if (!$ad) return;

        $path = parse_url((string) $ad->media_url, PHP_URL_PATH) ?: (string) $ad->media_url;
        if (str_starts_with($path, '/storage/')) {
            $path = substr($path, strlen('/storage/'));
        } else {
            $bucket = trim((string) config('filesystems.disks.public.bucket'), '/');
            if ($bucket !== '' && str_starts_with($path, '/' . $bucket . '/')) {
                $path = substr($path, strlen('/' . $bucket . '/'));
            }
            $path = ltrim($path, '/');
        }
        
        if (!Storage::disk('public')->exists($path)) {
            Log::error("Media file not found for processing", ['ad_id' => $ad->id, 'path' => $path]);
            return;
        }

        $sourceWorkFile = $storageWorkFileService->localCopy('public', $path);
        $fullPath = $sourceWorkFile['path'];
        $directory = dirname($path);
        $filename = pathinfo($path, PATHINFO_FILENAME);

        try {
            if ($ad->media_type === 'video') {
                $this->processVideo($fullPath, $directory, $filename, $ad, $storageWorkFileService);
            } else {
                $this->processImage($fullPath, $directory, $filename, $ad, $storageWorkFileService);
            }
        } finally {
            $storageWorkFileService->cleanup($sourceWorkFile['temporary'] ? $fullPath : null);
        }
    }

    protected function processVideo($fullPath, $directory, $filename, $ad, StorageWorkFileService $storageWorkFileService)
    {
        $outputPath = $directory . '/' . $filename . '_processed.mp4';
        $outputFullPath = $storageWorkFileService->temporaryPath($outputPath);
        
        // Convert to H.264 MP4 with optimized settings for web/mobile
        // -vf "scale='if(gt(iw,ih),-2,1080)':'if(gt(iw,ih),1920,-2)'" ensures vertical-ish scaling if needed
        // Short-form placements usually work best with a 9:16 aspect ratio.
        $command = "ffmpeg -i " . escapeshellarg($fullPath) . " -vcodec libx264 -crf 23 -preset fast -pix_fmt yuv420p -movflags +faststart -y " . escapeshellarg($outputFullPath) . " 2>&1";
        
        exec($command, $output, $returnVar);

        if ($returnVar === 0) {
            $storageWorkFileService->storeLocalFile('public', $outputPath, $outputFullPath);

            // Update ad with new media URL
            $ad->update([
                'media_url' => Storage::disk('public')->url($outputPath),
                'status' => true // Mark as ready after processing? 
                                // Or keep pending_approval but media is ready
            ]);
            
            // Optionally delete original if different
            if ($outputPath !== str_replace('/storage/', '', $ad->media_url)) {
                // Storage::disk('public')->delete(str_replace('/storage/', '', $ad->media_url));
            }
            
            Log::info("Video processed successfully", ['ad_id' => $ad->id]);
        } else {
            Log::error("FFmpeg failed", ['ad_id' => $ad->id, 'output' => $output]);
        }

        $storageWorkFileService->cleanup($outputFullPath);
    }

    protected function processImage($fullPath, $directory, $filename, $ad, StorageWorkFileService $storageWorkFileService)
    {
        $outputPath = $directory . '/' . $filename . '_processed.webp';
        $outputFullPath = $storageWorkFileService->temporaryPath($outputPath);

        try {
            $manager = extension_loaded('imagick') ? ImageManager::imagick() : ImageManager::gd();
            $image = $manager->read($fullPath);
            
            // Resize if too large, maintain aspect ratio
            // For ads we might want a specific max width/height
            $image->scale(width: 1080); // Max width 1080px
            
            $image->toWebp(quality: 80)->save($outputFullPath);
            $storageWorkFileService->storeLocalFile('public', $outputPath, $outputFullPath);

            $ad->update([
                'media_url' => Storage::disk('public')->url($outputPath),
                'status' => true
            ]);

            Log::info("Image processed successfully", ['ad_id' => $ad->id]);
        } catch (\Exception $e) {
            Log::error("Image processing failed", ['ad_id' => $ad->id, 'error' => $e->getMessage()]);
        } finally {
            $storageWorkFileService->cleanup($outputFullPath);
        }
    }
}
