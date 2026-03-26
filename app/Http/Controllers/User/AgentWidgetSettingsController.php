<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\AIAgent;
use App\Models\AgentWidgetSettings;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgentWidgetSettingsController extends Controller
{
    public function show(Request $request, AIAgent $agent)
    {
        // $this->authorize('view', $agent);

        $widgetSettings = $agent->widgetSettings()->firstOrCreate([]);

        return Inertia::render('User/Agents/WidgetSettings/Show', [
            'agent' => $agent,
            'widgetSettings' => $widgetSettings,
        ]);
    }

    public function edit(Request $request, AIAgent $agent)
    {
        $this->authorize('update', $agent);

        $widgetSettings = $agent->widgetSettings()->firstOrCreate([]);

        return Inertia::render('User/Agents/WidgetSettings/Edit', [
            'agent' => $agent,
            'widgetSettings' => $widgetSettings,
        ]);
    }

    public function update(Request $request, AIAgent $agent)
    {
        // $this->authorize('update', $agent);

        $request->validate([
            'widget_script_url' => 'nullable|url',
            'injection_method' => 'required|in:manual,auto_inject',
            'auto_inject_selector' => 'nullable|string',
            'trigger_method' => 'required|in:click,hover,delay,scroll,exit_intent',
            'trigger_delay_seconds' => 'nullable|integer|min:0',
            'show_on_mobile' => 'boolean',
            'show_on_desktop' => 'boolean',
            'language_detection' => 'boolean',
            'geolocation_enabled' => 'boolean',
            'custom_css' => 'nullable|string',
            'custom_js' => 'nullable|string',
            'widget_config' => 'nullable|array',
        ]);

        $widgetSettings = $agent->widgetSettings()->firstOrCreate([]);

        $widgetSettings->update($request->only([
            'widget_script_url',
            'injection_method',
            'auto_inject_selector',
            'trigger_method',
            'trigger_delay_seconds',
            'show_on_mobile',
            'show_on_desktop',
            'language_detection',
            'geolocation_enabled',
            'custom_css',
            'custom_js',
            'widget_config',
        ]));

        return redirect()->route('user.agents.widget-settings.show', $agent)
            ->with('success', 'Widget settings updated successfully.');
    }

    public function preview(Request $request, AIAgent $agent)
    {
        // $this->authorize('update', $agent);

        $widgetSettings = $agent->widgetSettings()->firstOrCreate([]);

        // Generate preview script/embed code
        $previewCode = $this->generatePreviewCode($agent, $widgetSettings);

        return response()->json([
            'preview_code' => $previewCode,
            'success' => true,
        ]);
    }

    public function reset(Request $request, AIAgent $agent)
    {
        $this->authorize('update', $agent);

        $widgetSettings = $agent->widgetSettings()->first();

        if ($widgetSettings) {
            $widgetSettings->update([
                'widget_script_url' => '/widget/v1/script.js',
                'injection_method' => 'manual',
                'auto_inject_selector' => null,
                'trigger_method' => 'click',
                'trigger_delay_seconds' => 0,
                'show_on_mobile' => true,
                'show_on_desktop' => true,
                'language_detection' => false,
                'geolocation_enabled' => false,
                'custom_css' => null,
                'custom_js' => null,
                'widget_config' => [],
            ]);
        }

        return back()->with('success', 'Widget settings reset to defaults.');
    }

    private function generatePreviewCode($agent, $widgetSettings)
    {
        // Generate embed code for the widget
        $scriptUrl = url($widgetSettings->widget_script_url ?: '/widget/v1/script.js');

        $code = <<<HTML
<!-- AI Agent Widget Embed Code -->
<script src="{$scriptUrl}"></script>
<script>
    window.AIChatWidget.init({
        agentSlug: "{$agent->slug}",
        position: "{$agent->widget_position}",
        botName: "{$agent->name}",
        primaryColor: "{$agent->primary_color}",
        autoOpen: false,
        debug: false
    });
</script>
HTML;

        return $code;
    }
}
