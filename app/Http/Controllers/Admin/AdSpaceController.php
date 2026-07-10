<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ad;
use App\Models\AdSpace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AdSpaceController extends Controller
{
    public function index(Request $request)
    {
        $query = AdSpace::with(['ad', 'campaign']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('placement_type', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%")
                    ->orWhereHas('ad', function ($q) use ($search) {
                        $q->where('title', 'like', "%{$search}%");
                    })
                    ->orWhereHas('campaign', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $adSpaces = $query->paginate($request->get('per_page', 15))
            ->withQueryString();

        return Inertia::render('Admin/AdSpaces/Index', [
            'adSpaces' => $adSpaces,
            'filters' => $request->only(['search', 'status', 'sort', 'direction']),
            'stats' => [
                'total' => AdSpace::count(),
                'active' => AdSpace::where('status', true)->count(),
                'inactive' => AdSpace::where('status', false)->count(),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/AdSpaces/Create', [
            'ads' => Ad::select('id', 'title', 'ad_campaign_id')->with('campaign:id,name')->orderBy('title')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ad_id' => 'required|exists:ads,id',
            'placement_type' => 'required|string|max:50',
            'position' => 'required|string|max:50',
            'width' => 'nullable|integer|min:0',
            'height' => 'nullable|integer|min:0',
            'price_per_impression' => 'nullable|numeric|min:0',
            'price_per_click' => 'nullable|numeric|min:0',
            'status' => 'boolean',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        $ad = Ad::findOrFail($validated['ad_id']);

        $validated['id'] = (string) Str::uuid();
        $validated['user_id'] = auth()->id();
        $validated['ad_campaign_id'] = $ad->ad_campaign_id;

        $adSpace = AdSpace::create($validated);

        return redirect()->route('admin.ad-spaces.show', $adSpace)
            ->with('success', 'Ad space created successfully.');
    }

    public function show(AdSpace $adSpace)
    {
        $adSpace->load(['ad', 'campaign']);

        return Inertia::render('Admin/AdSpaces/Show', [
            'adSpace' => $adSpace,
        ]);
    }

    public function edit(AdSpace $adSpace)
    {
        return Inertia::render('Admin/AdSpaces/Edit', [
            'adSpace' => $adSpace,
            'ads' => Ad::select('id', 'title', 'ad_campaign_id')->with('campaign:id,name')->orderBy('title')->get(),
        ]);
    }

    public function update(Request $request, AdSpace $adSpace)
    {
        $validated = $request->validate([
            'ad_id' => 'required|exists:ads,id',
            'placement_type' => 'required|string|max:50',
            'position' => 'required|string|max:50',
            'width' => 'nullable|integer|min:0',
            'height' => 'nullable|integer|min:0',
            'price_per_impression' => 'nullable|numeric|min:0',
            'price_per_click' => 'nullable|numeric|min:0',
            'status' => 'boolean',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        if ($validated['ad_id'] !== $adSpace->ad_id) {
            $ad = Ad::findOrFail($validated['ad_id']);
            $validated['ad_campaign_id'] = $ad->ad_campaign_id;
        }

        $adSpace->update($validated);

        return redirect()->route('admin.ad-spaces.show', $adSpace)
            ->with('success', 'Ad space updated successfully.');
    }

    public function destroy(AdSpace $adSpace)
    {
        $adSpace->delete();

        return redirect()->route('admin.ad-spaces.index')
            ->with('success', 'Ad space deleted successfully.');
    }

    public function toggleStatus(AdSpace $adSpace)
    {
        $adSpace->update(['status' => ! $adSpace->status]);

        return back()->with('success', 'Ad space status updated.');
    }

    public function updatePricing(Request $request, AdSpace $adSpace)
    {
        $validated = $request->validate([
            'price_per_impression' => 'nullable|numeric|min:0',
            'price_per_click' => 'nullable|numeric|min:0',
        ]);

        $adSpace->update($validated);

        return back()->with('success', 'Pricing updated successfully.');
    }
}
