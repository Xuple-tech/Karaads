<?php

namespace App\Http\Middleware;

use App\Services\SubscriptionService;
use App\Services\LimitResponseService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscriptionRateLimit
{
    protected $subscriptionService;

    public function __construct(SubscriptionService $subscriptionService)
    {
        $this->subscriptionService = $subscriptionService;
    }

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only check for authenticated users
        if (!auth()->check()) {
            return $next($request);
        }

        $user = auth()->user();
        $canMakeRequest = $this->subscriptionService->canMakeRequest($user);

        if (!$canMakeRequest['allowed']) {
            // Use LimitResponseService to generate structured response
            $limitResponse = LimitResponseService::fromSubscriptionCheck(
                $canMakeRequest,
                'rate_limit_exceeded'
            );

            return response()->json($limitResponse, 429);
        }

        return $next($request);
    }
}
