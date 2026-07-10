<?php

namespace App\Actions\Media;

use App\Jobs\ProcessUserCover;
use App\Models\User;
use App\Services\Media\MediaPathService;
use Illuminate\Http\UploadedFile;

class QueueUserCoverUploadAction
{
    public function __construct(
        private readonly MediaPathService $mediaPathService
    ) {
    }

    public function execute(User $user, UploadedFile $file, string $disk = 'public'): string
    {
        $existingPaths = [$user->cover];
        if (is_array($user->cover_variants)) {
            $existingPaths = array_merge($existingPaths, array_values($user->cover_variants));
        }

        $this->mediaPathService->deleteMany($existingPaths, $disk);

        $uploadDirectory = $this->mediaPathService->originalUploadDirectory('covers');
        $path = $file->store($uploadDirectory, $disk);

        $user->forceFill([
            'cover' => $path,
            'cover_variants' => [
                'sm' => null,
                'md' => null,
                'lg' => null,
                'original' => $path,
            ],
            'cover_processing_status' => 'queued',
            'cover_processing_error' => null,
        ])->save();

        if (app()->environment('local')) {
            ProcessUserCover::dispatchSync($user->id, $path);
        } else {
            ProcessUserCover::dispatch($user->id, $path);
        }

        return $path;
    }
}
