<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CountryCurrency
{
    private const BASE_CURRENCY = 'NGN';

    private const COUNTRY_CURRENCIES = [
        'nigeria' => 'NGN',
        'ng' => 'NGN',
        'ghana' => 'GHS',
        'gh' => 'GHS',
        'kenya' => 'KES',
        'ke' => 'KES',
        'southafrica' => 'ZAR',
        'za' => 'ZAR',
        'unitedkingdom' => 'GBP',
        'greatbritain' => 'GBP',
        'england' => 'GBP',
        'uk' => 'GBP',
        'gb' => 'GBP',
        'unitedstates' => 'USD',
        'unitedstatesofamerica' => 'USD',
        'usa' => 'USD',
        'us' => 'USD',
        'canada' => 'CAD',
        'ca' => 'CAD',
    ];

    private const FALLBACK_RATES_FROM_NGN = [
        'NGN' => 1.0,
        'GHS' => 0.0094,
        'KES' => 0.084,
        'ZAR' => 0.0118,
        'GBP' => 0.00052,
        'USD' => 0.00065,
        'CAD' => 0.00089,
    ];

    private const SYMBOLS = [
        'NGN' => '₦',
        'GHS' => 'GH₵',
        'KES' => 'KSh',
        'ZAR' => 'R',
        'GBP' => '£',
        'USD' => '$',
        'CAD' => 'CA$',
    ];

    public function forUser(?User $user): string
    {
        return $this->forCountry($user?->country);
    }

    public function forCountry(?string $country): string
    {
        $normalized = $this->normalizeCountry($country);

        if ($normalized === '' || $normalized === 'other') {
            return self::BASE_CURRENCY;
        }

        return self::COUNTRY_CURRENCIES[$normalized] ?? self::BASE_CURRENCY;
    }

    public function rateFromNgn(string $currency): float
    {
        $currency = $this->normalizeCurrency($currency);
        if ($currency === self::BASE_CURRENCY) {
            return 1.0;
        }

        $rates = $this->ratesFromNgn();
        $rate = (float) ($rates[$currency] ?? self::FALLBACK_RATES_FROM_NGN[$currency] ?? 0);

        return $rate > 0 ? $rate : 1.0;
    }

    public function convertFromNgn(float|int|string|null $amount, string $currency): float
    {
        $numeric = (float) ($amount ?? 0);

        return round($numeric * $this->rateFromNgn($currency), 2);
    }

    public function formatFromNgn(float|int|string|null $amount, string $currency): string
    {
        return $this->format($this->convertFromNgn($amount, $currency), $currency);
    }

    public function format(float|int|string|null $amount, string $currency = self::BASE_CURRENCY): string
    {
        $currency = $this->normalizeCurrency($currency);
        $numeric = (float) ($amount ?? 0);
        $decimals = fmod(abs($numeric), 1.0) === 0.0 ? 0 : 2;

        if (class_exists(\NumberFormatter::class)) {
            $formatter = new \NumberFormatter($this->localeForCurrency($currency), \NumberFormatter::CURRENCY);
            $formatter->setAttribute(\NumberFormatter::MIN_FRACTION_DIGITS, $decimals);
            $formatter->setAttribute(\NumberFormatter::MAX_FRACTION_DIGITS, $decimals);
            $formatted = $formatter->formatCurrency($numeric, $currency);

            if (is_string($formatted) && $formatted !== '') {
                return $formatted;
            }
        }

        $prefix = self::SYMBOLS[$currency] ?? ($currency . ' ');

        return $prefix . number_format($numeric, $decimals, '.', ',');
    }

    /**
     * @return array{base_currency: string, display_currency: string, currency: string, exchange_rate: float}
     */
    public function displayMetaForUser(?User $user): array
    {
        $displayCurrency = $this->forUser($user);

        return [
            'base_currency' => self::BASE_CURRENCY,
            'display_currency' => $displayCurrency,
            'currency' => $displayCurrency,
            'exchange_rate' => $this->rateFromNgn($displayCurrency),
        ];
    }

    /**
     * @return array<string, float>
     */
    private function ratesFromNgn(): array
    {
        $cacheHours = max(1, (int) config('services.currency.cache_hours', 6));

        return Cache::remember('country_currency:rates_from_ngn', now()->addHours($cacheHours), function (): array {
            $rates = self::FALLBACK_RATES_FROM_NGN;

            if (! (bool) config('services.currency.live_rates', true)) {
                return $rates;
            }

            try {
                $response = Http::acceptJson()
                    ->timeout((int) config('services.currency.timeout', 4))
                    ->get((string) config('services.currency.rates_url', 'https://open.er-api.com/v6/latest/NGN'));

                $payloadRates = $response->ok() ? $response->json('rates') : null;
                if (! is_array($payloadRates)) {
                    return $rates;
                }

                foreach (array_keys(self::FALLBACK_RATES_FROM_NGN) as $currency) {
                    $rate = (float) ($payloadRates[$currency] ?? 0);
                    if ($rate > 0) {
                        $rates[$currency] = $rate;
                    }
                }
            } catch (\Throwable $exception) {
                Log::info('Currency rates lookup failed; using fallback rates.', [
                    'error' => $exception->getMessage(),
                ]);
            }

            return $rates;
        });
    }

    private function normalizeCountry(?string $country): string
    {
        return (string) preg_replace('/[^a-z]/', '', strtolower(trim((string) $country)));
    }

    private function normalizeCurrency(?string $currency): string
    {
        $currency = strtoupper(trim((string) $currency));

        return $currency !== '' ? $currency : self::BASE_CURRENCY;
    }

    private function localeForCurrency(string $currency): string
    {
        return match ($currency) {
            'NGN' => 'en_NG',
            'GHS' => 'en_GH',
            'KES' => 'en_KE',
            'ZAR' => 'en_ZA',
            'GBP' => 'en_GB',
            'USD' => 'en_US',
            'CAD' => 'en_CA',
            default => 'en',
        };
    }
}
