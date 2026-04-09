<?php

namespace App\Http\Controllers;

use App\Models\WidgetConfig;
use App\Models\WidgetKnowledgeItem;
use App\Models\WidgetTool;
use App\Services\SubscriptionService;
use App\Services\Widget\WidgetKnowledgeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WidgetConfigController extends Controller
{
    public function __construct(
        private readonly WidgetKnowledgeService $knowledge,
        private readonly SubscriptionService $subscriptions
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $widgets = WidgetConfig::query()
            ->where('user_id', $request->user()->id)
            ->withCount(['sessions', 'knowledgeItems', 'tools'])
            ->with('sessions')
            ->latest()
            ->get()
            ->map(fn (WidgetConfig $widget) => $this->serializeWidgetSummary($widget));

        return response()->json(['widgets' => $widgets]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'greeting' => 'nullable|string|max:255',
        ]);

        $activeWidgets = WidgetConfig::query()
            ->where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->count();

        $limit = $this->subscriptions->canCreateWidget($request->user(), $activeWidgets);

        if (! $limit['allowed']) {
            return response()->json([
                'message' => $limit['reason'] ?? 'Widget limit exceeded.',
            ], 422);
        }

        $widget = WidgetConfig::create([
            'user_id' => $request->user()->id,
            'name' => $validated['name'],
            'token' => WidgetConfig::generateToken(),
            'bot_name' => $validated['name'],
            'greeting' => $validated['greeting'] ?: 'Hi! How can I help you today?',
            'theme_color' => '#7c3aed',
            'is_active' => true,
        ]);

        return response()->json([
            'message' => 'Widget created successfully.',
            'widget' => $this->serializeWidgetDetail($widget->fresh(['knowledgeItems', 'tools'])),
        ], 201);
    }

    public function show(Request $request, WidgetConfig $widget): JsonResponse
    {
        $this->ensureOwnership($request, $widget);

        return response()->json([
            'widget' => $this->serializeWidgetDetail($widget->load(['knowledgeItems', 'tools', 'sessions.messages'])),
        ]);
    }

    public function update(Request $request, WidgetConfig $widget): JsonResponse
    {
        $this->ensureOwnership($request, $widget);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bot_name' => 'required|string|max:255',
            'greeting' => 'required|string|max:255',
            'theme_color' => 'required|string|max:20',
            'avatar_url' => 'nullable|string|max:2048',
            'system_prompt' => 'nullable|string',
            'is_active' => 'required|boolean',
            'allow_file_uploads' => 'required|boolean',
            'allowed_domains' => 'nullable|array',
            'allowed_domains.*' => 'string|max:255',
        ]);

        if ($validated['is_active'] && ! $widget->is_active) {
            $activeWidgets = WidgetConfig::query()
                ->where('user_id', $request->user()->id)
                ->where('is_active', true)
                ->whereKeyNot($widget->id)
                ->count();

            $limit = $this->subscriptions->canCreateWidget($request->user(), $activeWidgets);

            if (! $limit['allowed']) {
                return response()->json([
                    'message' => $limit['reason'] ?? 'Widget limit exceeded.',
                ], 422);
            }
        }

        if ($validated['allow_file_uploads'] && ! $this->subscriptions->hasPlanCapability($request->user(), 'widget_file_uploads')) {
            return response()->json([
                'message' => 'Your plan does not include widget file uploads.',
            ], 422);
        }

        $widget->update($validated);

        return response()->json([
            'message' => 'Widget updated successfully.',
            'widget' => $this->serializeWidgetDetail($widget->fresh(['knowledgeItems', 'tools'])),
        ]);
    }

    public function destroy(Request $request, WidgetConfig $widget): JsonResponse
    {
        $this->ensureOwnership($request, $widget);
        $widget->delete();

        return response()->json(['message' => 'Widget deleted successfully.']);
    }

    public function listKnowledge(Request $request, WidgetConfig $widget): JsonResponse
    {
        $this->ensureOwnership($request, $widget);

        return response()->json([
            'knowledge' => $widget->knowledgeItems()->latest()->get(),
        ]);
    }

    public function addKnowledge(Request $request, WidgetConfig $widget): JsonResponse
    {
        $this->ensureOwnership($request, $widget);

        $validated = $request->validate([
            'type' => 'required|in:text,url',
            'name' => 'nullable|string|max:255',
            'content' => 'required_if:type,text|nullable|string',
            'url' => 'required_if:type,url|nullable|url|max:2048',
        ]);

        $item = $validated['type'] === 'text'
            ? $this->knowledge->addText($widget, $request->user(), $validated['name'] ?: 'Text note', (string) $validated['content'])
            : $this->knowledge->addUrl($widget, $request->user(), (string) $validated['url'], $validated['name'] ?? null);

        return response()->json([
            'message' => 'Knowledge item saved.',
            'item' => $item,
        ], 201);
    }

    public function uploadPdf(Request $request, WidgetConfig $widget): JsonResponse
    {
        $this->ensureOwnership($request, $widget);

        $validated = $request->validate([
            'file' => 'required|file|mimes:pdf|max:51200',
        ]);

        $item = $this->knowledge->addPdf($widget, $request->user(), $validated['file']);

        return response()->json([
            'message' => 'PDF knowledge uploaded.',
            'item' => $item,
        ], 201);
    }

    public function deleteKnowledge(Request $request, WidgetConfig $widget, WidgetKnowledgeItem $item): JsonResponse
    {
        $this->ensureOwnership($request, $widget);
        abort_unless($item->widget_id === $widget->id, 404);
        $item->delete();

        return response()->json(['message' => 'Knowledge item removed.']);
    }

    public function listTools(Request $request, WidgetConfig $widget): JsonResponse
    {
        $this->ensureOwnership($request, $widget);

        return response()->json([
            'tools' => $widget->tools()->latest()->get(),
        ]);
    }

    public function addTool(Request $request, WidgetConfig $widget): JsonResponse
    {
        $this->ensureOwnership($request, $widget);
        $validated = $this->validateTool($request);
        $this->guardToolCapability($request, $validated['tool_type']);

        $tool = $widget->tools()->create($validated);

        return response()->json([
            'message' => 'Tool saved.',
            'tool' => $tool,
        ], 201);
    }

    public function updateTool(Request $request, WidgetConfig $widget, WidgetTool $tool): JsonResponse
    {
        $this->ensureOwnership($request, $widget);
        abort_unless($tool->widget_id === $widget->id, 404);

        $validated = $this->validateTool($request);
        $this->guardToolCapability($request, $validated['tool_type']);
        $tool->update($validated);

        return response()->json([
            'message' => 'Tool updated.',
            'tool' => $tool->fresh(),
        ]);
    }

    public function deleteTool(Request $request, WidgetConfig $widget, WidgetTool $tool): JsonResponse
    {
        $this->ensureOwnership($request, $widget);
        abort_unless($tool->widget_id === $widget->id, 404);
        $tool->delete();

        return response()->json(['message' => 'Tool removed.']);
    }

    private function validateTool(Request $request): array
    {
        return $request->validate([
            'tool_type' => 'required|in:http,mcp_server',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'endpoint_url' => 'required|url|max:2048',
            'method' => 'nullable|string|max:10',
            'transport' => 'nullable|string|max:50',
            'headers' => 'nullable|array',
            'parameters' => 'nullable|array',
            'configuration' => 'nullable|array',
            'is_active' => 'required|boolean',
        ]);
    }

    private function guardToolCapability(Request $request, string $toolType): void
    {
        $capability = $toolType === 'mcp_server' ? 'widget_mcp' : 'widget_tools';

        abort_unless(
            $this->subscriptions->hasPlanCapability($request->user(), $capability),
            422,
            'Your plan does not include this widget capability.'
        );
    }

    private function ensureOwnership(Request $request, WidgetConfig $widget): void
    {
        abort_unless($widget->user_id === $request->user()->id, 404);
    }

    private function serializeWidgetSummary(WidgetConfig $widget): array
    {
        $sessionIds = $widget->sessions->pluck('id');

        return [
            'id' => $widget->id,
            'name' => $widget->name,
            'bot_name' => $widget->bot_name,
            'greeting' => $widget->greeting,
            'theme_color' => $widget->theme_color,
            'is_active' => $widget->is_active,
            'allow_file_uploads' => $widget->allow_file_uploads,
            'sessions_count' => (int) ($widget->sessions_count ?? 0),
            'knowledge_count' => (int) ($widget->knowledge_items_count ?? 0),
            'tools_count' => (int) ($widget->tools_count ?? 0),
            'messages_count' => $sessionIds->isEmpty() ? 0 : \App\Models\WidgetMessage::whereIn('session_id', $sessionIds)->count(),
            'created_at' => $widget->created_at,
            'updated_at' => $widget->updated_at,
        ];
    }

    private function serializeWidgetDetail(WidgetConfig $widget): array
    {
        $widget->loadMissing(['knowledgeItems', 'tools', 'sessions.messages']);
        $scriptUrl = route('widget.embed.loader');

        return [
            'id' => $widget->id,
            'name' => $widget->name,
            'token' => $widget->token,
            'bot_name' => $widget->bot_name,
            'greeting' => $widget->greeting,
            'theme_color' => $widget->theme_color,
            'avatar_url' => $widget->avatar_url,
            'system_prompt' => $widget->system_prompt,
            'is_active' => $widget->is_active,
            'allow_file_uploads' => $widget->allow_file_uploads,
            'allowed_domains' => $widget->allowed_domains ?? [],
            'knowledge' => $widget->knowledgeItems()->latest()->get()->values(),
            'tools' => $widget->tools()->latest()->get()->values(),
            'analytics' => [
                'sessions' => $widget->sessions()->count(),
                'messages' => $widget->sessions()->withCount('messages')->get()->sum('messages_count'),
            ],
            'embed_script_url' => $scriptUrl,
            'embed_code' => '<script>window.KwatiWidgetToken = "' . $widget->token . '";</script>' . "\n" .
                '<script type="module" src="' . $scriptUrl . '"></script>',
            'preview_url' => url('/widget-preview/' . $widget->token),
            'created_at' => $widget->created_at,
            'updated_at' => $widget->updated_at,
        ];
    }
}
