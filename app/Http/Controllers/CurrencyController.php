<?php

namespace App\Http\Controllers;

use App\Services\CurrencyService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CurrencyController extends Controller
{
    public function __construct(private CurrencyService $currencyService)
    {
    }

    /**
     * Get exchange rate between two currencies
     */
    public function getExchangeRate(Request $request): JsonResponse
    {
        $from = strtoupper($request->query('from', 'USD'));
        $to = strtoupper($request->query('to', 'USD'));
        $forceRefresh = $request->query('refresh', false);

        if (!$this->currencyService->isSupportedCurrency($from)) {
            return response()->json(['error' => "Unsupported currency: {$from}"], 400);
        }

        if (!$this->currencyService->isSupportedCurrency($to)) {
            return response()->json(['error' => "Unsupported currency: {$to}"], 400);
        }

        $rate = $this->currencyService->getExchangeRate($from, $to, $forceRefresh);

        return response()->json([
            'from' => $from,
            'to' => $to,
            'rate' => $rate,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Convert price from one currency to another
     */
    public function convertPrice(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:0',
            'from' => 'required|string|size:3',
            'to' => 'required|string|size:3',
        ]);

        $from = strtoupper($request->input('from'));
        $to = strtoupper($request->input('to'));
        $amount = (float) $request->input('amount');

        if (!$this->currencyService->isSupportedCurrency($from)) {
            return response()->json(['error' => "Unsupported currency: {$from}"], 400);
        }

        if (!$this->currencyService->isSupportedCurrency($to)) {
            return response()->json(['error' => "Unsupported currency: {$to}"], 400);
        }

        $converted = $this->currencyService->convertPrice($amount, $from, $to);
        $rate = $this->currencyService->getExchangeRate($from, $to);
        $formatted = $this->currencyService->formatPrice($converted, $to);

        return response()->json([
            'original' => [
                'amount' => $amount,
                'currency' => $from,
                'formatted' => $this->currencyService->formatPrice($amount, $from),
            ],
            'converted' => [
                'amount' => $converted,
                'currency' => $to,
                'formatted' => $formatted,
            ],
            'exchange_rate' => $rate,
        ]);
    }

    /**
     * Get user's detected currency based on IP
     */
    public function detectUserCurrency(Request $request): JsonResponse
    {
        $ip = $this->getClientIP($request);
        $currency = $this->currencyService->detectCurrencyFromIP($ip);

        return response()->json([
            'ip_address' => $ip,
            'detected_currency' => $currency ?? 'USD',
            'user_agent' => $request->userAgent(),
        ]);
    }

    /**
     * Get user's preferred currency (requires auth)
     */
    public function getUserCurrency(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $ip = $this->getClientIP($request);
        $currency = $this->currencyService->getUserCurrency($user->id, $ip);

        return response()->json([
            'user_id' => $user->id,
            'preferred_currency' => $currency,
        ]);
    }

    /**
     * Set user's preferred currency (requires auth)
     */
    public function setUserCurrency(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'currency' => 'required|string|size:3',
            'auto_detect' => 'boolean',
        ]);

        $currency = strtoupper($request->input('currency'));

        if (!$this->currencyService->isSupportedCurrency($currency)) {
            return response()->json(['error' => "Unsupported currency: {$currency}"], 400);
        }

        $autoDetect = $request->boolean('auto_detect', false);
        $this->currencyService->setUserCurrency($user->id, $currency, $autoDetect);

        return response()->json([
            'success' => true,
            'preferred_currency' => $currency,
            'auto_detect' => $autoDetect,
        ]);
    }

    /**
     * Get subscription prices in user's currency
     */
    public function getSubscriptionPrices(Request $request): JsonResponse
    {
        $user = $request->user();
        $ip = $this->getClientIP($request);

        // Get subscription plan prices
        $usdPrices = [
            'basic_monthly' => 9.99,
            'basic_yearly' => 99.99,
            'pro_monthly' => 29.99,
            'pro_yearly' => 299.99,
            'enterprise_monthly' => 99.99,
            'enterprise_yearly' => 999.99,
        ];

        $prices = $this->currencyService->getSubscriptionPrices(
            $usdPrices,
            $user?->id,
            $ip
        );

        return response()->json($prices);
    }

    /**
     * Get all supported currencies
     */
    public function getSupportedCurrencies(): JsonResponse
    {
        return response()->json([
            'supported_currencies' => $this->currencyService->getSupportedCurrencies(),
        ]);
    }

    /**
     * Get client IP address
     */
    private function getClientIP(Request $request): string
    {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
        }

        return trim($ip);
    }
}
