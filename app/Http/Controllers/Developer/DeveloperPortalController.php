<?php

namespace App\Http\Controllers\Developer;

use App\Http\Controllers\Controller;
use App\Models\ApiModel;
use App\Models\DeveloperApiKey;
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

    public function index(Request $request): \Illuminate\Http\RedirectResponse
    {
        return redirect()->route('developer-api.index');
    }

    public function dashboard(Request $request): Response
    {
        $user = $request->user();
        $walletSummary = $this->billingService->getWalletSummary($user);
        $usageQuery = $this->billingService->buildUsageQuery([], $user);
        $keyCount = $user->developerApiKeys()->where('is_active', true)->count();

        return Inertia::render('User/DeveloperApi/Dashboard', [
            'wallet' => $walletSummary,
            'stats' => $this->billingService->summarizeUsage(clone $usageQuery),
            'apiBaseUrl' => rtrim((string) config('developer-api.api_base_url', url('')), '/') . '/api/v1',
            'keyCount' => $keyCount,
            'topupConfig' => $this->topupConfig(),
        ]);
    }

    public function keys(Request $request): Response
    {
        $user = $request->user();
        $keyQuery = $user->developerApiKeys()
            ->withCount('usageRecords')
            ->withSum('usageRecords', 'cost_usd')
            ->latest();

        return Inertia::render('User/DeveloperApi/Keys', [
            'apiKeys' => $keyQuery->paginate(15)->withQueryString()->through(fn (DeveloperApiKey $apiKey) => [
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
            'models' => ApiModel::where('is_active', true)
                ->where(fn ($q) => $q->whereNull('model_type')->orWhere('model_type', 'text'))
                ->orderBy('public_id')
                ->get()
                ->map(fn ($m) => [
                    'id' => $m->id,
                    'public_id' => $m->public_id,
                    'name' => $m->name,
                ]),
        ]);
    }

    public function usage(Request $request): Response
    {
        $user = $request->user();
        $filters = $this->filters($request);
        $usageQuery = $this->billingService->buildUsageQuery($filters, $user);

        return Inertia::render('User/DeveloperApi/Usage', [
            'stats' => $this->billingService->summarizeUsage(clone $usageQuery),
            'usage' => $usageQuery->latest()->paginate(25)->withQueryString()->through(function ($record) {
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
            'filters' => $filters,
        ]);
    }

    public function billing(Request $request): Response
    {
        $user = $request->user();
        $filters = $this->filters($request);
        $ledgerQuery = $this->billingService->buildLedgerQuery($filters, $user);
        $walletSummary = $this->billingService->getWalletSummary($user);

        return Inertia::render('User/DeveloperApi/Billing', [
            'wallet' => $walletSummary,
            'ledger' => $ledgerQuery->latest()->paginate(25)->withQueryString()->through(function ($entry) {
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
            'topupConfig' => $this->topupConfig(),
        ]);
    }

    public function quickstart(Request $request): Response
    {
        return Inertia::render('User/DeveloperApi/Quickstart', [
            'apiBaseUrl' => rtrim((string) config('developer-api.api_base_url', url('')), '/') . '/api/v1',
            'models' => ApiModel::where('is_active', true)
                ->where(fn ($q) => $q->whereNull('model_type')->orWhere('model_type', 'text'))
                ->orderBy('public_id')
                ->get()
                ->map(fn ($m) => [
                    'id' => $m->id,
                    'public_id' => $m->public_id,
                    'name' => $m->name,
                    'description' => $m->description,
                    'max_context_tokens' => $m->max_context_tokens,
                    'supports_streaming' => $m->supports_streaming,
                    'supports_tools' => $m->supports_tools,
                ]),
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
        $allowedProviders = config('developer-api.topup_providers', ['stripe']);

        $validated = $request->validate([
            'amount_usd' => 'required|numeric|min:' . config('developer-api.min_topup_amount_usd') . '|max:' . config('developer-api.max_topup_amount_usd'),
            'provider'   => ['nullable', 'string', 'in:' . implode(',', $allowedProviders)],
        ]);

        $amountUsd = (float) $validated['amount_usd'];
        $provider  = $validated['provider'] ?? $allowedProviders[0] ?? 'stripe';
        $billingUrl = route('developer-api.billing.index', [], true);

        if ($provider === 'paystack') {
            $url = $this->paystackService->createDeveloperWalletTopupAuthorization(
                $request->user(),
                $amountUsd,
                route('paystack.callback', [], true),
                $billingUrl,
            );
        } else {
            $url = $this->stripeService->createOneTimeCheckoutSession(
                $request->user(),
                $amountUsd,
                $billingUrl,
                $billingUrl,
                [
                    'purpose' => 'developer_wallet_topup',
                    'user_id' => $request->user()->id,
                    'amount_usd' => (string) $amountUsd,
                ]
            );
        }

        return Inertia::location($url);
    }

    private function topupConfig(): array
    {
        $providers = config('developer-api.topup_providers', ['stripe']);
        $available  = [];

        foreach ($providers as $p) {
            if ($p === 'paystack' && $this->paystackService->isConfigured()) {
                $available[] = [
                    'id'       => 'paystack',
                    'label'    => 'Paystack',
                    'currency' => $this->paystackService->getCheckoutCurrency(),
                    'rate'     => $this->paystackService->getUsdExchangeRate(),
                ];
            } elseif ($p === 'stripe') {
                $available[] = ['id' => 'stripe', 'label' => 'Stripe', 'currency' => 'USD', 'rate' => 1.0];
            }
        }

        return [
            'default_amount_usd'  => (float) config('developer-api.default_topup_amount_usd'),
            'min_amount_usd'      => (float) config('developer-api.min_topup_amount_usd'),
            'max_amount_usd'      => (float) config('developer-api.max_topup_amount_usd'),
            'default_provider'    => config('developer-api.default_topup_provider', $providers[0] ?? 'stripe'),
            'available_providers' => $available,
        ];
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
