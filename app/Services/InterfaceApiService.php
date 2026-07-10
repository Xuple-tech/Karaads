<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Str;
use Throwable;

class InterfaceApiService
{
    private const TOKEN_CACHE_KEY = 'interface_api_token';
    private const BANK_LIST_CACHE_KEY = 'interface_api_bank_list';
    private const DEFAULT_TOKEN_TTL_SECONDS = 3600;
    private const BANK_LIST_CACHE_TTL_SECONDS = 86400;

    public function getToken(): array
    {
        $this->assertConfigured();

        $cached = Cache::store('database')->get(self::TOKEN_CACHE_KEY);
        if (is_array($cached) && ! empty($cached['token'])) {
            return $cached;
        }

        $secretKey = $this->stringConfig('services.interface.secret_key');
        $secretPassword = $this->stringConfig('services.interface.secret_password');
        $accountNumber = $this->stringConfig('services.interface.account_number');
        $requestStartedAt = microtime(true);

        try {
            $response = $this->requestWithRetry(fn () => $this->client()
                ->post($this->endpoint('/interface/token'), [
                    'secret_key' => $secretKey,
                    'secret_password' => $secretPassword,
                    'account_number' => $accountNumber,
                ]), 'interface_api.get_token');
        } catch (Throwable $exception) {
            Log::warning('interface_api.get_token.request_failed', [
                'error' => $exception->getMessage(),
            ]);
            throw new \RuntimeException('Unable to fetch interface token.');
        }

        $this->logResponse('interface_api.get_token.response', $response, $requestStartedAt);

        if (! $response->successful()) {
            Log::warning('interface_api.get_token.http_failed', [
                'status' => $response->status(),
                'body' => $this->sanitizeResponseBody($response),
            ]);
            throw new \RuntimeException('Unable to fetch interface token.');
        }

        $payload = $response->json() ?? [];
        $token = (string) ($payload['token'] ?? '');
        $expiresIn = (int) ($payload['expires_in'] ?? self::DEFAULT_TOKEN_TTL_SECONDS);

        if ($token === '') {
            throw new \RuntimeException('Interface token response invalid.');
        }

        if ($expiresIn <= 0) {
            $expiresIn = self::DEFAULT_TOKEN_TTL_SECONDS;
        }

        $cacheSeconds = max(30, $expiresIn - 30);
        $cachedPayload = [
            'token' => $token,
            'expires_in' => $expiresIn,
            'account_number' => trim((string) ($payload['account_number'] ?? $accountNumber)),
        ];

        Cache::store('database')->put(self::TOKEN_CACHE_KEY, $cachedPayload, $cacheSeconds);

        return $cachedPayload;
    }

    public function bankList(): array
    {
        $cached = Cache::store('database')->get(self::BANK_LIST_CACHE_KEY);
        if (is_array($cached) && $cached !== []) {
            return $cached;
        }

        $headers = $this->authHeaders();
        $requestStartedAt = microtime(true);

        try {
            $response = $this->requestWithRetry(fn () => $this->client()
                ->withHeaders($headers)
                ->get($this->endpoint('/interface/banklist')), 'interface_api.bank_list');
        } catch (Throwable $exception) {
            Log::warning('interface_api.bank_list.request_failed', [
                'error' => $exception->getMessage(),
            ]);
            throw new \RuntimeException('Unable to fetch bank list.');
        }

        $this->logResponse('interface_api.bank_list.response', $response, $requestStartedAt);

        if (! $response->successful()) {
            Log::warning('interface_api.bank_list.http_failed', [
                'status' => $response->status(),
                'body' => $this->sanitizeResponseBody($response),
            ]);
            $this->throwIfInvalidSource($response);
            throw new \RuntimeException('Unable to fetch bank list.');
        }

        $payload = $response->json() ?? [];
        Cache::store('database')->put(self::BANK_LIST_CACHE_KEY, $payload, now()->addSeconds(self::BANK_LIST_CACHE_TTL_SECONDS));

        return $payload;
    }

