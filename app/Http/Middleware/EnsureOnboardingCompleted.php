<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOnboardingCompleted
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        $isOnboardingRoute = $request->is('onboarding');
        $hasCompletedOnboarding = method_exists($user, 'hasCompletedOnboarding')
            ? $user->hasCompletedOnboarding()
            : ! is_null($user->onboarding_completed_at);

        if (! $hasCompletedOnboarding && ! $isOnboardingRoute) {
            return redirect('/onboarding');
        }

        if ($hasCompletedOnboarding && $isOnboardingRoute) {
            return redirect('/app');
        }

        return $next($request);
    }
}
