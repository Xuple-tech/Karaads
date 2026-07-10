<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AppDownloadTrack;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppDownloadTrackController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $userAgent = $request->userAgent() ?? '';

        if (stripos($userAgent, 'android') !== false) {
            $platform = 'android';
        } elseif (stripos($userAgent, 'iphone') !== false || stripos($userAgent, 'ipad') !== false) {
            $platform = 'ios';
        } else {
            $platform = 'unknown';
        }

        AppDownloadTrack::create([
            'user_id'    => $request->user()?->id,
            'ip_address' => $request->ip(),
            'user_agent' => $userAgent,
            'platform'   => $platform,
        ]);

        return response()->json(['ok' => true]);
    }
}
