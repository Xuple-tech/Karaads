<?php

namespace App\Http\Controllers\Admin\V2;

use App\Http\Controllers\Controller;
use App\Models\AdsV2\AdPlacement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdsPlacementController extends Controller
{
    public function index(): Response
    {
        $placements = AdPlacement::with('adapter')->latest()->paginate(30);

        return Inertia::render('Admin/V2/Ads/Placements/Index', [
            'placements' => $placements,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'surface' => 'required|in:feed,moments,profile',
            'slot' => 'required|string|max:100',
            'source_type' => 'required|in:internal,external,mixed',
            'status' => 'required|boolean',
            'adapter_id' => 'nullable|uuid|exists:ad_provider_adapters,id',
            'fallback_placement_id' => 'nullable|uuid|exists:ad_placements_v2,id',
            'constraints' => 'nullable|array',
        ]);

        AdPlacement::create($validated);

        return back()->with('success', 'Placement created.');
    }

    public function update(Request $request, AdPlacement $placement): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'surface' => 'sometimes|in:feed,moments,profile',
            'slot' => 'sometimes|string|max:100',
            'source_type' => 'sometimes|in:internal,external,mixed',
            'status' => 'sometimes|boolean',
            'adapter_id' => 'nullable|uuid|exists:ad_provider_adapters,id',
            'fallback_placement_id' => 'nullable|uuid|exists:ad_placements_v2,id',
            'constraints' => 'nullable|array',
        ]);

        $placement->update($validated);

        return back()->with('success', 'Placement updated.');
    }
}
