<?php

namespace App\Domain\Recommendation\Services;

use Illuminate\Support\Str;

class PostCategorizationService
{
    /**
     * @param  array<int, string>  $hashtags
     * @return array{
     *   primary_category:string,
     *   confidence:float,
     *   scores:array<string,float>,
     *   hashtags:array<int,string>
     * }
     */
    public function categorize(?string $content, array $hashtags = [], ?string $mediaType = null): array
    {
        $content = trim((string) $content);
        $normalizedHashtags = $this->normalizeHashtags(array_merge(
            $hashtags,
            $this->extractHashtagsFromContent($content),
        ));

        $categories = [
            'technology' => ['ai', 'tech', 'software', 'coding', 'programming', 'javascript', 'laravel', 'react', 'webdev', 'startup'],
            'business' => ['business', 'marketing', 'brand', 'sales', 'entrepreneur', 'commerce', 'productivity'],
            'finance' => ['finance', 'money', 'crypto', 'bitcoin', 'invest', 'stock', 'trading', 'economy'],
            'education' => ['education', 'study', 'school', 'tutorial', 'learn', 'course', 'tips'],
            'entertainment' => ['movie', 'music', 'comedy', 'viral', 'fun', 'celeb', 'show'],
            'sports' => ['sports', 'football', 'soccer', 'basketball', 'tennis', 'fitness', 'gym'],
            'health' => ['health', 'wellness', 'mentalhealth', 'nutrition', 'diet', 'meditation'],
            'gaming' => ['gaming', 'gamer', 'esports', 'gameplay', 'ps5', 'xbox'],
            'news' => ['news', 'update', 'breaking', 'politics', 'world'],
            'lifestyle' => ['travel', 'food', 'fashion', 'beauty', 'lifestyle', 'vlog'],
        ];

        $text = Str::lower($content . ' ' . implode(' ', $normalizedHashtags));
        $scores = [];
        foreach ($categories as $category => $keywords) {
            $score = 0.0;
            foreach ($keywords as $keyword) {
                if (str_contains($text, $keyword)) {
                    $score += 1.0;
                }
            }
            $scores[$category] = $score;
        }

        if ($mediaType === 'video') {
            $scores['entertainment'] = ($scores['entertainment'] ?? 0) + 0.25;
            $scores['gaming'] = ($scores['gaming'] ?? 0) + 0.10;
            $scores['sports'] = ($scores['sports'] ?? 0) + 0.10;
        }

        arsort($scores);
        $primary = (string) (array_key_first($scores) ?? 'general');
        $top = (float) ($scores[$primary] ?? 0.0);
        $sum = array_sum($scores);
        $confidence = $sum > 0 ? min(1.0, $top / max(1.0, $sum)) : 0.20;

        if ($top <= 0.0) {
            $primary = 'general';
            $scores = ['general' => 1.0];
            $confidence = 0.20;
        } else {
            $scores = array_map(fn ($value) => round((float) $value, 4), $scores);
        }

        return [
            'primary_category' => $primary,
            'confidence' => round($confidence, 4),
            'scores' => $scores,
            'hashtags' => $normalizedHashtags,
        ];
    }

    /**
     * @return array<int, string>
     */
    private function extractHashtagsFromContent(string $content): array
    {
        preg_match_all('/#([\p{L}\p{N}_]+)/u', $content, $matches);
        return isset($matches[1]) && is_array($matches[1]) ? $matches[1] : [];
    }

    /**
     * @param  array<int, string>  $hashtags
     * @return array<int, string>
     */
    private function normalizeHashtags(array $hashtags): array
    {
        $items = [];
        foreach ($hashtags as $tag) {
            $tag = Str::lower(trim((string) $tag));
            $tag = ltrim($tag, '#');
            if ($tag !== '' && preg_match('/^[\p{L}\p{N}_-]+$/u', $tag)) {
                $items[] = $tag;
            }
        }

        return array_values(array_unique($items));
    }
}

