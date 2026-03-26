<?php

namespace App\Http\Controllers\Demo;

use App\Http\Controllers\Controller;
use App\Models\AIAgent;
use App\Models\AgentWidgetSettings;
use Inertia\Inertia;

class DemoController extends Controller
{
    /**
     * Show demo landing page
     */
    public function index()
    {
        $agents = AIAgent::where('is_active', true)
            ->where('agent_type', 'widget')
            ->with(['widgetSettings'])
            ->select('id', 'name', 'description', 'agent_type', 'is_active', 'logo_url', 'primary_color')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('Demo/Index', [
            'agents' => $agents,
            'initialAgentId' => $agents->first()?->id,
            'widgetSettings' => [
                'scriptUrl' => config('app.widget_script_url', '/widget/v1/script.js'),
                'cdnUrl' => config('app.cdn_url', ''),
                'apiUrl' => config('app.url') . '/demo/api',
            ],
            'defaultConfig' => [
                'position' => 'bottom-right',
                'theme' => 'light',
                'language' => 'en',
                'autoOpen' => false,
                'showAvatar' => true,
                'soundEnabled' => true,
            ]
        ]);
    }

    /**
     * Show demo for specific agent
     */
    public function show(AIAgent $agent)
    {
        $agent->load('widgetSettings');

        return Inertia::render('Demo/Index', [
            'agents' => [$agent],
            'initialAgentId' => $agent->id,
            'widgetSettings' => [
                'scriptUrl' => config('app.widget_script_url', '/widget/v1/script.js'),
                'cdnUrl' => config('app.cdn_url', ''),
                'apiUrl' => config('app.url') . '/demo/api',
            ],
            'agentConfig' => $agent->widgetSettings?->widget_config ?? [],
        ]);
    }

    /**
     * Preview widget with specific settings
     */
    public function preview(AgentWidgetSettings $widgetSetting)
    {
        $widgetSetting->load('agent');

        return Inertia::render('Demo', [
            'agents' => [$widgetSetting->agent],
            'initialAgentId' => $widgetSetting->agent_id,
            'widgetSettings' => [
                'scriptUrl' => config('app.widget_script_url', '/widget/v1/script.js'),
                'cdnUrl' => config('app.cdn_url', '/'),
                'apiUrl' => config('app.url') . '/demo/api',
                'injectionMethod' => $widgetSetting->injection_method,
                'triggerMethod' => $widgetSetting->trigger_method,
                'triggerDelay' => $widgetSetting->trigger_delay_seconds,
                'showOnMobile' => $widgetSetting->show_on_mobile,
                'showOnDesktop' => $widgetSetting->show_on_desktop,
            ],
            'agentConfig' => array_merge(
                $widgetSetting->widget_config ?? [],
                ['customCss' => $widgetSetting->custom_css, 'customJs' => $widgetSetting->custom_js]
            ),
        ]);
    }
}
