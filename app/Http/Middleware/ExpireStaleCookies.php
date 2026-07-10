<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Response;

class ExpireStaleCookies
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $version = trim((string) config('cookie-reset.version', ''));

        if ($version === '') {
            return $response;
        }

        $markerCookie = 'karaads_cookie_reset_'.$this->safeVersion($version);

        if ($request->cookies->has($markerCookie)) {
            return $response;
        }

        $path = (string) config('session.path', '/');
        $currentSessionCookie = (string) config('session.cookie');
        $cookieNames = $this->cookieNames($currentSessionCookie, $markerCookie);

        foreach ($cookieNames as $cookieName) {
            foreach ($this->domains($request) as $domain) {
                Cookie::queue(Cookie::forget($cookieName, $path, $domain));
            }
        }

        Cookie::queue(cookie(
            $markerCookie,
            '1',
            60 * 24 * 365,
            $path,
            config('session.domain'),
            (bool) config('session.secure', false),
            true,
            false,
            config('session.same_site')
        ));

        return $response;
    }

    /**
     * @return array<int, string>
     */
    private function cookieNames(string $currentSessionCookie, string $markerCookie): array
    {
        $configuredNames = config('cookie-reset.names', []);
        $names = is_array($configuredNames) ? $configuredNames : [];

        foreach (['web', 'admin'] as $guard) {
            $authGuard = Auth::guard($guard);

            if (method_exists($authGuard, 'getRecallerName')) {
                $names[] = $authGuard->getRecallerName();
            }
        }

        return array_values(array_unique(array_filter(
            array_map(static fn ($name) => trim((string) $name), $names),
            static fn ($name) => $name !== '' && $name !== $currentSessionCookie && $name !== $markerCookie
        )));
    }

    /**
     * @return array<int, string|null>
     */
    private function domains(Request $request): array
    {
        $host = $request->getHost();
        $rootHost = preg_replace('/^www\./i', '', $host) ?: $host;
        $domains = [
            config('session.domain'),
            null,
        ];

        if (! in_array($host, ['localhost', '127.0.0.1'], true) && ! filter_var($host, FILTER_VALIDATE_IP)) {
            $domains[] = $host;
            $domains[] = '.'.$rootHost;
        }

        $seen = [];

        return array_values(array_filter($domains, static function ($domain) use (&$seen) {
            $key = $domain ?? '__host_only__';

            if (isset($seen[$key])) {
                return false;
            }

            $seen[$key] = true;

            return true;
        }));
    }

    private function safeVersion(string $version): string
    {
        return preg_replace('/[^A-Za-z0-9_]/', '_', $version) ?: 'current';
    }
}
