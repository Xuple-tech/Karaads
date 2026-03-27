<?php

namespace App\Http\Controllers\Console;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OverviewController extends ConsoleBaseController
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $filters = $this->filters($request);
        $usageQuery = $this->billingService->buildUsageQuery($filters, $user);

        return Inertia::render('User/DeveloperApi/Index', array_merge(
            $this->sharedProps($request, 'overview'),
            [
                'breakdowns' => [
                    ...$this->billingService->getUsageBreakdowns(clone $usageQuery),
                    'ledger' => $this->billingService->getLedgerBreakdown(
                        $this->billingService->buildLedgerQuery($filters, $user)
                    ),
                    'trend' => $this->billingService->getUsageTrend(clone $usageQuery, (int) ($filters['days'] ?? 30)),
                ],
            ]
        ));
    }
}
