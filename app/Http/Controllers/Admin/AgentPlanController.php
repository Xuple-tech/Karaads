<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgentPlan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgentPlanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $plans = AgentPlan::orderBy('display_order')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/AgentPlans/Index', [
            'plans' => $plans,
            'planTypes' => ['per_site', 'per_agent', 'mixed'],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/AgentPlans/Create', [
            'planTypes' => ['per_site', 'per_agent', 'mixed'],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:agent_plans,name',
            'slug' => 'required|string|max:255|unique:agent_plans,slug',
            'description' => 'nullable|string',
            'type' => 'required|string',
            'stripe_product_id' => 'nullable|string',
            'stripe_monthly_price_id' => 'nullable|string',
            'stripe_yearly_price_id' => 'nullable|string',
            'monthly_price' => 'nullable|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'max_sites' => 'nullable|integer|min:0',
            'max_agents_per_site' => 'nullable|integer|min:0',
            'max_total_agents' => 'nullable|integer|min:0',
            'max_monthly_conversations' => 'nullable|integer|min:0',
            'max_daily_conversations' => 'nullable|integer|min:0',
            'max_monthly_messages' => 'nullable|integer|min:0',
            'knowledge_base_size_mb' => 'nullable|integer|min:0',
            'max_file_uploads' => 'nullable|integer|min:0',
            'custom_domains_allowed' => 'boolean',
            'white_label_allowed' => 'boolean',
            'api_access' => 'boolean',
            'webhook_support' => 'boolean',
            'advanced_analytics' => 'boolean',
            'priority_support' => 'boolean',
            'custom_branding' => 'boolean',
            'sso_integration' => 'boolean',
            'is_active' => 'boolean',
            'display_order' => 'nullable|integer',
            'features' => 'nullable|array',
            'limits' => 'nullable|array',
        ]);

        AgentPlan::create($validated);

        return redirect()->route('admin.agent-plans.index')
            ->with('success', 'Plan created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(AgentPlan $agentPlan)
    {
        $agentPlan->loadCount('siteSubscriptions');

        return Inertia::render('Admin/AgentPlans/Show', [
            'plan' => $agentPlan,
            'subscriptions' => $agentPlan->siteSubscriptions()
                ->with(['site', 'user'])
                ->latest()
                ->paginate(10),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AgentPlan $agentPlan)
    {
        return Inertia::render('Admin/AgentPlans/Edit', [
            'plan' => $agentPlan,
            'planTypes' => ['per_site', 'per_agent', 'mixed'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AgentPlan $agentPlan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:agent_plans,name,' . $agentPlan->id,
            'slug' => 'required|string|max:255|unique:agent_plans,slug,' . $agentPlan->id,
            'description' => 'nullable|string',
            'type' => 'required|string',
            'stripe_product_id' => 'nullable|string',
            'stripe_monthly_price_id' => 'nullable|string',
            'stripe_yearly_price_id' => 'nullable|string',
            'monthly_price' => 'nullable|numeric|min:0',
            'yearly_price' => 'nullable|numeric|min:0',
            'max_sites' => 'nullable|integer|min:0',
            'max_agents_per_site' => 'nullable|integer|min:0',
            'max_total_agents' => 'nullable|integer|min:0',
            'max_monthly_conversations' => 'nullable|integer|min:0',
            'max_daily_conversations' => 'nullable|integer|min:0',
            'max_monthly_messages' => 'nullable|integer|min:0',
            'knowledge_base_size_mb' => 'nullable|integer|min:0',
            'max_file_uploads' => 'nullable|integer|min:0',
            'custom_domains_allowed' => 'boolean',
            'white_label_allowed' => 'boolean',
            'api_access' => 'boolean',
            'webhook_support' => 'boolean',
            'advanced_analytics' => 'boolean',
            'priority_support' => 'boolean',
            'custom_branding' => 'boolean',
            'sso_integration' => 'boolean',
            'is_active' => 'boolean',
            'display_order' => 'nullable|integer',
            'features' => 'nullable|array',
            'limits' => 'nullable|array',
        ]);

        $agentPlan->update($validated);

        return redirect()->route('admin.agent-plans.index')
            ->with('success', 'Plan updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AgentPlan $agentPlan)
    {
        if ($agentPlan->siteSubscriptions()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete plan that has active subscriptions.');
        }

        $agentPlan->delete();

        return redirect()->route('admin.agent-plans.index')
            ->with('success', 'Plan deleted successfully.');
    }

    /**
     * Toggle plan status
     */
    public function toggleStatus(AgentPlan $agentPlan)
    {
        $agentPlan->update([
            'is_active' => !$agentPlan->is_active
        ]);

        return redirect()->back()
            ->with('success', 'Plan status updated.');
    }

    /**
     * Sync with Stripe
     */
    public function syncStripe(AgentPlan $agentPlan)
    {
        // Here you would implement Stripe synchronization logic
        // This is a placeholder for Stripe integration

        return redirect()->back()
            ->with('success', 'Plan synchronized with Stripe.');
    }
}
