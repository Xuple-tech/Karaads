<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdCampaign;
use App\Models\AdProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdCampaignController extends Controller
{
    public function index(Request $request)
    {
        $query = AdCampaign::with(['provider'])
            ->withCount(['ads']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('provider', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('company_name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('provider_id')) {
            $query->where('ad_provider_id', $request->provider_id);
        }

        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $campaigns = $query->paginate($request->get('per_page', 15))
            ->withQueryString();

        return Inertia::render('Admin/AdCampaigns/Index', [
            'campaigns' => $campaigns,
            'filters' => $request->only(['search', 'status', 'sort', 'direction', 'provider_id']),
            'stats' => [
                'total' => AdCampaign::count(),
                'active' => AdCampaign::where('status', AdCampaign::STATUS_ACTIVE)->count(),
                'paused' => AdCampaign::where('status', AdCampaign::STATUS_PAUSED)->count(),
                'completed' => AdCampaign::where('status', AdCampaign::STATUS_COMPLETED)->count(),
                'totalBudget' => AdCampaign::sum('budget'),
                'totalSpent' => AdCampaign::sum('spent'),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/AdCampaigns/Create', [
            'providers' => AdProvider::select('id', 'name', 'company_name')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ad_provider_id' => 'required|exists:ad_providers,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'budget' => 'required|numeric|min:0',
            'daily_budget' => 'nullable|numeric|min:0',
            'status' => 'required|in:active,paused,draft',
            'type' => 'required|in:cpm,cpc,cpa',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'bid_amount' => 'nullable|numeric|min:0',
            'targeting' => 'nullable|array',
        ]);

        $validated['id'] = (string) Str::uuid();
        $validated['spent'] = 0;

        $campaign = AdCampaign::create($validated);

        return redirect()->route('admin.ad-campaigns.show', $campaign)
            ->with('success', 'Campaign created successfully.');
    }

    public function show(AdCampaign $adCampaign)
    {
        $campaign = $adCampaign->load(['provider', 'ads' => function($q) {
            $q->latest()->limit(5);
        }]);

        return Inertia::render('Admin/AdCampaigns/Show', [
            'campaign' => $campaign,
            'stats' => [
                'adsCount' => $campaign->ads()->count(),
                'activeAdsCount' => $campaign->ads()->where('status', true)->count(),
                'spentPercentage' => $campaign->budget > 0 ? ($campaign->spent / $campaign->budget) * 100 : 0,
            ]
        ]);
    }

    public function edit(AdCampaign $adCampaign)
    {
        return Inertia::render('Admin/AdCampaigns/Edit', [
            'campaign' => $adCampaign,
            'providers' => AdProvider::select('id', 'name', 'company_name')->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, AdCampaign $adCampaign)
    {
        $validated = $request->validate([
            'ad_provider_id' => 'required|exists:ad_providers,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'budget' => 'required|numeric|min:0',
            'daily_budget' => 'nullable|numeric|min:0',
            'status' => 'required|in:active,paused,draft,completed',
            'type' => 'required|in:cpm,cpc,cpa',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'bid_amount' => 'nullable|numeric|min:0',
            'targeting' => 'nullable|array',
        ]);

        $adCampaign->update($validated);

        return redirect()->route('admin.ad-campaigns.show', $adCampaign)
            ->with('success', 'Campaign updated successfully.');
    }

    public function destroy(AdCampaign $adCampaign)
    {
        $adCampaign->delete();
        return redirect()->route('admin.ad-campaigns.index')
            ->with('success', 'Campaign deleted successfully.');
    }

    public function toggleStatus(AdCampaign $adCampaign)
    {
        $newStatus = $adCampaign->status === AdCampaign::STATUS_ACTIVE 
            ? AdCampaign::STATUS_PAUSED 
            : AdCampaign::STATUS_ACTIVE;
            
        $adCampaign->update(['status' => $newStatus]);

        return back()->with('success', 'Campaign status updated.');
    }

    public function updateBudget(Request $request, AdCampaign $adCampaign)
    {
        $validated = $request->validate([
            'budget' => 'required|numeric|min:' . $adCampaign->spent,
        ]);

        $adCampaign->update(['budget' => $validated['budget']]);

        return back()->with('success', 'Budget updated successfully.');
    }

    public function ads(AdCampaign $adCampaign)
    {
        $ads = $adCampaign->ads()->with('campaign')->latest()->paginate(15);
        
        return Inertia::render('Admin/AdCampaigns/Ads', [
            'campaign' => $adCampaign,
            'ads' => $ads,
        ]);
    }

    public function performance(AdCampaign $adCampaign)
    {
        // Placeholder for performance data
        // In a real app, this would query an analytics table
        return Inertia::render('Admin/AdCampaigns/Performance', [
            'campaign' => $adCampaign,
        ]);
    }
}
