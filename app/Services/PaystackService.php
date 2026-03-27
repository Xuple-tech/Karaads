<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Str;

class PaystackService
{
    public function __construct(private readonly HttpFactory $http)
    {
    }

    public function isConfigured(): bool
    {
        return filled(config('services.paystack.secret_key'));
    }

    public function createDeveloperWalletTopupAuthorization(
        User $user,
        float $amountUsd,
        string $callbackUrl,
        string $cancelUrl,
        array $metadata = []
    ): string {
        if (! $this->isConfigured()) {
            throw new \RuntimeException('Paystack is not configured.');
        }

        $reference = 'kwati_topup_' . Str::lower(Str::random(24));

        try {
            $response = $this->http
                ->withToken((string) config('services.paystack.secret_key'))
                ->acceptJson()
                ->timeout((int) config('services.paystack.timeout', 60))
                ->connectTimeout((int) config('services.paystack.connect_timeout', 15))
                ->withOptions([
                    'verify' => (bool) config('services.paystack.verify_ssl', false),
                ])
                ->post(rtrim((string) config('services.paystack.base_url'), '/') . '/transaction/initialize', [
                    'email' => $user->email,
                    'amount' => (int) round($amountUsd * 100),
                    'currency' => (string) config('services.paystack.currency', 'USD'),
                    'reference' => $reference,
                    'callback_url' => $callbackUrl,
                    'metadata' => array_merge($metadata, [
                        'purpose' => 'developer_wallet_topup',
                        'user_id' => $user->id,
                        'amount_usd' => number_format($amountUsd, 2, '.', ''),
                        'cancel_url' => $cancelUrl,
                    ]),
                ])
                ->throw()
                ->json();
        } catch (ConnectionException $exception) {
            throw new \RuntimeException('Paystack checkout is currently unavailable.');
        } catch (RequestException $exception) {
            throw new \RuntimeException('Paystack checkout could not be initialized.');
        }

        $url = data_get($response, 'data.authorization_url');
        if (! is_string($url) || $url === '') {
            throw new \RuntimeException('Paystack checkout could not be initialized.');
        }

        return $url;
    }

    public function verifyTransaction(string $reference): array
    {
        if (! $this->isConfigured()) {
            throw new \RuntimeException('Paystack is not configured.');
        }

        try {
            return $this->http
                ->withToken((string) config('services.paystack.secret_key'))
                ->acceptJson()
                ->timeout((int) config('services.paystack.timeout', 60))
                ->connectTimeout((int) config('services.paystack.connect_timeout', 15))
                ->withOptions([
                    'verify' => (bool) config('services.paystack.verify_ssl', false),
                ])
                ->get(rtrim((string) config('services.paystack.base_url'), '/') . '/transaction/verify/' . urlencode($reference))
                ->throw()
                ->json();
        } catch (ConnectionException $exception) {
            throw new \RuntimeException('Paystack transaction verification is currently unavailable.');
        } catch (RequestException $exception) {
            throw new \RuntimeException('Paystack transaction verification failed.');
        }
    }

    public function hasValidSignature(string $payload, ?string $signature): bool
    {
        $secret = (string) config('services.paystack.secret_key');

        if ($secret === '' || ! $signature) {
            return false;
        }

        return hash_equals(hash_hmac('sha512', $payload, $secret), $signature);
    }
}