    public function resolveAccountName(string $accountNumber, string $bankCode): array
    {
        $headers = $this->authHeaders();
        $requestStartedAt = microtime(true);

        try {
            $response = $this->requestWithRetry(fn () => $this->client()
                ->withHeaders($headers)
                ->post($this->endpoint('/interface/getBankAccountName'), [
                    'account_number' => $accountNumber,
                    'bank_code' => $bankCode,
                ]), 'interface_api.resolve_account_name');
        } catch (Throwable $exception) {
            Log::warning('interface_api.resolve_account_name.request_failed', [
                'error' => $exception->getMessage(),
                'account_number' => $this->maskAccountNumber($accountNumber),
                'bank_code' => $bankCode,
            ]);
            throw new \RuntimeException('Unable to resolve bank account name.');
        }

        $this->logResponse('interface_api.resolve_account_name.response', $response, $requestStartedAt);

        if (! $response->successful()) {
            Log::warning('interface_api.resolve_account_name.http_failed', [
                'status' => $response->status(),
                'account_number' => $this->maskAccountNumber($accountNumber),
                'bank_code' => $bankCode,
                'body' => $this->sanitizeResponseBody($response),
            ]);
            $this->throwIfInvalidSource($response);
            throw new \RuntimeException('Unable to resolve bank account name.');
        }

        $payload = $response->json() ?? [];
        return $payload;
    }

    public function bankTransfer(array $payload): array
    {
        $headers = $this->authHeaders();
        $requestStartedAt = microtime(true);

        try {
            $response = $this->requestWithRetry(
                fn () => $this->client()
                    ->withHeaders($headers)
                    ->post($this->endpoint('/interface/banktransfer'), $payload),
                'interface_api.bank_transfer',
                true
            );
        } catch (Throwable $exception) {
            Log::warning('interface_api.bank_transfer.request_failed', [
                'error' => $exception->getMessage(),
                'payload' => $this->redactSensitive($payload),
            ]);
            throw new \RuntimeException('Bank transfer request failed.');
        }

        $this->logResponse('interface_api.bank_transfer.response', $response, $requestStartedAt);

        if (! $response->successful()) {
            Log::warning('interface_api.bank_transfer.http_failed', [
                'status' => $response->status(),
                'payload' => $this->redactSensitive($payload),
                'body' => $this->sanitizeResponseBody($response),
            ]);
            $this->throwIfInvalidSource($response);
            if ($response->status() === 422) {
                $apiMessage = trim((string) data_get($response->json() ?? [], 'message', ''));
                if ($this->isProviderBalanceError($apiMessage)) {
                    throw new \RuntimeException('Service is unavailable. Please try again later.');
                }
                if ($apiMessage !== '' && $apiMessage !== null) {
                    throw new \InvalidArgumentException((string) $apiMessage);
                }
            }
            throw new \RuntimeException('Bank transfer request failed.');
        }

        $responsePayload = $response->json() ?? [];
        return $responsePayload;
    }

    private function isProviderBalanceError(string $message): bool
    {
        $normalized = strtolower($message);

        return $normalized !== ''
            && str_contains($normalized, 'balance')
            && (
                str_contains($normalized, 'insufficient')
                || str_contains($normalized, 'account balance')
            );
    }

    public function balance(): array
    {
        $headers = $this->authHeaders();
        $requestStartedAt = microtime(true);

        try {
            $response = $this->requestWithRetry(fn () => $this->client()
                ->withHeaders($headers)
                ->get($this->endpoint('/interface/balance')), 'interface_api.balance');
        } catch (Throwable $exception) {
            Log::warning('interface_api.balance.request_failed', [
                'error' => $exception->getMessage(),
            ]);
            throw new \RuntimeException('Unable to fetch interface balance.');
        }

        $this->logResponse('interface_api.balance.response', $response, $requestStartedAt);

        if (! $response->successful()) {
            Log::warning('interface_api.balance.http_failed', [
                'status' => $response->status(),
                'body' => $this->sanitizeResponseBody($response),
            ]);
            $this->throwIfInvalidSource($response);
            throw new \RuntimeException('Unable to fetch interface balance.');
        }

        $payload = $response->json() ?? [];
        return $payload;
    }

    public function tsq(string $reference): array
    {
        $headers = $this->authHeaders();
        $requestStartedAt = microtime(true);

        try {
            $response = $this->requestWithRetry(fn () => $this->client()
                ->withHeaders($headers)
                ->get($this->endpoint('/interface/tsq/' . $reference)), 'interface_api.tsq');
        } catch (Throwable $exception) {
            Log::warning('interface_api.tsq.request_failed', [
                'reference' => $reference,
                'error' => $exception->getMessage(),
            ]);
            throw new \RuntimeException('Unable to fetch transaction status.');
        }

        $this->logResponse('interface_api.tsq.response', $response, $requestStartedAt, [
            'reference' => $reference,
        ]);

        if (! $response->successful()) {
            Log::warning('interface_api.tsq.http_failed', [
                'reference' => $reference,
                'status' => $response->status(),
                'body' => $this->sanitizeResponseBody($response),
            ]);
            $this->throwIfInvalidSource($response);
            throw new \RuntimeException('Unable to fetch transaction status.');
        }

        $payload = $response->json() ?? [];
        return $payload;
    }

