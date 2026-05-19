<?php

namespace App\Http\Controllers\Api\Chat;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessChatMessageRealtime;
use App\Models\ChatMessageAttachment;
use App\Models\ChatMessage;
use App\Services\Chat\ChatMessageService;
use App\Services\Chat\ChatConversationService;
use App\Services\ChatFileAttachmentService;
use App\Services\Realtime\RealtimePublisher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MessageController extends Controller
{
    public function __construct(
        private readonly ChatMessageService $messages,
        private readonly ChatConversationService $conversations,
        private readonly ChatFileAttachmentService $files,
        private readonly RealtimePublisher $publisher,
    ) {
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'conversation_id' => ['nullable', 'string', 'exists:conversations,id'],
            'message' => ['nullable', 'string'],
            'type' => ['nullable', 'string'],
            'model' => ['nullable', 'string'],
            'files' => ['nullable', 'array'],
        ]);
        $this->ensureMessageOrFiles($validated);
        $validated = $this->withDefaultAttachmentPrompt($validated);

        $prepared = $this->messages->queueSend($request->user(), $validated);
        $assistantMessage = $prepared['assistant_message'];

        $this->publisher->toConversation($prepared['conversation']->id, [
            'event' => 'message.created',
            'conversation_id' => $prepared['conversation']->id,
            'message' => $this->conversations->serializeMessage($assistantMessage),
        ]);
        $this->publisher->conversationUpdated($prepared['conversation'], $prepared['user_message']->content_text);

        ProcessChatMessageRealtime::dispatch($assistantMessage->id);

        return response()->json([
            'success' => true,
            'conversation_id' => $prepared['conversation']->id,
            'user_message_id' => $prepared['user_message']->id,
            'assistant_message_id' => $assistantMessage->id,
            'assistant_message' => $this->conversations->serializeMessage($assistantMessage),
        ], 202);
    }

    public function storeStream(Request $request): StreamedResponse
    {
        $validated = $request->validate([
            'conversation_id' => ['nullable', 'string', 'exists:conversations,id'],
            'message' => ['nullable', 'string'],
            'type' => ['nullable', 'string'],
            'model' => ['nullable', 'string'],
            'files' => ['nullable', 'array'],
        ]);
        $this->ensureMessageOrFiles($validated);
        $validated = $this->withDefaultAttachmentPrompt($validated);

        return response()->stream(function () use ($request, $validated): void {
            $emit = function (string $event, array $payload): void {
                echo "event: {$event}\n";
                echo 'data: ' . json_encode($payload, JSON_UNESCAPED_SLASHES) . "\n\n";
                if (function_exists('ob_flush')) {
                    @ob_flush();
                }
                flush();
            };

            try {
                $this->messages->sendStreaming($request->user(), $validated, $emit);
            } catch (\Throwable $throwable) {
                $emit('message.failed', ['error' => $throwable->getMessage()]);
            }
        }, 200, [
            'Cache-Control' => 'no-cache',
            'Content-Type' => 'text/event-stream',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
        ]);
    }

    public function regenerate(Request $request, ChatMessage $message): JsonResponse
    {
        $prepared = $this->messages->queueRegenerate($request->user(), $message);
        $assistantMessage = $prepared['assistant_message'];

        $this->publisher->toConversation($prepared['conversation']->id, [
            'event' => 'message.created',
            'conversation_id' => $prepared['conversation']->id,
            'message' => $this->conversations->serializeMessage($assistantMessage),
            'replace' => true,
        ]);

        ProcessChatMessageRealtime::dispatch($assistantMessage->id);

        return response()->json([
            'success' => true,
            'conversation_id' => $prepared['conversation']->id,
            'assistant_message_id' => $assistantMessage->id,
            'assistant_message' => $this->conversations->serializeMessage($assistantMessage),
            'replace' => true,
        ], 202);
    }

    public function regenerateStream(Request $request, ChatMessage $message): StreamedResponse
    {
        return response()->stream(function () use ($request, $message): void {
            $emit = function (string $event, array $payload): void {
                echo "event: {$event}\n";
                echo 'data: ' . json_encode($payload, JSON_UNESCAPED_SLASHES) . "\n\n";
                if (function_exists('ob_flush')) {
                    @ob_flush();
                }
                flush();
            };

            try {
                $this->messages->regenerateStreaming($request->user(), $message, $emit);
            } catch (\Throwable $throwable) {
                $emit('message.failed', ['message_id' => $message->id, 'error' => $throwable->getMessage()]);
            }
        }, 200, [
            'Cache-Control' => 'no-cache',
            'Content-Type' => 'text/event-stream',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
        ]);
    }

    public function file(Request $request, string $file): JsonResponse|\Symfony\Component\HttpFoundation\StreamedResponse
    {
        $attachment = ChatMessageAttachment::query()
            ->where('id', $file)
            ->first();

        if ($attachment) {
            $message = $attachment->message()->with('conversation')->first();
            abort_unless($message && $message->conversation && $message->conversation->user_id === $request->user()->id, 403);

            if (!$attachment->path) {
                return response()->json(['message' => 'File not found'], 404);
            }

            if (Storage::disk('private')->exists($attachment->path)) {
                return Storage::disk('private')->download(
                    $attachment->path,
                    $attachment->name,
                    ['Content-Type' => $attachment->mime_type ?: 'application/octet-stream']
                );
            }

            if (Storage::disk('public')->exists($attachment->path)) {
                return Storage::disk('public')->download(
                    $attachment->path,
                    $attachment->name,
                    ['Content-Type' => $attachment->mime_type ?: 'application/octet-stream']
                );
            }

            if (Storage::disk('local')->exists($attachment->path)) {
                return Storage::disk('local')->download(
                    $attachment->path,
                    $attachment->name,
                    ['Content-Type' => $attachment->mime_type ?: 'application/octet-stream']
                );
            }

            return response()->json(['message' => 'File not found'], 404);
        }

        $response = $this->files->serveFile((int) $file);

        if (!$response) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return $response;
    }

    private function ensureMessageOrFiles(array $validated): void
    {
        if (trim((string) ($validated['message'] ?? '')) !== '' || !empty($validated['files'] ?? [])) {
            return;
        }

        throw ValidationException::withMessages([
            'message' => 'Enter a message or attach a file.',
        ]);
    }

    private function withDefaultAttachmentPrompt(array $validated): array
    {
        if (trim((string) ($validated['message'] ?? '')) !== '') {
            return $validated;
        }

        $files = $validated['files'] ?? [];
        $hasImage = collect($files)->contains(
            fn (array $file): bool => str_starts_with((string) ($file['type'] ?? ''), 'image/')
        );

        $validated['message'] = $hasImage
            ? 'Please analyze the uploaded image.'
            : 'Please review the attached file.';

        return $validated;
    }
}
