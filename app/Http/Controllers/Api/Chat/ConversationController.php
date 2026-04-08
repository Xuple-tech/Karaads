<?php

namespace App\Http\Controllers\Api\Chat;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Services\Chat\ChatConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\Realtime\RealtimePublisher;
use Symfony\Component\HttpFoundation\Response;

class ConversationController extends Controller
{
    public function __construct(
        private readonly ChatConversationService $conversations,
        private readonly RealtimePublisher $publisher,
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
                'ai_generated_title' => $conversation->ai_generated_title,
                'title_generated_at' => $conversation->title_generated_at?->toIso8601String(),
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
        $this->publisher->conversationUpdated($conversation);

        return response()->json([
            'success' => true,
            'conversation' => [
                'id' => $conversation->id,
                'title' => $conversation->title,
                'ai_generated_title' => $conversation->ai_generated_title,
                'title_generated_at' => $conversation->title_generated_at?->toIso8601String(),
                'updated_at' => $conversation->updated_at?->toIso8601String(),
            ],
        ]);
    }

    public function destroy(Request $request, Conversation $conversation): JsonResponse
    {
        $conversationId = $conversation->id;
        $this->conversations->delete($request->user(), $conversation);

        $this->publisher->toUser($request->user()->id, [
            'event' => 'conversation.updated',
            'conversation_id' => $conversationId,
            'deleted' => true,
        ]);

        return response()->json([
            'success' => true,
        ]);
    }

    public function destroyAll(Request $request): JsonResponse
    {
        $deletedCount = $this->conversations->deleteAll($request->user());

        $this->publisher->toUser($request->user()->id, [
            'event' => 'conversation.updated',
            'cleared' => true,
        ]);

        return response()->json([
            'success' => true,
            'deleted_count' => $deletedCount,
        ]);
    }

    public function export(Request $request, Conversation $conversation): Response
    {
        $format = $request->query('format', 'md');
        $export = $this->conversations->export($request->user(), $conversation, $format);

        return response($export['content'], 200, [
            'Content-Type' => $export['mime_type'],
            'Content-Disposition' => 'attachment; filename="' . $export['filename'] . '"',
        ]);
    }
}
