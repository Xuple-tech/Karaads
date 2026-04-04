<?php

namespace App\Http\Controllers\Api\Chat;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Services\Chat\ChatConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function __construct(
        private readonly ChatConversationService $conversations,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'conversations' => $this->conversations->listForUser($request->user()),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $conversation = $this->conversations->create($request->user(), $request->string('title')->toString());

        return response()->json([
            'success' => true,
            'conversation' => [
                'id' => $conversation->id,
                'title' => $conversation->title,
                'created_at' => $conversation->created_at?->toIso8601String(),
                'updated_at' => $conversation->updated_at?->toIso8601String(),
            ],
        ], 201);
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        return response()->json([
            'success' => true,
            'conversation' => $this->conversations->show($request->user(), $conversation),
        ]);
    }

    public function update(Request $request, Conversation $conversation): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
        ]);

        $conversation = $this->conversations->update($request->user(), $conversation, $validated);

        return response()->json([
            'success' => true,
            'conversation' => [
                'id' => $conversation->id,
                'title' => $conversation->title,
                'updated_at' => $conversation->updated_at?->toIso8601String(),
            ],
        ]);
    }

    public function destroy(Request $request, Conversation $conversation): JsonResponse
    {
        $this->conversations->delete($request->user(), $conversation);

        return response()->json([
            'success' => true,
        ]);
    }
}
