<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Site;
use App\Models\User;
use App\Models\SiteSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SiteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Site::with(['user', 'activeSubscriptionRelation.plan']);

        if ($request->has('user_id') && !empty($request->user_id)) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('site_type') && !empty($request->site_type)) {
            $query->where('site_type', $request->site_type);
        }

        if ($request->has('is_active') && !empty($request->is_active)) {
            $query->where('is_active', $request->is_active === 'true');
        }

        if ($request->has('widget_enabled') && !empty($request->widget_enabled)) {
            $query->where('widget_enabled', $request->widget_enabled === 'true');
        }

        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('domain', 'like', '%' . $request->search . '%')
                  ->orWhere('url', 'like', '%' . $request->search . '%');
            });
        }

        $sites = $query->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/Sites/Index', [
            'sites' => $sites,
            'filters' => $request->only(['search', 'user_id', 'site_type', 'is_active', 'widget_enabled']),
            'users' => User::select('id', 'name', 'email')->get(),
            'siteTypes' => ['website', 'web_app', 'mobile_app', 'ecommerce', 'saas'],
            'industries' => [
                'retail', 'technology', 'healthcare', 'education', 'finance',
                'hospitality', 'real_estate', 'marketing', 'consulting', 'other'
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/Sites/Create', [
            'users' => User::select('id', 'name', 'email')->get(),
            'siteTypes' => ['website', 'web_app', 'mobile_app', 'ecommerce', 'saas'],
            'industries' => [
                'retail', 'technology', 'healthcare', 'education', 'finance',
                'hospitality', 'real_estate', 'marketing', 'consulting', 'other'
            ],
            'timezones' => \DateTimeZone::listIdentifiers(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'domain' => 'required|string|max:255|unique:sites,domain',
            'subdomain' => 'nullable|string|max:255|unique:sites,subdomain',
            'url' => 'required|url',
            'site_type' => 'required|string',
            'industry' => 'nullable|string',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|url',
            'favicon_url' => 'nullable|url',
            'primary_color' => 'nullable|string|size:7',
            'secondary_color' => 'nullable|string|size:7',
            'language' => 'nullable|string|size:2',
            'timezone' => 'nullable|string',
            'is_active' => 'boolean',
            'widget_enabled' => 'boolean',
            'max_agents' => 'nullable|integer|min:1',
            'site_settings' => 'nullable|array',
            'metadata' => 'nullable|array',
        ]);

        // Generate verification token
        $validated['verification_token'] = Str::random(64);
        $validated['current_agents_count'] = 0;

        $site = Site::create($validated);

        // Create default subscription if user doesn't have one
        $this->createDefaultSubscription($site);

        return redirect()->route('admin.sites.show', $site)
            ->with('success', 'Site created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Site $site)
    {
        $site->load([
            'user',
            'agents' => function ($query) {
                $query->orderBy('created_at', 'desc')->limit(10);
            },
            'subscriptions' => function ($query) {
                $query->with('plan')->orderBy('created_at', 'desc');
            },
        ]);

        $stats = [
            'total_agents' => $site->agents()->count(),
            'active_agents' => $site->agents()->where('is_active', true)->count(),
            'total_conversations' => DB::table('agent_conversations')
                ->whereIn('agent_id', $site->agents()->pluck('id'))
                ->count(),
            'subscription_status' => $site->activeSubscription() ? $site->activeSubscription()->status : 'none',
        ];

        return Inertia::render('Admin/Sites/Show', [
            'site' => $site,
            'stats' => $stats,
            'recent_activity' => $this->getRecentActivity($site),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Site $site)
    {
        $site->load(['user', 'activeSubscription']);

        return Inertia::render('Admin/Sites/Edit', [
            'site' => $site,
            'users' => User::select('id', 'name', 'email')->get(),
            'siteTypes' => ['website', 'web_app', 'mobile_app', 'ecommerce', 'saas'],
            'industries' => [
                'retail', 'technology', 'healthcare', 'education', 'finance',
                'hospitality', 'real_estate', 'marketing', 'consulting', 'other'
            ],
            'timezones' => \DateTimeZone::listIdentifiers(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Site $site)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'domain' => 'required|string|max:255|unique:sites,domain,' . $site->id,
            'subdomain' => 'nullable|string|max:255|unique:sites,subdomain,' . $site->id,
            'url' => 'required|url',
            'site_type' => 'required|string',
            'industry' => 'nullable|string',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|url',
            'favicon_url' => 'nullable|url',
            'primary_color' => 'nullable|string|size:7',
            'secondary_color' => 'nullable|string|size:7',
            'language' => 'nullable|string|size:2',
            'timezone' => 'nullable|string',
            'is_active' => 'boolean',
            'widget_enabled' => 'boolean',
            'max_agents' => 'nullable|integer|min:1',
            'site_settings' => 'nullable|array',
            'metadata' => 'nullable|array',
        ]);

        $site->update($validated);

        return redirect()->route('admin.sites.show', $site)
            ->with('success', 'Site updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Site $site)
    {
        // Check if site has agents
        if ($site->agents()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete site that has agents. Delete agents first.');
        }

        $site->delete();

        return redirect()->route('admin.sites.index')
            ->with('success', 'Site deleted successfully.');
    }

    /**
     * Toggle site status
     */
    public function toggleStatus(Site $site)
    {
        $site->update([
            'is_active' => !$site->is_active
        ]);

        // Also toggle all agents' status
        $site->agents()->update(['is_active' => $site->is_active]);

        return redirect()->back()
            ->with('success', 'Site status updated.');
    }

    /**
     * Toggle widget status
     */
    public function toggleWidget(Site $site)
    {
        $site->update([
            'widget_enabled' => !$site->widget_enabled
        ]);

        return redirect()->back()
            ->with('success', 'Widget status updated.');
    }

    /**
     * Verify site
     */
    public function verify(Site $site)
    {
        $site->update([
            'verified_at' => now(),
            'verification_token' => null,
        ]);

        return redirect()->back()
            ->with('success', 'Site verified successfully.');
    }

    /**
     * Resend verification
     */
    public function resendVerification(Site $site)
    {
        // Generate new token
        $site->update([
            'verification_token' => Str::random(64),
            'verified_at' => null,
        ]);

        // Here you would send verification email
        // This is a placeholder for email sending

        return redirect()->back()
            ->with('success', 'Verification email sent.');
    }

    /**
     * Get embed code for site
     */
    public function embedCode(Site $site)
    {
        $code = <<<HTML
<!-- Kwati AI Widget for {$site->name} -->
<script>
    (function() {
        var kwatiWidget = document.createElement('script');
        kwatiWidget.src = 'https://widget.kwati.ai/embed.js?site={$site->id}';
        kwatiWidget.async = true;
        document.head.appendChild(kwatiWidget);
    })();
</script>
<!-- End Kwati AI Widget -->
HTML;

        return response($code)
            ->header('Content-Type', 'text/plain');
    }

    /**
     * Site analytics
     */
    public function analytics(Site $site)
    {
        $site->load(['agents', 'subscriptions.plan']);

        // Get usage statistics for the last 30 days
        $usageStats = DB::table('agent_usage_stats')
            ->whereIn('agent_id', $site->agents()->pluck('id'))
            ->where('date', '>=', now()->subDays(30))
            ->selectRaw('DATE(date) as day,
                        SUM(conversations_count) as conversations,
                        SUM(messages_count) as messages,
                        AVG(avg_response_time) as avg_response_time')
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        // Get top agents by conversations
        $topAgents = $site->agents()
            ->withCount(['conversations' => function ($query) {
                $query->where('created_at', '>=', now()->subDays(30));
            }])
            ->orderBy('conversations_count', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Admin/Sites/Analytics', [
            'site' => $site,
            'usageStats' => $usageStats,
            'topAgents' => $topAgents,
            'timeRange' => '30d',
        ]);
    }

    /**
     * Create default subscription for site
     */
    private function createDefaultSubscription(Site $site)
    {
        $freePlan = \App\Models\AgentPlan::getFreePlan();

        if ($freePlan && !$site->subscriptions()->exists()) {
            SiteSubscription::create([
                'site_id' => $site->id,
                'plan_id' => $freePlan->id,
                'user_id' => $site->user_id,
                'status' => 'active',
                'billing_cycle' => 'monthly',
                'price' => 0,
                'currency' => 'USD',
                'starts_at' => now(),
                'expires_at' => null,
            ]);
        }
    }

    /**
     * Get recent activity for site
     */
    private function getRecentActivity(Site $site)
    {
        $activities = [];

        // Recent agents created
        $recentAgents = $site->agents()
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentAgents as $agent) {
            $activities[] = [
                'type' => 'agent_created',
                'title' => "Agent created: {$agent->name}",
                'time' => $agent->created_at->diffForHumans(),
                'icon' => 'Bot',
            ];
        }

        // Recent conversations
        $recentConversations = DB::table('agent_conversations')
            ->whereIn('agent_id', $site->agents()->pluck('id'))
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        foreach ($recentConversations as $conversation) {
            $activities[] = [
                'type' => 'conversation_started',
                'title' => "New conversation started",
                'time' => \Carbon\Carbon::parse($conversation->created_at)->diffForHumans(),
                'icon' => 'MessageSquare',
            ];
        }

        // Sort by time
        usort($activities, function ($a, $b) {
            return strtotime($b['time']) - strtotime($a['time']);
        });

        return array_slice($activities, 0, 10);
    }
}
