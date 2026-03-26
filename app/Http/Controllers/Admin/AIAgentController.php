<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AIAgent;
use App\Models\User;
use App\Models\Site;
use App\Models\AgentTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AIAgentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = AIAgent::with(['user', 'site']);

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('site_id')) {
            $query->where('site_id', $request->site_id);
        }

        if ($request->has('agent_type')) {
            $query->where('agent_type', $request->agent_type);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active === 'true');
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $agents = $query->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/AIAgents/Index', [
            'agents' => $agents,
            'filters' => $request->only(['search', 'user_id', 'site_id', 'agent_type', 'is_active']),
            'users' => User::select('id', 'name', 'email')->get(),
            'sites' => Site::select('id', 'name', 'domain')->where('is_active', true)->get(),
            'agentTypes' => ['widget', 'api', 'full_site', 'mobile_app'],
            'widgetPositions' => ['bottom-right', 'bottom-left', 'center', 'custom'],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/AIAgents/Create', [
            'users' => User::select('id', 'name', 'email')->get(),
            'sites' => Site::select('id', 'name', 'domain')->where('is_active', true)->get(),
            'templates' => AgentTemplate::select('id', 'name')->where('is_active', true)->get(),
            'agentTypes' => ['widget', 'api', 'full_site', 'mobile_app'],
            'widgetPositions' => ['bottom-right', 'bottom-left', 'center', 'custom'],
            'languages' => ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'site_id' => 'nullable|exists:sites,id',
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:ai_agents,slug',
            'description' => 'nullable|string',
            'agent_type' => 'required|string',
            'behavior_profile' => 'nullable|string',
            'welcome_message' => 'nullable|string',
            'primary_color' => 'nullable|string|size:7',
            'secondary_color' => 'nullable|string|size:7',
            'logo_url' => 'nullable|url',
            'is_active' => 'boolean',
            'max_context_length' => 'nullable|integer|min:100|max:8000',
            'response_temperature' => 'nullable|numeric|min:0|max:2',
            'knowledge_base_enabled' => 'boolean',
            'web_search_enabled' => 'boolean',
            'file_upload_enabled' => 'boolean',
            'voice_enabled' => 'boolean',
            'default_language' => 'nullable|string|size:2',
            'supported_languages' => 'nullable|array',
            'working_hours' => 'nullable|array',
            'offline_message' => 'nullable|string',
            'widget_position' => 'nullable|string',
            'widget_icon' => 'nullable|string',
            'template_id' => 'nullable|exists:agent_templates,id',
            'custom_css' => 'nullable|string',
            'custom_js' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        // Set created_by_admin flag
        $validated['created_by_admin'] = true;

        $agent = AIAgent::create($validated);

        // If template is selected, apply template settings
        if ($request->template_id) {
            $this->applyTemplate($agent, $request->template_id);
        }

        return redirect()->route('admin.ai-agents.show', $agent)
            ->with('success', 'AI Agent created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(AIAgent $aiAgent)
    {
        $aiAgent->load([
            'user',
            'site',
            'conversations' => function ($query) {
                $query->latest()->limit(10);
            },
            'knowledgeBase' => function ($query) {
                $query->where('is_active', true)->limit(10);
            },
            'tools' => function ($query) {
                $query->where('is_active', true);
            },
            'widgetSettings',
            'apiKeys' => function ($query) {
                $query->where('is_active', true);
            },
            'usageStats' => function ($query) {
                $query->latest()->limit(30);
            },
        ]);

        return Inertia::render('Admin/AIAgents/Show', [
            'agent' => $aiAgent,
            'stats' => [
                'total_conversations' => $aiAgent->conversations()->count(),
                'total_messages' => $aiAgent->conversations()->withCount('messages')->get()->sum('messages_count'),
                'active_users' => $aiAgent->conversations()->distinct('user_id')->count('user_id'),
                'knowledge_base_items' => $aiAgent->knowledgeBase()->count(),
                'active_tools' => $aiAgent->tools()->where('is_active', true)->count(),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AIAgent $aiAgent)
    {
        $aiAgent->load(['user', 'site']);

        return Inertia::render('Admin/AIAgents/Edit', [
            'agent' => $aiAgent,
            'users' => User::select('id', 'name', 'email')->get(),
            'sites' => Site::select('id', 'name', 'domain')->where('is_active', true)->get(),
            'templates' => AgentTemplate::select('id', 'name')->where('is_active', true)->get(),
            'agentTypes' => ['widget', 'api', 'full_site', 'mobile_app'],
            'widgetPositions' => ['bottom-right', 'bottom-left', 'center', 'custom'],
            'languages' => ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AIAgent $aiAgent)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'site_id' => 'nullable|exists:sites,id',
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:ai_agents,slug,' . $aiAgent->id,
            'description' => 'nullable|string',
            'agent_type' => 'required|string',
            'behavior_profile' => 'nullable|string',
            'welcome_message' => 'nullable|string',
            'primary_color' => 'nullable|string|size:7',
            'secondary_color' => 'nullable|string|size:7',
            'logo_url' => 'nullable|url',
            'is_active' => 'boolean',
            'max_context_length' => 'nullable|integer|min:100|max:8000',
            'response_temperature' => 'nullable|numeric|min:0|max:2',
            'knowledge_base_enabled' => 'boolean',
            'web_search_enabled' => 'boolean',
            'file_upload_enabled' => 'boolean',
            'voice_enabled' => 'boolean',
            'default_language' => 'nullable|string|size:2',
            'supported_languages' => 'nullable|array',
            'working_hours' => 'nullable|array',
            'offline_message' => 'nullable|string',
            'widget_position' => 'nullable|string',
            'widget_icon' => 'nullable|string',
            'template_id' => 'nullable|exists:agent_templates,id',
            'custom_css' => 'nullable|string',
            'custom_js' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $aiAgent->update($validated);

        // Update site agent count if site changed
        if ($aiAgent->wasChanged('site_id') || $aiAgent->wasChanged('is_active')) {
            $this->updateSiteAgentCount($aiAgent);
        }

        return redirect()->route('admin.ai-agents.show', $aiAgent)
            ->with('success', 'AI Agent updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AIAgent $aiAgent)
    {
        // Check if agent has active conversations
        if ($aiAgent->conversations()->count() > 0) {
            return redirect()->back()
                ->with('error', 'Cannot delete agent that has conversations. Deactivate it instead.');
        }

        $aiAgent->delete();

        // Update site agent count
        $this->updateSiteAgentCount($aiAgent, true);

        return redirect()->route('admin.ai-agents.index')
            ->with('success', 'AI Agent deleted successfully.');
    }

    /**
     * Toggle agent status
     */
    public function toggleStatus(AIAgent $aiAgent)
    {
        $aiAgent->update([
            'is_active' => !$aiAgent->is_active
        ]);

        // Update site agent count
        $this->updateSiteAgentCount($aiAgent);

        return redirect()->back()
            ->with('success', 'Agent status updated.');
    }

    /**
     * Clone agent
     */
    public function clone(AIAgent $aiAgent)
    {
        $newAgent = $aiAgent->replicate();
        $newAgent->name = $aiAgent->name . ' (Copy)';
        $newAgent->slug = $aiAgent->slug . '-copy-' . time();
        $newAgent->is_active = false;
        $newAgent->save();

        // Clone knowledge base items
        foreach ($aiAgent->knowledgeBase as $item) {
            $newItem = $item->replicate();
            $newItem->agent_id = $newAgent->id;
            $newItem->save();
        }

        // Clone tools
        foreach ($aiAgent->tools as $tool) {
            $newTool = $tool->replicate();
            $newTool->agent_id = $newAgent->id;
            $newTool->save();
        }

        return redirect()->route('admin.ai-agents.edit', $newAgent)
            ->with('success', 'Agent cloned successfully.');
    }

    /**
     * Export agent configuration
     */
    public function export(AIAgent $aiAgent)
    {
        $agentData = $aiAgent->toArray();
        $agentData['knowledge_base'] = $aiAgent->knowledgeBase->toArray();
        $agentData['tools'] = $aiAgent->tools->toArray();
        $agentData['widget_settings'] = $aiAgent->widgetSettings;

        return response()->json($agentData);
    }

    /**
     * Import agent configuration
     */
    public function import(Request $request)
    {
        $request->validate([
            'config_file' => 'required|file|mimes:json',
            'user_id' => 'required|exists:users,id',
            'site_id' => 'nullable|exists:sites,id',
        ]);

        $config = json_decode(file_get_contents($request->config_file->getRealPath()), true);

        // Create agent from config
        $agent = AIAgent::create([
            'user_id' => $request->user_id,
            'site_id' => $request->site_id,
            'name' => $config['name'] . ' (Imported)',
            'slug' => $config['slug'] . '-imported-' . time(),
            'description' => $config['description'],
            'agent_type' => $config['agent_type'],
            'is_active' => false,
            // ... map other fields
        ]);

        return redirect()->route('admin.ai-agents.show', $agent)
            ->with('success', 'Agent imported successfully.');
    }

    /**
     * Apply template to agent
     */
    private function applyTemplate(AIAgent $agent, $templateId)
    {
        $template = AgentTemplate::find($templateId);

        if ($template) {
            $agent->update([
                'behavior_profile' => $template->default_config['behavior_profile'] ?? null,
                'welcome_message' => $template->welcome_message,
                'knowledge_base_enabled' => $template->default_config['knowledge_base_enabled'] ?? false,
                'web_search_enabled' => $template->default_config['web_search_enabled'] ?? false,
                'widget_position' => $template->widget_settings['position'] ?? 'bottom-right',
            ]);
        }
    }

    /**
     * Update site agent count
     */
    private function updateSiteAgentCount(AIAgent $agent, $deleted = false)
    {
        if ($agent->site) {
            $activeCount = $agent->site->agents()->where('is_active', true)->count();
            $agent->site->update(['current_agents_count' => $activeCount]);
        }
    }
}
