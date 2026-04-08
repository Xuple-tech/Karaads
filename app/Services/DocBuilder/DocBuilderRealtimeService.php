<?php

namespace App\Services\DocBuilder;

use App\Models\ChatMessage;
use App\Models\Conversation;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class DocBuilderRealtimeService
{
    private const API_ENDPOINT = 'https://api.x.ai/v1/chat/completions';
    private const OPEN_TAG = '<kwati-document>';
    private const CLOSE_TAG = '</kwati-document>';

    public const CONVERSATION_TYPE = 'text';
    public const CONVERSATION_MODE = 'doc_builder';

    public const MODELS = [
        'grok-4' => 'Grok 4 (Best Quality)',
        'grok-4-fast-non-reasoning' => 'Grok 4 Fast',
        'grok-4-fast-reasoning' => 'Grok 4 Reasoning',
    ];

    public const DOCUMENT_TYPES = [
        'general', 'report', 'proposal', 'letter', 'essay',
        'resume', 'business', 'academic', 'code', 'technical',
    ];

    public function queueMessage(string $userId, array $payload): array
    {
        $conversation = $this->resolveConversation($userId, $payload);

        $userMessage = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'status' => 'completed',
            'type' => 'text',
            'content_markdown' => (string) $payload['message'],
            'content_text' => (string) $payload['message'],
        ]);

        $assistantMessage = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'reply_to_id' => $userMessage->id,
            'role' => 'assistant',
            'status' => 'streaming',
            'type' => 'text',
            'content_markdown' => '',
            'content_text' => '',
            'model' => $conversation->doc_model ?? 'grok-4',
        ]);

        return [
            'conversation' => $conversation->fresh(),
            'user_message' => $userMessage,
            'assistant_message' => $assistantMessage,
        ];
    }

    public function process(ChatMessage $assistantMessage, callable $emit): array
    {
        $assistantMessage->loadMissing('conversation.user', 'replyTo');
        /** @var Conversation $conversation */
        $conversation = $assistantMessage->conversation;
        $userMessage = $assistantMessage->replyTo()->firstOrFail();

        $chatBuffer = '';
        $docBuffer = '';

        $client = new Client([
            'timeout' => 180,
            'connect_timeout' => 15,
            'verify' => config('services.grok.verify_ssl', true),
        ]);

        try {
            $response = $client->post(self::API_ENDPOINT, [
                'headers' => [
                    'Authorization' => 'Bearer '.config('services.grok.api_key'),
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'model' => $conversation->doc_model ?? 'grok-4',
                    'messages' => $this->buildMessages(
                        $conversation,
                        $userMessage->id,
                        (string) ($userMessage->content_markdown ?: $userMessage->content_text),
                    ),
                    'stream' => true,
                    'max_tokens' => 16000,
                    'temperature' => 0.65,
                ],
                'stream' => true,
            ]);

            $body = $response->getBody();
            $buffer = '';
            $state = 'chat';

            while (! $body->eof()) {
                foreach (explode("\n", $body->read(512)) as $line) {
                    $line = trim($line);

                    if (! str_starts_with($line, 'data: ')) {
                        continue;
                    }

                    $data = substr($line, 6);

                    if ($data === '[DONE]') {
                        if ($buffer !== '') {
                            $this->flushBuffer($assistantMessage, $conversation, $state, $buffer, $emit, $chatBuffer, $docBuffer);
                            $buffer = '';
                        }

                        break 2;
                    }

                    $parsed = json_decode($data, true);
                    $content = $parsed['choices'][0]['delta']['content'] ?? '';

                    if ($content === '') {
                        continue;
                    }

                    $buffer .= $content;
                    [$buffer, $state] = $this->processBuffer(
                        $assistantMessage,
                        $conversation,
                        $buffer,
                        $state,
                        $emit,
                        $chatBuffer,
                        $docBuffer,
                    );
                }
            }

            if ($buffer !== '') {
                $this->flushBuffer($assistantMessage, $conversation, $state, $buffer, $emit, $chatBuffer, $docBuffer);
            }

            $assistantMessage->updateQuietly([
                'status' => 'completed',
                'content_markdown' => $chatBuffer,
                'content_text' => strip_tags($chatBuffer),
                'error_message' => null,
            ]);

            $conversation->updateQuietly([
                'document_content' => $docBuffer !== '' ? $docBuffer : $conversation->document_content,
            ]);

            $emit('message.completed', [
                'message_id' => $assistantMessage->id,
                'content' => $assistantMessage->content_markdown,
            ]);

            if ($docBuffer !== '') {
                $emit('document.completed', [
                    'message_id' => $assistantMessage->id,
                    'document_content' => $docBuffer,
                ]);
                $emit('document.saved', [
                    'message_id' => $assistantMessage->id,
                    'document_content' => $docBuffer,
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('DocBuilder realtime process failed', [
                'conversation_id' => $conversation->id,
                'assistant_message_id' => $assistantMessage->id,
                'error' => $e->getMessage(),
            ]);

            $assistantMessage->updateQuietly([
                'status' => 'failed',
                'error_message' => 'Generation failed. Please try again.',
            ]);

            $emit('message.failed', [
                'message_id' => $assistantMessage->id,
                'error' => 'Generation failed. Please try again.',
            ]);
        }

        return [
            'conversation' => $conversation->fresh(),
            'assistant_message' => $assistantMessage->fresh(),
        ];
    }

    private function resolveConversation(string $userId, array $payload): Conversation
    {
        $conversationId = $payload['conversation_id'] ?? null;
        $title = $payload['title'] ?? 'Untitled Document';
        $documentType = $payload['document_type'] ?? 'general';
        $model = $payload['model'] ?? 'grok-4';
        $document = $payload['document'] ?? '';

        if ($conversationId) {
            $conversation = Conversation::query()
                ->where('id', $conversationId)
                ->where('user_id', $userId)
                ->where('type', self::CONVERSATION_TYPE)
                ->where('mode', self::CONVERSATION_MODE)
                ->firstOrFail();

            $conversation->update([
                'title' => $title,
                'document_type' => $documentType,
                'doc_model' => $model,
                'document_content' => $document !== '' ? $document : $conversation->document_content,
            ]);

            return $conversation->fresh();
        }

        return Conversation::create([
            'user_id' => $userId,
            'title' => $title,
            'type' => self::CONVERSATION_TYPE,
            'mode' => self::CONVERSATION_MODE,
            'document_type' => $documentType,
            'doc_model' => $model,
            'document_content' => $document,
        ]);
    }

    private function flushBuffer(
        ChatMessage $assistantMessage,
        Conversation $conversation,
        string $state,
        string $buffer,
        callable $emit,
        string &$chatBuffer,
        string &$docBuffer,
    ): void {
        if ($state === 'document') {
            $docBuffer .= $buffer;
            $conversation->updateQuietly(['document_content' => $docBuffer]);
            $emit('document.delta', [
                'message_id' => $assistantMessage->id,
                'content' => $buffer,
                'document_content' => $docBuffer,
            ]);

            return;
        }

        $chatBuffer .= $buffer;
        $assistantMessage->updateQuietly([
            'content_markdown' => $chatBuffer,
            'content_text' => strip_tags($chatBuffer),
        ]);
        $emit('message.delta', [
            'message_id' => $assistantMessage->id,
            'content' => $buffer,
        ]);
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function processBuffer(
        ChatMessage $assistantMessage,
        Conversation $conversation,
        string $buffer,
        string $state,
        callable $emit,
        string &$chatBuffer,
        string &$docBuffer,
    ): array {
        while (true) {
            if ($state === 'chat') {
                $pos = strpos($buffer, self::OPEN_TAG);
                if ($pos === false) {
                    $safe = max(0, strlen($buffer) - strlen(self::OPEN_TAG));
                    if ($safe > 0) {
                        $this->flushBuffer($assistantMessage, $conversation, 'chat', substr($buffer, 0, $safe), $emit, $chatBuffer, $docBuffer);
                        $buffer = substr($buffer, $safe);
                    }
                    break;
                }

                if ($pos > 0) {
                    $this->flushBuffer($assistantMessage, $conversation, 'chat', substr($buffer, 0, $pos), $emit, $chatBuffer, $docBuffer);
                }

                $buffer = substr($buffer, $pos + strlen(self::OPEN_TAG));
                $state = 'document';
            } else {
                $pos = strpos($buffer, self::CLOSE_TAG);
                if ($pos === false) {
                    $safe = max(0, strlen($buffer) - strlen(self::CLOSE_TAG));
                    if ($safe > 0) {
                        $this->flushBuffer($assistantMessage, $conversation, 'document', substr($buffer, 0, $safe), $emit, $chatBuffer, $docBuffer);
                        $buffer = substr($buffer, $safe);
                    }
                    break;
                }

                if ($pos > 0) {
                    $this->flushBuffer($assistantMessage, $conversation, 'document', substr($buffer, 0, $pos), $emit, $chatBuffer, $docBuffer);
                }

                $buffer = substr($buffer, $pos + strlen(self::CLOSE_TAG));
                $state = 'chat';
            }
        }

        return [$buffer, $state];
    }

    private function buildMessages(Conversation $conversation, string $latestUserMessageId, string $message): array
    {
        $messages = [
            [
                'role' => 'system',
                'content' => $this->systemPrompt(
                    $conversation->title ?: 'Untitled Document',
                    $conversation->document_type ?? 'general',
                    $conversation->document_content ?? '',
                ),
            ],
            ['role' => 'system', 'content' => 'Current date: '.now()->format('F j, Y')],
        ];

        ChatMessage::query()
            ->where('conversation_id', $conversation->id)
            ->where('id', '!=', $latestUserMessageId)
            ->orderBy('created_at')
            ->get()
            ->each(function (ChatMessage $chatMessage) use (&$messages): void {
                $content = (string) ($chatMessage->content_markdown ?: $chatMessage->content_text ?: '');
                if ($content !== '') {
                    $messages[] = [
                        'role' => $chatMessage->role,
                        'content' => $content,
                    ];
                }
            });

        $messages[] = ['role' => 'user', 'content' => $message];

        return $messages;
    }

    private function systemPrompt(string $title, string $documentType, string $currentDocument): string
    {
        $hasDocument = trim($currentDocument) !== '';
        $docContext = $hasDocument
            ? "The user's current working document:\n\n<current-document>\n{$currentDocument}\n</current-document>"
            : 'No document exists yet - you will create one from scratch.';

        return <<<PROMPT
# Kwati AI - Document Builder Agent

You are an expert document creation assistant embedded in the Kwati AI Document Builder. Your job is to help users create, edit, and refine professional documents through natural conversation.

## Current Document
- **Title:** {$title}
- **Type:** {$documentType}
- {$docContext}

## Response Format

Every response MUST follow this exact structure:

**Part 1 - Chat response** (always required)
Write 1-3 sentences explaining what you are doing or asking. Be direct, confident, and helpful. No filler phrases.

**Part 2 - Document block** (required whenever you create or modify the document)
Output the complete, updated document inside these exact XML tags:

<kwati-document>
[full document in professional markdown]
</kwati-document>

## Core Rules

1. Always output the COMPLETE document - never partial or diff-only updates
2. Skip the document block only when the user asks a question requiring no change
3. Use proper heading hierarchy, professional writing, and correct markdown formatting
4. For code documents: use properly fenced code blocks with language identifiers
5. Never output partial documents - always the complete content

## Identity

If asked who you are, say you are Kwati AI Document Builder, built by the KwatiAi team.
PROMPT;
    }
}
