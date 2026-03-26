<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageController extends Controller
{
    public function show($path)
    {
        $originalPath = storage_path('app/public/' . $path);

        if (!file_exists($originalPath)) {
            abort(404);
        }

        // Cached output path
        $cachedPath = storage_path('app/watermarked/' . $path);

        // Ensure directory exists
        if (!file_exists(dirname($cachedPath))) {
            mkdir(dirname($cachedPath), 0777, true);
        }

        // If cached version exists, return it
        if (file_exists($cachedPath)) {
            return response()->file($cachedPath, [
                'Content-Type' => mime_content_type($cachedPath)
            ]);
        }

        // Manager (Intervention v3)
        $manager = new ImageManager(new Driver());

        // Read image
        $img = $manager->read($originalPath);

        // Read watermark
        $watermark = $manager->read(public_path('___t_mds.png'))
            ->scaleDown(150);

        // Apply watermark
        $img->place($watermark, 'bottom-right', 10, 10);

        // Encode image
        $encoded = $img->encode();

        // Save watermarked version
        file_put_contents($cachedPath, $encoded);

        // Correct MIME type using PHP
        $mime = mime_content_type($originalPath);

        return new Response(
            $encoded,
            200,
            ['Content-Type' => $mime]
        );
    }
}
