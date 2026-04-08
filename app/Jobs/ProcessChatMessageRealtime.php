<?php

namespace App\Jobs;

use App\Models\ChatMessage;
use App\Services\Chat\ChatConversationService;
use App\Services\Chat\ChatMessageService;
use App\Services\Realtime\RealtimePublisher;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

class ProcessChatMessageRealtime implements ShouldQueue
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
        ChatMessageService $messages,
        ChatConversationService $conversations,
        RealtimePublisher $publisher,
    ): void {
        $assistantMessage = ChatMessage::query()
            ->with('conversation')
            ->findOrFail($this->assistantMessageId);
        $conversation = $assistantMessage->conversation;

        $messages->processAssistantMessage($assistantMessage, function (string $eventName, array $payload) use ($conversation, $assistantMessage, $conversations, $publisher): void {
            $publisher->toConversation($conversation->id, array_merge($payload, [
                'event' => $eventName,
                'conversation_id' => $conversation->id,
            ]));

            if (in_array($eventName, ['message.completed', 'message.failed'], true)) {
                $publisher->conversationUpdated(
                    $conversation->fresh(),
                    $assistantMessage->fresh()?->content_text ?: $assistantMessage->fresh()?->content_markdown
                );
            }
        });

        $publisher->toConversation($conversation->id, [
            'event' => 'message.synced',
            'conversation_id' => $conversation->id,
            'message' => $conversations->serializeMessage($assistantMessage->fresh(['attachments', 'toolRuns', 'sources'])),
        ]);
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
            'error_message' => 'Message processing failed before completion.',
        ]);

        $publisher = app(RealtimePublisher::class);
        $conversation = $assistantMessage->conversation;

        $publisher->toConversation($conversation->id, [
            'event' => 'message.failed',
            'conversation_id' => $conversation->id,
            'message_id' => $assistantMessage->id,
            'error' => 'Message processing failed before completion.',
        ]);

        $publisher->conversationUpdated(
            $conversation->fresh(),
            $assistantMessage->fresh()?->content_text ?: $assistantMessage->fresh()?->content_markdown
        );

        report($exception);
    }
}
