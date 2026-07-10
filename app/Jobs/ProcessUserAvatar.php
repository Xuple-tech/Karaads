<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\Media\AvatarVariantService;
use App\Services\Media\MediaPathService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;

class ProcessUserAvatar implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $userId,
        public readonly string $sourcePath
    ) {
    }

    public function handle(
        AvatarVariantService $avatarVariantService,
        MediaPathService $mediaPathService
    ): void
    {
        $user = User::query()->find($this->userId);
        if (!$user) {
            return;
        }

        $previousDerivativePaths = $this->collectDerivativePaths($user);

        $originalPath = is_array($user->avatar_variants) ? ($user->avatar_variants['original'] ?? null) : null;
        if ($user->avatar !== $this->sourcePath && $originalPath !== $this->sourcePath) {
            return;
        }

        $user->forceFill([
            'avatar_processing_status' => 'processing',
            'avatar_processing_error' => null,
        ])->save();

        if (!Storage::disk('public')->exists($this->sourcePath)) {
            $user->forceFill([
                'avatar_processing_status' => 'failed',
                'avatar_processing_error' => 'Avatar source file does not exist.',
            ])->save();

            return;
        }

        $variants = $avatarVariantService->generate($this->sourcePath);
        $mdPath = $variants['md'] ?? null;

        $user->forceFill([
            'avatar' => $mdPath ?? $this->sourcePath,
            'avatar_variants' => $variants,
            'avatar_processing_status' => $mdPath ? 'ready' : 'failed',
            'avatar_processing_error' => $mdPath ? null : 'Unable to generate avatar variants.',
        ])->save();

        $newDerivativePaths = array_values(array_filter([
            $variants['sm'] ?? null,
            $variants['md'] ?? null,
            $variants['lg'] ?? null,
        ]));

        $stalePaths = array_values(array_diff($previousDerivativePaths, $newDerivativePaths));
        if ($stalePaths !== []) {
            $mediaPathService->deleteMany($stalePaths);
        }
    }

    /**
     * @return array<int, string>
     */
    private function collectDerivativePaths(User $user): array
    {
        $paths = [];

        if (is_array($user->avatar_variants)) {
            foreach ($user->avatar_variants as $key => $path) {
                if ($key === 'original') {
                    continue;
                }

                $paths[] = $path;
            }
        }

        if (is_string($user->avatar) && $user->avatar !== '' && $user->avatar !== $this->sourcePath) {
            $paths[] = $user->avatar;
        }

        return array_values(array_unique(array_filter($paths)));
    }
}
