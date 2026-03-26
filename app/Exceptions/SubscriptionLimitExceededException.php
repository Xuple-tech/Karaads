<?php

namespace App\Exceptions;

use Exception;

/**
 * Exception thrown when a user exceeds their subscription limits
 */
class SubscriptionLimitExceededException extends Exception
{
    protected $limitType;
    protected $details;

    public function __construct(
        string $message = 'Subscription limit exceeded',
        string $limitType = 'unknown',
        array $details = [],
        int $code = 0,
        Exception $previous = null
    ) {
        parent::__construct($message, $code, $previous);
        $this->limitType = $limitType;
        $this->details = $details;
    }

    /**
     * Get the type of limit that was exceeded
     */
    public function getLimitType(): string
    {
        return $this->limitType;
    }

    /**
     * Get additional details about the limit
     */
    public function getDetails(): array
    {
        return $this->details;
    }

    /**
     * Render the exception to a JSON response
     */
    public function render()
    {
        return response()->json([
            'success' => false,
            'message' => $this->message,
            'error_type' => 'subscription_limit_exceeded',
            'limit_type' => $this->limitType,
            'details' => $this->details,
        ], 403);
    }
}
