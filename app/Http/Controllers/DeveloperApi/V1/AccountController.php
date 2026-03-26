<?php

namespace App\Http\Controllers\DeveloperApi\V1;

use App\Http\Controllers\Controller;
use App\Models\DeveloperApiKey;
use App\Services\DeveloperApiBillingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function __construct(private readonly DeveloperApiBillingService $billingService)
    {
    }

    public function me(Request $request): JsonResponse
    {
        /** @var DeveloperApiKey $apiKey */
        $apiKey = $request->attributes->get('developer_api_key');
        $wallet = $this->billingService->getOrCreateWallet($apiKey->user);

        return response()->json([
            'object' => 'developer_account',
            'key' => [
                'id' => $apiKey->id,
                'name' => $apiKey->name,
                'prefix' => $apiKey->key_prefix,
                'expires_at' => optional($apiKey->expires_at)->toIso8601String(),
                'allowed_model_ids' => $apiKey->allowed_model_ids ?? [],
                'last_used_at' => optional($apiKey->last_used_at)->toIso8601String(),
            ],
            'wallet' => [
                'balance_usd' => (float) $wallet->balance_usd,
                'lifetime_credited_usd' => (float) $wallet->lifetime_credited_usd,
                'lifetime_debited_usd' => (float) $wallet->lifetime_debited_usd,
            ],
            'limits' => [
                'default_max_tokens' => (int) config('developer-api.default_max_tokens'),
            ],
        ]);
    }

    public function usage(Request $request): JsonResponse
    {
        /** @var DeveloperApiKey $apiKey */
        $apiKey = $request->attributes->get('developer_api_key');
        $days = max(1, min(365, (int) $request->integer('days', 30)));

        return response()->json([
            'object' => 'usage_summary',
            'days' => $days,
            'summary' => $this->billingService->getUsageSummary($apiKey->user, $apiKey, $days),
        ]);
    }
}
