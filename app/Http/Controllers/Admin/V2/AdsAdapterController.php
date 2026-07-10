<?php

namespace App\Http\Controllers\Admin\V2;

use App\Http\Controllers\Controller;
use App\Models\AdsV2\AdProviderAdapter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdsAdapterController extends Controller
{
    public function index(): Response
    {
        $adapters = AdProviderAdapter::latest()->paginate(25);

        return Inertia::render('Admin/V2/Ads/Adapters/Index', [
            'adapters' => $adapters,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'provider_key' => 'required|string|max:255|unique:ad_provider_adapters,provider_key',
            'adapter_type' => 'required|in:script_tag,iframe_embed,server_response',
            'status' => 'required|in:active,inactive',
            'config' => 'nullable|array',
            'secrets' => 'nullable|array',
        ]);

        AdProviderAdapter::create($validated);

        return back()->with('success', 'Adapter created.');
    }

    public function update(Request $request, AdProviderAdapter $adapter): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'adapter_type' => 'sometimes|in:script_tag,iframe_embed,server_response',
            'status' => 'sometimes|in:active,inactive',
            'config' => 'nullable|array',
            'secrets' => 'nullable|array',
        ]);

        $adapter->update($validated);

        return back()->with('success', 'Adapter updated.');
    }
}
