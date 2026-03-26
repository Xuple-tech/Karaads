<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AIAgent;
use App\Models\Site;
use App\Models\AgentTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class AIAgentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $agents = $user->aiAgents()
            ->with(['site', 'widgetSettings'])
            ->latest()
            ->paginate(20);

        $trialInfo = [
            'isOnTrial' => $user->isOnTrial(),
            'hasTrialExpired' => $user->hasTrialExpired(),
            'daysRemaining' => $user->getTrialDaysRemaining(),
            'agentQuota' => $user->getAgentCreationQuota(),
            'remainingQuota' => $user->getRemainingAgentQuota(),
        ];

        return Inertia::render('User/Agents/Index', [
            'agents' => $agents,
            'trial' => $trialInfo,
        ]);
    }

    public function create(Request $request)
    {
        $user = $request->user();

        $sites = $user->sites()
            ->where('is_active', true)
            ->get();

        $templates = AgentTemplate::where('is_active', true)
            ->orderBy('is_premium', 'desc')
            ->orderBy('name')
            ->get();

        $trialInfo = [
            'isOnTrial' => $user->isOnTrial(),
            'hasTrialExpired' => $user->hasTrialExpired(),
            'daysRemaining' => $user->getTrialDaysRemaining(),
            'agentQuota' => $user->getAgentCreationQuota(),
            'remainingQuota' => $user->getRemainingAgentQuota(),
            'canCreateAgents' => $user->canCreateAgents(),
        ];

        return Inertia::render('User/Agents/Create', [
            'sites' => $sites,
            'templates' => $templates,
            'trial' => $trialInfo,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'site_id' => 'required|exists:sites,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'agent_type' => 'required|in:widget,api,full_site,mobile_app',
            'behavior_profile' => 'nullable|string',
            'welcome_message' => 'nullable|string',
            'primary_color' => 'nullable|string|max:7',
            'secondary_color' => 'nullable|string|max:7',
            'template_id' => 'nullable|exists:agent_templates,id',
        ]);

        $user = $request->user();
        $site = Site::findOrFail($request->site_id);

        // Check if user owns the site
        if ($site->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        // Check trial status
        if (!$user->canCreateAgents()) {
            if ($user->hasTrialExpired()) {
                return back()->withErrors([
                    'trial' => 'Your free trial has expired. Please upgrade to a paid plan to continue creating agents.'
                ])->with('redirect_to_pricing', true);
            }
            return back()->withErrors([
                'trial' => 'You don\'t have access to create agents. Please check your subscription status.'
            ]);
        }

        // Check agent quota
        if ($user->getRemainingAgentQuota() <= 0) {
            return back()->withErrors([
                'limit' => 'You have reached the maximum number of agents (' . $user->getAgentCreationQuota() . ') allowed in your plan. Please upgrade to create more agents.'
            ])->with('redirect_to_pricing', true);
        }

        // Check if site can add more agents
        if (!$site->canAddMoreAgents()) {
            return back()->withErrors(['limit' => 'This site has reached the maximum number of agents allowed by the current plan.']);
        }

        $agentData = [
            'user_id' => $user->id,
            'site_id' => $site->id,
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . Str::random(6),
            'description' => $request->description,
            'agent_type' => $request->agent_type,
            'behavior_profile' => $request->behavior_profile,
            'welcome_message' => $request->welcome_message,
            'primary_color' => $request->primary_color,
            'secondary_color' => $request->secondary_color,
            'is_active' => true,
            'default_language' => 'en',
            'supported_languages' => ['en'],
            'widget_position' => 'bottom-right',
            'template_id' => $request->template_id,
        ];

        // Apply template if selected
        if ($request->template_id) {
            $template = AgentTemplate::find($request->template_id);
            if ($template) {
                $agentData = array_merge($agentData, $template->default_config ?? []);
                $agentData['welcome_message'] = $template->welcome_message ?? $agentData['welcome_message'];
            }
        }

        $agent = AIAgent::create($agentData);

        // Update site agent count
        $site->increment('current_agents_count');

        return redirect()->route('user.agents.show', $agent)->with('success', 'AI Agent created successfully.');
    }

    public function show(AIAgent $agent, Request $request)
    {
        // $this->authorize('view', $agent);

        $agent->load([
            'site',
            'widgetSettings',
            'tools' => function($query) {
                $query->where('is_active', true)->orderBy('order');
            },
            'knowledgeBase' => function($query) {
                $query->where('is_active', true)->orderBy('order');
            },
            'apiKeys' => function($query) {
                $query->where('is_active', true);
            },
        ]);

        // Get recent conversations
        $recentConversations = $agent->conversations()
            ->with(['messages' => function($query) {
                $query->latest()->take(5);
            }])
            ->latest()
            ->take(10)
            ->get();

        // Get usage stats
        $usageStats = $agent->usageStats()
            ->orderBy('date', 'desc')
            ->take(30)
            ->get();

        return Inertia::render('User/Agents/Show', [
            'agent' => $agent,
            'recentConversations' => $recentConversations,
            'usageStats' => $usageStats,
        ]);
    }

    public function edit(AIAgent $agent, Request $request)
    {
        // $this->authorize('update', $agent);

        $agent->load(['site']);

        return Inertia::render('User/Agents/Edit', [
            'agent' => $agent,
        ]);
    }

    public function update(Request $request, AIAgent $agent)
    {
        // $this->authorize('update', $agent);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'behavior_profile' => 'nullable|string',
            'welcome_message' => 'required|string',
            'primary_color' => 'nullable|string|max:7',
            'secondary_color' => 'nullable|string|max:7',
            'widget_position' => 'required|in:bottom-right,bottom-left,center,custom',
            'default_language' => 'required|string|max:10',
            'supported_languages' => 'nullable|array',
            'knowledge_base_enabled' => 'boolean',
            'web_search_enabled' => 'boolean',
            'file_upload_enabled' => 'boolean',
            'voice_enabled' => 'boolean',
        ]);

        $agent->update($request->only([
            'name', 'description', 'behavior_profile', 'welcome_message',
            'primary_color', 'secondary_color', 'widget_position',
            'default_language', 'knowledge_base_enabled', 'web_search_enabled',
            'file_upload_enabled', 'voice_enabled',
        ]) + [
            'supported_languages' => $request->supported_languages ?? ['en'],
        ]);

        return redirect()->route('user.agents.show', $agent)->with('success', 'Agent updated successfully.');
    }

    public function destroy(AIAgent $agent, Request $request)
    {
        // $this->authorize('delete', $agent);

        // Update site agent count
        $agent->site()->decrement('current_agents_count');

        $agent->delete();

        return redirect()->route('user.agents.index')->with('success', 'Agent deleted successfully.');
    }

    public function toggleActive(Request $request, AIAgent $agent)
    {
        // $this->authorize('update', $agent);

        $agent->update([
            'is_active' => !$agent->is_active,
        ]);

        return back()->with('success', 'Agent ' . ($agent->is_active ? 'activated' : 'deactivated') . ' successfully.');
    }

    public function duplicate(Request $request, AIAgent $agent)
    {
        // $this->authorize('view', $agent);

        // Check if site can add more agents
        $site = $agent->site;
        if (!$site->canAddMoreAgents()) {
            return back()->withErrors(['limit' => 'This site has reached the maximum number of agents allowed by the current plan.']);
        }

        $newAgent = $agent->replicate();
        $newAgent->name = $agent->name . ' (Copy)';
        $newAgent->slug = Str::slug($newAgent->name) . '-' . Str::random(6);
        $newAgent->save();

        // Duplicate tools
        foreach ($agent->tools as $tool) {
            $newTool = $tool->replicate();
            $newTool->agent_id = $newAgent->id;
            $newTool->save();
        }

        // Duplicate knowledge base
        foreach ($agent->knowledgeBase as $knowledge) {
            $newKnowledge = $knowledge->replicate();
            $newKnowledge->agent_id = $newAgent->id;
            $newKnowledge->save();
        }

        // Update site agent count
        $site->increment('current_agents_count');

        return redirect()->route('user.agents.show', $newAgent)->with('success', 'Agent duplicated successfully.');
    }
}
