<?php

namespace App\Http\Controllers\Api\Chat;

use App\Http\Controllers\Controller;
use App\Models\ChatMessageAttachment;
use App\Models\ChatMessage;
use App\Services\Chat\ChatMessageService;
use App\Services\ChatFileAttachmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MessageController extends Controller
{
    public function __construct(
        private readonly ChatMessageService $messages,
        private readonly ChatFileAttachmentService $files,
    ) {
    }

    public function store(Request $request): StreamedResponse
    {
        $validated = $request->validate([
            'conversation_id' => ['nullable', 'string', 'exists:conversations,id'],
            'message' => ['required', 'string'],
            'type' => ['nullable', 'string'],
            'model' => ['nullable', 'string'],
            'files' => ['nullable', 'array'],
        ]);

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

    public function regenerate(Request $request, ChatMessage $message): StreamedResponse
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

            if (!$attachment->path || !Storage::disk('private')->exists($attachment->path)) {
                return response()->json(['message' => 'File not found'], 404);
            }

            return Storage::disk('private')->download(
                $attachment->path,
                $attachment->name,
                ['Content-Type' => $attachment->mime_type ?: 'application/octet-stream']
            );
        }

        $response = $this->files->serveFile((int) $file);

        if (!$response) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return $response;
    }
}
