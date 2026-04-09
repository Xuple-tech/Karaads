<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Log;
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

    public function getCheckoutCurrency(): string
    {
        return strtoupper((string) config('services.paystack.settlement_currency', 'NGN'));
    }

    public function getUsdExchangeRate(): float
    {
        return max(0.000001, (float) config('services.paystack.usd_to_ngn_rate', 1460));
    }

    public function convertUsdToCheckoutAmount(float $amountUsd): float
    {
        $currency = $this->getCheckoutCurrency();

        return $currency === 'NGN'
            ? round($amountUsd * $this->getUsdExchangeRate(), 2)
            : round($amountUsd, 2);
    }

    public function convertUsdToCheckoutMinorAmount(float $amountUsd): int
    {
        return (int) round($this->convertUsdToCheckoutAmount($amountUsd) * 100);
    }

    public function convertCheckoutMinorAmountToUsd(float $amountMinor, ?string $currency = null, ?float $exchangeRate = null): float
    {
        $resolvedCurrency = strtoupper((string) ($currency ?: $this->getCheckoutCurrency()));
        $majorAmount = $amountMinor / 100;

        if ($resolvedCurrency === 'NGN') {
            $rate = max(0.000001, (float) ($exchangeRate ?: $this->getUsdExchangeRate()));

            return round($majorAmount / $rate, 2);
        }

        return round($majorAmount, 2);
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
        $currency = $this->getCheckoutCurrency();
        $exchangeRate = $this->getUsdExchangeRate();
        $checkoutAmount = $this->convertUsdToCheckoutAmount($amountUsd);
        $checkoutAmountMinor = $this->convertUsdToCheckoutMinorAmount($amountUsd);

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
                    'amount' => $checkoutAmountMinor,
                    'currency' => $currency,
                    'reference' => $reference,
                    'callback_url' => $callbackUrl,
                    'metadata' => array_merge($metadata, [
                        'purpose' => 'developer_wallet_topup',
                        'user_id' => $user->id,
                        'amount_usd' => number_format($amountUsd, 2, '.', ''),
                        'checkout_currency' => $currency,
                        'checkout_exchange_rate' => number_format($exchangeRate, 4, '.', ''),
                        'checkout_amount' => number_format($checkoutAmount, 2, '.', ''),
                        'checkout_amount_minor' => $checkoutAmountMinor,
                        'cancel_url' => $cancelUrl,
                    ]),
                ])
                ->throw()
                ->json();
        } catch (ConnectionException $exception) {
            Log::error('Paystack checkout initialization connection failure.', [
                'user_id' => $user->id,
                'email' => $user->email,
                'reference' => $reference,
                'amount_usd' => round($amountUsd, 2),
                'checkout_currency' => $currency,
                'checkout_amount_minor' => $checkoutAmountMinor,
                'message' => $exception->getMessage(),
            ]);

            throw new \RuntimeException('Paystack checkout is currently unavailable.');
        } catch (RequestException $exception) {
            Log::error('Paystack checkout initialization failed.', [
                'user_id' => $user->id,
                'email' => $user->email,
                'reference' => $reference,
                'amount_usd' => round($amountUsd, 2),
                'checkout_currency' => $currency,
                'checkout_amount_minor' => $checkoutAmountMinor,
                'status' => $exception->response?->status(),
                'body' => $exception->response?->json() ?? $exception->response?->body(),
            ]);

            throw new \RuntimeException('Paystack checkout could not be initialized. Please try again or use another payment method.');
        }

        $url = data_get($response, 'data.authorization_url');
        if (! is_string($url) || $url === '') {
            Log::error('Paystack checkout initialization returned no authorization URL.', [
                'user_id' => $user->id,
                'email' => $user->email,
                'reference' => $reference,
                'amount_usd' => round($amountUsd, 2),
                'checkout_currency' => $currency,
                'checkout_amount_minor' => $checkoutAmountMinor,
                'response' => $response,
            ]);

            throw new \RuntimeException('Paystack checkout could not be initialized.');
        }

        return $url;
    }

    public function createSubscriptionCheckoutAuthorization(
        User $user,
        float $amountUsd,
        string $callbackUrl,
        string $cancelUrl,
        array $metadata = []
    ): string {
        if (! $this->isConfigured()) {
            throw new \RuntimeException('Paystack is not configured.');
        }

        $reference = 'kwati_sub_' . Str::lower(Str::random(24));
        $currency = $this->getCheckoutCurrency();
        $exchangeRate = $this->getUsdExchangeRate();
        $checkoutAmount = $this->convertUsdToCheckoutAmount($amountUsd);
        $checkoutAmountMinor = $this->convertUsdToCheckoutMinorAmount($amountUsd);

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
                    'amount' => $checkoutAmountMinor,
                    'currency' => $currency,
                    'reference' => $reference,
                    'callback_url' => $callbackUrl,
                    'metadata' => array_merge($metadata, [
                        'purpose' => 'subscription_checkout',
                        'user_id' => $user->id,
                        'amount_usd' => number_format($amountUsd, 2, '.', ''),
                        'checkout_currency' => $currency,
                        'checkout_exchange_rate' => number_format($exchangeRate, 4, '.', ''),
                        'checkout_amount' => number_format($checkoutAmount, 2, '.', ''),
                        'checkout_amount_minor' => $checkoutAmountMinor,
                        'cancel_url' => $cancelUrl,
                    ]),
                ])
                ->throw()
                ->json();
        } catch (ConnectionException $exception) {
            Log::error('Paystack subscription checkout initialization connection failure.', [
                'user_id' => $user->id,
                'reference' => $reference,
                'amount_usd' => round($amountUsd, 2),
                'message' => $exception->getMessage(),
            ]);

            throw new \RuntimeException('Paystack checkout is currently unavailable.');
        } catch (RequestException $exception) {
            Log::error('Paystack subscription checkout initialization failed.', [
                'user_id' => $user->id,
                'reference' => $reference,
                'amount_usd' => round($amountUsd, 2),
                'status' => $exception->response?->status(),
                'body' => $exception->response?->json() ?? $exception->response?->body(),
            ]);

            throw new \RuntimeException('Paystack checkout could not be initialized. Please try again or use another payment method.');
        }

        $url = data_get($response, 'data.authorization_url');
        if (! is_string($url) || $url === '') {
            Log::error('Paystack subscription checkout returned no authorization URL.', [
                'user_id' => $user->id,
                'reference' => $reference,
                'amount_usd' => round($amountUsd, 2),
                'response' => $response,
            ]);

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
            Log::error('Paystack transaction verification connection failure.', [
                'reference' => $reference,
                'message' => $exception->getMessage(),
            ]);

            throw new \RuntimeException('Paystack transaction verification is currently unavailable.');
        } catch (RequestException $exception) {
            Log::error('Paystack transaction verification failed.', [
                'reference' => $reference,
                'status' => $exception->response?->status(),
                'body' => $exception->response?->json() ?? $exception->response?->body(),
            ]);

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
