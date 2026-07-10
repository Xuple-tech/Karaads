<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\Media\CoverVariantService;
use App\Services\Media\MediaPathService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;

class ProcessUserCover implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $userId,
        public readonly string $sourcePath
    ) {
    }

    public function handle(
        CoverVariantService $coverVariantService,
        MediaPathService $mediaPathService
    ): void
    {
        $user = User::query()->find($this->userId);
        if (!$user) {
            return;
        }

        $previousDerivativePaths = $this->collectDerivativePaths($user);

        $originalPath = is_array($user->cover_variants) ? ($user->cover_variants['original'] ?? null) : null;
        if ($user->cover !== $this->sourcePath && $originalPath !== $this->sourcePath) {
            return;
        }

        $user->forceFill([
            'cover_processing_status' => 'processing',
            'cover_processing_error' => null,
        ])->save();

        if (!Storage::disk('public')->exists($this->sourcePath)) {
            $user->forceFill([
                'cover_processing_status' => 'failed',
                'cover_processing_error' => 'Cover source file does not exist.',
            ])->save();

            return;
        }

        $variants = $coverVariantService->generate($this->sourcePath);
        $mdPath = $variants['md'] ?? null;

        $user->forceFill([
            'cover' => $mdPath ?? $this->sourcePath,
            'cover_variants' => $variants,
            'cover_processing_status' => $mdPath ? 'ready' : 'failed',
            'cover_processing_error' => $mdPath ? null : 'Unable to generate cover variants.',
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

        if (is_array($user->cover_variants)) {
            foreach ($user->cover_variants as $key => $path) {
                if ($key === 'original') {
                    continue;
                }

                $paths[] = $path;
            }
        }

        if (is_string($user->cover) && $user->cover !== '' && $user->cover !== $this->sourcePath) {
            $paths[] = $user->cover;
        }

        return array_values(array_unique(array_filter($paths)));
    }
}
