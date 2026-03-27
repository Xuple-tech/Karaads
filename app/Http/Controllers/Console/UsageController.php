<?php

namespace App\Http\Controllers\Console;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UsageController extends ConsoleBaseController
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $filters = $this->filters($request);
        $usageQuery = $this->billingService->buildUsageQuery($filters, $user);

        return Inertia::render('User/DeveloperApi/Index', array_merge(
            $this->sharedProps($request, 'usage'),
            [
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
                'breakdowns' => [
                    ...$this->billingService->getUsageBreakdowns(clone $usageQuery),
                    'ledger' => ['credits_usd' => 0, 'debits_usd' => 0, 'by_type' => []],
                    'trend' => [],
                ],
            ]
        ));
    }
}
