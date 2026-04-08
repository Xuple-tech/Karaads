<?php

namespace App\Jobs;

use App\Models\ChatMessage;
use App\Services\DocBuilder\DocBuilderRealtimeService;
use App\Services\Realtime\RealtimePublisher;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessDocBuilderRealtime implements ShouldQueue
{
    use Queueable;

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
}
