<?php

namespace App\Support;

use App\Models\Post;
use Illuminate\Support\Str;

class PostSeo
{
    public static function build(Post $post): array
    {
        $siteName = config('app.name', 'Karaads');
        $username = $post->user?->username ?? 'user';
        $rawContent = trim(strip_tags((string) $post->content));
        $excerpt = $rawContent !== ''
            ? Str::limit(preg_replace('/\s+/', ' ', $rawContent), 155, '...')
            : "View this post by @{$username} on {$siteName}.";

        $titleCore = $rawContent !== ''
            ? Str::limit($rawContent, 60, '...')
            : "Post by @{$username}";
        $title = "{$titleCore} | {$siteName}";

        $canonical = url("/posts/{$post->id}");
        $image = self::resolveImage($post);
        $imageUrl = $image['url'] ?? null;
        $publishedAt = optional($post->created_at)->toIso8601String();
        $updatedAt = optional($post->updated_at)->toIso8601String();

        $jsonLd = array_filter([
            '@context' => 'https://schema.org',
            '@type' => 'SocialMediaPosting',
            'headline' => Str::limit($titleCore, 110, ''),
            'articleBody' => $rawContent !== '' ? $rawContent : null,
            'datePublished' => $publishedAt,
            'dateModified' => $updatedAt,
            'mainEntityOfPage' => $canonical,
            'author' => [
                '@type' => 'Person',
                'name' => $post->user?->name ?? "@{$username}",
                'url' => url("/@{$username}"),
            ],
            'image' => $imageUrl ? [$imageUrl] : null,
        ], static fn ($value) => $value !== null && $value !== '');

        return [
            'title' => $title,
            'description' => $excerpt,
            'canonical' => $canonical,
            'robots' => $post->visibility === 'everyone' ? 'index,follow,max-image-preview:large' : 'noindex,nofollow',
            'og_type' => 'article',
            'og_image' => $imageUrl,
            'og_image_width' => $image['width'] ?? null,
            'og_image_height' => $image['height'] ?? null,
            'og_image_type' => $image['type'] ?? null,
            'og_image_alt' => "Karaads post by @{$username}",
            'twitter_card' => $imageUrl ? 'summary_large_image' : 'summary',
            'published_time' => $publishedAt,
            'modified_time' => $updatedAt,
            'author' => $post->user?->name ?? "@{$username}",
            'site_name' => $siteName,
            'json_ld' => $jsonLd,
        ];
    }

    /**
     * @return array{url:string,width:?int,height:?int,type:?string}|null
     */
    private static function resolveImage(Post $post): ?array
    {
        $media = $post->media->first(function ($item) {
            return self::previewPathForMedia($item) !== null;
        });

        if (!$media) {
            return null;
        }

        $path = self::previewPathForMedia($media);
        if (!$path) {
            return null;
        }

        $url = self::publicMediaUrl($path);

        return $url ? [
            'url' => $url,
            'width' => $media->width ? (int) $media->width : null,
            'height' => $media->height ? (int) $media->height : null,
            'type' => self::imageMimeType($path, $media->mime_type),
        ] : null;
    }

    private static function previewPathForMedia($media): ?string
    {
        $variants = is_array($media->variants) ? $media->variants : [];

        return $media->thumbnail_path
            ?? ($media->file_type === 'image' ? ($variants['medium'] ?? $variants['thumb'] ?? $media->processed_file_path ?? $media->file_path) : null)
            ?? ($variants['thumb'] ?? null);
    }

    private static function publicMediaUrl(string $path): ?string
    {
        $path = trim($path);

        if ($path === '') {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        return route('media.asset', [
            'encodedPath' => rtrim(strtr(base64_encode(ltrim($path, '/')), '+/', '-_'), '='),
        ]);
    }

    private static function imageMimeType(string $path, ?string $fallback): ?string
    {
        $extension = strtolower(pathinfo(parse_url($path, PHP_URL_PATH) ?: $path, PATHINFO_EXTENSION));

        return match ($extension) {
            'jpg', 'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            default => Str::startsWith((string) $fallback, 'image/') ? $fallback : null,
        };
    }
}
