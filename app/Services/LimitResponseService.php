<?php

namespace App\Services;

use App\Models\User;

class LimitResponseService
{
    /**
     * Limit types and their corresponding actions
     */
    private const LIMIT_ACTIONS = [
        'rate_limit_exceeded' => 'upgrade',
        'daily_limit_exceeded' => 'upgrade',
        'monthly_limit_exceeded' => 'upgrade',
        'image_limit_exceeded' => 'upgrade',
        'token_limit_exceeded' => 'upgrade',
        'voice_limit_exceeded' => 'upgrade',
        'email_limit_exceeded' => 'upgrade',
        'unauthenticated' => 'login',
        'subscription_required' => 'login',
        'no_plan' => 'login',
        'feature_unavailable' => 'upgrade',
    ];

    /**
     * User-friendly messages for limit types
     */
    private const LIMIT_MESSAGES = [
        'rate_limit_exceeded' => 'You\'ve exceeded your daily request limit.',
        'daily_limit_exceeded' => 'Daily limit reached.',
        'monthly_limit_exceeded' => 'Monthly limit reached.',
        'image_limit_exceeded' => 'Image generation limit reached.',
        'token_limit_exceeded' => 'Token usage limit exceeded.',
        'voice_limit_exceeded' => 'Voice message limit reached.',
        'email_limit_exceeded' => 'Email processing limit reached.',
        'unauthenticated' => 'Please sign in to continue.',
        'subscription_required' => 'This feature requires a subscription.',
        'no_plan' => 'Please subscribe to use this feature.',
        'feature_unavailable' => 'This feature is not available on your plan.',
    ];

    /**
     * Generate a structured limit response
     *
     * @param string $limitType The type of limit that was exceeded
     * @param array $metadata Additional metadata (limit, used, reset_at, plan_name, etc.)
     * @param ?User $user The user who hit the limit
     * @return array Structured response with message and action
     */
    public static function limitExceeded(string $limitType, array $metadata = [], ?User $user = null): array
    {
        $action = self::LIMIT_ACTIONS[$limitType] ?? 'upgrade';
        $message = self::LIMIT_MESSAGES[$limitType] ?? 'You\'ve reached your usage limit.';

        $response = [
            'success' => false,
            'error' => 'limit_exceeded',
            'type' => $limitType,
            'message' => $message,
            'action' => $action,
            'code' => self::getErrorCode($limitType),
        ];

        // Add metadata information
        if (!empty($metadata)) {
            // Add helpful context based on limit type
            if (isset($metadata['limit']) && isset($metadata['used'])) {
                $response['limit'] = $metadata['limit'];
                $response['used'] = $metadata['used'];
                $response['remaining'] = max(0, $metadata['limit'] - $metadata['used']);
            }

            if (isset($metadata['reset_at'])) {
                $response['reset_at'] = $metadata['reset_at'];
            }

            if (isset($metadata['reset_type'])) {
                $response['reset_type'] = $metadata['reset_type'];
            }

            if (isset($metadata['plan_name'])) {
                $response['plan_name'] = $metadata['plan_name'];
            }

            if (isset($metadata['plan_id'])) {
                $response['plan_id'] = $metadata['plan_id'];
            }

            // For needed value (e.g., how many images user wanted to generate)
            if (isset($metadata['needed'])) {
                $response['needed'] = $metadata['needed'];
            }
        }

        // Add upgrade information if action is upgrade
        if ($action === 'upgrade') {
            $response['upgrade_required'] = true;
            $response['action_label'] = 'Upgrade to Pro';
            $response['action_url'] = '/pricing'; // or route('pricing')
            $response['pricing_url'] = '/pricing'; // For frontend detection
            // NOTE: We do NOT add pricing link to the message for authenticated users
            // They can click the pricing button if they want to upgrade, but we don't force a dialog
        }

        // Add login information if action is login
        if ($action === 'login') {
            $response['login_required'] = true;
            $response['action_label'] = 'Sign In';
            $response['action_url'] = '/login'; // or route('login')
            $response['login_url'] = '/login'; // For frontend detection
            // Include message with login URL for AI responses
            $message .= "\n\n**Sign in to continue:** [Sign In](/login)";
            $response['message'] = $message;
        }

        return $response;
    }

