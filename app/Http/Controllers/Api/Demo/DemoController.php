<?php

namespace App\Http\Controllers\Api\Demo;

use App\Http\Controllers\Controller;
use App\Models\AIAgent;
use App\Models\AgentWidgetSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class DemoController extends Controller
{
    /**
     * Get available agents for demo
     */
    public function getAgents(Request $request)
    {
        $agents = AIAgent::where('is_active', true)
            ->where('agent_type', 'widget')
            ->with(['widgetSettings'])
            ->select('id', 'name', 'description', 'agent_type', 'is_active', 'logo_url')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $agents,
            'count' => $agents->count()
        ]);
    }

    /**
     * Get widget settings for an agent
     */
    public function getWidgetSettings($agentId)
    {
        $agent = AIAgent::findOrFail($agentId);

        $widgetSettings = $agent->widgetSettings ?? AgentWidgetSettings::where('agent_id', $agentId)->first();

        if (!$widgetSettings) {
            // Create default widget settings
            $widgetSettings = AgentWidgetSettings::create([
                'agent_id' => $agent->id,
                'injection_method' => 'auto_inject',
                'trigger_method' => 'click',
                'show_on_mobile' => true,
                'show_on_desktop' => true,
                'language_detection' => true,
                'widget_config' => [
                    'position' => 'bottom-right',
                    'theme' => 'light',
                    'autoOpen' => false
                ]
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $widgetSettings,
            'agent' => $agent
        ]);
    }

    /**
     * Generate widget script
     */
    public function generateScript($agentId)
    {
        $agent = AIAgent::findOrFail($agentId);
        $widgetSettings = $agent->widgetSettings;

        $script = <<<HTML
<!-- Kwati AI Widget Script for {$agent->name} -->
<script>
    (function() {
        var kwatiWidget = document.createElement('script');
        kwatiWidget.src = 'https://cdn.kwati.ai/widget/v1/script.js?agent={$agent->id}';
        kwatiWidget.async = true;
        kwatiWidget.onload = function() {
            window.KwatiAI.init({
                agentId: '{$agent->id}',
                agentName: '{$agent->name}',
                injectionMethod: '{$widgetSettings->injection_method}',
                triggerMethod: '{$widgetSettings->trigger_method}',
                triggerDelay: {$widgetSettings->trigger_delay_seconds},
                showOnMobile: {$widgetSettings->show_on_mobile},
                showOnDesktop: {$widgetSettings->show_on_desktop},
                languageDetection: {$widgetSettings->language_detection},
                config: {$this->formatConfig($widgetSettings->widget_config)}
            });
        };
        document.head.appendChild(kwatiWidget);
    })();
</script>
<!-- End Kwati AI Widget -->
HTML;

        return response($script)
            ->header('Content-Type', 'application/javascript')
            ->header('Cache-Control', 'public, max-age=3600');
    }

    /**
     * Test conversation endpoint
     */
    public function testConversation(Request $request, $agentId)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'conversation_id' => 'nullable|string',
            'language' => 'nullable|string|size:2',
        ]);

        $agent = AIAgent::findOrFail($agentId);

        // In a real implementation, this would call the AI model
        // For demo purposes, return simulated responses
        $responses = [
            "Hello! I'm {$agent->name}, your AI assistant. How can I help you today?",
            "I understand you're asking about: '{$request->message}'. In a real implementation, I would provide a helpful response.",
            "Based on your question, I'd recommend checking our documentation for more detailed information.",
            "I'm here to help! Could you provide more details about what you're looking for?",
            "Thank you for your question. Let me connect you with the most relevant information.",
        ];

        $response = $responses[array_rand($responses)];

        // Simulate processing delay
        usleep(rand(500000, 1500000)); // 0.5-1.5 seconds

        return response()->json([
            'success' => true,
            'data' => [
                'message' => $response,
                'agent_id' => $agent->id,
                'agent_name' => $agent->name,
                'timestamp' => now()->toISOString(),
                'conversation_id' => $request->conversation_id ?? uniqid('conv_'),
                'tokens_used' => rand(50, 150),
                'processing_time' => rand(500, 1500) / 1000,
            ]
        ]);
    }

    /**
     * Get widget statistics
     */
    public function getWidgetStats($agentId)
    {
        $cacheKey = "widget_stats_{$agentId}";

        $stats = Cache::remember($cacheKey, 300, function () use ($agentId) {
            // Simulated statistics
            return [
                'impressions' => rand(1000, 10000),
                'conversations' => rand(100, 1000),
                'messages' => rand(500, 5000),
                'avg_response_time' => rand(500, 2000) / 1000,
                'satisfaction_rate' => rand(80, 98),
                'unique_users' => rand(200, 2000),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $stats,
            'period' => 'last_30_days'
        ]);
    }

    /**
     * Validate widget configuration
     */
    public function validateConfig(Request $request)
    {
        $request->validate([
            'config' => 'required|array',
            'agent_id' => 'required|exists:ai_agents,id',
        ]);

        $config = $request->config;
        $errors = [];

        // Validate position
        $validPositions = ['bottom-right', 'bottom-left', 'top-right', 'top-left', 'center'];
        if (isset($config['position']) && !in_array($config['position'], $validPositions)) {
            $errors[] = "Invalid position. Must be one of: " . implode(', ', $validPositions);
        }

        // Validate theme
        $validThemes = ['light', 'dark', 'auto'];
        if (isset($config['theme']) && !in_array($config['theme'], $validThemes)) {
            $errors[] = "Invalid theme. Must be one of: " . implode(', ', $validThemes);
        }

        // Validate language
        if (isset($config['language']) && !preg_match('/^[a-z]{2}$/', $config['language'])) {
            $errors[] = "Invalid language code. Must be 2 letters (e.g., 'en', 'es')";
        }

        if (count($errors) > 0) {
            return response()->json([
                'success' => false,
                'errors' => $errors
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Configuration is valid',
            'config' => $config
        ]);
    }

    /**
     * Get demo page data
     */
    public function getDemoData()
    {
        $agents = AIAgent::where('is_active', true)
            ->where('agent_type', 'widget')
            ->limit(5)
            ->get(['id', 'name', 'description']);

        $defaultConfig = [
            'position' => 'bottom-right',
            'theme' => 'light',
            'language' => 'en',
            'autoOpen' => false,
            'showAvatar' => true,
            'soundEnabled' => true,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'agents' => $agents,
                'defaultConfig' => $defaultConfig,
                'features' => [
                    'Real-time preview',
                    'Customizable settings',
                    'Multiple agents',
                    'Device testing',
                    'Embed code generator',
                    'API integration'
                ],
                'usage' => [
                    'total_demos' => Cache::increment('total_demos', rand(1, 5)),
                    'active_now' => rand(5, 50)
                ]
            ]
        ]);
    }

    /**
     * Format widget config for JavaScript
     */
    private function formatConfig($config)
    {
        if (is_array($config)) {
            return json_encode($config);
        }

        if (is_string($config)) {
            return $config;
        }

        return '{}';
    }
}
