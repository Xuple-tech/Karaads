<?php

namespace App\Services\Widget;

use App\Models\WidgetConfig;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class WidgetDomainService
{
    public function ensureAllowed(WidgetConfig $widget, Request $request): void
    {
        $allowedDomains = array_values(array_filter((array) ($widget->allowed_domains ?? [])));

        if ($allowedDomains === []) {
            return;
        }

        $origin = $request->headers->get('Origin');
        $referer = $request->headers->get('Referer');
        $source = $origin ?: $referer;

        if (! $source) {
            throw new AccessDeniedHttpException('This widget is restricted to approved domains.');
        }

        $sourceHost = $this->normalizeHost($source);

        if (! $sourceHost) {
            throw new AccessDeniedHttpException('This widget is restricted to approved domains.');
        }

        foreach ($allowedDomains as $domain) {
            $allowedHost = $this->normalizeHost($domain);

            if (! $allowedHost) {
                continue;
            }

            if ($sourceHost === $allowedHost || str_ends_with($sourceHost, '.' . $allowedHost)) {
                return;
            }
        }

        throw new AccessDeniedHttpException('This widget is not allowed on this domain.');
    }

    private function normalizeHost(string $value): ?string
    {
        $candidate = trim($value);

        if ($candidate === '') {
            return null;
        }

        if (! str_contains($candidate, '://')) {
            $candidate = 'https://' . $candidate;
        }

        $host = parse_url($candidate, PHP_URL_HOST);

        return $host ? strtolower($host) : null;
    }
}
