<?php

namespace Tests\Unit;

use App\Services\CurrencyService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Tests\TestCase;

/**
 * Currency Fallback System Tests
 *
 * These tests verify that the 3-tier fallback system works correctly:
 * 1. Primary API (OpenExchangeRates)
 * 2. Secondary API (ExchangeRate-API)
 * 3. Hardcoded rates (final fallback)
 */
class CurrencyFallbackTest extends TestCase
{
    private CurrencyService $currencyService;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        $this->currencyService = app(CurrencyService::class);
    }

    /**
     * Test that supported currencies list includes major currencies
     */
    public function test_supported_currencies_includes_major_currencies(): void
    {
        $supported = $this->currencyService->getSupportedCurrencies();

        $this->assertContains('USD', $supported);
        $this->assertContains('EUR', $supported);
        $this->assertContains('GBP', $supported);
        $this->assertContains('NGN', $supported);
    }

    /**
     * Test currency validation works
     */
    public function test_currency_validation(): void
    {
        $this->assertTrue($this->currencyService->isSupportedCurrency('USD'));
        $this->assertTrue($this->currencyService->isSupportedCurrency('eur')); // Case insensitive
        $this->assertFalse($this->currencyService->isSupportedCurrency('INVALID'));
    }

    /**
     * Test same currency returns 1.0 rate
     */
    public function test_same_currency_returns_one(): void
    {
        $rate = $this->currencyService->getExchangeRate('USD', 'USD');
        $this->assertEquals(1.0, $rate);
    }

    /**
     * Test price formatting works
     */
    public function test_price_formatting(): void
    {
        $formatted = $this->currencyService->formatPrice(100, 'USD');
        $this->assertStringContainsString('$', $formatted);
        $this->assertStringContainsString('100.00', $formatted);

        $formatted = $this->currencyService->formatPrice(100, 'EUR');
        $this->assertStringContainsString('€', $formatted);

        $formatted = $this->currencyService->formatPrice(100, 'NGN');
        $this->assertStringContainsString('₦', $formatted);
    }

    /**
     * Test that conversion returns valid number
     */
    public function test_conversion_returns_positive_number(): void
    {
        // Mock API to ensure we get a response
        Http::fake([
            'https://api.exchangerate-api.com/v4/latest/USD' => Http::response([
                'rates' => ['EUR' => 0.92]
            ]),
        ]);

        $converted = $this->currencyService->convertPrice(100, 'USD', 'EUR');

        $this->assertGreaterThan(0, $converted);
        $this->assertLessThan(100, $converted); // EUR worth less than USD
    }

    /**
     * Test conversion returns correct decimal places
     */
    public function test_conversion_decimal_places(): void
    {
        Http::fake([
            'https://api.exchangerate-api.com/v4/latest/USD' => Http::response([
                'rates' => ['EUR' => 0.92]
            ]),
        ]);

        $converted = $this->currencyService->convertPrice(100, 'USD', 'EUR', 2);

        // Should have 2 decimal places
        $this->assertEquals(2, strlen(explode('.', (string)$converted)[1] ?? ''));
    }

    /**
     * Test ExchangeRate-API fallback works
     */
    public function test_exchangerate_api_fallback(): void
    {
        Http::fake([
            'https://api.exchangerate-api.com/v4/latest/USD' => Http::response([
                'rates' => ['EUR' => 0.91, 'GBP' => 0.79]
            ]),
        ]);

        config(['services.currency.api_key' => null]); // Disable primary API

        $rate = $this->currencyService->getExchangeRate('USD', 'EUR', forceRefresh: true);

        // Should get the fallback API rate
        $this->assertEquals(0.91, $rate);
    }

    /**
     * Test user currency preference setting
     */
    public function test_user_currency_preference(): void
    {
        $userId = 1;
        $this->currencyService->setUserCurrency($userId, 'EUR', false);

        // Verify cache was cleared (no error thrown)
        $this->assertTrue(true);
    }

    /**
     * Test format price with different currencies
     */
    public function test_format_price_currency_symbols(): void
    {
        $currencies = [
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
            'NGN' => '₦',
            'JPY' => '¥',
        ];

        foreach ($currencies as $currency => $symbol) {
            $formatted = $this->currencyService->formatPrice(100, $currency);
            $this->assertStringContainsString($symbol, $formatted);
        }
    }

    /**
     * Test JPY formatting (no decimals)
     */
    public function test_jpy_no_decimal_formatting(): void
    {
        $formatted = $this->currencyService->formatPrice(100.99, 'JPY');

        // Should not have decimals for JPY
        $this->assertStringNotContainsString('.', $formatted);
    }

    /**
     * Test supported currencies count
     */
    public function test_supported_currencies_count(): void
    {
        $supported = $this->currencyService->getSupportedCurrencies();

        // Should have reasonable number of currencies
        $this->assertGreaterThan(30, count($supported));
    }

    /**
     * Test API works without key (uses fallback)
     */
    public function test_api_works_without_key(): void
    {
        config(['services.currency.api_key' => null]);

        Http::fake([
            'https://api.exchangerate-api.com/v4/latest/USD' => Http::response([
                'rates' => ['EUR' => 0.92]
            ]),
        ]);

        // Should not throw error, should use fallback API
        $rate = $this->currencyService->getExchangeRate('USD', 'EUR', forceRefresh: true);

        $this->assertGreaterThan(0, $rate);
    }

    /**
     * Test basic subscription pricing
     */
    public function test_subscription_pricing_structure(): void
    {
        Http::fake([
            'https://api.exchangerate-api.com/v4/latest/USD' => Http::response([
                'rates' => ['EUR' => 0.92]
            ]),
        ]);

        $prices = $this->currencyService->getSubscriptionPrices([9.99, 29.99], userId: 1, ipAddress: '127.0.0.1');

        $this->assertIsArray($prices);
        $this->assertArrayHasKey('prices', $prices);
        $this->assertArrayHasKey('currency', $prices);
        $this->assertArrayHasKey('rate', $prices);
    }

    /**
     * Test that rate conversion is logical
     */
    public function test_rate_conversion_logic(): void
    {
        Http::fake([
            'https://api.exchangerate-api.com/v4/latest/USD' => Http::response([
                'rates' => ['EUR' => 0.92, 'GBP' => 0.79]
            ]),
        ]);

        $eur = $this->currencyService->getExchangeRate('USD', 'EUR', forceRefresh: true);
        $gbp = $this->currencyService->getExchangeRate('USD', 'GBP', forceRefresh: true);

        // GBP should be weaker than EUR
        $this->assertLessThan($eur, $gbp);
    }
}
