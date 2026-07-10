<?php

namespace App\Http\Controllers\Admin\V2;

use App\Http\Controllers\Controller;
use App\Models\AdsV2\AdCampaign;
use App\Models\AdsV2\AdCreative;
use App\Models\AdsV2\AdPayment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdsModerationController extends Controller
{
    public function queue(Request $request): Response
    {
        $showAllPaidAds = $request->boolean('paid');

        // Paid ads are campaigns with last_funded_at set by a successful payment.
        $campaigns = AdCampaign::query()
            ->whereNotNull('last_funded_at')
            ->when(! $showAllPaidAds, fn ($query) => $query->where('status', 'in_review'))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        // Creatives in review, plus any draft/rejected whose campaign is already approved+funded
        $creatives = AdCreative::query()
            ->with('campaign:id,name,status,last_funded_at')
            ->whereHas('campaign', fn ($campaign) => $campaign->whereNotNull('last_funded_at'))
            ->when(! $showAllPaidAds, function ($query) {
                $query->where(function ($q) {
                    $q->where('status', 'in_review')
                        ->orWhere(function ($q2) {
                            $q2->whereIn('status', ['draft', 'rejected'])
                                ->whereHas('campaign', fn ($c) => $c->whereIn('status', ['approved', 'active']));
                        });
                });
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/V2/Ads/Moderation/Queue', [
            'campaigns' => $campaigns,
            'creatives' => $creatives,
            'mode' => $showAllPaidAds ? 'paid' : 'review',
            'paymentReport' => $showAllPaidAds ? $this->paidAdsPaymentReport() : null,
        ]);
    }

    private function paidAdsPaymentReport(): array
    {
        $paidStatuses = ['successful', 'success', 'paid'];

        return [
            'total_paid_amount' => (float) AdPayment::whereIn('status', $paidStatuses)->sum('amount'),
            'total_payment_count' => AdPayment::whereIn('status', $paidStatuses)->count(),
            'pending_payment_count' => AdPayment::whereNotIn('status', $paidStatuses)->count(),
            'funded_campaign_count' => AdCampaign::whereNotNull('last_funded_at')->count(),
            'active_campaign_count' => AdCampaign::whereNotNull('last_funded_at')->where('status', 'active')->count(),
            'in_review_campaign_count' => AdCampaign::whereNotNull('last_funded_at')->where('status', 'in_review')->count(),
            'paid_creative_count' => AdCreative::whereHas('campaign', fn ($campaign) => $campaign->whereNotNull('last_funded_at'))->count(),
            'active_creative_count' => AdCreative::whereHas('campaign', fn ($campaign) => $campaign->whereNotNull('last_funded_at'))->where('status', 'active')->count(),
            'total_budget' => (float) AdCampaign::whereNotNull('last_funded_at')->sum('budget_total'),
            'total_spent' => (float) AdCampaign::whereNotNull('last_funded_at')->sum('spent'),
        ];
    }

    public function approveCampaign(AdCampaign $campaign): RedirectResponse
    {
        $nextStatus = $campaign->last_funded_at ? 'active' : 'approved';

        $campaign->update([
            'status' => $nextStatus,
            'approved_at' => now(),
            'approved_by' => $this->adminId(),
            'rejected_at' => null,
            'rejection_reason' => null,
        ]);

        return back()->with('success', 'Campaign approved.');
    }

    public function rejectCampaign(Request $request, AdCampaign $campaign): RedirectResponse
    {
        $validated = $request->validate(['reason' => 'required|string|min:5|max:2000']);

        $campaign->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'approved_by' => $this->adminId(),
            'rejection_reason' => $validated['reason'],
        ]);

        return back()->with('success', 'Campaign rejected.');
    }

    public function pauseCampaign(AdCampaign $campaign): RedirectResponse
    {
        $campaign->update(['status' => 'paused']);
        return back()->with('success', 'Campaign paused.');
    }

    public function resumeCampaign(AdCampaign $campaign): RedirectResponse
    {
        if (! $campaign->isAdminApproved()) {
            return back()->withErrors(['campaign' => 'Campaign must be approved before it can resume.']);
        }

        $campaign->update(['status' => 'active']);
        return back()->with('success', 'Campaign resumed.');
    }

    public function approveCreative(AdCreative $creative): RedirectResponse
    {
        $nextStatus = $creative->campaign?->last_funded_at ? 'active' : 'approved';

        $creative->update([
            'status' => $nextStatus,
            'approved_at' => now(),
            'approved_by' => $this->adminId(),
            'rejected_at' => null,
            'rejection_reason' => null,
        ]);

        return back()->with('success', 'Creative approved.');
    }

    public function rejectCreative(Request $request, AdCreative $creative): RedirectResponse
    {
        $validated = $request->validate(['reason' => 'required|string|min:5|max:2000']);

        $creative->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'approved_by' => $this->adminId(),
            'rejection_reason' => $validated['reason'],
        ]);

        return back()->with('success', 'Creative rejected.');
    }

    private function adminId(): ?string
    {
        return auth('admin')->id();
    }
}
