<?php

namespace App\Http\Controllers\Console;

use App\Http\Controllers\Controller;
use App\Models\ApiModel;
use App\Services\DeveloperApiBillingService;
use App\Services\DeveloperApiTokenService;
use App\Services\PaystackService;
use App\Services\StripeService;
use App\Support\ConsoleUrl;
use Illuminate\Http\Request;

abstract class ConsoleBaseController extends Controller
{
    public function __construct(
        protected readonly DeveloperApiBillingService $billingService,
        protected readonly DeveloperApiTokenService $tokenService,
        protected readonly StripeService $stripeService,
        protected readonly PaystackService $paystackService,
    ) {
    }

    /**
     * Parse shared filter parameters from the request.
     * Section is no longer part of filters — it is determined by the URL.
     */
    protected function filters(Request $request): array
    {
        return [
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

    /**
     * Build the shared props present on every console section page.
     */
    protected function sharedProps(Request $request, string $section): array
    {
        $user = $request->user();
        $filters = $this->filters($request);
        $usageQuery = $this->billingService->buildUsageQuery($filters, $user);

        return [
            'wallet' => $this->billingService->getWalletSummary($user),
            'stats' => $this->billingService->summarizeUsage(clone $usageQuery),
            'models' => ApiModel::where('is_active', true)->orderBy('model_type')->orderBy('public_id')->get(),
            'apiBaseUrl' => 'https://' . config('developer-api.domain') . '/v1',
            'docsUrl' => ConsoleUrl::docsUrl($request) . '/api',
            'filters' => $filters,
            'section' => $section,
        ];
    }
}
