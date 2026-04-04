<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SpaConversationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversations = Conversation::query()
            ->where('user_id', $user->id)
            ->withCount('chats')
            ->with(['chats' => fn ($query) => $query->latest()->limit(1)])
            ->latest('updated_at')
            ->get()
            ->map(function (Conversation $conversation) {
                return [
                    'id' => $conversation->id,
                    'title' => $conversation->title ?: 'New chat',
                    'canvas_mode' => (bool) $conversation->canvas_mode,
                    'created_at' => $conversation->created_at?->toIso8601String(),
                    'updated_at' => $conversation->updated_at?->toIso8601String(),
                    'messages_count' => $conversation->chats_count,
                    'last_message' => $conversation->chats->first()?->message,
                ];
            });

        return response()->json([
            'success' => true,
            'conversations' => $conversations,
        ]);
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        abort_unless($conversation->user_id === $request->user()->id, 403);

        $conversation->load(['chats' => fn ($query) => $query->orderBy('created_at')->with('files')]);

        return response()->json([
            'success' => true,
            'conversation' => [
                'id' => $conversation->id,
                'title' => $conversation->title ?: 'New chat',
                'canvas_mode' => (bool) $conversation->canvas_mode,
                'created_at' => $conversation->created_at?->toIso8601String(),
                'updated_at' => $conversation->updated_at?->toIso8601String(),
                'messages' => $conversation->chats->map(function ($chat) {
                    return [
                        'id' => $chat->id,
                        'role' => $chat->role,
                        'message' => $chat->message,
                        'thinking' => $chat->thinking,
                        'type' => $chat->type,
                        'metadata' => $chat->metadata,
                        'created_at' => $chat->created_at?->toIso8601String(),
                    ];
                }),
            ],
        ]);
    }
}
