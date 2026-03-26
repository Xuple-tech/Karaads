<?php

namespace App\Http\Middleware;

use App\Models\ImageGeneration;
use App\Services\LimitResponseService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImageGenerationRateLimit
{
    const DAILY_LIMIT = 5;

    public function handle(Request $request, Closure $next)
    {
        $userId = Auth::id();
        $ipAddress = $request->ip();
        $email = Auth::user()?->email;

        $usageCount = ImageGeneration::getDailyUsageCount(
            userId: $userId,
            ipAddress: $ipAddress,
            email: $email
        );

        if ($usageCount >= self::DAILY_LIMIT) {
            // Use LimitResponseService for structured response
            $limitResponse = LimitResponseService::limitExceeded(
                'image_limit_exceeded',
                [
                    'limit' => self::DAILY_LIMIT,
                    'used' => $usageCount,
                    'reset_at' => now()->addDay()->toDateTimeString(),
                    'reset_type' => 'daily',
                ]
            );

            return response()->json($limitResponse, 429);
        }

        return $next($request);
    }
}
