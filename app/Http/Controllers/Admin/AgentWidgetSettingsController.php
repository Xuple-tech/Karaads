<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgentWidgetSettings;
use App\Models\AIAgent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgentWidgetSettingsController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = AgentWidgetSettings::with('agent');

        if ($request->has('agent_id')) {
            $query->where('agent_id', $request->agent_id);
        }

        if ($request->has('injection_method')) {
            $query->where('injection_method', $request->injection_method);
        }

        $widgetSettings = $query->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('Admin/AgentWidgetSettings/Index', [
            'widgetSettings' => $widgetSettings,
            'filters' => $request->only(['agent_id', 'injection_method']),
            'agents' => AIAgent::select('id', 'name')->where('is_active', true)->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/AgentWidgetSettings/Create', [
            'agents' => AIAgent::select('id', 'name')->where('is_active', true)->get(),
            'injectionMethods' => ['manual', 'auto_inject'],
            'triggerMethods' => ['click', 'hover', 'delay', 'scroll', 'exit_intent'],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'agent_id' => 'required|exists:ai_agents,id|unique:agent_widget_settings,agent_id',
            'widget_script_url' => 'nullable|url',
            'injection_method' => 'required|string',
            'auto_inject_selector' => 'nullable|string',
            'trigger_method' => 'required|string',
            'trigger_delay_seconds' => 'nullable|integer|min:0',
            'show_on_mobile' => 'boolean',
            'show_on_desktop' => 'boolean',
            'language_detection' => 'boolean',
            'geolocation_enabled' => 'boolean',
            'custom_css' => 'nullable|string',
            'custom_js' => 'nullable|string',
            'widget_config' => 'nullable|array',
        ]);

        AgentWidgetSettings::create($validated);

        return redirect()->route('admin.agent-widget-settings.index')
            ->with('success', 'Widget settings created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(AgentWidgetSettings $agentWidgetSetting)
    {
        $agentWidgetSetting->load('agent');

        return Inertia::render('Admin/AgentWidgetSettings/Show', [
            'widgetSetting' => $agentWidgetSetting,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AgentWidgetSettings $agentWidgetSetting)
    {
        return Inertia::render('Admin/AgentWidgetSettings/Edit', [
            'widgetSetting' => $agentWidgetSetting,
            'agents' => AIAgent::select('id', 'name')->where('is_active', true)->get(),
            'injectionMethods' => ['manual', 'auto_inject'],
            'triggerMethods' => ['click', 'hover', 'delay', 'scroll', 'exit_intent'],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AgentWidgetSettings $agentWidgetSetting)
    {
        $validated = $request->validate([
            'agent_id' => 'required|exists:ai_agents,id|unique:agent_widget_settings,agent_id,' . $agentWidgetSetting->id,
            'widget_script_url' => 'nullable|url',
            'injection_method' => 'required|string',
            'auto_inject_selector' => 'nullable|string',
            'trigger_method' => 'required|string',
            'trigger_delay_seconds' => 'nullable|integer|min:0',
            'show_on_mobile' => 'boolean',
            'show_on_desktop' => 'boolean',
            'language_detection' => 'boolean',
            'geolocation_enabled' => 'boolean',
            'custom_css' => 'nullable|string',
            'custom_js' => 'nullable|string',
            'widget_config' => 'nullable|array',
        ]);

        $agentWidgetSetting->update($validated);

        return redirect()->route('admin.agent-widget-settings.index')
            ->with('success', 'Widget settings updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AgentWidgetSettings $agentWidgetSetting)
    {
        $agentWidgetSetting->delete();

        return redirect()->route('admin.agent-widget-settings.index')
            ->with('success', 'Widget settings deleted successfully.');
    }

    /**
     * Get widget script
     */
    public function getScript(AgentWidgetSettings $agentWidgetSetting)
    {
        $agent = $agentWidgetSetting->agent;

        $script = "<script>
    (function() {
        var kwatiWidget = document.createElement('script');
        kwatiWidget.src = '{$agentWidgetSetting->widget_script_url}';
        kwatiWidget.async = true;
        kwatiWidget.onload = function() {
            window.KwatiAI.init({
                agentId: '{$agent->id}',
                agentName: '{$agent->name}',
                injectionMethod: '{$agentWidgetSetting->injection_method}',
                triggerMethod: '{$agentWidgetSetting->trigger_method}',
                triggerDelay: {$agentWidgetSetting->trigger_delay_seconds},
                config: " . json_encode($agentWidgetSetting->widget_config) . "
            });
        };
        document.head.appendChild(kwatiWidget);
    })();
</script>";

        return response($script)
            ->header('Content-Type', 'application/javascript');
    }

    /**
     * Preview widget
     */
    public function preview(AgentWidgetSettings $agentWidgetSetting)
    {
        $agentWidgetSetting->load('agent');

        return Inertia::render('Admin/AgentWidgetSettings/Preview', [
            'widgetSetting' => $agentWidgetSetting,
        ]);
    }
}
