<?php

namespace App\Services\Content;

class ContentValidationService
{
    /**
     * @param  array<int, string>  $hashtags
     * @return array{
     *     passed: bool,
     *     status: string,
     *     score: int,
     *     summary: string,
     *     violations: array<int, string>,
     *     warnings: array<int, string>,
     *     trace: array<int, array<string, mixed>>
     * }
     */
    public function validate(
        string $content,
        array $hashtags = [],
        bool $hasMedia = false,
        bool $hasVideo = false,
        ?float $videoDurationSeconds = null,
    ): array {
        $normalized = mb_strtolower(trim($content));
        $violations = [];
        $warnings = [];
        $trace = [];
        $needsReview = false;

        $criticalPatterns = [
            '/\b(?:child sexual abuse|csam|rape video|terrorist manual)\b/u' => 'This content cannot be published because it appears to involve severe illegal or exploitative material.',
        ];

        foreach ($criticalPatterns as $pattern => $message) {
            $matched = $normalized !== '' && preg_match($pattern, $normalized) === 1;
            $trace[] = [
                'rule' => 'critical_safety',
                'severity' => 'error',
                'passed' => ! $matched,
                'message' => $matched ? $message : 'No critical safety terms detected.',
            ];

            if ($matched) {
                $violations[] = $message;
            }
        }

        $copyrightPatterns = [
            '/\b(?:full movie|full episode|leaked movie|leaked album|pirated|cracked software|watch .* free movie)\b/u' => 'This post looks like it may contain copyrighted or pirated content.',
            '/\b(?:i do not own the rights|no copyright intended|copyright belongs to|reuploaded from)\b/u' => 'This post includes wording often used with unlicensed copyrighted content.',
        ];

        foreach ($copyrightPatterns as $pattern => $message) {
            $matched = $normalized !== '' && preg_match($pattern, $normalized) === 1;
            $trace[] = [
                'rule' => 'copyright_risk',
                'severity' => $matched ? 'error' : 'info',
                'passed' => ! $matched,
                'message' => $matched ? $message : 'No copyright-risk wording detected.',
            ];

            if ($matched) {
                $violations[] = $message;
            }
        }

        $reviewPatterns = [
            '/\b(?:porn|nude|sex tape|explicit sex)\b/u' => 'Adult sexual content is not allowed.',
            '/\b(?:kill|murder|assassinate|bomb attack)\b/u' => 'Violent or dangerous threats are not allowed.',
            '/\b(?:ponzi|investment scam|wire money now|guaranteed profit|crypto doubling)\b/u' => 'Scam or deceptive financial content is not allowed.',
            '/\b(?:hate speech|ethnic cleansing|racial slur)\b/u' => 'Hateful or abusive content is not allowed.',
        ];

        foreach ($reviewPatterns as $pattern => $message) {
            $matched = $normalized !== '' && preg_match($pattern, $normalized) === 1;
            $trace[] = [
                'rule' => 'review_terms',
                'severity' => $matched ? 'error' : 'info',
                'passed' => ! $matched,
                'message' => $matched ? $message : 'No review terms detected.',
            ];

            if ($matched) {
                $violations[] = $message;
            }
        }

        $linkCount = preg_match_all('/https?:\/\/|www\./iu', $content);
        $linkSpam = $linkCount > 2;
        $trace[] = [
            'rule' => 'link_spam',
            'severity' => $linkSpam ? 'warning' : 'info',
            'passed' => ! $linkSpam,
            'message' => $linkSpam
                ? 'Too many external links were detected in one post.'
                : 'Link count is within policy.',
            'meta' => ['count' => $linkCount],
        ];
        if ($linkSpam) {
            $needsReview = true;
            $warnings[] = 'Too many external links were detected. Reduce the number of links and try again.';
        }

        $hasExcessiveHashtags = count($hashtags) > 12;
        $trace[] = [
            'rule' => 'hashtag_volume',
            'severity' => $hasExcessiveHashtags ? 'warning' : 'info',
            'passed' => true,
            'message' => $hasExcessiveHashtags
                ? 'Too many hashtags can reduce quality and reach.'
                : 'Hashtag count looks healthy.',
            'meta' => ['count' => count($hashtags)],
        ];
        if ($hasExcessiveHashtags) {
            $warnings[] = 'Use 12 hashtags or fewer for cleaner, higher-quality posts.';
        }

        $repeatedCharacters = preg_match('/(.)\1{7,}/u', $content) === 1;
        $trace[] = [
            'rule' => 'repetition',
            'severity' => $repeatedCharacters ? 'warning' : 'info',
            'passed' => true,
            'message' => $repeatedCharacters
                ? 'The caption contains repeated characters that look like spam.'
                : 'Caption repetition check passed.',
        ];
        if ($repeatedCharacters) {
            $warnings[] = 'Your caption looks repetitive. Shortening repeated characters can help it pass review faster.';
        }

        $veryShortEmptyPost = ! $hasMedia && mb_strlen($normalized) > 0 && mb_strlen($normalized) < 3;
        $trace[] = [
            'rule' => 'caption_quality',
            'severity' => $veryShortEmptyPost ? 'warning' : 'info',
            'passed' => true,
            'message' => $veryShortEmptyPost
                ? 'The caption is very short and may look incomplete.'
                : 'Caption quality looks acceptable.',
        ];
        if ($veryShortEmptyPost) {
            $warnings[] = 'Add a little more context so the post feels complete.';
        }

        $rewardEligible = $hasVideo && $videoDurationSeconds !== null && $videoDurationSeconds >= 30;
        $trace[] = [
            'rule' => 'reward_duration',
            'severity' => 'info',
            'passed' => true,
            'message' => $rewardEligible
                ? 'Video duration qualifies for the creator reward.'
                : 'Video duration does not yet qualify for the creator reward.',
            'meta' => ['duration_seconds' => $videoDurationSeconds],
        ];

        $passed = $violations === [];
        $score = max(0, 100 - (count($violations) * 35) - (count($warnings) * 10));

        if (! $passed) {
            $summary = 'This post cannot be published because it appears to break a severe safety rule.';
            $status = 'rejected';
        } elseif ($needsReview) {
            $summary = 'Post published, but it needs admin review before any reward can be paid.';
            $status = 'needs_review';
        } elseif ($warnings !== []) {
            $summary = 'Post published. A few quality warnings were saved for moderation review.';
            $status = 'warning';
        } else {
            $summary = 'Post published and passed content validation.';
            $status = 'approved';
        }

        return [
            'passed' => $passed,
            'status' => $status,
            'score' => $score,
            'summary' => $summary,
            'violations' => array_values(array_unique($violations)),
            'warnings' => array_values(array_unique($warnings)),
            'trace' => $trace,
        ];
    }
}
