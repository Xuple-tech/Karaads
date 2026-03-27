<?php

namespace App\Http\Controllers\Console;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends ConsoleBaseController
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $filters = $this->filters($request);
        $ledgerQuery = $this->billingService->buildLedgerQuery($filters, $user);

        return Inertia::render('User/DeveloperApi/Index', array_merge(
            $this->sharedProps($request, 'billing'),
            [
                'ledger' => $ledgerQuery->latest()->paginate(15)->withQueryString()->through(function ($entry) {
                    return [
                        'id' => $entry->id,
                        'type' => $entry->type,
                        'amount_usd' => round((float) $entry->amount_usd, 6),
                        'balance_before_usd' => round((float) $entry->balance_before_usd, 6),
                        'balance_after_usd' => round((float) $entry->balance_after_usd, 6),
                        'description' => $entry->description,
                        'external_reference' => $entry->external_reference,
                        'created_at' => optional($entry->created_at)->toIso8601String(),
                        'api_key' => $entry->apiKey ? [
                            'id' => $entry->apiKey->id,
                            'name' => $entry->apiKey->name,
                            'key_prefix' => $entry->apiKey->key_prefix,
                        ] : null,
                    ];
                }),
                'breakdowns' => [
                    'per_model' => [],
                    'per_key' => [],
                    'statuses' => [],
                    'ledger' => $this->billingService->getLedgerBreakdown(clone $ledgerQuery),
                    'trend' => [],
                ],
                'topupConfig' => [
                    'default_amount_usd' => (float) config('developer-api.default_topup_amount_usd'),
                    'min_amount_usd' => (float) config('developer-api.min_topup_amount_usd'),
                    'max_amount_usd' => (float) config('developer-api.max_topup_amount_usd'),
                    'providers' => config('developer-api.topup_providers', ['paystack', 'stripe']),
                    'default_provider' => (string) config('developer-api.default_topup_provider', 'paystack'),
                ],
            ]
        ));
    }

    public function topup(Request $request)
    {
        $validated = $request->validate([
            'amount_usd' => 'required|numeric|min:' . config('developer-api.min_topup_amount_usd') . '|max:' . config('developer-api.max_topup_amount_usd'),
            'provider' => 'required|string|in:stripe,paystack',
        ]);

        $provider = $validated['provider'];
        $successUrl = route('console.billing', [], true);
        $cancelUrl = route('console.billing', [], true);

        $url = $provider === 'paystack'
            ? $this->paystackService->createDeveloperWalletTopupAuthorization(
                $request->user(),
                (float) $validated['amount_usd'],
                route('paystack.callback', [], true),
                $cancelUrl,
                [
                    'provider' => 'paystack',
                ]
            )
            : $this->stripeService->createOneTimeCheckoutSession(
                $request->user(),
                (float) $validated['amount_usd'],
                $successUrl,
                $cancelUrl,
                [
                    'purpose' => 'developer_wallet_topup',
                    'user_id' => $request->user()->id,
                    'amount_usd' => (string) $validated['amount_usd'],
                    'provider' => 'stripe',
                ]
            );

        return Inertia::location($url);
    }
}