    public function buildTransferPayload(
        string $accountNumber,
        string $bankCode,
        float $amount,
        string $narration,
        ?string $reference = null,
        ?string $source = null,
    ): array {
        $reference = $reference ?: 'rw_' . Str::uuid();
        $sourceHeader = trim((string) ($source ?: $this->configuredSource()));
        $amountValue = $this->normalizeAmount($amount);
        $tokenData = $this->getToken();
        $fromNumber = trim((string) ($tokenData['account_number'] ?? $this->stringConfig('services.interface.account_number')));
        $token = trim((string) ($tokenData['token'] ?? ''));
        $prefixedNarration = trim($sourceHeader . ' ' . trim($narration));
        $bodySource = $sourceHeader;

        if ($fromNumber === '' || $token === '') {
            throw new \RuntimeException('Unable to build transfer hash context.');
        }

        // Provider format: HMAC-SHA256 of pipe-separated amount|refrence|fromNumber|accountNumber|bankCode using the token as key.
        $hashInput = implode('|', [
            (string) $amountValue,
            (string) $reference,
            (string) $fromNumber,
            (string) trim($accountNumber),
            (string) trim($bankCode),
        ]);
        $hash = hash_hmac('sha256', $hashInput, $token);

        $payload = [
            'account_number' => trim($accountNumber),
            'bank_code' => trim($bankCode),
            'amount' => is_numeric($amountValue) ? $amount + 0 : $amountValue,
            'bank_name' => null,
            'narration' => $prefixedNarration,
            'refrence' => $reference,
            'hash' => $hash,
            'sources' => $bodySource,
        ];

        return $payload;
    }

    private function authHeaders(): array
    {
        $token = $this->getToken();

        $headers = [
            'X-Interface-Token' => trim((string) ($token['token'] ?? '')),
            'X-Account-Number' => trim((string) ($token['account_number'] ?? $this->stringConfig('services.interface.account_number'))),
            'X-Source' => $this->configuredSource(),
        ];

        return $headers;
    }

    private function endpoint(string $path): string
    {
        $base = rtrim((string) config('services.interface.base_url'), '/');

        return $base . $path;
    }

    private function assertConfigured(): void
    {
        $required = [
            'services.interface.base_url',
            'services.interface.secret_key',
            'services.interface.secret_password',
            'services.interface.account_number',
            'services.interface.source',
        ];

        foreach ($required as $key) {
            if ($this->stringConfig($key) === '') {
                throw new \RuntimeException("Missing interface config: {$key}");
            }
        }
    }

    private function client(): PendingRequest
    {
        $verify = filter_var((string) config('services.interface.verify_ssl', true), FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE);
        $userAgent = (string) config('services.interface.user_agent', 'KaraadsInterfaceClient/1.0');
        $timeoutSeconds = max(1, (int) config('services.interface.timeout', 30));
        $connectTimeoutSeconds = max(1, (int) config('services.interface.connect_timeout', 8));

        return Http::acceptJson()
            ->withUserAgent($userAgent)
            ->timeout($timeoutSeconds)
            ->connectTimeout($connectTimeoutSeconds)
            ->withOptions([
                'verify' => $verify ?? true,
            ]);
    }

    private function requestWithRetry(callable $request, string $event, bool $allowRetry = true): Response
    {
        $attempts = $allowRetry ? max(1, (int) config('services.interface.retry_attempts', 3)) : 1;
        $baseDelayMs = max(0, (int) config('services.interface.retry_delay_ms', 300));
        $attempt = 0;
        $lastException = null;

        while ($attempt < $attempts) {
            $attempt++;

            try {
                $response = $request();

                if ($allowRetry && $attempt < $attempts && $this->shouldRetryResponse($response)) {
                    $this->logRetryAttempt($event, $attempt, $attempts, [
                        'status' => $response->status(),
                    ]);
                    $this->sleepForRetry($baseDelayMs, $attempt);
                    continue;
                }

                return $response;
            } catch (Throwable $exception) {
                $lastException = $exception;

                if ($attempt >= $attempts || ! $this->shouldRetryException($exception)) {
                    throw $exception;
                }

                $this->logRetryAttempt($event, $attempt, $attempts, [
                    'error' => $exception->getMessage(),
                ]);
                $this->sleepForRetry($baseDelayMs, $attempt);
            }
        }

        if ($lastException !== null) {
            throw $lastException;
        }

        throw new \RuntimeException('HTTP request failed after retries.');
    }

