<?php

namespace App\Http\Controllers\Developer;

use App\Http\Controllers\Controller;
use App\Models\ApiModel;
use App\Models\DeveloperApiKey;
use App\Support\ConsoleUrl;
use App\Services\DeveloperApiBillingService;
use App\Services\DeveloperApiTokenService;
use App\Services\PaystackService;
use App\Services\StripeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeveloperPortalController extends Controller
{
    public function __construct(
        private readonly DeveloperApiTokenService $tokenService,
        private readonly DeveloperApiBillingService $billingService,
        private readonly StripeService $stripeService,
        private readonly PaystackService $paystackService,
    ) {
    }

    public function index(Request $request): Response
    {
        $user = $request->user();
        $filters = $this->filters($request);
        $walletSummary = $this->billingService->getWalletSummary($user);
        $usageQuery = $this->billingService->buildUsageQuery($filters, $user);
        $ledgerQuery = $this->billingService->buildLedgerQuery($filters, $user);
        $keyQuery = $user->developerApiKeys()
            ->withCount('usageRecords')
            ->withSum('usageRecords', 'cost_usd')
            ->latest();

        if (($filters['key_status'] ?? null) === 'active') {
            $keyQuery->where('is_active', true);
        } elseif (($filters['key_status'] ?? null) === 'revoked') {
            $keyQuery->where('is_active', false);
        }

        return Inertia::render('User/DeveloperApi/Index', [
            'wallet' => $walletSummary,
            'stats' => $this->billingService->summarizeUsage(clone $usageQuery),
            'breakdowns' => [
                ...$this->billingService->getUsageBreakdowns(clone $usageQuery),
                'ledger' => $this->billingService->getLedgerBreakdown(clone $ledgerQuery),
                'trend' => $this->billingService->getUsageTrend(clone $usageQuery, (int) ($filters['days'] ?? 30)),
            ],
            'apiKeys' => $keyQuery->paginate(10)->withQueryString()->through(fn (DeveloperApiKey $apiKey) => [
                'id' => $apiKey->id,
                'name' => $apiKey->name,
                'key_prefix' => $apiKey->key_prefix,
                'is_active' => $apiKey->is_active,
                'notes' => $apiKey->notes,
                'allowed_model_ids' => $apiKey->allowed_model_ids ?? [],
                'expires_at' => optional($apiKey->expires_at)->toIso8601String(),
                'last_used_at' => optional($apiKey->last_used_at)->toIso8601String(),
                'last_rotated_at' => optional($apiKey->last_rotated_at)->toIso8601String(),
                'usage_requests_count' => (int) $apiKey->usage_records_count,
                'usage_spend_usd' => round((float) ($apiKey->usage_records_sum_cost_usd ?? 0), 6),
            ]),
            'usage' => $usageQuery->latest()->paginate(15)->withQueryString()->through(function ($record) {
                return [
                    'id' => $record->id,
                    'request_id' => $record->request_id,
                    'status' => $record->status,
                    'endpoint' => $record->endpoint,
                    'input_tokens' => $record->input_tokens,
                    'output_tokens' => $record->output_tokens,
                    'total_tokens' => $record->total_tokens,
                    'cost_usd' => round((float) $record->cost_usd, 6),
                    'created_at' => optional($record->created_at)->toIso8601String(),
                    'is_estimated_tokens' => (bool) $record->is_estimated_tokens,
                    'api_key' => $record->apiKey ? [
                        'id' => $record->apiKey->id,
                        'name' => $record->apiKey->name,
                        'key_prefix' => $record->apiKey->key_prefix,
                    ] : null,
                    'model' => $record->model ? [
                        'id' => $record->model->id,
                        'public_id' => $record->model->public_id,
                        'name' => $record->model->name,
                    ] : null,
                ];
            }),
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
            'models' => ApiModel::where('is_active', true)->orderBy('model_type')->orderBy('public_id')->get(),
            'apiBaseUrl' => 'https://' . config('developer-api.domain') . '/v1',
            'docsUrl' => ConsoleUrl::docsUrl($request) . '/api',
            'topupConfig' => [
                'default_amount_usd' => (float) config('developer-api.default_topup_amount_usd'),
                'min_amount_usd' => (float) config('developer-api.min_topup_amount_usd'),
                'max_amount_usd' => (float) config('developer-api.max_topup_amount_usd'),
                'providers' => config('developer-api.topup_providers', ['paystack', 'stripe']),
                'default_provider' => (string) config('developer-api.default_topup_provider', 'paystack'),
                'paystack' => [
                    'currency' => $this->paystackService->getCheckoutCurrency(),
                    'exchange_rate' => $this->paystackService->getUsdExchangeRate(),
                    'symbol' => $this->paystackService->getCheckoutCurrency() === 'NGN' ? '₦' : '$',
                ],
            ],
            'filters' => $filters,
        ]);
    }

    public function storeKey(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'allowed_model_ids' => 'nullable|array',
            'allowed_model_ids.*' => 'string|exists:api_models,public_id',
            'expires_at' => 'nullable|date|after:now',
        ]);

        [, $plainTextKey] = $this->tokenService->createKey(
            $request->user(),
            $validated['name'],
            $validated['allowed_model_ids'] ?? null,
            $validated['expires_at'] ?? null,
            $validated['notes'] ?? null
        );

        return back()
            ->with('success', 'Developer API key created successfully.')
            ->with('developer_plaintext_key', $plainTextKey);
    }

    public function updateKey(Request $request, DeveloperApiKey $developerApiKey): RedirectResponse
    {
        abort_unless($developerApiKey->user_id === $request->user()->id, 404);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'notes' => 'nullable|string|max:1000',
            'allowed_model_ids' => 'nullable|array',
            'allowed_model_ids.*' => 'string|exists:api_models,public_id',
            'expires_at' => 'nullable|date',
        ]);

        $this->tokenService->updateKey(
            $developerApiKey,
            $validated['name'],
            $validated['allowed_model_ids'] ?? null,
            $validated['expires_at'] ?? null,
            $validated['notes'] ?? null
        );

        return back()->with('success', 'Developer API key updated.');
    }

    public function revokeKey(Request $request, DeveloperApiKey $developerApiKey): RedirectResponse
    {
        abort_unless($developerApiKey->user_id === $request->user()->id, 404);

        $developerApiKey->update(['is_active' => false]);

        return back()->with('success', 'Developer API key revoked.');
    }

    public function regenerateKey(Request $request, DeveloperApiKey $developerApiKey): RedirectResponse
    {
        abort_unless($developerApiKey->user_id === $request->user()->id, 404);

        [, $plainTextKey] = $this->tokenService->regenerateKey($developerApiKey);

        return back()
            ->with('success', 'Developer API key regenerated successfully.')
            ->with('developer_plaintext_key', $plainTextKey);
    }

    public function createTopupCheckout(Request $request)
    {
        $validated = $request->validate([
            'amount_usd' => 'required|numeric|min:' . config('developer-api.min_topup_amount_usd') . '|max:' . config('developer-api.max_topup_amount_usd'),
            'provider' => 'required|string|in:stripe,paystack',
        ]);

        $successUrl = route('console.index', ['section' => 'billing'], true);
        $cancelUrl = route('console.index', ['section' => 'billing'], true);
        $provider = $validated['provider'];

        try {
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
        } catch (\Throwable $exception) {
            return back()->with('error', $exception->getMessage());
        }

        return Inertia::location($url);
    }

    private function filters(Request $request): array
    {
        return [
            'section' => (string) $request->string('section', 'overview'),
            'days' => max(1, min(365, $request->integer('days', 30))),
            'date_from' => $request->input('date_from'),
            'date_to' => $request->input('date_to'),
            'status' => $request->input('status'),
            'model' => $request->input('model'),
            'key_id' => $request->input('key_id'),
            'ledger_type' => $request->input('ledger_type'),
            'key_status' => $request->input('key_status'),
        ];
    }
}
