<?php

namespace App\Services\EmailProviders;

use App\Models\Email;
use Illuminate\Support\Collection;

interface EmailProviderInterface
{
    /**
     * Get authentication URL for OAuth providers
     */
    public function authenticate(): string;

    /**
     * Set access token after authentication
     */
    public function setAccessToken(array $token): void;

    /**
     * Refresh token if needed (for OAuth providers)
     */
    public function refreshTokenIfNeeded(): bool;

    /**
     * Fetch emails from inbox
     */
    public function fetchEmails(int $limit = 50, ?string $since = null): Collection;

    /**
     * Fetch a specific email by message ID
     */
    public function fetchEmail(string $messageId): ?Email;

    /**
     * Send an email
     */
    public function sendEmail(array $data): bool;
}
