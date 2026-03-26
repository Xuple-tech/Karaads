<?php

namespace App\Listeners;

use App\Models\LoginLog;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Attempting;

/**
 * LogAuthenticationEvents
 *
 * Listens to authentication events and logs them for security audit
 */
class LogAuthenticationEvents
{
    /**
     * Handle login event
     */
    public function handleLogin(Login $event)
    {
        LoginLog::logAttempt($event->user->email, 'success');
    }

    /**
     * Handle failed login event
     */
    public function handleFailed(Failed $event)
    {
        LoginLog::logAttempt(
            $event->credentials['email'] ?? 'unknown',
            'failed',
            'Invalid credentials'
        );

        // Check for suspicious activity
        if (LoginLog::checkSuspiciousActivity($event->credentials['email'] ?? 'unknown')) {
            \App\Models\SystemAlert::createAlert(
                'warning',
                'auth',
                'Multiple failed login attempts',
                'Multiple failed login attempts detected for: ' . ($event->credentials['email'] ?? 'unknown'),
                ['email' => $event->credentials['email'] ?? 'unknown']
            );
        }
    }

    /**
     * Register the listeners for the subscriber.
     */
    public function subscribe($events): array
    {
        return [
            Login::class => 'handleLogin',
            Failed::class => 'handleFailed',
        ];
    }
}
