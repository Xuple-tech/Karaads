<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Site;
use App\Models\AgentPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class SiteController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $sites = $user->sites()
            ->with(['activeSubscriptionRelation.plan'])
            ->latest()
            ->paginate(15);

        return Inertia::render('User/Sites/Index', [
            'sites' => $sites,
        ]);
    }

    public function create()
    {
        return Inertia::render('User/Sites/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'domain' => 'nullable|url',
            'url' => 'required|url',
            'site_type' => 'required|in:website,web_app,mobile_app,ecommerce,saas',
            'industry' => 'nullable|string|max:100',
            'description' => 'nullable|string',
        ]);

        $user = $request->user();

        // Check if user can create more sites based on subscription
        $activeSubscription = $user->activeSubscription();
        // $maxSites = $activeSubscription ? $activeSubscription->plan->max_sites : 1;
        $maxSites = 3;
        if ($user->sites()->count() >= $maxSites) {
            return back()->withErrors(['limit' => 'You have reached the maximum number of sites allowed by your plan.']);
        }

        $site = $user->sites()->create([
            'name' => $request->name,
            'domain' => $request->domain,
            'url' => $request->url,
            'subdomain' => $this->generateSubdomain($request->name),
            'site_type' => $request->site_type,
            'industry' => $request->industry,
            'description' => $request->description,
            'is_active' => true,
            'verification_token' => Str::random(60),
        ]);

        return redirect()->route('user.sites.show', $site)->with('success', 'Site created successfully.');
    }

    public function show(Site $site, Request $request)
    {
        // $this->authorize('view', $site);

        $site->load(['agents', 'activeSubscriptionRelation.plan']);

        $agents = $site->agents()
            ->with(['widgetSettings', 'usageStats' => function($query) {
                $query->orderBy('date', 'desc')->take(7);
            }])
            ->paginate(10);

        return Inertia::render('User/Sites/Show', [
            'site' => $site,
            'agents' => $agents,
        ]);
    }

    public function edit(Site $site, Request $request)
    {
        // $this->authorize('update', $site);

        return Inertia::render('User/Sites/Edit', [
            'site' => $site,
        ]);
    }

    public function update(Request $request, Site $site)
    {
        // $this->authorize('update', $site);

        $request->validate([
            'name' => 'required|string|max:255',
            'domain' => 'nullable|url',
            'url' => 'required|url',
            'site_type' => 'required|in:website,web_app,mobile_app,ecommerce,saas',
            'industry' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'primary_color' => 'nullable|string|max:7',
            'secondary_color' => 'nullable|string|max:7',
        ]);

        $site->update($request->only([
            'name', 'domain', 'url', 'site_type', 'industry', 'description',
            'primary_color', 'secondary_color'
        ]));

        return redirect()->route('user.sites.show', $site)->with('success', 'Site updated successfully.');
    }

    public function destroy(Site $site, Request $request)
    {
        // $this->authorize('delete', $site);

        // Check if site has agents
        if ($site->agents()->count() > 0) {
            return back()->withErrors(['agents' => 'Cannot delete site with active agents. Please delete all agents first.']);
        }

        $site->delete();

        return redirect()->route('user.sites.index')->with('success', 'Site deleted successfully.');
    }

    public function verify(Request $request, Site $site)
    {
        // $this->authorize('update', $site);

        // In a real app, you would implement site verification logic here
        // For now, we'll just mark it as verified
        $site->update([
            'verified_at' => now(),
        ]);

        return back()->with('success', 'Site verification initiated.');
    }

    public function toggleWidget(Request $request, Site $site)
    {
        // $this->authorize('update', $site);

        $site->update([
            'widget_enabled' => !$site->widget_enabled,
        ]);

        return back()->with('success', 'Widget ' . ($site->widget_enabled ? 'enabled' : 'disabled') . ' successfully.');
    }

    public function agents(Site $site, Request $request)
    {
        // $this->authorize('view', $site);

        $agents = $site->agents()
            ->with(['widgetSettings', 'conversations' => function($query) {
                $query->where('status', 'active')->count();
            }])
            ->paginate(20);

        return Inertia::render('User/Sites/Agents', [
            'site' => $site,
            'agents' => $agents,
        ]);
    }

    private function generateSubdomain($name)
    {
        $slug = Str::slug($name);
        $uniqueSlug = $slug;
        $counter = 1;

        while (Site::where('subdomain', $uniqueSlug)->exists()) {
            $uniqueSlug = $slug . '-' . $counter;
            $counter++;
        }

        return $uniqueSlug;
    }
}