    /**
     * Generate a response for unauthenticated users
     */
    public static function unauthenticated(): array
    {
        $message = 'Please sign in to continue.';
        // Include markdown link for frontend dialog detection
        $message .= "\n\n**Sign in to continue:** [Sign In](/gpllllogin)";

        return [
            'success' => false,
            'error' => 'unauthenticated',
            'message' => $message,
            'action' => 'login',
            'code' => 'UNAUTHENTICATED',
            'login_required' => true,
            'action_label' => 'Sign In',
            'action_url' => '/login',
            'login_url' => '/login', // For frontend detection
        ];
    }

    /**
     * Check if a limit check result indicates access is allowed
     */
    public static function isAllowed(array $limitCheckResult): bool
    {
        return $limitCheckResult['allowed'] ?? false;
    }

    /**
     * Convert a subscription service limit check to a structured response
     *
     * @param array $limitCheckResult Result from SubscriptionService::canMakeRequest(), canGenerateImages(), etc.
     * @param string $limitType The type of limit being checked
     * @return array|null Structured response or null if allowed
     */
    public static function fromSubscriptionCheck(array $limitCheckResult, string $limitType): ?array
    {
        if ($limitCheckResult['allowed'] ?? false) {
            return null; // Access allowed
        }

        $reason = $limitCheckResult['reason'] ?? 'Unknown limit exceeded';

        // Map subscription service reason to limit type if not provided
        $limitTypeMap = [
            'Daily request limit exceeded' => 'daily_limit_exceeded',
            'Monthly request limit exceeded' => 'monthly_limit_exceeded',
            'Daily image limit exceeded' => 'image_limit_exceeded',
            'Monthly image limit exceeded' => 'image_limit_exceeded',
            'Daily token limit exceeded' => 'token_limit_exceeded',
            'Monthly token limit exceeded' => 'token_limit_exceeded',
            'No plan found' => 'no_plan',
        ];

        $mappedType = $limitTypeMap[$reason] ?? $limitType;

        return self::limitExceeded($mappedType, $limitCheckResult);
    }

    /**
     * Get error code for a limit type
     */
    private static function getErrorCode(string $limitType): string
    {
        $codeMap = [
            'rate_limit_exceeded' => 'RATE_LIMIT_EXCEEDED',
            'daily_limit_exceeded' => 'DAILY_LIMIT_EXCEEDED',
            'monthly_limit_exceeded' => 'MONTHLY_LIMIT_EXCEEDED',
            'image_limit_exceeded' => 'IMAGE_LIMIT_EXCEEDED',
            'token_limit_exceeded' => 'TOKEN_LIMIT_EXCEEDED',
            'voice_limit_exceeded' => 'VOICE_LIMIT_EXCEEDED',
            'email_limit_exceeded' => 'EMAIL_LIMIT_EXCEEDED',
            'unauthenticated' => 'UNAUTHENTICATED',
            'subscription_required' => 'SUBSCRIPTION_REQUIRED',
            'no_plan' => 'NO_PLAN',
            'feature_unavailable' => 'FEATURE_UNAVAILABLE',
        ];

        return $codeMap[$limitType] ?? 'LIMIT_EXCEEDED';
    }

    /**
     * Format a limit response message with helpful context
     */
    public static function formatMessage(string $limitType, array $metadata = []): string
    {
        $baseMessage = self::LIMIT_MESSAGES[$limitType] ?? 'You\'ve reached your usage limit.';

        // Add specific context
        if (isset($metadata['limit']) && isset($metadata['used'])) {
            $remaining = max(0, $metadata['limit'] - $metadata['used']);
            $baseMessage .= " You\'ve used {$metadata['used']} of {$metadata['limit']} allowed.";
        }

        if (isset($metadata['reset_at'])) {
            $baseMessage .= " Your limit resets on " . \Carbon\Carbon::parse($metadata['reset_at'])->format('M d, Y');
        }

        if (isset($metadata['reset_type']) && $metadata['reset_type'] === 'daily') {
            $baseMessage .= " Your limit resets tomorrow.";
        }

        if (isset($metadata['plan_name'])) {
            $baseMessage .= " Upgrade to a higher plan for more access.";
        }

        return $baseMessage;
    }
}