    private function shouldRetryResponse(Response $response): bool
    {
        return in_array($response->status(), [408, 429, 500, 502, 503, 504], true);
    }

    private function shouldRetryException(Throwable $exception): bool
    {
        if ($exception instanceof ConnectionException) {
            return true;
        }

        $message = strtolower($exception->getMessage());

        return str_contains($message, 'cURL error 7')
            || str_contains($message, 'cURL error 28')
            || str_contains($message, 'timed out')
            || str_contains($message, 'could not connect to server')
            || str_contains($message, 'failed to connect');
    }

    private function logRetryAttempt(string $event, int $attempt, int $maxAttempts, array $context = []): void
    {
        Log::warning($event . '.retrying', array_merge($context, [
            'attempt' => $attempt,
            'max_attempts' => $maxAttempts,
        ]));
    }

    private function sleepForRetry(int $baseDelayMs, int $attempt): void
    {
        if ($baseDelayMs <= 0) {
            return;
        }

        $delayMs = $baseDelayMs * $attempt;
        usleep($delayMs * 1000);
    }

    private function logResponse(string $event, Response $response, float $requestStartedAt, array $context = []): void
    {
        Log::info($event, array_merge($context, [
            'status' => $response->status(),
            'successful' => $response->successful(),
            'duration_ms' => (int) round((microtime(true) - $requestStartedAt) * 1000),
            'body' => $this->sanitizeResponseBody($response),
        ]));
    }

    private function sanitizeResponseBody(Response $response): mixed
    {
        $json = $response->json();
        if ($json !== null) {
            return $this->redactSensitive($json);
        }

        $rawBody = trim($response->body());

        return $rawBody !== '' ? ['raw' => $rawBody] : [];
    }

    private function redactSensitive(mixed $payload): mixed
    {
        if (! is_array($payload)) {
            return $payload;
        }

        $sensitiveKeys = ['token', 'secret', 'password', 'hash'];

        foreach ($payload as $key => $value) {
            $normalizedKey = strtolower((string) $key);

            if ($normalizedKey === 'account_number' || $normalizedKey === 'x-account-number') {
                $payload[$key] = $this->maskAccountNumber((string) $value);
                continue;
            }

            if ($normalizedKey === 'x-interface-token' || $normalizedKey === 'token') {
                $payload[$key] = $this->maskToken((string) $value);
                continue;
            }

            if (is_array($value)) {
                $payload[$key] = $this->redactSensitive($value);
                continue;
            }

            foreach ($sensitiveKeys as $sensitiveKey) {
                if (str_contains($normalizedKey, $sensitiveKey)) {
                    $payload[$key] = '[REDACTED]';
                    break;
                }
            }
        }

        return $payload;
    }

    private function maskAccountNumber(string $accountNumber): string
    {
        $accountNumber = trim($accountNumber);
        if ($accountNumber === '') {
            return '';
        }

        if (strlen($accountNumber) <= 4) {
            return str_repeat('*', strlen($accountNumber));
        }

        return str_repeat('*', strlen($accountNumber) - 4) . substr($accountNumber, -4);
    }

    private function maskToken(string $token): string
    {
        $token = trim($token);
        if ($token === '') {
            return '';
        }

        if (strlen($token) <= 10) {
            return str_repeat('*', strlen($token));
        }

        return substr($token, 0, 6) . str_repeat('*', strlen($token) - 10) . substr($token, -4);
    }

    private function throwIfInvalidSource(Response $response): void
    {
        if ($response->status() !== 403) {
            return;
        }

        $message = strtolower(trim((string) data_get($response->json() ?? [], 'message', '')));
        if (! str_contains($message, 'invalid source')) {
            return;
        }

        $source = $this->configuredSource();

        throw new \RuntimeException(
            "Interface rejected X-Source '{$source}'. Set INTERFACE_SOURCE to the exact provider-whitelisted value."
        );
    }

    private function configuredSource(): string
    {
        return $this->stringConfig('services.interface.source');
    }

    private function stringConfig(string $key): string
    {
        return trim((string) config($key, ''));
    }

    private function normalizeAmount(float $amount): string
    {
        $normalized = rtrim(rtrim(sprintf('%.8F', $amount), '0'), '.');

        return $normalized === '' ? '0' : $normalized;
    }
}
