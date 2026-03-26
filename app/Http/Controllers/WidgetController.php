<?php

namespace App\Http\Controllers;

use App\Models\AIAgent;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WidgetController extends Controller
{
    public function embed(Request $request, $agentSlug)
    {
        $agent = AIAgent::where('slug', $agentSlug)
            ->where('is_active', true)
            ->with('widgetSettings')
            ->firstOrFail();

        // Check if agent's site is active
        if ($agent->site && (!$agent->site->is_active || !$agent->site->widget_enabled)) {
            abort(403, 'Widget is disabled for this site');
        }

        $widgetSettings = $agent->widgetSettings;

        $config = [
            'widget_id' => $agent->slug,
            'agentSlug' => $agent->slug,
            'botName' => $agent->name,
            'botAvatar' => $agent->logo_url ?: 'https://api.dicebear.com/7.x/bottts/svg?seed=' . $agent->slug,
            'welcomeMessage' => $agent->welcome_message ?: 'Hello! How can I help you today?',
            'primaryColor' => $agent->primary_color ?: '#3b82f6',
            'secondaryColor' => $agent->secondary_color ?: '#1e40af',
            'accentColor' => $agent->secondary_color ?: '#8b5cf6',
            'position' => $agent->widget_position ?: 'bottom-right',
            'theme' => 'light', // Could be configurable
            'enableFiles' => (bool) $agent->file_upload_enabled,
            'enableVoice' => (bool) $agent->voice_enabled,
            'showHeader' => true,
            'showFooter' => true,
            'autoOpen' => false,
            'apiBaseUrl' => config('app.url') . '/api/v1/widget',
            'language' => $agent->default_language ?: 'en',
        ];

        // Merge widget settings if available
        if ($widgetSettings) {
            $config = array_merge($config, [
                'widget_script_url' => $widgetSettings->widget_script_url,
                'injection_method' => $widgetSettings->injection_method,
                'trigger_method' => $widgetSettings->trigger_method,
                'trigger_delay_seconds' => $widgetSettings->trigger_delay_seconds,
                'show_on_mobile' => (bool) $widgetSettings->show_on_mobile,
                'show_on_desktop' => (bool) $widgetSettings->show_on_desktop,
                'language_detection' => (bool) $widgetSettings->language_detection,
                'geolocation_enabled' => (bool) $widgetSettings->geolocation_enabled,
                'custom_css' => $widgetSettings->custom_css,
                'custom_js' => $widgetSettings->custom_js,
                'widget_config' => $widgetSettings->widget_config ?? [],
            ]);
        }

        // Override config with query parameters if provided (useful for testing/customization)
        if ($request->has('theme')) {
            $config['theme'] = $request->input('theme');
        }
        if ($request->has('primary_color')) {
            $config['primaryColor'] = $request->input('primary_color');
        }

        Inertia::setRootView('widget');

        return Inertia::render('widget/iframe', [
            'config' => $config
        ]);
    }
}
