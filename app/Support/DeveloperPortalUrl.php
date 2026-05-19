<?php

namespace App\Support;

use Illuminate\Http\Request;

class DeveloperPortalUrl
{
    public static function usesSubdomain(Request $request): bool
    {
        $consoleDomain = trim((string) config('console.domain'));

        return $consoleDomain !== '' && $request->getHost() === $consoleDomain;
    }

    public static function basePath(Request $request): string
    {
        return self::usesSubdomain($request) ? '' : '/developer-api';
    }

    public static function baseUrl(Request $request): string
    {
        return self::urlForPath($request, '/');
    }

    public static function loginUrl(Request $request): string
    {
        return self::urlForPath($request, '/login');
    }

    public static function registerUrl(Request $request): string
    {
        return self::urlForPath($request, '/register');
    }

    public static function logoutUrl(Request $request): string
    {
        return self::urlForPath($request, '/logout');
    }

    public static function urlForPath(Request $request, string $path = '/'): string
    {
        $path = '/' . ltrim($path, '/');
        $basePath = trim(self::basePath($request), '/');
        $fullPath = $basePath === '' ? $path : '/' . $basePath . ($path === '/' ? '' : $path);

        return rtrim($request->getSchemeAndHttpHost(), '/') . ($fullPath === '' ? '/' : $fullPath);
    }
}
