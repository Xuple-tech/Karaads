<?php

namespace App\Jobs;

use App\Models\ChatMessage;
use App\Services\DocBuilder\DocBuilderRealtimeService;
use App\Services\Realtime\RealtimePublisher;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class ProcessDocBuilderRealtime implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    public int $timeout = 180;

    public bool $failOnTimeout = true;

    public function __construct(
        public readonly string $assistantMessageId,
    ) {
    }

    public function handle(
        DocBuilderRealtimeService $service,
        RealtimePublisher $publisher,
    ): void {
        $assistantMessage = ChatMessage::query()
            ->with('conversation')
            ->findOrFail($this->assistantMessageId);
        $conversation = $assistantMessage->conversation;

        $service->process($assistantMessage, function (string $eventName, array $payload) use ($publisher, $conversation): void {
            $publisher->toConversation($conversation->id, array_merge($payload, [
                'event' => $eventName,
                'conversation_id' => $conversation->id,
            ]));
        });

        $publisher->conversationUpdated(
            $conversation->fresh(),
            $assistantMessage->fresh()?->content_text ?: $assistantMessage->fresh()?->content_markdown
        );
    }

    public function failed(Throwable $exception): void
    {
        $assistantMessage = ChatMessage::query()
            ->with('conversation')
            ->find($this->assistantMessageId);

        if (! $assistantMessage || ! $assistantMessage->conversation) {
            return;
        }

        $assistantMessage->updateQuietly([
            'status' => 'failed',
            'error_message' => 'Document generation failed before completion.',
        ]);

        $publisher = app(RealtimePublisher::class);
        $conversation = $assistantMessage->conversation;

        $publisher->toConversation($conversation->id, [
            'event' => 'message.failed',
            'conversation_id' => $conversation->id,
            'message_id' => $assistantMessage->id,
            'error' => 'Document generation failed before completion.',
        ]);

        $publisher->conversationUpdated(
            $conversation->fresh(),
            $assistantMessage->fresh()?->content_text ?: $assistantMessage->fresh()?->content_markdown
        );

        report($exception);
    }
}
