<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SpaVoiceConversationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $conversations = Conversation::query()
            ->where('user_id', $request->user()->id)
            ->where(function ($query) {
                $query->where('type', 'voice')->orWhere('title', 'Voice Chat');
            })
            ->latest('updated_at')
            ->get(['id', 'title', 'updated_at']);

        return response()->json([
            'success' => true,
            'conversations' => $conversations,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $conversation = Conversation::create([
            'user_id' => $request->user()->id,
            'title' => 'Voice Chat',
            'type' => 'voice',
            'context' => [],
        ]);

        return response()->json([
            'success' => true,
            'conversation' => [
                'id' => $conversation->id,
                'title' => $conversation->title,
            ],
        ], 201);
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        abort_unless($conversation->user_id === $request->user()->id, 403);

        $conversation->load(['chats' => fn ($query) => $query->orderBy('created_at')]);

        return response()->json([
            'success' => true,
            'conversation' => [
                'id' => $conversation->id,
                'title' => $conversation->title,
                'messages' => $conversation->chats->map(fn ($chat) => [
                    'id' => $chat->id,
                    'content' => $chat->message,
                    'role' => $chat->role,
                    'type' => $chat->type ?? 'text',
                    'created_at' => $chat->created_at?->toIso8601String(),
                ]),
            ],
            'availableVoices' => [
                ['id' => 'alloy', 'name' => 'Alloy'],
                ['id' => 'nova', 'name' => 'Nova'],
                ['id' => 'echo', 'name' => 'Echo'],
            ],
        ]);
    }
}
