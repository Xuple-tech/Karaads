<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\UserPresence;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackUserPresence
{
    public function __construct(
        private readonly UserPresence $userPresence,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user instanceof User) {
            $this->userPresence->touch($user);
        }

        return $next($request);
    }
}
