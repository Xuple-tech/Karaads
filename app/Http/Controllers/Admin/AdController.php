<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\AdCampaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdController extends Controller
{
    public function index(Request $request)
    {
        $query = Ad::with(['campaign', 'provider']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhereHas('campaign', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('provider', function ($q) use ($search) {
                        $q->where('company_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('campaign_id')) {
            $query->where('ad_campaign_id', $request->campaign_id);
        }

        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $ads = $query->paginate($request->get('per_page', 15))
            ->withQueryString();

        return Inertia::render('Admin/Ads/Index', [
            'ads' => $ads,
            'filters' => $request->only(['search', 'status', 'sort', 'direction', 'campaign_id']),
            'stats' => [
                'total' => Ad::count(),
                'active' => Ad::where('status', 'active')->count(),
                'paused' => Ad::where('status', 'paused')->count(),
                'rejected' => Ad::where('status', 'rejected')->count(),
                'totalImpressions' => Ad::sum('impressions'),
                'totalClicks' => Ad::sum('clicks'),
            ],
        ]);
    }

    public function create(Request $request)
    {
        $campaignId = $request->get('campaign_id');

        return Inertia::render('Admin/Ads/Create', [
            'campaigns' => AdCampaign::select('id', 'name', 'ad_provider_id')->with('provider:id,name,company_name')->orderBy('name')->get(),
            'selectedCampaignId' => $campaignId,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ad_campaign_id' => 'required|exists:ad_campaigns,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'media_url' => 'nullable|url',
            'media_type' => 'required|in:image,video',
            'target_url' => 'required|url',
            'ad_type' => 'required|in:banner,interstitial,rewarded,native,sponsored',
            'status' => 'required|in:active,paused,draft,pending',
        ]);

        $campaign = AdCampaign::findOrFail($validated['ad_campaign_id']);

        $validated['id'] = (string) Str::uuid();
        $validated['ad_provider_id'] = $campaign->ad_provider_id;
        $validated['impressions'] = 0;
        $validated['clicks'] = 0;
        $validated['conversions'] = 0;
        $validated['ctr'] = 0;
        $validated['conversion_rate'] = 0;
        $validated['total_spent'] = 0;

        $ad = Ad::create($validated);

        return redirect()->route('admin.ads.show', $ad)
            ->with('success', 'Ad created successfully.');
    }

    public function show(Ad $ad)
    {
        $ad->load(['campaign', 'provider']);

        return Inertia::render('Admin/Ads/Show', [
            'ad' => $ad,
            'stats' => [
                'ctr' => $ad->ctr,
                'cpc' => $ad->clicks > 0 ? $ad->total_spent / $ad->clicks : 0,
                'cpm' => $ad->impressions > 0 ? ($ad->total_spent / $ad->impressions) * 1000 : 0,
            ],
        ]);
    }

    public function edit(Ad $ad)
    {
        return Inertia::render('Admin/Ads/Edit', [
            'ad' => $ad,
            'campaigns' => AdCampaign::select('id', 'name', 'ad_provider_id')->with('provider:id,name,company_name')->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Ad $ad)
    {
        $validated = $request->validate([
            'ad_campaign_id' => 'required|exists:ad_campaigns,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'media_url' => 'nullable|url',
            'media_type' => 'required|in:image,video',
            'target_url' => 'required|url',
            'ad_type' => 'required|in:banner,interstitial,rewarded,native,sponsored',
            'status' => 'required|in:active,paused,draft,pending,rejected',
        ]);

        // If campaign changed, update provider too
        if ($validated['ad_campaign_id'] !== $ad->ad_campaign_id) {
            $campaign = AdCampaign::findOrFail($validated['ad_campaign_id']);
            $validated['ad_provider_id'] = $campaign->ad_provider_id;
        }

        $ad->update($validated);

        return redirect()->route('admin.ads.show', $ad)
            ->with('success', 'Ad updated successfully.');
    }

    public function destroy(Ad $ad)
    {
        $ad->delete();

        return redirect()->route('admin.ads.index')
            ->with('success', 'Ad deleted successfully.');
    }

    public function toggleStatus(Ad $ad)
    {
        $newStatus = $ad->status === 'active' ? 'paused' : 'active';
        $ad->update(['status' => $newStatus]);

        return back()->with('success', 'Ad status updated.');
    }

    public function approve(Request $request, Ad $ad)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        $admin = Auth::guard('admin')->user();

        $ad->update([
            'approval_status' => 'approved',
            'approved_by' => $admin->id,
            'approved_at' => now(),
        ]);

        return back()->with('success', 'Ad approved successfully.');
    }

    public function reject(Request $request, Ad $ad)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|min:10|max:500',
        ]);

        $admin = Auth::guard('admin')->user();

        $ad->update([
            'approval_status' => 'rejected',
            'approved_by' => $admin->id,
            'rejection_reason' => $validated['rejection_reason'],
            'approved_at' => now(),
        ]);

        return back()->with('success', 'Ad rejected successfully.');
    }

    public function statistics(Ad $ad)
    {
        return Inertia::render('Admin/Ads/Statistics', [
            'ad' => $ad->load('campaign'),
        ]);
    }

    public function placements(Ad $ad)
    {
        return Inertia::render('Admin/Ads/Placements', [
            'ad' => $ad->load('campaign'),
        ]);
    }
}
