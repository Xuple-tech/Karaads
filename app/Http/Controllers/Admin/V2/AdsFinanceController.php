<?php

namespace App\Http\Controllers\Admin\V2;

use App\Http\Controllers\Controller;
use App\Domain\AdsV2\Services\WalletLedgerService;
use App\Models\AdsV2\AdPayoutBatch;
use App\Models\AdsV2\AdPayoutItem;
use App\Models\AdsV2\AdWalletLedger;
use App\Models\AdsV2\AdPayment;
use App\Models\AdsV2\AdCampaign;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdsFinanceController extends Controller
{
    public function __construct(private readonly WalletLedgerService $walletLedgerService) {}

    public function ledger(Request $request): Response
    {
        $query = AdWalletLedger::query()->latest();

        if ($request->filled('entry_type')) {
            $query->where('entry_type', $request->string('entry_type'));
        }

        $ledger = $query->paginate(50);

        return Inertia::render('Admin/V2/Ads/Finance/Ledger', [
            'ledger' => $ledger,
            'filters' => $request->only('entry_type'),
        ]);
    }

    public function payoutBatches(): Response
    {
        $batches = AdPayoutBatch::latest()->paginate(25);

        return Inertia::render('Admin/V2/Ads/Finance/PayoutBatches', [
            'batches' => $batches,
        ]);
    }

    public function payments(Request $request): Response
    {
        $query = AdPayment::query()->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $payments = $query->paginate(50);

        return Inertia::render('Admin/V2/Ads/Finance/Payments', [
            'payments' => $payments,
            'filters' => $request->only('status'),
        ]);
    }

    public function approvePayment(AdPayment $payment): RedirectResponse
    {
        if ($payment->status === 'successful') {
            return back()->with('success', 'Payment already approved.');
        }

        $wallet = $payment->wallet;
        if ($wallet) {
            $wallet->balance = (float) $wallet->balance + (float) $payment->amount;
            $wallet->save();

            $this->walletLedgerService->deposit(
                $wallet,
                (float) $payment->amount,
                $payment->reference,
                ['source' => 'admin_manual', 'admin_id' => auth('admin')->id()],
            );
        }

        $payment->status = 'successful';
        $payment->save();

        $campaignId = $payment->meta['campaign_id'] ?? null;
        if ($campaignId) {
            $campaign = AdCampaign::find($campaignId);
            if ($campaign && ! in_array($campaign->status, ['archived'], true)) {
                $campaign->last_funded_at = now();

                // Auto-submit for review when admin manually funds a campaign
                if (in_array($campaign->status, ['draft', 'rejected'], true)) {
                    $campaign->status = 'in_review';
                    $campaign->review_submitted_at = now();
                    $campaign->rejected_at = null;
                    $campaign->rejection_reason = null;
                }

                $campaign->save();

                $campaign->creatives()
                    ->whereIn('status', ['draft', 'rejected'])
                    ->update(['status' => 'in_review']);
            }
        }

        return back()->with('success', 'Payment approved, wallet credited, and campaign submitted for review.');
    }

    public function failPayment(AdPayment $payment): RedirectResponse
    {
        if ($payment->status === 'failed') {
            return back()->with('success', 'Payment already marked failed.');
        }

        $payment->status = 'failed';
        $payment->save();

        return back()->with('success', 'Payment marked as failed.');
    }

    public function createPayoutBatch(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'period_start' => 'required|date',
            'period_end' => 'required|date|after:period_start',
            'currency' => 'nullable|string|size:3',
        ]);

        $items = AdPayoutItem::query()
            ->whereNull('batch_id')
            ->where('status', 'pending')
            ->whereBetween('created_at', [$validated['period_start'], $validated['period_end']])
            ->get();

        $batch = AdPayoutBatch::create([
            'id' => (string) Str::uuid(),
            'period_start' => $validated['period_start'],
            'period_end' => $validated['period_end'],
            'status' => 'processing',
            'total_amount' => (float) $items->sum('amount'),
            'currency' => strtoupper($validated['currency'] ?? 'USD'),
            'processed_at' => now(),
        ]);

        foreach ($items as $item) {
            $item->batch_id = $batch->id;
            $item->status = 'processing';
            $item->save();
        }

        return back()->with('success', 'Payout batch created.');
    }

    public function completePayoutBatch(AdPayoutBatch $batch): RedirectResponse
    {
        $batch->status = 'completed';
        $batch->processed_at = now();
        $batch->save();

        AdPayoutItem::query()
            ->where('batch_id', $batch->id)
            ->where('status', 'processing')
            ->update([
                'status' => 'completed',
                'paid_at' => now(),
            ]);

        return back()->with('success', 'Payout batch completed.');
    }
}
