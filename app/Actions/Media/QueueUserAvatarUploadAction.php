<?php

namespace App\Actions\Media;

use App\Jobs\ProcessUserAvatar;
use App\Models\User;
use App\Services\Media\MediaPathService;
use Illuminate\Http\UploadedFile;

class QueueUserAvatarUploadAction
{
    public function __construct(
        private readonly MediaPathService $mediaPathService
    ) {
    }

    public function execute(User $user, UploadedFile $file, string $disk = 'public'): string
    {
        $existingPaths = [$user->avatar];
        if (is_array($user->avatar_variants)) {
            $existingPaths = array_merge($existingPaths, array_values($user->avatar_variants));
        }

        $this->mediaPathService->deleteMany($existingPaths, $disk);

        $uploadDirectory = $this->mediaPathService->originalUploadDirectory('avatars');
        $path = $file->store($uploadDirectory, $disk);

        $user->forceFill([
            'avatar' => $path,
            'avatar_variants' => [
                'sm' => null,
                'md' => null,
                'lg' => null,
                'original' => $path,
            ],
            'avatar_processing_status' => 'queued',
            'avatar_processing_error' => null,
        ])->save();

        if (app()->environment('local')) {
            ProcessUserAvatar::dispatchSync($user->id, $path);
        } else {
            ProcessUserAvatar::dispatch($user->id, $path);
        }

        return $path;
    }
}
