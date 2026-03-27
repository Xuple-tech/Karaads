<?php

namespace App\Support;

use Illuminate\Http\Request;

class ConsoleUrl
{
    public static function usesPathPrefix(): bool
    {
        return app()->environment(['local', 'testing']) || blank(config('console.domain'));
    }

    public static function basePath(): string
    {
        if (! self::usesPathPrefix()) {
            return '';
        }

        return '/' . trim((string) config('console.path_prefix', 'console'), '/');
    }

    public static function docsPath(): string
    {
        return self::basePath() . '/docs';
    }

    public static function loginPath(): string
    {
        return self::basePath() . '/login';
    }

    public static function docsUrl(Request $request): string
    {
        return self::urlForPath($request, self::docsPath());
    }

    public static function consoleUrl(Request $request): string
    {
        $url = self::urlForPath($request, self::basePath() ?: '/');

        if (! self::usesPathPrefix()) {
            return rtrim($url, '/');
        }

        return $url;
    }

    public static function urlForPath(Request $request, string $path): string
    {
        $path = '/' . ltrim($path, '/');

        if (self::usesPathPrefix()) {
            return $request->getSchemeAndHttpHost() . $path;
        }

        $domain = (string) config('console.domain');

        return $request->getScheme() . '://' . $domain . $path;
    }
}
