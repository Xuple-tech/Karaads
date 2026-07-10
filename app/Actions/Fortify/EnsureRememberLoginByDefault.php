<?php

namespace App\Actions\Fortify;

class EnsureRememberLoginByDefault
{
    /**
     * Default web logins to "remember me" unless the request explicitly sets it.
     */
    public function handle($request, $next)
    {
        if (! $request->exists('remember')) {
            $request->merge(['remember' => 'on']);
        }

        return $next($request);
    }
}
