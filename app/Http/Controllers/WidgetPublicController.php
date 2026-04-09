<?php

namespace App\Http\Controllers;

use App\Models\WidgetConfig;
use App\Models\WidgetSession;
use App\Services\Widget\WidgetChatService;
use App\Services\Widget\WidgetDomainService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class WidgetPublicController extends Controller
{
    public function __construct(
        private readonly WidgetChatService $chat,
        private readonly WidgetDomainService $domains
    ) {
    }

    public function config(string $token, Request $request): JsonResponse
    {
        $widget = $this->findActiveWidget($token);
        $this->domains->ensureAllowed($widget, $request);

        return response()->json([
            'bot_name' => $widget->bot_name,
            'greeting' => $widget->greeting,
            'theme_color' => $widget->theme_color,
            'avatar_url' => $widget->avatar_url,
            'allow_file_uploads' => $widget->allow_file_uploads,
        ]);
    }

    public function startSession(string $token, Request $request): JsonResponse
    {
        $widget = $this->findActiveWidget($token);
        $this->domains->ensureAllowed($widget, $request);

        $validated = $request->validate([
            'session_token' => 'nullable|string|max:64',
            'visitor_id' => 'nullable|string|max:255',
            'referrer_url' => 'nullable|string|max:2048',
            'page_url' => 'nullable|string|max:2048',
            'metadata' => 'nullable|array',
        ]);

        $session = null;

        if (! empty($validated['session_token'])) {
            $session = $widget->sessions()
                ->where('session_token', $validated['session_token'])
                ->first();
        }

        if (! $session) {
            $session = WidgetSession::create([
                'widget_id' => $widget->id,
                'session_token' => WidgetSession::generateToken(),
                'visitor_id' => $validated['visitor_id'] ?? null,
                'referrer_url' => $validated['referrer_url'] ?? null,
                'page_url' => $validated['page_url'] ?? null,
                'metadata' => $validated['metadata'] ?? null,
                'last_seen_at' => now(),
            ]);
        } else {
            $session->update([
                'visitor_id' => $validated['visitor_id'] ?? $session->visitor_id,
                'referrer_url' => $validated['referrer_url'] ?? $session->referrer_url,
                'page_url' => $validated['page_url'] ?? $session->page_url,
                'metadata' => array_merge($session->metadata ?? [], $validated['metadata'] ?? []),
                'last_seen_at' => now(),
            ]);
        }

        return response()->json([
            'session_token' => $session->session_token,
            'session_id' => $session->id,
        ]);
    }

    public function chat(string $token, Request $request): StreamedResponse|JsonResponse
    {
        $widget = $this->findActiveWidget($token);
        $this->domains->ensureAllowed($widget, $request);

        $validated = $request->validate([
            'session_token' => 'required|string|max:64',
            'message' => 'required|string',
            'files' => 'nullable|array',
        ]);

        $session = $widget->sessions()
            ->where('session_token', $validated['session_token'])
            ->first();

        if (! $session) {
            return response()->json([
                'message' => 'Invalid widget session.',
            ], 404);
        }

        return response()->stream(function () use ($widget, $session, $validated): void {
            $emit = function (string $event, array $payload): void {
                echo "event: {$event}\n";
                echo 'data: ' . json_encode($payload, JSON_UNESCAPED_SLASHES) . "\n\n";
                if (function_exists('ob_flush')) {
                    @ob_flush();
                }
                flush();
            };

            $this->chat->streamChat(
                $widget->loadMissing('user'),
                $session,
                $validated['message'],
                $validated['files'] ?? [],
                $emit
            );
        }, 200, [
            'Cache-Control' => 'no-cache',
            'Content-Type' => 'text/event-stream',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
        ]);
    }

    private function findActiveWidget(string $token): WidgetConfig
    {
        return WidgetConfig::query()
            ->where('token', $token)
            ->where('is_active', true)
            ->firstOrFail();
    }
}
