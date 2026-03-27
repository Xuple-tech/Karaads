<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Arr;

class AuthRedirect
{
    public static function sanitize(?string $target): ?string
    {
        if (! is_string($target) || $target === '') {
            return null;
        }

        if (str_starts_with($target, '/')) {
            return $target;
        }

        $host = parse_url($target, PHP_URL_HOST);
        $scheme = parse_url($target, PHP_URL_SCHEME);

        if (! $host || ! $scheme) {
            return null;
        }

        $allowedHosts = array_filter([
            parse_url((string) config('app.url'), PHP_URL_HOST),
            config('console.domain'),
        ]);

        return in_array($host, $allowedHosts, true) ? $target : null;
    }

    public static function fromRequest(Request $request): ?string
    {
        return self::sanitize(
            $request->input('redirect')
            ?? $request->query('redirect')
            ?? $request->session()->pull('auth.redirect_to')
        );
    }

    public static function remember(Request $request): void
    {
        $target = self::sanitize($request->input('redirect') ?? $request->query('redirect'));

        if ($target !== null) {
            $request->session()->put('auth.redirect_to', $target);
        }
    }

    public static function mainLoginUrl(?string $redirect = null): string
    {
        $base = rtrim((string) config('app.url'), '/');
        $query = [];

        if ($redirect !== null) {
            $sanitized = self::sanitize($redirect);

            if ($sanitized !== null) {
                $query['redirect'] = $sanitized;
            }
        }

        return $base . '/login' . ($query !== [] ? '?' . http_build_query($query) : '');
    }
}
