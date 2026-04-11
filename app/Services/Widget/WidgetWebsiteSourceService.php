<?php

namespace App\Services\Widget;

use App\Jobs\CrawlWidgetWebsiteSource;
use App\Models\User;
use App\Models\WidgetConfig;
use App\Models\WidgetKnowledgeItem;
use App\Models\WidgetWebsiteSource;
use App\Models\WidgetWebsiteSourcePage;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class WidgetWebsiteSourceService
{
    private const MAX_PAGES = 25;

    private const DEFAULT_RECRAWL_HOURS = 24;

    public function createSource(WidgetConfig $widget, User $user, array $attributes): WidgetWebsiteSource
    {
        $siteUrl = $this->normalizeUrl((string) $attributes['site_url']);
        $siteHost = strtolower((string) parse_url($siteUrl, PHP_URL_HOST));
        $sourceType = (string) $attributes['source_type'];
        $verificationMethod = $sourceType === 'wordpress_plugin'
            ? null
            : (string) ($attributes['verification_method'] ?? 'meta_tag');

        return WidgetWebsiteSource::create([
            'widget_id' => $widget->id,
            'user_id' => $user->id,
            'source_type' => $sourceType,
            'site_name' => $attributes['site_name'] ?? null,
            'site_url' => $siteUrl,
            'site_host' => $siteHost,
            'is_wordpress' => $this->detectWordPress($siteUrl),
            'verification_method' => $verificationMethod,
            'verification_token' => $this->generateToken(40),
            'verification_status' => $sourceType === 'wordpress_plugin' ? 'verified' : 'pending',
            'connection_token' => $sourceType === 'wordpress_plugin' ? $this->generateToken(32) : null,
            'connection_secret' => $sourceType === 'wordpress_plugin' ? $this->generateToken(64) : null,
            'plugin_connected_at' => $sourceType === 'wordpress_plugin' ? now() : null,
            'crawl_status' => 'idle',
            'include_paths' => $this->cleanPathList($attributes['include_paths'] ?? []),
            'exclude_paths' => $this->cleanPathList($attributes['exclude_paths'] ?? []),
            'seed_urls' => $this->cleanUrlList($attributes['seed_urls'] ?? [], $siteHost),
            'settings' => [
                'recrawl_interval_hours' => (int) ($attributes['recrawl_interval_hours'] ?? self::DEFAULT_RECRAWL_HOURS),
            ],
            'metadata' => [
                'scope_mode' => $attributes['scope_mode'] ?? 'safe_public',
            ],
            'last_verified_at' => $sourceType === 'wordpress_plugin' ? now() : null,
            'next_recrawl_at' => $sourceType === 'wordpress_plugin' ? now()->addHours(self::DEFAULT_RECRAWL_HOURS) : null,
            'is_active' => true,
        ])->fresh();
    }

    public function updateSource(WidgetWebsiteSource $source, array $attributes): WidgetWebsiteSource
    {
        $updates = [];

        if (isset($attributes['site_name'])) {
            $updates['site_name'] = $attributes['site_name'];
        }

        if (isset($attributes['verification_method']) && $source->source_type !== 'wordpress_plugin') {
            $updates['verification_method'] = $attributes['verification_method'];
        }

        if (array_key_exists('include_paths', $attributes)) {
            $updates['include_paths'] = $this->cleanPathList($attributes['include_paths'] ?? []);
        }

        if (array_key_exists('exclude_paths', $attributes)) {
            $updates['exclude_paths'] = $this->cleanPathList($attributes['exclude_paths'] ?? []);
        }

        if (array_key_exists('seed_urls', $attributes)) {
            $updates['seed_urls'] = $this->cleanUrlList($attributes['seed_urls'] ?? [], $source->site_host);
        }

        if (isset($attributes['scope_mode'])) {
            $metadata = $source->metadata ?? [];
            $metadata['scope_mode'] = $attributes['scope_mode'];
            $updates['metadata'] = $metadata;
        }

        if (isset($attributes['recrawl_interval_hours'])) {
            $settings = $source->settings ?? [];
            $settings['recrawl_interval_hours'] = (int) $attributes['recrawl_interval_hours'];
            $updates['settings'] = $settings;
            $updates['next_recrawl_at'] = now()->addHours((int) $attributes['recrawl_interval_hours']);
        }

        if (isset($attributes['is_active'])) {
            $updates['is_active'] = (bool) $attributes['is_active'];
        }

        if ($updates !== []) {
            $source->update($updates);
        }

        return $source->fresh();
    }

    public function verifySource(WidgetWebsiteSource $source): WidgetWebsiteSource
    {
        if ($source->source_type === 'wordpress_plugin') {
            return $source->fresh();
        }

        $verified = $source->verification_method === 'file'
            ? $this->verifyByFile($source)
            : $this->verifyByMetaTag($source);

        $source->update([
            'verification_status' => $verified ? 'verified' : 'failed',
            'last_verified_at' => $verified ? now() : $source->last_verified_at,
        ]);

        return $source->fresh();
    }

    public function queueCrawl(WidgetWebsiteSource $source, bool $force = false): WidgetWebsiteSource
    {
        if ($source->source_type !== 'wordpress_plugin' && $source->verification_status !== 'verified') {
            throw new \RuntimeException('Verify this website source before crawling it.');
        }

        if (! $force && $source->crawl_status === 'queued') {
            return $source->fresh();
        }

        $source->update(['crawl_status' => 'queued']);
        CrawlWidgetWebsiteSource::dispatch($source->id);

        return $source->fresh();
    }

    public function crawlSource(WidgetWebsiteSource $source): void
    {
        if ($source->source_type !== 'wordpress_plugin' && $source->verification_status !== 'verified') {
            $source->update(['crawl_status' => 'failed']);
            throw new \RuntimeException('Website source must be verified before crawl.');
        }

        $source->update(['crawl_status' => 'crawling']);

        $queue = collect([$source->site_url, ...($source->seed_urls ?? [])])->filter()->values();
        $visited = [];
        $processed = 0;

        while ($queue->isNotEmpty() && $processed < self::MAX_PAGES) {
            $url = $this->normalizeUrl((string) $queue->shift());

            if ($url === '' || isset($visited[$url])) {
                continue;
            }

            $visited[$url] = true;
            $path = (string) (parse_url($url, PHP_URL_PATH) ?: '/');

            if (! $this->shouldCrawlPath($source, $url, $path)) {
                $this->recordSkippedPage($source, $url, $path, 'Skipped by crawl scope or safe-page rules.');
                continue;
            }

            $processed++;
            $page = $this->upsertPage($source, $url, $path, ['status' => 'crawling']);

            try {
                $response = $this->sendPublicGet($url);
                $response->throw();

                $parsed = $this->parseHtmlPage($url, $response->body(), $source->site_host);
                $text = $parsed['text'];

                if ($text === '') {
                    $page->update([
                        'status' => 'failed',
                        'failure_reason' => 'No readable page content was extracted.',
                        'last_crawled_at' => now(),
                    ]);
                    continue;
                }

                $knowledgeItem = $this->upsertKnowledgeFromPage($source, $page, $url, $parsed['title'], $text);

                $page->update([
                    'knowledge_item_id' => $knowledgeItem->id,
                    'title' => $parsed['title'],
                    'status' => 'ready',
                    'content_hash' => sha1($text),
                    'failure_reason' => null,
                    'last_crawled_at' => now(),
                    'metadata' => [
                        'word_count' => str_word_count($text),
                    ],
                ]);

                foreach ($parsed['links'] as $link) {
                    if (! isset($visited[$link])) {
                        $queue->push($link);
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Widget website crawl failed for page.', [
                    'source_id' => $source->id,
                    'url' => $url,
                    'error' => $e->getMessage(),
                ]);

                $page->update([
                    'status' => 'failed',
                    'failure_reason' => Str::limit($e->getMessage(), 400, ''),
                    'last_crawled_at' => now(),
                ]);
            }
        }

        $source->refresh();
        $source->update([
            'crawl_status' => 'completed',
            'last_crawled_at' => now(),
            'last_sync_at' => now(),
            'next_recrawl_at' => now()->addHours((int) (($source->settings['recrawl_interval_hours'] ?? self::DEFAULT_RECRAWL_HOURS))),
        ]);
    }

    public function syncPluginSource(WidgetWebsiteSource $source, array $payload): WidgetWebsiteSource
    {
        abort_unless($source->source_type === 'wordpress_plugin', 404);

        $source->update([
            'verification_status' => 'verified',
            'plugin_connected_at' => now(),
            'last_verified_at' => now(),
            'is_wordpress' => true,
            'site_name' => $payload['site_name'] ?? $source->site_name,
            'metadata' => array_merge($source->metadata ?? [], [
                'plugin_version' => $payload['plugin_version'] ?? null,
                'wordpress_version' => $payload['wordpress_version'] ?? null,
            ]),
            'last_sync_at' => now(),
            'next_recrawl_at' => now()->addHours((int) (($source->settings['recrawl_interval_hours'] ?? self::DEFAULT_RECRAWL_HOURS))),
        ]);

        foreach (($payload['pages'] ?? []) as $pageData) {
            $url = $this->normalizeUrl((string) ($pageData['url'] ?? ''));
            if ($url === '') {
                continue;
            }

            $path = (string) (parse_url($url, PHP_URL_PATH) ?: '/');
            $page = $this->upsertPage($source, $url, $path, ['status' => 'crawling']);
            $content = trim((string) ($pageData['content'] ?? ''));

            if ($content === '') {
                $page->update([
                    'status' => 'failed',
                    'failure_reason' => 'Plugin sync did not provide content.',
                    'last_crawled_at' => now(),
                ]);
                continue;
            }

            $knowledgeItem = $this->upsertKnowledgeFromPage($source, $page, $url, (string) ($pageData['title'] ?? ''), $content);

            $page->update([
                'knowledge_item_id' => $knowledgeItem->id,
                'title' => $pageData['title'] ?? null,
                'status' => 'ready',
                'content_hash' => sha1($content),
                'failure_reason' => null,
                'last_crawled_at' => now(),
                'metadata' => [
                    'synced_by' => 'plugin',
                    'post_type' => $pageData['post_type'] ?? null,
                ],
            ]);
        }

        return $source->fresh(['pages.knowledgeItem']);
    }

    public function serializeSource(WidgetWebsiteSource $source, bool $includePages = false): array
    {
        $source->loadMissing('pages');
        $pages = $source->pages;

        return [
            'id' => $source->id,
            'source_type' => $source->source_type,
            'site_name' => $source->site_name,
            'site_url' => $source->site_url,
            'site_host' => $source->site_host,
            'is_wordpress' => $source->is_wordpress,
            'verification_method' => $source->verification_method,
            'verification_status' => $source->verification_status,
            'verification_token' => $source->verification_token,
            'verification_meta_tag' => $this->verificationMetaTag($source),
            'verification_filename' => $this->verificationFilename($source),
            'verification_file_content' => $source->verification_token,
            'connection_token' => $source->connection_token,
            'connection_secret' => $source->connection_secret,
            'plugin_sync_url' => $source->connection_token ? url('/api/widget/plugin/' . $source->connection_token . '/sync') : null,
            'crawl_status' => $source->crawl_status,
            'include_paths' => $source->include_paths ?? [],
            'exclude_paths' => $source->exclude_paths ?? [],
            'seed_urls' => $source->seed_urls ?? [],
            'settings' => $source->settings ?? [],
            'metadata' => $source->metadata ?? [],
            'last_verified_at' => $source->last_verified_at,
            'last_crawled_at' => $source->last_crawled_at,
            'last_sync_at' => $source->last_sync_at,
            'next_recrawl_at' => $source->next_recrawl_at,
            'is_active' => $source->is_active,
            'stats' => [
                'pages_total' => $pages->count(),
                'pages_ready' => $pages->where('status', 'ready')->count(),
                'pages_failed' => $pages->where('status', 'failed')->count(),
                'pages_skipped' => $pages->where('status', 'skipped')->count(),
            ],
            'pages' => $includePages ? $pages->sortBy('url')->values()->map(fn (WidgetWebsiteSourcePage $page) => [
                'id' => $page->id,
                'url' => $page->url,
                'path' => $page->path,
                'title' => $page->title,
                'status' => $page->status,
                'failure_reason' => $page->failure_reason,
                'last_crawled_at' => $page->last_crawled_at,
                'knowledge_item_id' => $page->knowledge_item_id,
            ])->all() : [],
        ];
    }

    public function verificationFilename(WidgetWebsiteSource $source): string
    {
        return 'kwati-site-verification-' . $source->verification_token . '.txt';
    }

    public function verificationMetaTag(WidgetWebsiteSource $source): string
    {
        return '<meta name="kwati-site-verification" content="' . $source->verification_token . '">';
    }

    private function verifyByMetaTag(WidgetWebsiteSource $source): bool
    {
        $response = $this->sendPublicGet($source->site_url);
        $response->throw();

        return str_contains(
            strtolower($response->body()),
            strtolower('name="kwati-site-verification" content="' . $source->verification_token . '"')
        );
    }

    private function verifyByFile(WidgetWebsiteSource $source): bool
    {
        $response = $this->sendPublicGet(rtrim($source->site_url, '/') . '/' . $this->verificationFilename($source));
        $response->throw();

        return trim($response->body()) === $source->verification_token;
    }

    private function detectWordPress(string $siteUrl): bool
    {
        try {
            $response = $this->sendPublicGet($siteUrl);
            $body = strtolower($response->body());

            return str_contains($body, 'wp-content')
                || str_contains($body, 'wordpress')
                || str_contains($body, 'wp-json');
        } catch (\Throwable) {
            return false;
        }
    }

    private function upsertPage(WidgetWebsiteSource $source, string $url, string $path, array $attributes = []): WidgetWebsiteSourcePage
    {
        return tap(
            WidgetWebsiteSourcePage::query()->firstOrCreate(
                [
                    'website_source_id' => $source->id,
                    'url_hash' => sha1($url),
                ],
                [
                    'url' => $url,
                    'path' => $path,
                    'status' => 'queued',
                ]
            ),
            function (WidgetWebsiteSourcePage $page) use ($url, $path, $attributes): void {
                $page->update(array_merge([
                    'url' => $url,
                    'url_hash' => sha1($url),
                    'path' => $path,
                ], $attributes));
            }
        )->fresh();
    }

    private function upsertKnowledgeFromPage(WidgetWebsiteSource $source, WidgetWebsiteSourcePage $page, string $url, string $title, string $content): WidgetKnowledgeItem
    {
        $name = $title !== '' ? $title : Str::limit($url, 120, '');

        if ($page->knowledge_item_id) {
            $knowledgeItem = WidgetKnowledgeItem::query()->find($page->knowledge_item_id);
            if ($knowledgeItem) {
                $knowledgeItem->update([
                    'name' => $name,
                    'content' => Str::limit($content, 15000, ''),
                    'source_url' => $url,
                    'status' => 'ready',
                ]);

                return $knowledgeItem->fresh();
            }
        }

        return WidgetKnowledgeItem::query()->create([
            'widget_id' => $source->widget_id,
            'user_id' => $source->user_id,
            'name' => $name,
            'type' => 'url',
            'content' => Str::limit($content, 15000, ''),
            'source_url' => $url,
            'status' => 'ready',
        ]);
    }

    private function recordSkippedPage(WidgetWebsiteSource $source, string $url, string $path, string $reason): void
    {
        $this->upsertPage($source, $url, $path, [
            'status' => 'skipped',
            'failure_reason' => $reason,
            'last_crawled_at' => now(),
        ]);
    }

    private function parseHtmlPage(string $url, string $html, string $host): array
    {
        $dom = new \DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML($html);
        libxml_clear_errors();

        $title = trim((string) optional($dom->getElementsByTagName('title')->item(0))->textContent);
        $text = trim(preg_replace('/\s+/', ' ', strip_tags($html)) ?? '');

        $links = [];
        foreach ($dom->getElementsByTagName('a') as $anchor) {
            $href = trim((string) $anchor->getAttribute('href'));
            $absolute = $this->resolveLink($url, $href);
            if ($absolute === null) {
                continue;
            }

            if (strtolower((string) parse_url($absolute, PHP_URL_HOST)) !== $host) {
                continue;
            }

            $links[] = $absolute;
        }

        return [
            'title' => $title,
            'text' => Str::limit($text, 15000, ''),
            'links' => array_values(array_unique($links)),
        ];
    }

    private function shouldCrawlPath(WidgetWebsiteSource $source, string $url, string $path): bool
    {
        if ((string) parse_url($url, PHP_URL_HOST) !== $source->site_host) {
            return false;
        }

        if ((string) parse_url($url, PHP_URL_QUERY) !== '') {
            return false;
        }

        $lowerPath = strtolower($path);
        foreach ([
            '/wp-admin',
            '/wp-login',
            '/cart',
            '/checkout',
            '/my-account',
            '/account',
            '/search',
            '/feed',
            '/tag/',
            '/author/',
        ] as $skipPrefix) {
            if (str_starts_with($lowerPath, $skipPrefix) || str_contains($lowerPath, $skipPrefix)) {
                return false;
            }
        }

        $excludePaths = collect($source->exclude_paths ?? [])->filter();
        if ($excludePaths->contains(fn (string $excluded) => str_starts_with($lowerPath, strtolower($excluded)))) {
            return false;
        }

        $includePaths = collect($source->include_paths ?? [])->filter();
        if ($includePaths->isNotEmpty()) {
            return $includePaths->contains(fn (string $included) => str_starts_with($lowerPath, strtolower($included)));
        }

        return true;
    }

    private function normalizeUrl(string $url): string
    {
        $url = trim($url);
        if ($url === '') {
            return '';
        }

        if (! str_starts_with($url, 'http://') && ! str_starts_with($url, 'https://')) {
            $url = 'https://' . ltrim($url, '/');
        }

        $this->assertSafeUrl($url);

        $parts = parse_url($url);
        $scheme = strtolower((string) ($parts['scheme'] ?? 'https'));
        $host = strtolower((string) ($parts['host'] ?? ''));
        $path = (string) ($parts['path'] ?? '/');

        if ($path === '') {
            $path = '/';
        }

        return $scheme . '://' . $host . rtrim($path, '/') . ((isset($parts['query']) && $parts['query'] !== '') ? '?' . $parts['query'] : '');
    }

    private function cleanPathList(array $paths): array
    {
        return collect($paths)
            ->map(fn ($path) => '/' . trim((string) $path, " \t\n\r\0\x0B/"))
            ->map(fn ($path) => $path === '/' ? $path : rtrim($path, '/'))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    private function cleanUrlList(array $urls, string $expectedHost): array
    {
        return collect($urls)
            ->map(fn ($url) => $this->normalizeUrl((string) $url))
            ->filter(fn ($url) => (string) parse_url($url, PHP_URL_HOST) === $expectedHost)
            ->unique()
            ->values()
            ->all();
    }

    private function resolveLink(string $baseUrl, string $href): ?string
    {
        if ($href === '' || str_starts_with($href, '#') || str_starts_with($href, 'mailto:') || str_starts_with($href, 'tel:')) {
            return null;
        }

        if (str_starts_with($href, 'http://') || str_starts_with($href, 'https://')) {
            return $this->normalizeUrl($href);
        }

        if (str_starts_with($href, '//')) {
            return $this->normalizeUrl((string) parse_url($baseUrl, PHP_URL_SCHEME) . ':' . $href);
        }

        $scheme = (string) parse_url($baseUrl, PHP_URL_SCHEME);
        $host = (string) parse_url($baseUrl, PHP_URL_HOST);

        if (str_starts_with($href, '/')) {
            return $this->normalizeUrl($scheme . '://' . $host . $href);
        }

        $directory = rtrim(str_replace('\\', '/', dirname((string) parse_url($baseUrl, PHP_URL_PATH))), '/');

        return $this->normalizeUrl($scheme . '://' . $host . ($directory !== '' ? $directory : '') . '/' . ltrim($href, '/'));
    }

    private function assertSafeUrl(string $url): void
    {
        $parts = parse_url($url);
        $scheme = strtolower((string) ($parts['scheme'] ?? ''));

        if (! in_array($scheme, ['http', 'https'], true)) {
            throw new \RuntimeException('Only HTTP and HTTPS website URLs are allowed.');
        }

        $host = strtolower((string) ($parts['host'] ?? ''));

        if ($host === '' || in_array($host, ['localhost', '127.0.0.1', '::1'], true) || str_ends_with($host, '.local')) {
            throw new \RuntimeException('Private or local website URLs are not allowed.');
        }

        $addresses = gethostbynamel($host) ?: [];

        if ($addresses === []) {
            throw new \RuntimeException('Could not resolve the website host.');
        }

        foreach ($addresses as $address) {
            $isPublic = filter_var($address, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE);
            if (! $isPublic) {
                throw new \RuntimeException('Private or reserved network targets are not allowed.');
            }
        }
    }

    private function sendPublicGet(string $url)
    {
        $client = Http::timeout(8)->connectTimeout(4)->withoutRedirecting();

        try {
            return $client->get($url);
        } catch (\Throwable $e) {
            if (! $this->isCertificateAuthorityError($e)) {
                throw $e;
            }

            return $this->insecurePublicClient()->get($url);
        }
    }

    private function insecurePublicClient(): PendingRequest
    {
        return Http::timeout(8)
            ->connectTimeout(4)
            ->withoutRedirecting()
            ->withoutVerifying();
    }

    private function isCertificateAuthorityError(\Throwable $e): bool
    {
        return str_contains(strtolower($e->getMessage()), 'curl error 60');
    }

    private function generateToken(int $length): string
    {
        return Str::lower(Str::random($length));
    }
}
