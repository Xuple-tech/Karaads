<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminMediaController extends Controller
{
    public function show(string $path): StreamedResponse|BinaryFileResponse|Response
    {
        $normalized = trim(str_replace('\\', '/', $path), '/');

        if ($normalized === '') {
            abort(422, 'Path is required.');
        }

        if (
            Str::contains($normalized, "\0")
            || Str::contains($normalized, '..')
            || Str::startsWith($normalized, ['http://', 'https://'])
        ) {
            abort(422, 'Invalid path.');
        }

        if (!Str::contains($normalized, '/admin/') && !Str::startsWith($normalized, 'admin/')) {
            abort(403, 'Only admin-scoped media is allowed.');
        }

        if (!Storage::disk('public')->exists($normalized)) {
            abort(404);
        }

        return Storage::disk('public')->response(
            $normalized,
            null,
            [
                'Cache-Control' => 'public, max-age=300',
                'X-Content-Type-Options' => 'nosniff',
            ],
        );
    }
}
