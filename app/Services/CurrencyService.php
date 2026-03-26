<?php

namespace App\Services;

use App\Models\CurrencyRate;
use App\Models\UserCurrencyPreference;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CurrencyService
{
    private const CACHE_DURATION = 3600; // 1 hour
    private const API_TIMEOUT = 10;
    private const SUPPORTED_CURRENCIES = [
        'USD', 'EUR', 'GBP', 'JPY', 'INR', 'NGN', 'CHF', 'CAD', 'AUD', 'NZD',
        'CNY', 'SEK', 'NOR', 'DKK', 'MXN', 'BRL', 'RUB', 'HKD', 'SGD', 'KRW',
        'MYR', 'PHP', 'THB', 'IDR', 'VND', 'PKR', 'BDT', 'LKR', 'ZAR', 'EGP',
        'KES', 'GHS', 'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'ILS',
        'TRY', 'UAH', 'HUF', 'CZK', 'PLN', 'RON', 'BGN', 'HRK', 'RSD', 'ISK',
        'BGN', 'ARS', 'CLP', 'COP', 'PEN', 'UYU', 'TWD', 'THB'
    ];

    // Hardcoded fallback rates (last known good rates from Jan 2025)
    // These are used if all APIs fail
    private const FALLBACK_RATES = [
        'USD' => 1.0,
        'EUR' => 0.92,
        'GBP' => 0.79,
        'JPY' => 149.50,
        'INR' => 83.45,
        'NGN' => 1640.0,
        'CHF' => 0.88,
        'CAD' => 1.40,
        'AUD' => 1.55,
        'NZD' => 1.72,
        'CNY' => 7.28,
        'SEK' => 10.95,
        'DKK' => 6.85,
        'MXN' => 17.05,
        'BRL' => 5.12,
        'RUB' => 99.50,
        'HKD' => 7.78,
        'SGD' => 1.32,
        'KRW' => 1310.0,
        'ZAR' => 18.60,
        'AED' => 3.67,
        'SAR' => 3.75,
        'BHD' => 0.377,
        'TRY' => 35.50,
        'HUF' => 383.0,
        'CZK' => 24.50,
        'PLN' => 4.08,
        'RON' => 4.97,
        'HRK' => 6.85,
    ];

    /**
     * Get exchange rate from one currency to another
     */
    public function getExchangeRate(string $from, string $to, bool $forceRefresh = false): float
    {
        // If same currency, return 1
        if ($from === $to) {
            return 1.0;
        }

        $cacheKey = "currency_rate:{$from}:{$to}";

        // Check cache first
        if (!$forceRefresh) {
            $cached = Cache::get($cacheKey);
            if ($cached !== null) {
                return (float) $cached;
            }
        }

        // Check database
        $dbRate = CurrencyRate::where('base_currency', $from)
            ->where('target_currency', $to)
            ->where('expires_at', '>', now())
            ->first();

        if ($dbRate) {
            Cache::put($cacheKey, $dbRate->rate, self::CACHE_DURATION);
            return (float) $dbRate->rate;
        }

        // Fetch from API
        try {
            $rate = $this->fetchRateFromAPI($from, $to);

            // Store in database
            CurrencyRate::updateOrCreate(
                [
                    'base_currency' => $from,
                    'target_currency' => $to,
                ],
                [
                    'rate' => $rate,
                    'rate_timestamp' => now(),
                    'expires_at' => now()->addHours(24),
                ]
            );

            // Cache the result
            Cache::put($cacheKey, $rate, self::CACHE_DURATION);

            return (float) $rate;
        } catch (\Exception $e) {
            Log::error("Failed to fetch exchange rate {$from} to {$to}: {$e->getMessage()}");

            // Return stored rate if available (even if expired)
            $lastRate = CurrencyRate::where('base_currency', $from)
                ->where('target_currency', $to)
                ->latest('rate_timestamp')
                ->first();

            if ($lastRate) {
                return (float) $lastRate->rate;
            }

            // Fallback to 1.0
            return 1.0;
        }
    }

    /**
     * Fetch rate from Open Exchange Rates API with fallbacks
     *
     * Tries multiple sources in order:
     * 1. OpenExchangeRates (primary)
     * 2. ExchangeRate-API (free tier fallback)
     * 3. Hardcoded rates (final fallback)
     */
    private function fetchRateFromAPI(string $from, string $to): float
    {
        // Try primary API first
        $rate = $this->tryOpenExchangeRatesAPI($from, $to);
        if ($rate !== null) {
            Log::info("Exchange rate {$from}/{$to} fetched from OpenExchangeRates");
            return $rate;
        }

        // Try fallback API
        $rate = $this->tryExchangeRateAPI($from, $to);
        if ($rate !== null) {
            Log::info("Exchange rate {$from}/{$to} fetched from ExchangeRate-API (fallback)");
            return $rate;
        }

        // Use hardcoded rates as final fallback
        $rate = $this->getHardcodedRate($from, $to);
        Log::warning("Exchange rate {$from}/{$to} using hardcoded fallback: {$rate}");
        return $rate;
    }

    /**
     * Try OpenExchangeRates API
     */
    private function tryOpenExchangeRatesAPI(string $from, string $to): ?float
    {
        try {
            $apiKey = config('services.currency.api_key');

            if (!$apiKey) {
                Log::debug('OpenExchangeRates API key not configured, skipping primary API');
                return null;
            }

            $response = Http::timeout(self::API_TIMEOUT)
                ->get('https://openexchangerates.org/api/latest.json', [
                    'app_id' => $apiKey,
                    'base' => $from,
                    'symbols' => $to,
                ]);

            if (!$response->successful()) {
                Log::warning("OpenExchangeRates API returned status {$response->status()}");
                return null;
            }

            $data = $response->json();

            if (!isset($data['rates'][$to])) {
                Log::warning("Rate for {$to} not found in OpenExchangeRates response");
                return null;
            }

            return (float) $data['rates'][$to];
        } catch (\Exception $e) {
            Log::warning("OpenExchangeRates API error: {$e->getMessage()}");
            return null;
        }
    }

    /**
     * Try ExchangeRate-API (free tier, no key required)
     * Limit: 1500 requests/month, but perfect as fallback
     */
    private function tryExchangeRateAPI(string $from, string $to): ?float
    {
        try {
            $response = Http::timeout(self::API_TIMEOUT)
                ->get("https://api.exchangerate-api.com/v4/latest/{$from}");

            if (!$response->successful()) {
                Log::warning("ExchangeRate-API returned status {$response->status()}");
                return null;
            }

            $data = $response->json();

            if (!isset($data['rates'][$to])) {
                Log::warning("Rate for {$to} not found in ExchangeRate-API response");
                return null;
            }

            return (float) $data['rates'][$to];
        } catch (\Exception $e) {
            Log::warning("ExchangeRate-API error: {$e->getMessage()}");
            return null;
        }
    }

    /**
     * Get hardcoded fallback rate
     * Uses the last known good rates as the final safety net
     */
    private function getHardcodedRate(string $from, string $to): float
    {
        if ($from === 'USD' && isset(self::FALLBACK_RATES[$to])) {
            return self::FALLBACK_RATES[$to];
        }

        if ($to === 'USD' && isset(self::FALLBACK_RATES[$from])) {
            return 1.0 / self::FALLBACK_RATES[$from];
        }

        // Cross-rate calculation
        if (isset(self::FALLBACK_RATES[$from]) && isset(self::FALLBACK_RATES[$to])) {
            return self::FALLBACK_RATES[$to] / self::FALLBACK_RATES[$from];
        }

        Log::error("No fallback rate available for {$from}/{$to}");
        return 1.0; // Default to no conversion if all else fails
    }

    /**
     * Convert price from one currency to another
     */
    public function convertPrice(float $amount, string $from, string $to, int $decimals = 2): float
    {
        if ($from === $to) {
            return round($amount, $decimals);
        }

        $rate = $this->getExchangeRate($from, $to);
        return round($amount * $rate, $decimals);
    }

    /**
     * Get formatted price with symbol
     */
    public function formatPrice(float $amount, string $currency = 'USD'): string
    {
        $symbols = [
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
            'JPY' => '¥',
            'INR' => '₹',
            'NGN' => '₦',
            'CHF' => 'CHF',
            'CAD' => 'C$',
            'AUD' => 'A$',
            'NZD' => 'NZ$',
            'CNY' => '¥',
            'SEK' => 'kr',
            'KRW' => '₩',
            'AED' => 'د.إ',
            'SAR' => '﷼',
            'BRL' => 'R$',
            'MXN' => '$',
            'RUB' => '₽',
            'HKD' => 'HK$',
            'SGD' => 'S$',
            'ZAR' => 'R',
        ];

        $symbol = $symbols[$currency] ?? $currency;

        // Format based on currency conventions
        if (in_array($currency, ['JPY', 'KRW'])) {
            return $symbol . number_format($amount, 0);
        }

        return $symbol . number_format($amount, 2);
    }

    /**
     * Get user's preferred currency
     */
    public function getUserCurrency(int $userId, ?string $ipAddress = null): string
    {
        // Check user preference
        $preference = UserCurrencyPreference::find($userId);

        if ($preference && !$preference->auto_detect) {
            return $preference->preferred_currency;
        }

        // Auto-detect from IP if preference allows it
        if ($ipAddress) {
            $currency = $this->detectCurrencyFromIP($ipAddress);
            if ($currency) {
                return $currency;
            }
        }

        // Default to USD
        return 'USD';
    }

    /**
     * Detect currency from IP address
     */
    public function detectCurrencyFromIP(string $ipAddress): ?string
    {
        try {
            // Use GeoIP to get country
            $geoIp = geoip($ipAddress);

            if (!$geoIp || !isset($geoIp['iso_code'])) {
                return null;
            }

            $countryCode = $geoIp['iso_code'];

            // Map country code to currency
            $currencyMap = [
                'US' => 'USD',
                'GB' => 'GBP',
                'EU' => 'EUR',
                'DE' => 'EUR',
                'FR' => 'EUR',
                'IT' => 'EUR',
                'ES' => 'EUR',
                'JP' => 'JPY',
                'CN' => 'CNY',
                'IN' => 'INR',
                'NG' => 'NGN',
                'CH' => 'CHF',
                'CA' => 'CAD',
                'AU' => 'AUD',
                'NZ' => 'NZD',
                'BR' => 'BRL',
                'MX' => 'MXN',
                'ZA' => 'ZAR',
                'AE' => 'AED',
                'SA' => 'SAR',
                'KR' => 'KRW',
                'SG' => 'SGD',
                'HK' => 'HKD',
                'TH' => 'THB',
                'PH' => 'PHP',
                'MY' => 'MYR',
                'ID' => 'IDR',
                'VN' => 'VND',
                'TR' => 'TRY',
                'RU' => 'RUB',
                'UA' => 'UAH',
                'SE' => 'SEK',
                'NO' => 'NOK',
                'DK' => 'DKK',
                'PL' => 'PLN',
                'CZ' => 'CZK',
            ];

            return $currencyMap[$countryCode] ?? 'USD';
        } catch (\Exception $e) {
            Log::warning("Failed to detect currency from IP {$ipAddress}: {$e->getMessage()}");
            return null;
        }
    }

    /**
     * Get all supported currencies
     */
    public function getSupportedCurrencies(): array
    {
        return self::SUPPORTED_CURRENCIES;
    }

    /**
     * Check if currency is supported
     */
    public function isSupportedCurrency(string $currency): bool
    {
        return in_array(strtoupper($currency), self::SUPPORTED_CURRENCIES);
    }

    /**
     * Update user currency preference
     */
    public function setUserCurrency(int $userId, string $currency, bool $autoDetect = false): void
    {
        UserCurrencyPreference::updateOrCreate(
            ['user_id' => $userId],
            [
                'preferred_currency' => strtoupper($currency),
                'auto_detect' => $autoDetect,
            ]
        );

        // Clear cache
        Cache::forget("user_currency:{$userId}");
    }

    /**
     * Get price in user's currency
     */
    public function getPriceInUserCurrency(float $amountInUSD, int $userId, ?string $ipAddress = null): array
    {
        $userCurrency = $this->getUserCurrency($userId, $ipAddress);
        $convertedAmount = $this->convertPrice($amountInUSD, 'USD', $userCurrency);

        return [
            'original_amount' => $amountInUSD,
            'original_currency' => 'USD',
            'converted_amount' => $convertedAmount,
            'converted_currency' => $userCurrency,
            'formatted' => $this->formatPrice($convertedAmount, $userCurrency),
            'exchange_rate' => $this->getExchangeRate('USD', $userCurrency),
        ];
    }

    /**
     * Get bulk conversion for subscription prices
     */
    public function getSubscriptionPrices(array $usdPrices, ?int $userId = null, ?string $ipAddress = null): array
    {
        $userCurrency = $userId
            ? $this->getUserCurrency($userId, $ipAddress)
            : $this->detectCurrencyFromIP($ipAddress) ?? 'USD';

        $converted = [];
        foreach ($usdPrices as $key => $price) {
            $converted[$key] = [
                'usd' => $price,
                'currency' => $userCurrency,
                'amount' => $this->convertPrice($price, 'USD', $userCurrency),
                'formatted' => $this->formatPrice($this->convertPrice($price, 'USD', $userCurrency), $userCurrency),
            ];
        }

        return [
            'prices' => $converted,
            'currency' => $userCurrency,
            'rate' => $this->getExchangeRate('USD', $userCurrency),
        ];
    }

    /**
     * Refresh all currency rates
     */
    public function refreshAllRates(): int
    {
        $refreshed = 0;

        foreach (self::SUPPORTED_CURRENCIES as $currency) {
            if ($currency === 'USD') {
                continue;
            }

            try {
                $this->getExchangeRate('USD', $currency, forceRefresh: true);
                $refreshed++;
            } catch (\Exception $e) {
                Log::error("Failed to refresh rate for {$currency}: {$e->getMessage()}");
            }
        }

        return $refreshed;
    }
}
