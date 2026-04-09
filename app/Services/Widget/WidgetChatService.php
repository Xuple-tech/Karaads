<?php

namespace App\Services\Widget;

use App\Models\WidgetConfig;
use App\Models\WidgetMessage;
use App\Models\WidgetSession;
use App\Services\GrokApiService;
use App\Services\SubscriptionService;
use Illuminate\Support\Collection;

class WidgetChatService
{
    public function __construct(
        private readonly GrokApiService $grok,
        private readonly WidgetToolService $tools,
        private readonly SubscriptionService $subscriptions
    ) {
    }

    public function streamChat(
        WidgetConfig $widget,
        WidgetSession $session,
        string $message,
        array $files,
        callable $emit
    ): void {
        $owner = $widget->user;
        $limit = $this->subscriptions->canUseWidgetRequest($owner);

        if (! $limit['allowed']) {
            $emit('message.failed', [
                'error' => $limit['reason'] ?? 'Widget usage limit exceeded',
            ]);

            return;
        }

        if (! empty($files) && (! $widget->allow_file_uploads || ! $this->subscriptions->hasPlanCapability($owner, 'widget_file_uploads'))) {
            $emit('message.failed', [
                'error' => 'File uploads are not enabled for this widget.',
            ]);

            return;
        }

        $history = $this->buildHistory($session);
        $systemPrompt = $this->buildSystemPrompt($widget);
        $toolDefinitions = $this->tools->prepareToolsForWidget($widget);

        $userMessage = WidgetMessage::create([
            'session_id' => $session->id,
            'role' => 'user',
            'content' => $message,
        ]);

        $assistantMessage = WidgetMessage::create([
            'session_id' => $session->id,
            'role' => 'assistant',
            'content' => '',
        ]);

        $emit('message.created', [
            'conversation_id' => $session->id,
            'message_id' => $assistantMessage->id,
            'message' => [
                'id' => $assistantMessage->id,
                'conversation_id' => $session->id,
                'role' => 'assistant',
                'status' => 'streaming',
                'content_markdown' => '',
                'content_text' => '',
                'attachments' => [],
                'tool_runs' => [],
            ],
        ]);

        $assistantContent = '';
        $this->subscriptions->recordWidgetRequest($owner);
        $session->forceFill(['last_seen_at' => now()])->save();

        try {
            $this->grok->generateStreamingChat(
                prompt: $message,
                callback: function (array $chunk) use ($assistantMessage, $emit, &$assistantContent): void {
                    if (isset($chunk['tool_status'])) {
                        $toolName = $chunk['tool_name'] ?? 'tool';

                        if (in_array($chunk['tool_status'], ['executing_tool', 'executing'], true)) {
                            $emit('tool.started', [
                                'message_id' => $assistantMessage->id,
                                'tool_name' => $toolName,
                                'message' => $chunk['tool_executing_message'] ?? null,
                                'arguments' => $chunk['tool_args'] ?? null,
                            ]);
                        } elseif (in_array($chunk['tool_status'], ['tool_failed', 'failed'], true)) {
                            $emit('tool.failed', [
                                'message_id' => $assistantMessage->id,
                                'tool_name' => $toolName,
                                'error' => $chunk['error'] ?? 'Tool execution failed',
                            ]);
                        } elseif ($chunk['tool_status'] === 'tool_completed') {
                            $emit('tool.completed', [
                                'message_id' => $assistantMessage->id,
                                'tool_name' => $toolName,
                                'summary' => $chunk['result_summary'] ?? null,
                                'result' => $chunk['tool_result'] ?? null,
                                'references' => $chunk['references'] ?? [],
                            ]);
                        }

                        return;
                    }

                    if (isset($chunk['image'])) {
                        $emit('attachment.created', [
                            'message_id' => $assistantMessage->id,
                            'attachment' => [
                                'kind' => 'image',
                                'url' => $chunk['image']['url'] ?? null,
                                'name' => $chunk['image']['metadata']['revised_prompt'] ?? 'Generated image',
                                'mime_type' => 'image/png',
                                'payload' => $chunk['image']['metadata'] ?? [],
                            ],
                        ]);
                    }

                    if (isset($chunk['content']) && $chunk['content'] !== '') {
                        $assistantContent .= $chunk['content'];
                        $emit('message.delta', [
                            'message_id' => $assistantMessage->id,
                            'content' => $chunk['content'],
                        ]);
                    }

                    if (! empty($chunk['error'])) {
                        $emit('message.failed', [
                            'message_id' => $assistantMessage->id,
                            'error' => $chunk['error'],
                        ]);
                    }

                    if (! empty($chunk['done'])) {
                        $emit('message.completed', [
                            'message_id' => $assistantMessage->id,
                            'content' => $assistantContent,
                        ]);
                    }
                },
                model: 'grok-4-fast-non-reasoning',
                history: $history,
                tools: $toolDefinitions,
                files: $files,
                customSystemPrompt: $systemPrompt,
                chatId: $assistantMessage->id
            );

            $assistantMessage->update(['content' => $assistantContent]);
        } catch (\Throwable $e) {
            $assistantMessage->update(['content' => $assistantContent]);

            $emit('message.failed', [
                'message_id' => $assistantMessage->id,
                'error' => $e->getMessage(),
            ]);
        } finally {
            $this->tools->clearContext();
            $session->forceFill(['last_seen_at' => now()])->save();
        }
    }

    private function buildHistory(WidgetSession $session): array
    {
        return $session->messages()
            ->latest()
            ->limit(20)
            ->get()
            ->reverse()
            ->map(fn (WidgetMessage $message) => [
                'role' => $message->role,
                'content' => $message->content,
            ])
            ->values()
            ->all();
    }

    private function buildSystemPrompt(WidgetConfig $widget): string
    {
        $knowledge = $widget->knowledgeItems()
            ->where('status', 'ready')
            ->latest()
            ->get()
            ->map(fn ($item) => trim((string) $item->content))
            ->filter()
            ->implode("\n\n---\n\n");

        $knowledge = mb_substr($knowledge, 0, 30000);
        $prompt = trim((string) $widget->system_prompt);
        $botName = trim((string) $widget->bot_name) ?: 'Kwati';

        $parts = [
            "You are {$botName}, an embeddable website assistant for {$widget->name}.",
            $prompt !== '' ? $prompt : 'Answer clearly, stay helpful, and keep the conversation concise unless the visitor asks for more detail.',
        ];

        if ($knowledge !== '') {
            $parts[] = "Use the following knowledge base when it is relevant:\n\n{$knowledge}";
        }

        return implode("\n\n", $parts);
    }
}
