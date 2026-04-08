<?php

namespace App\Services;

use App\Models\ApiModel;
use App\Models\DeveloperApiKey;
use App\Models\DeveloperCreditLedger;
use App\Models\DeveloperUsageRecord;
use App\Models\DeveloperWallet;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DeveloperApiBillingService
{
    public function getOrCreateWallet(User $user): DeveloperWallet
    {
        return DeveloperWallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance_usd' => 0, 'lifetime_credited_usd' => 0, 'lifetime_debited_usd' => 0]
        );
    }

    public function estimateTokens(array|string $payload): int
    {
        $text = is_array($payload) ? json_encode($payload, JSON_UNESCAPED_UNICODE) : (string) $payload;
        return max(1, (int) ceil(mb_strlen($text) / 4));
    }

    public function estimateRequestCost(ApiModel $model, int $inputTokens, int $outputTokens): float
    {
        $inputCost = ($inputTokens / 1_000_000) * (float) $model->input_price_per_1m_tokens;
        $outputCost = ($outputTokens / 1_000_000) * (float) $model->output_price_per_1m_tokens;

        return round($inputCost + $outputCost, 6);
    }

    public function ensureSufficientBalance(User $user, float $requiredAmount): void
    {
        $wallet = $this->getOrCreateWallet($user);
        $minimum = $requiredAmount + (float) config('developer-api.minimum_balance_buffer_usd', 0);

        if ((float) $wallet->balance_usd < $minimum) {
            throw new \RuntimeException('Insufficient credits.');
        }
    }

    public function recordUsageAndDebit(
        DeveloperApiKey $apiKey,
        ApiModel $model,
        array $usage,
        string $endpoint,
        array $requestPayload,
        array $responsePayload,
        bool $isEstimated,
        ?string $status = 'success',
        ?string $errorMessage = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?string $requestId = null
    ): DeveloperUsageRecord {
        return DB::transaction(function () use (
            $apiKey,
            $model,
            $usage,
            $endpoint,
            $requestPayload,
            $responsePayload,
            $isEstimated,
            $status,
            $errorMessage,
            $ipAddress,
            $userAgent,
            $requestId
        ) {
            $wallet = DeveloperWallet::where('user_id', $apiKey->user_id)->lockForUpdate()->firstOrFail();
            $cost = $this->estimateRequestCost($model, $usage['input_tokens'], $usage['output_tokens']);

            if ((float) $wallet->balance_usd < $cost) {
                throw new \RuntimeException('Insufficient credits.');
            }

            $before = (float) $wallet->balance_usd;
            $after = round($before - $cost, 6);

            $wallet->update([
                'balance_usd' => $after,
                'lifetime_debited_usd' => round((float) $wallet->lifetime_debited_usd + $cost, 6),
            ]);

            $usageRecord = DeveloperUsageRecord::create([
                'user_id' => $apiKey->user_id,
                'developer_api_key_id' => $apiKey->id,
                'api_model_id' => $model->id,
                'request_id' => $requestId ?: (string) Str::uuid(),
                'endpoint' => $endpoint,
                'input_tokens' => $usage['input_tokens'],
                'output_tokens' => $usage['output_tokens'],
                'total_tokens' => $usage['input_tokens'] + $usage['output_tokens'],
                'cost_usd' => $cost,
                'is_estimated_tokens' => $isEstimated,
                'status' => $status ?? 'success',
                'error_message' => $errorMessage,
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
                'request_payload' => $requestPayload,
                'response_payload' => $responsePayload,
            ]);

            DeveloperCreditLedger::create([
                'wallet_id' => $wallet->id,
                'user_id' => $apiKey->user_id,
                'developer_api_key_id' => $apiKey->id,
                'type' => 'debit',
                'amount_usd' => -1 * $cost,
                'balance_before_usd' => $before,
                'balance_after_usd' => $after,
                'description' => 'API usage debit for ' . $model->public_id,
                'metadata' => [
                    'request_id' => $usageRecord->request_id,
                    'public_model' => $model->public_id,
                    'endpoint' => $endpoint,
                ],
            ]);

            return $usageRecord;
        });
    }

    public function creditWallet(
        User $user,
        float $amountUsd,
        string $type = 'topup',
        ?string $description = null,
        array $metadata = [],
        ?string $externalReference = null
    ): DeveloperCreditLedger {
        return DB::transaction(function () use ($user, $amountUsd, $type, $description, $metadata, $externalReference) {
            if ($externalReference) {
                $existing = DeveloperCreditLedger::where('external_reference', $externalReference)->first();
                if ($existing) {
                    return $existing;
                }
            }

            $wallet = DeveloperWallet::where('user_id', $user->id)->lockForUpdate()->first();
            if (!$wallet) {
                $wallet = $this->getOrCreateWallet($user);
                $wallet = DeveloperWallet::where('id', $wallet->id)->lockForUpdate()->firstOrFail();
            }

            $before = (float) $wallet->balance_usd;
            $after = round($before + $amountUsd, 6);

            $wallet->update([
                'balance_usd' => $after,
                'lifetime_credited_usd' => round((float) $wallet->lifetime_credited_usd + max($amountUsd, 0), 6),
                'lifetime_debited_usd' => round((float) $wallet->lifetime_debited_usd + max($amountUsd * -1, 0), 6),
            ]);

            return DeveloperCreditLedger::create([
                'wallet_id' => $wallet->id,
                'user_id' => $user->id,
                'type' => $type,
                'amount_usd' => $amountUsd,
                'balance_before_usd' => $before,
                'balance_after_usd' => $after,
                'external_reference' => $externalReference,
                'description' => $description,
                'metadata' => $metadata,
            ]);
        });
    }

    public function adjustWallet(User $user, float $amountUsd, string $description): DeveloperCreditLedger
    {
        return $this->creditWallet(
            $user,
            $amountUsd,
            'adjustment',
            $description,
            ['source' => 'admin_adjustment']
        );
    }

    public function getUsageSummary(User $user, ?DeveloperApiKey $apiKey = null, int $days = 30): array
    {
        $query = $this->buildUsageQuery(['days' => $days], $user);

        if ($apiKey) {
            $query->where('developer_api_key_id', $apiKey->id);
        }

        return $this->summarizeUsage($query);
    }

    public function getWalletSummary(User $user): array
    {
        $wallet = $this->getOrCreateWallet($user);
        $ledgerQuery = $this->buildLedgerQuery([], $user);

        $topups = (clone $ledgerQuery)->where('amount_usd', '>', 0)->sum('amount_usd');
        $debits = abs((float) (clone $ledgerQuery)->where('amount_usd', '<', 0)->sum('amount_usd'));

        return [
            'balance_usd' => (float) $wallet->balance_usd,
            'lifetime_credited_usd' => (float) $wallet->lifetime_credited_usd,
            'lifetime_debited_usd' => (float) $wallet->lifetime_debited_usd,
            'topups_usd' => round((float) $topups, 6),
            'debits_usd' => round($debits, 6),
        ];
    }

    public function buildUsageQuery(array $filters = [], ?User $user = null): Builder
    {
        $query = DeveloperUsageRecord::query()
            ->with([
                'apiKey:id,name,key_prefix,user_id',
                'model:id,public_id,name',
                'user:id,name,email',
            ]);

        if ($user) {
            $query->where('user_id', $user->id);
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['key_id'])) {
            $query->where('developer_api_key_id', $filters['key_id']);
        }

        if (!empty($filters['model'])) {
            $query->whereHas('model', fn (Builder $builder) => $builder->where('public_id', $filters['model']));
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['user_query'])) {
            $search = '%' . trim((string) $filters['user_query']) . '%';
            $query->whereHas('user', function (Builder $builder) use ($search) {
                $builder->where('email', 'like', $search)->orWhere('name', 'like', $search);
            });
        }

        [$from, $to] = $this->resolveDateRange($filters);

        return $query->where('created_at', '>=', $from)->where('created_at', '<=', $to);
    }

    public function buildLedgerQuery(array $filters = [], ?User $user = null): Builder
    {
        $query = DeveloperCreditLedger::query()
            ->with([
                'apiKey:id,name,key_prefix,user_id',
                'user:id,name,email',
            ]);

        if ($user) {
            $query->where('user_id', $user->id);
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        $ledgerType = $filters['type'] ?? $filters['ledger_type'] ?? null;

        if (!empty($ledgerType)) {
            $query->where('type', $ledgerType);
        }

        if (!empty($filters['user_query'])) {
            $search = '%' . trim((string) $filters['user_query']) . '%';
            $query->whereHas('user', function (Builder $builder) use ($search) {
                $builder->where('email', 'like', $search)->orWhere('name', 'like', $search);
            });
        }

        [$from, $to] = $this->resolveDateRange($filters);

        return $query->where('created_at', '>=', $from)->where('created_at', '<=', $to);
    }

    public function summarizeUsage(Builder $query): array
    {
        return [
            'requests' => (clone $query)->count(),
            'input_tokens' => (int) (clone $query)->sum('input_tokens'),
            'output_tokens' => (int) (clone $query)->sum('output_tokens'),
            'total_tokens' => (int) (clone $query)->sum('total_tokens'),
            'cost_usd' => round((float) (clone $query)->sum('cost_usd'), 6),
            'success_requests' => (clone $query)->where('status', 'success')->count(),
            'error_requests' => (clone $query)->where('status', '!=', 'success')->count(),
        ];
    }

    public function getUsageBreakdowns(Builder $query, int $limit = 5): array
    {
        $perModel = (clone $query)
            ->selectRaw('api_model_id, count(*) as requests, sum(total_tokens) as total_tokens, sum(cost_usd) as cost_usd')
            ->groupBy('api_model_id')
            ->orderByDesc('cost_usd')
            ->with('model:id,public_id,name')
            ->limit($limit)
            ->get();

        $perKey = (clone $query)
            ->selectRaw('developer_api_key_id, count(*) as requests, sum(total_tokens) as total_tokens, sum(cost_usd) as cost_usd')
            ->groupBy('developer_api_key_id')
            ->orderByDesc('cost_usd')
            ->with('apiKey:id,name,key_prefix')
            ->limit($limit)
            ->get();

        $statusSummary = (clone $query)
            ->selectRaw('status, count(*) as requests')
            ->groupBy('status')
            ->orderByDesc('requests')
            ->get();

        $customers = (clone $query)
            ->selectRaw('user_id, count(*) as requests, sum(cost_usd) as cost_usd')
            ->groupBy('user_id')
            ->orderByDesc('cost_usd')
            ->with('user:id,name,email')
            ->limit($limit)
            ->get();

        return [
            'per_model' => $perModel->map(fn (DeveloperUsageRecord $record) => [
                'model' => $record->model?->public_id,
                'name' => $record->model?->name,
                'requests' => (int) $record->requests,
                'total_tokens' => (int) $record->total_tokens,
                'cost_usd' => round((float) $record->cost_usd, 6),
            ])->values(),
            'per_key' => $perKey->map(fn (DeveloperUsageRecord $record) => [
                'id' => $record->developer_api_key_id,
                'name' => $record->apiKey?->name,
                'key_prefix' => $record->apiKey?->key_prefix,
                'requests' => (int) $record->requests,
                'total_tokens' => (int) $record->total_tokens,
                'cost_usd' => round((float) $record->cost_usd, 6),
            ])->values(),
            'statuses' => $statusSummary->map(fn (DeveloperUsageRecord $record) => [
                'status' => $record->status,
                'requests' => (int) $record->requests,
            ])->values(),
            'top_customers' => $customers->map(fn (DeveloperUsageRecord $record) => [
                'user_id' => $record->user_id,
                'name' => $record->user?->name,
                'email' => $record->user?->email,
                'requests' => (int) $record->requests,
                'cost_usd' => round((float) $record->cost_usd, 6),
            ])->values(),
        ];
    }

    public function getLedgerBreakdown(Builder $query): array
    {
        $grouped = (clone $query)
            ->selectRaw('type, count(*) as entries, sum(amount_usd) as amount_usd')
            ->groupBy('type')
            ->orderByDesc('entries')
            ->get();

        return [
            'by_type' => $grouped->map(fn (DeveloperCreditLedger $ledger) => [
                'type' => $ledger->type,
                'entries' => (int) $ledger->entries,
                'amount_usd' => round((float) $ledger->amount_usd, 6),
            ])->values(),
            'credits_usd' => round((float) (clone $query)->where('amount_usd', '>', 0)->sum('amount_usd'), 6),
            'debits_usd' => round(abs((float) (clone $query)->where('amount_usd', '<', 0)->sum('amount_usd')), 6),
        ];
    }

    public function getUsageTrend(Builder $query, int $days = 30): Collection
    {
        return (clone $query)
            ->selectRaw('DATE(created_at) as date, count(*) as requests, sum(total_tokens) as total_tokens, sum(cost_usd) as cost_usd')
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->limit(max(1, $days))
            ->get()
            ->map(fn (DeveloperUsageRecord $record) => [
                'date' => $record->date,
                'requests' => (int) $record->requests,
                'total_tokens' => (int) $record->total_tokens,
                'cost_usd' => round((float) $record->cost_usd, 6),
            ])
            ->values();
    }

    private function resolveDateRange(array $filters): array
    {
        $days = max(1, min(365, (int) ($filters['days'] ?? 30)));
        $from = !empty($filters['date_from'])
            ? Carbon::parse((string) $filters['date_from'])->startOfDay()
            : now()->subDays($days)->startOfDay();
        $to = !empty($filters['date_to'])
            ? Carbon::parse((string) $filters['date_to'])->endOfDay()
            : now()->endOfDay();

        return [$from, $to];
    }
}
