<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdProviderController extends Controller
{
    public function index(Request $request)
    {
        $query = AdProvider::withCount(['campaigns', 'ads'])
            ->withSum('campaigns', 'budget')
            ->withSum('campaigns', 'spent');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('contact_email', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $providers = $query->paginate($request->get('per_page', 15))
            ->withQueryString();

        return Inertia::render('Admin/AdProviders/Index', [
            'providers' => $providers,
            'filters' => $request->only(['search', 'status', 'sort', 'direction']),
            'stats' => [
                'total' => AdProvider::count(),
                'active' => AdProvider::where('status', true)->count(),
                'inactive' => AdProvider::where('status', false)->count(),
                'totalBalance' => AdProvider::sum('balance'),
                'totalSpent' => AdProvider::sum('total_spent'),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/AdProviders/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'contact_email' => 'required|email|unique:ad_providers,contact_email',
            'contact_phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'status' => 'boolean',
            'balance' => 'numeric|min:0',
            'payment_method' => 'nullable|string|max:50',
            'payment_details' => 'nullable|array',
            'min_budget' => 'numeric|min:0',
            'max_budget' => 'numeric|min:0|gte:min_budget',
            'targeting_options' => 'nullable|array',
        ]);

        $validated['id'] = (string) Str::uuid();
        $validated['api_key'] = Str::random(32);
        $validated['secret_key'] = Str::random(64);

        $provider = AdProvider::create($validated);

        return redirect()->route('admin.ad-providers.show', $provider)
            ->with('success', 'Ad provider created successfully.');
    }

    public function show(AdProvider $adProvider)
    {
        $provider = $adProvider->load([
            'campaigns' => function ($query) {
                $query->latest()->limit(10);
            },
            'ads' => function ($query) {
                $query->latest()->limit(10);
            },
        ]);

        $stats = [
            'totalCampaigns' => $adProvider->campaigns()->count(),
            'activeCampaigns' => $adProvider->campaigns()->where('status', 'active')->count(),
            'totalAds' => $adProvider->ads()->count(),
            'activeAds' => $adProvider->ads()->where('status', true)->count(),
            'totalSpent' => $adProvider->campaigns()->sum('spent'),
            'remainingBalance' => $adProvider->balance,
            'averageCPM' => $adProvider->ads()->avg('total_spent') / max(1, $adProvider->ads()->sum('impressions') / 1000),
            'averageCTR' => $adProvider->ads()->avg('ctr'),
        ];

        $performanceData = $this->getProviderPerformanceData($adProvider);

        return Inertia::render('Admin/AdProviders/Show', [
            'provider' => $provider,
            'stats' => $stats,
            'performanceData' => $performanceData,
        ]);
    }

    public function edit(AdProvider $adProvider)
    {
        return Inertia::render('Admin/AdProviders/Edit', [
            'provider' => $adProvider,
        ]);
    }

    public function update(Request $request, AdProvider $adProvider)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'contact_email' => 'required|email|unique:ad_providers,contact_email,'.$adProvider->id,
            'contact_phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'status' => 'boolean',
            'payment_method' => 'nullable|string|max:50',
            'payment_details' => 'nullable|array',
            'min_budget' => 'numeric|min:0',
            'max_budget' => 'numeric|min:0|gte:min_budget',
            'targeting_options' => 'nullable|array',
        ]);

        $adProvider->update($validated);

        return redirect()->route('admin.ad-providers.show', $adProvider)
            ->with('success', 'Ad provider updated successfully.');
    }

    public function destroy(AdProvider $adProvider)
    {
        if ($adProvider->campaigns()->where('status', 'active')->exists()) {
            return back()->with('error', 'Cannot delete provider with active campaigns.');
        }

        $adProvider->delete();

        return redirect()->route('admin.ad-providers.index')
            ->with('success', 'Ad provider deleted successfully.');
    }

    public function toggleStatus(AdProvider $adProvider)
    {
        $adProvider->update(['status' => ! $adProvider->status]);

        $status = $adProvider->status ? 'activated' : 'deactivated';

        return back()->with('success', "Ad provider {$status} successfully.");
    }

    public function addBalance(Request $request, AdProvider $adProvider)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($adProvider, $request) {
            $adProvider->increment('balance', $request->amount);
        });

        return back()->with('success', 'Balance added successfully. New balance: $'.number_format($adProvider->balance, 2));
    }

    public function campaigns(AdProvider $adProvider)
    {
        $campaigns = $adProvider->campaigns()
            ->with(['ads' => function ($query) {
                $query->select('id', 'ad_campaign_id', 'title', 'status', 'impressions', 'clicks', 'total_spent');
            }])
            ->withSum('ads', 'impressions')
            ->withSum('ads', 'clicks')
            ->withSum('ads', 'total_spent')
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/AdProviders/Campaigns', [
            'provider' => $adProvider,
            'campaigns' => $campaigns,
        ]);
    }

    public function analytics(AdProvider $adProvider)
    {
        $analytics = [
            'dailyImpressions' => $this->getDailyStats($adProvider, 'impressions'),
            'dailyClicks' => $this->getDailyStats($adProvider, 'clicks'),
            'campaignPerformance' => $this->getCampaignPerformance($adProvider),
            'adPerformance' => $this->getAdPerformance($adProvider),
            'revenueTrend' => $this->getRevenueTrend($adProvider),
        ];

        return Inertia::render('Admin/AdProviders/Analytics', [
            'provider' => $adProvider,
            'analytics' => $analytics,
        ]);
    }

    private function getProviderPerformanceData(AdProvider $provider)
    {
        $data = [];
        for ($i = 30; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $impressions = $provider->ads()
                ->whereDate('created_at', '<=', $date)
                ->sum('impressions');
            $clicks = $provider->ads()
                ->whereDate('created_at', '<=', $date)
                ->sum('clicks');
            $spent = $provider->campaigns()
                ->whereDate('created_at', '<=', $date)
                ->sum('spent');

            $data[] = [
                'date' => $date,
                'impressions' => $impressions,
                'clicks' => $clicks,
                'spent' => (float) $spent,
                'ctr' => $impressions > 0 ? ($clicks / $impressions) * 100 : 0,
                'cpm' => $impressions > 0 ? ($spent / $impressions) * 1000 : 0,
            ];
        }

        return $data;
    }

    private function getDailyStats(AdProvider $provider, $metric)
    {
        $stats = [];
        for ($i = 7; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $value = $provider->ads()
                ->whereDate('created_at', $date)
                ->sum($metric);
            $stats[] = [
                'date' => $date,
                'value' => (int) $value,
            ];
        }

        return $stats;
    }

    private function getCampaignPerformance(AdProvider $provider)
    {
        return $provider->campaigns()
            ->select('id', 'name', 'status', 'budget', 'spent', 'start_date', 'end_date')
            ->withSum('ads', 'impressions')
            ->withSum('ads', 'clicks')
            ->orderBy('spent', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($campaign) {
                return [
                    'id' => $campaign->id,
                    'name' => $campaign->name,
                    'status' => $campaign->status,
                    'budget' => (float) $campaign->budget,
                    'spent' => (float) $campaign->spent,
                    'impressions' => (int) $campaign->ads_sum_impressions,
                    'clicks' => (int) $campaign->ads_sum_clicks,
                    'ctr' => $campaign->ads_sum_impressions > 0
                        ? ($campaign->ads_sum_clicks / $campaign->ads_sum_impressions) * 100
                        : 0,
                    'roi' => $campaign->spent > 0
                        ? (($campaign->budget - $campaign->spent) / $campaign->spent) * 100
                        : 0,
                ];
            });
    }

    private function getAdPerformance(AdProvider $provider)
    {
        return $provider->ads()
            ->select('id', 'title', 'status', 'impressions', 'clicks', 'total_spent', 'created_at')
            ->orderBy('total_spent', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($ad) {
                return [
                    'id' => $ad->id,
                    'title' => $ad->title,
                    'status' => $ad->status,
                    'impressions' => $ad->impressions,
                    'clicks' => $ad->clicks,
                    'total_spent' => (float) $ad->total_spent,
                    'ctr' => $ad->impressions > 0 ? ($ad->clicks / $ad->impressions) * 100 : 0,
                    'cpc' => $ad->clicks > 0 ? $ad->total_spent / $ad->clicks : 0,
                    'cpm' => $ad->impressions > 0 ? ($ad->total_spent / $ad->impressions) * 1000 : 0,
                ];
            });
    }

    private function getRevenueTrend(AdProvider $provider)
    {
        $trend = [];
        for ($i = 30; $i >= 0; $i--) {
            $date = now()->subDays($i)->toDateString();
            $spent = $provider->campaigns()
                ->whereDate('created_at', $date)
                ->sum('spent');
            $trend[] = [
                'date' => $date,
                'spent' => (float) $spent,
            ];
        }

        return $trend;
    }
}
