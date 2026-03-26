<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ApiModel;
use App\Models\DeveloperApiKey;
use App\Models\DeveloperWallet;
use App\Models\DeveloperUsageRecord;
use App\Models\User;
use App\Services\DeveloperApiBillingService;
use App\Services\DeveloperApiTokenService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeveloperApiController extends Controller
{
    public function __construct(
        private readonly DeveloperApiBillingService $billingService,
        private readonly DeveloperApiTokenService $tokenService,
    )
    {
    }

    public function index(Request $request): Response
    {
        $filters = $this->filters($request);
        $usageQuery = $this->billingService->buildUsageQuery($filters);
        $ledgerQuery = $this->billingService->buildLedgerQuery($filters);
        $keysQuery = DeveloperApiKey::query()
            ->with('user:id,name,email')
            ->withCount('usageRecords')
            ->withSum('usageRecords', 'cost_usd')
            ->latest();

        if (!empty($filters['user_query'])) {
            $search = '%' . trim((string) $filters['user_query']) . '%';
            $keysQuery->whereHas('user', function ($builder) use ($search) {
                $builder->where('email', 'like', $search)
                    ->orWhere('name', 'like', $search);
            });
        }

        if (($filters['key_status'] ?? null) === 'active') {
            $keysQuery->where('is_active', true);
        } elseif (($filters['key_status'] ?? null) === 'revoked') {
            $keysQuery->where('is_active', false);
        }

        if (!empty($filters['model'])) {
            $keysQuery->where(function ($builder) use ($filters) {
                $builder->whereJsonContains('allowed_model_ids', $filters['model'])
                    ->orWhereNull('allowed_model_ids');
            });
        }

        $walletsQuery = DeveloperWallet::query()
            ->with('user:id,name,email')
            ->withCount('ledgers')
            ->latest();

        if (!empty($filters['user_query'])) {
            $search = '%' . trim((string) $filters['user_query']) . '%';
            $walletsQuery->whereHas('user', function ($builder) use ($search) {
                $builder->where('email', 'like', $search)
                    ->orWhere('name', 'like', $search);
            });
        }

        return Inertia::render('Admin/DeveloperApi/Index', [
            'models' => ApiModel::orderBy('public_id')->get(),
            'keys' => $keysQuery->paginate(12)->withQueryString()->through(fn (DeveloperApiKey $key) => [
                'id' => $key->id,
                'name' => $key->name,
                'key_prefix' => $key->key_prefix,
                'is_active' => $key->is_active,
                'notes' => $key->notes,
                'allowed_model_ids' => $key->allowed_model_ids ?? [],
                'expires_at' => optional($key->expires_at)->toIso8601String(),
                'last_used_at' => optional($key->last_used_at)->toIso8601String(),
                'last_rotated_at' => optional($key->last_rotated_at)->toIso8601String(),
                'usage_requests_count' => (int) $key->usage_records_count,
                'usage_spend_usd' => round((float) ($key->usage_records_sum_cost_usd ?? 0), 6),
                'user' => $key->user ? [
                    'id' => $key->user->id,
                    'name' => $key->user->name,
                    'email' => $key->user->email,
                ] : null,
            ]),
            'usage' => $usageQuery->latest()->paginate(20)->withQueryString()->through(function (DeveloperUsageRecord $usage) {
                return [
                    'id' => $usage->id,
                    'request_id' => $usage->request_id,
                    'endpoint' => $usage->endpoint,
                    'status' => $usage->status,
                    'input_tokens' => $usage->input_tokens,
                    'output_tokens' => $usage->output_tokens,
                    'total_tokens' => $usage->total_tokens,
                    'cost_usd' => round((float) $usage->cost_usd, 6),
                    'created_at' => optional($usage->created_at)->toIso8601String(),
                    'user' => $usage->user ? [
                        'id' => $usage->user->id,
                        'name' => $usage->user->name,
                        'email' => $usage->user->email,
                    ] : null,
                    'api_key' => $usage->apiKey ? [
                        'id' => $usage->apiKey->id,
                        'name' => $usage->apiKey->name,
                        'key_prefix' => $usage->apiKey->key_prefix,
                    ] : null,
                    'model' => $usage->model ? [
                        'id' => $usage->model->id,
                        'public_id' => $usage->model->public_id,
                        'name' => $usage->model->name,
                    ] : null,
                ];
            }),
            'wallets' => $walletsQuery->paginate(12)->withQueryString()->through(fn (DeveloperWallet $wallet) => [
                'id' => $wallet->id,
                'user_id' => $wallet->user_id,
                'balance_usd' => round((float) $wallet->balance_usd, 6),
                'lifetime_credited_usd' => round((float) $wallet->lifetime_credited_usd, 6),
                'lifetime_debited_usd' => round((float) $wallet->lifetime_debited_usd, 6),
                'ledger_count' => (int) $wallet->ledgers_count,
                'user' => $wallet->user ? [
                    'id' => $wallet->user->id,
                    'name' => $wallet->user->name,
                    'email' => $wallet->user->email,
                ] : null,
            ]),
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
                    'user' => $entry->user ? [
                        'id' => $entry->user->id,
                        'name' => $entry->user->name,
                        'email' => $entry->user->email,
                    ] : null,
                    'api_key' => $entry->apiKey ? [
                        'id' => $entry->apiKey->id,
                        'name' => $entry->apiKey->name,
                        'key_prefix' => $entry->apiKey->key_prefix,
                    ] : null,
                ];
            }),
            'stats' => [
                ...$this->billingService->summarizeUsage(clone $usageQuery),
                'active_keys' => DeveloperApiKey::where('is_active', true)->count(),
                'wallet_count' => DeveloperWallet::count(),
            ],
            'breakdowns' => [
                ...$this->billingService->getUsageBreakdowns(clone $usageQuery),
                'ledger' => $this->billingService->getLedgerBreakdown(clone $ledgerQuery),
                'trend' => $this->billingService->getUsageTrend(clone $usageQuery, (int) ($filters['days'] ?? 30)),
                'recent_payments' => (clone $ledgerQuery)
                    ->where('amount_usd', '>', 0)
                    ->latest()
                    ->limit(10)
                    ->get()
                    ->map(fn ($entry) => [
                        'id' => $entry->id,
                        'amount_usd' => round((float) $entry->amount_usd, 6),
                        'description' => $entry->description,
                        'created_at' => optional($entry->created_at)->toIso8601String(),
                        'user' => $entry->user ? [
                            'id' => $entry->user->id,
                            'name' => $entry->user->name,
                            'email' => $entry->user->email,
                        ] : null,
                    ])
                    ->values(),
            ],
            'filters' => $filters,
        ]);
    }

    public function storeModel(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'public_id' => 'required|string|max:255|unique:api_models,public_id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'upstream_provider' => 'required|string|max:255',
            'upstream_model' => 'required|string|max:255',
            'input_price_per_1m_tokens' => 'required|numeric|min:0',
            'output_price_per_1m_tokens' => 'required|numeric|min:0',
            'max_context_tokens' => 'nullable|integer|min:1',
            'supports_streaming' => 'nullable|boolean',
            'supports_tools' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        ApiModel::create($validated);

        return back()->with('success', 'API model created.');
    }

    public function updateModel(Request $request, ApiModel $apiModel): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'upstream_provider' => 'required|string|max:255',
            'upstream_model' => 'required|string|max:255',
            'input_price_per_1m_tokens' => 'required|numeric|min:0',
            'output_price_per_1m_tokens' => 'required|numeric|min:0',
            'max_context_tokens' => 'nullable|integer|min:1',
            'supports_streaming' => 'nullable|boolean',
            'supports_tools' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $apiModel->update($validated);

        return back()->with('success', 'API model updated.');
    }

    public function toggleModel(ApiModel $apiModel): RedirectResponse
    {
        $apiModel->update(['is_active' => !$apiModel->is_active]);

        return back()->with('success', 'API model status updated.');
    }

    public function toggleKey(DeveloperApiKey $developerApiKey): RedirectResponse
    {
        $developerApiKey->update(['is_active' => !$developerApiKey->is_active]);

        return back()->with('success', 'API key status updated.');
    }

    public function regenerateKey(DeveloperApiKey $developerApiKey): RedirectResponse
    {
        [, $plainTextKey] = $this->tokenService->regenerateKey($developerApiKey);

        return back()
            ->with('success', 'API key regenerated.')
            ->with('developer_plaintext_key', $plainTextKey);
    }

    public function adjustWallet(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'amount_usd' => 'required|numeric|not_in:0',
            'description' => 'required|string|max:255',
        ]);

        $this->billingService->adjustWallet($user, (float) $validated['amount_usd'], $validated['description']);

        return back()->with('success', 'Wallet adjusted.');
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
            'user_id' => $request->input('user_id'),
            'user_query' => $request->input('user_query'),
            'type' => $request->input('type'),
            'key_status' => $request->input('key_status'),
        ];
    }
}
