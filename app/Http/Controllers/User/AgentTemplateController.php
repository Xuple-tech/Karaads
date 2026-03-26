<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AgentTemplate;
use App\Models\AIAgent;
use App\Models\Site;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgentTemplateController extends Controller
{
    public function index(Request $request)
    {
        $templates = AgentTemplate::where('is_active', true)
            ->orderBy('is_premium', 'desc')
            ->orderBy('name')
            ->get();

        $categories = AgentTemplate::where('is_active', true)
            ->distinct()
            ->pluck('category');

        return Inertia::render('User/Templates/Index', [
            'templates' => $templates,
            'categories' => $categories,
        ]);
    }

    public function show(AgentTemplate $template)
    {
        if (!$template->is_active) {
            abort(404);
        }

        // Load similar templates
        $similarTemplates = AgentTemplate::where('is_active', true)
            ->where('category', $template->category)
            ->where('id', '!=', $template->id)
            ->limit(4)
            ->get();

        return Inertia::render('User/Templates/Show', [
            'template' => $template,
            'similarTemplates' => $similarTemplates,
        ]);
    }

    public function apply(Request $request, AgentTemplate $template)
    {
        $request->validate([
            'site_id' => 'required|exists:sites,id',
            'name' => 'required|string|max:255',
        ]);

        $user = $request->user();
        $site = Site::findOrFail($request->site_id);

        // Check if user owns the site
        if ($site->user_id !== $user->id) {
            abort(403, 'Unauthorized action.');
        }

        // Check if site can add more agents
        if (!$site->canAddMoreAgents()) {
            return back()->withErrors(['limit' => 'This site has reached the maximum number of agents allowed by the current plan.']);
        }

        // Check if template is premium and user has access
        if ($template->is_premium && !$this->hasPremiumAccess($user)) {
            return back()->withErrors(['premium' => 'Premium templates require a paid subscription.']);
        }

        // Create agent from template
        $agent = $this->createAgentFromTemplate($user, $site, $template, $request->name);

        return redirect()->route('user.agents.show', $agent)
            ->with('success', 'Agent created from template successfully.');
    }

    private function createAgentFromTemplate($user, $site, $template, $name)
    {
        // Create the agent
        $agent = AIAgent::create([
            'user_id' => $user->id,
            'site_id' => $site->id,
            'name' => $name,
            'slug' => \Illuminate\Support\Str::slug($name) . '-' . \Illuminate\Support\Str::random(6),
            'description' => $template->description,
            'agent_type' => 'widget',
            'behavior_profile' => $template->default_config['behavior_profile'] ?? 'helpful',
            'welcome_message' => $template->welcome_message,
            'primary_color' => $template->default_config['primary_color'] ?? '#3B82F6',
            'secondary_color' => $template->default_config['secondary_color'] ?? '#1E40AF',
            'is_active' => true,
            'default_language' => 'en',
            'supported_languages' => ['en'],
            'widget_position' => 'bottom-right',
            'knowledge_base_enabled' => true,
            'web_search_enabled' => false,
            'file_upload_enabled' => false,
            'voice_enabled' => false,
            'template_id' => $template->id,
        ]);

        // Create widget settings from template
        if ($template->widget_settings) {
            $agent->widgetSettings()->create([
                'injection_method' => 'manual',
                'trigger_method' => 'click',
                'show_on_mobile' => true,
                'show_on_desktop' => true,
                'widget_config' => $template->widget_settings,
            ]);
        }

        // Create tools from template
        if ($template->tools_config && is_array($template->tools_config)) {
            foreach ($template->tools_config as $index => $toolConfig) {
                $agent->tools()->create([
                    'tool_type' => $toolConfig['type'] ?? 'custom',
                    'name' => $toolConfig['name'] ?? 'Tool ' . ($index + 1),
                    'description' => $toolConfig['description'] ?? '',
                    'configuration' => $toolConfig['configuration'] ?? [],
                    'is_active' => true,
                    'order' => $index + 1,
                ]);
            }
        }

        // Create knowledge base structure from template
        if ($template->knowledge_base_structure && is_array($template->knowledge_base_structure)) {
            foreach ($template->knowledge_base_structure as $index => $kbItem) {
                $agent->knowledgeBase()->create([
                    'content_type' => $kbItem['type'] ?? 'custom',
                    'title' => $kbItem['title'] ?? 'Knowledge Item ' . ($index + 1),
                    'content' => $kbItem['content'] ?? '',
                    'is_active' => true,
                    'order' => $index + 1,
                ]);
            }
        }

        // Update site agent count
        $site->increment('current_agents_count');

        return $agent;
    }

    private function hasPremiumAccess($user)
    {
        $subscription = $user->activeSubscription();

        if (!$subscription) {
            return false;
        }

        $plan = $subscription->plan;

        // Check if plan allows premium templates
        return $plan->is_premium ?? false;
    }
}
