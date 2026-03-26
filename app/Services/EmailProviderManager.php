<?php

namespace App\Services;

use App\Models\EmailAccount;
use App\Services\EmailProviders\EmailProviderInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class EmailProviderManager
{
    /**
     * Get the appropriate provider instance for an email account
     */
    public function getProvider(EmailAccount $account): EmailProviderInterface
    {
        return $account->getProviderInstance();
    }

    /**
     * Fetch emails from an account
     */
    public function fetchEmails(EmailAccount $account, int $limit = 50, ?string $since = null): Collection
    {
        try {
            $provider = $this->getProvider($account);
            $emails = $provider->fetchEmails($limit, $since);

            // Update last synced timestamp
            $account->update(['last_synced_at' => now()]);

            Log::info("Fetched {$emails->count()} emails from {$account->provider} account {$account->email_address}");

            return $emails;
        } catch (\Exception $e) {
            Log::error("Failed to fetch emails from {$account->provider} account {$account->email_address}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Send email using the account's provider
     */
    public function sendEmail(EmailAccount $account, array $data): bool
    {
        try {
            $provider = $this->getProvider($account);
            $result = $provider->sendEmail($data);

            Log::info("Sent email from {$account->provider} account {$account->email_address} to {$data['to']}");

            return $result;
        } catch (\Exception $e) {
            Log::error("Failed to send email from {$account->provider} account {$account->email_address}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Sync all active email accounts
     */
    public function syncAllAccounts(): void
    {
        $accounts = EmailAccount::where('is_active', true)->get();

        foreach ($accounts as $account) {
            try {
                $this->fetchEmails($account);
            } catch (\Exception $e) {
                Log::error("Failed to sync account {$account->email_address}: " . $e->getMessage());
                // Continue with other accounts
            }
        }
    }

    /**
     * Sync emails for a specific account with optional limit and since parameters
     */
    public function syncEmails(EmailAccount $account, int $limit = 50, ?string $since = null): Collection
    {
        return $this->fetchEmails($account, $limit, $since);
    }

    /**
     * Get authentication URL for an account
     */
    public function getAuthUrl(EmailAccount $account): string
    {
        $provider = $this->getProvider($account);
        return $provider->authenticate();
    }

    /**
     * Handle OAuth callback and store tokens
     */
    public function handleOAuthCallback(EmailAccount $account, string $code): void
    {
        $provider = $this->getProvider($account);

        // Exchange code for tokens
        $tokens = $this->exchangeCodeForTokens($account->provider, $code);

        $provider->setAccessToken($tokens);
    }

    private function exchangeCodeForTokens(string $provider, string $code): array
    {
        switch ($provider) {
            case 'gmail':
                return $this->exchangeGmailCode($code);
            case 'outlook':
                return $this->exchangeOutlookCode($code);
            default:
                throw new \InvalidArgumentException("Unsupported provider: {$provider}");
        }
    }

    private function exchangeGmailCode(string $code): array
    {
        $client = new \Google\Client();
        $client->setClientId(config('services.google.client_id'));
        $client->setClientSecret(config('services.google.client_secret'));
        $client->setRedirectUri(config('services.google.redirect_uri'));

        $token = $client->fetchAccessTokenWithAuthCode($code);

        if (isset($token['error'])) {
            throw new \Exception('Gmail OAuth error: ' . $token['error']);
        }

        return $token;
    }

    private function exchangeOutlookCode(string $code): array
    {
        $client = new \GuzzleHttp\Client();

        $response = $client->post('https://login.microsoftonline.com/common/oauth2/v2.0/token', [
            'form_params' => [
                'client_id' => config('services.microsoft.client_id'),
                'client_secret' => config('services.microsoft.client_secret'),
                'code' => $code,
                'grant_type' => 'authorization_code',
                'redirect_uri' => config('services.microsoft.redirect_uri'),
            ],
        ]);

        $data = json_decode($response->getBody(), true);

        return [
            'access_token' => $data['access_token'],
            'refresh_token' => $data['refresh_token'],
            'expires_at' => date('Y-m-d H:i:s', time() + $data['expires_in']),
            'token_type' => $data['token_type'],
        ];
    }
}
