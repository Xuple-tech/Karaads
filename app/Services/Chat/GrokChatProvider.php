<?php

namespace App\Services\Chat;

use App\Contracts\ChatProvider;
use App\Services\GrokApiService;
use Illuminate\Support\Str;

class GrokChatProvider implements ChatProvider
{
    public function __construct(
        private readonly GrokApiService $grok,
    ) {
    }

    public function streamResponse(array $messages, array $tools, array $options, callable $onEvent): void
    {
        $history = $this->historyWithoutLatestUserPrompt($messages);
        $latestUserPrompt = $this->latestUserPrompt($messages);

        $this->grok->generateStreamingChat(
            $latestUserPrompt,
            function (array $chunk) use ($onEvent): void {
                if (isset($chunk['tool_status'])) {
                    $toolName = $chunk['tool_name'] ?? 'unknown';

                    if (in_array($chunk['tool_status'], ['executing_tool', 'executing'], true)) {
                        $onEvent('tool.started', [
                            'tool_name' => $toolName,
                            'message' => $chunk['tool_executing_message'] ?? $chunk['message'] ?? null,
                            'arguments' => $chunk['tool_args'] ?? null,
                        ]);
                    } elseif (in_array($chunk['tool_status'], ['tool_failed', 'failed'], true)) {
                        $onEvent('tool.failed', [
                            'tool_name' => $toolName,
                            'error' => $chunk['error'] ?? 'Tool execution failed',
                            'login_required' => $chunk['login_required'] ?? false,
                        ]);
                    } elseif ($chunk['tool_status'] === 'tool_completed') {
                        $onEvent('tool.completed', [
                            'tool_name' => $toolName,
                            'summary' => $chunk['result_summary'] ?? null,
                            'result' => $chunk['tool_result'] ?? null,
                            'references' => $chunk['references'] ?? [],
                            'generated_images' => $chunk['generated_images'] ?? [],
                        ]);
                    }

                    return;
                }

                if (isset($chunk['image'])) {
                    $onEvent('attachment.created', [
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
                    $onEvent('message.delta', [
                        'content' => $chunk['content'],
                    ]);
                }

                if (!empty($chunk['error'])) {
                    $onEvent('message.failed', [
                        'error' => $chunk['error'],
                    ]);
                }

                if (!empty($chunk['done'])) {
                    $onEvent('message.completed', []);
                }
            },
            $options['model'] ?? 'grok-4-fast-non-reasoning',
            $history,
            $tools,
            $options['format'] ?? null,
            $options['auto_tools'] ?? true,
            $options['files'] ?? [],
            $options['custom_system_prompt'] ?? null,
            false,
            $options['user_name'] ?? null,
            $options['message_id'] ?? null,
        );
    }

    public function generateResponse(array $messages, array $tools, array $options): array
    {
        $history = $this->historyWithoutLatestUserPrompt($messages);
        $latestUserPrompt = $this->latestUserPrompt($messages);

        $content = $this->grok->generateChat(
            $latestUserPrompt,
            $options['model'] ?? 'grok-4-fast-non-reasoning',
            $history,
            $tools,
            $options['format'] ?? null,
            $options['files'] ?? [],
            $options['custom_system_prompt'] ?? null,
            false,
            $options['user_name'] ?? null,
            null,
        );

        return ['content' => $content];
    }

    public function generateTitle(string $prompt): string
    {
        return Str::limit(trim($prompt), 60, '');
    }

    private function latestUserPrompt(array $messages): string
    {
        $last = collect($messages)->last(fn (array $message) => ($message['role'] ?? null) === 'user');

        return (string) ($last['content'] ?? '');
    }

    private function historyWithoutLatestUserPrompt(array $messages): array
    {
        $lastUserIndex = null;

        foreach ($messages as $index => $message) {
            if (($message['role'] ?? null) === 'user') {
                $lastUserIndex = $index;
            }
        }

        if ($lastUserIndex === null) {
            return $messages;
        }

        return array_values(array_filter(
            $messages,
            fn (array $message, int $index) => $index !== $lastUserIndex,
            ARRAY_FILTER_USE_BOTH
        ));
    }
}
