<?php

namespace App\Http\Controllers\DocBuilder;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessDocBuilderRealtime;
use App\Models\ChatMessage;
use App\Models\Conversation;
use App\Services\DocBuilder\DocBuilderRealtimeService;
use App\Services\PythonDocumentGenerationService;
use App\Services\Realtime\RealtimePublisher;
use GuzzleHttp\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocBuilderController extends Controller
{
    private const API_ENDPOINT = 'https://api.x.ai/v1/chat/completions';
    private const OPEN_TAG     = '<kwati-document>';
    private const CLOSE_TAG    = '</kwati-document>';
    private const CONVERSATION_TYPE = 'text';
    private const CONVERSATION_MODE = 'doc_builder';

    private const MODELS = [
        'grok-4'                    => 'Grok 4 (Best Quality)',
        'grok-4-fast-non-reasoning' => 'Grok 4 Fast',
        'grok-4-fast-reasoning'     => 'Grok 4 Reasoning',
    ];

    private const DOCUMENT_TYPES = [
        'general', 'report', 'proposal', 'letter', 'essay',
        'resume', 'business', 'academic', 'code', 'technical',
    ];

    public function __construct(
        private readonly PythonDocumentGenerationService $docService,
        private readonly DocBuilderRealtimeService $realtimeService,
        private readonly RealtimePublisher $publisher,
    ) {}

    // ─────────────────────────────────────────────────────────────────────────
    // Streaming
    // ─────────────────────────────────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|max:12000',
            'document' => 'nullable|string',
            'title' => 'nullable|string|max:255',
            'document_type' => 'nullable|string|in:' . implode(',', self::DOCUMENT_TYPES),
            'model' => 'nullable|string|in:' . implode(',', array_keys(self::MODELS)),
            'conversation_id' => 'nullable|string',
        ]);

        $prepared = $this->realtimeService->queueMessage((string) Auth::id(), $validated);
        $assistantMessage = $prepared['assistant_message'];

        $this->publisher->toConversation($prepared['conversation']->id, [
            'event' => 'message.created',
            'conversation_id' => $prepared['conversation']->id,
            'message' => [
                'id' => $assistantMessage->id,
                'conversation_id' => $assistantMessage->conversation_id,
                'role' => $assistantMessage->role,
                'status' => $assistantMessage->status,
                'provider' => $assistantMessage->provider,
                'model' => $assistantMessage->model,
                'type' => $assistantMessage->type,
                'content_markdown' => $assistantMessage->content_markdown,
                'content_text' => $assistantMessage->content_text,
                'created_at' => $assistantMessage->created_at?->toIso8601String(),
                'attachments' => [],
            ],
        ]);
        $this->publisher->conversationUpdated($prepared['conversation'], $prepared['user_message']->content_text);

        ProcessDocBuilderRealtime::dispatch($assistantMessage->id);

        return response()->json([
            'success' => true,
            'conversation_id' => $prepared['conversation']->id,
            'user_message_id' => $prepared['user_message']->id,
            'assistant_message_id' => $assistantMessage->id,
        ], 202);
    }

    public function stream(Request $request): StreamedResponse
    {
        $validated = $request->validate([
            'message'         => 'required|string|max:12000',
            'document'        => 'nullable|string',
            'title'           => 'nullable|string|max:255',
            'document_type'   => 'nullable|string|in:' . implode(',', self::DOCUMENT_TYPES),
            'model'           => 'nullable|string|in:' . implode(',', array_keys(self::MODELS)),
            'history'         => 'nullable|array|max:40',
            'history.*.role'  => 'required|string|in:user,assistant',
            'history.*.content' => 'required|string|max:20000',
            'conversation_id' => 'nullable|string',
        ]);

        $user           = Auth::user();
        $message        = $validated['message'];
        $document       = $validated['document'] ?? '';
        $title          = $validated['title'] ?? 'Untitled Document';
        $documentType   = $validated['document_type'] ?? 'general';
        $model          = $validated['model'] ?? 'grok-4';
        $history        = $validated['history'] ?? [];
        $conversationId = $validated['conversation_id'] ?? null;
        $apiKey         = config('services.grok.api_key');

        // Resolve or create the doc builder conversation.
        if ($conversationId) {
            $conversation = Conversation::where('id', $conversationId)
                ->where('user_id', $user->id)
                ->where('type', self::CONVERSATION_TYPE)
                ->where('mode', self::CONVERSATION_MODE)
                ->firstOrFail();
        } else {
            $conversation = Conversation::create([
                'user_id'       => $user->id,
                'title'         => $title,
                'type'          => self::CONVERSATION_TYPE,
                'mode'          => self::CONVERSATION_MODE,
                'document_type' => $documentType,
                'doc_model'     => $model,
            ]);
        }

        // Store user message
        $userMsg = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'role'            => 'user',
            'status'          => 'completed',
            'type'            => 'text',
            'content_markdown'=> $message,
            'content_text'    => $message,
        ]);

        // Placeholder assistant message
        $assistantMsg = ChatMessage::create([
            'conversation_id' => $conversation->id,
            'role'            => 'assistant',
            'status'          => 'streaming',
            'type'            => 'text',
            'content_markdown'=> '',
            'content_text'    => '',
            'model'           => $model,
        ]);

        return response()->stream(
            function () use (
                $message, $document, $title, $documentType, $model,
                $history, $apiKey, $conversation, $userMsg, $assistantMsg
            ) {
                // Send session info as the very first event so the frontend
                // can store the conversation_id immediately
                $this->emit('session', [
                    'conversation_id'    => $conversation->id,
                    'user_message_id'    => $userMsg->id,
                    'assistant_message_id' => $assistantMsg->id,
                ]);
                ob_flush();
                flush();

                $chatBuffer = '';
                $docBuffer  = '';

                $this->runStream(
                    $message, $document, $title, $documentType, $model, $history, $apiKey,
                    function (string $event, array $data) use (&$chatBuffer, &$docBuffer) {
                        $this->emit($event, $data);
                        ob_flush();
                        flush();
                        if ($event === 'chat' && isset($data['content'])) {
                            $chatBuffer .= $data['content'];
                        }
                        if ($event === 'document' && isset($data['content'])) {
                            $docBuffer .= $data['content'];
                        }
                    }
                );

                // Persist after stream completes
                try {
                    $finalDoc = $docBuffer ?: $document;

                    $assistantMsg->update([
                        'content_markdown' => $chatBuffer,
                        'content_text'     => strip_tags($chatBuffer),
                        'status'           => 'completed',
                    ]);

                    $conversation->update([
                        'title'            => $title,
                        'document_content' => $finalDoc,
                        'document_type'    => $documentType,
                        'doc_model'        => $model,
                    ]);
                } catch (\Throwable $e) {
                    Log::error('DocBuilder persist failed', ['error' => $e->getMessage()]);
                }
            },
            200,
            [
                'Content-Type'      => 'text/event-stream',
                'Cache-Control'     => 'no-cache, no-store, must-revalidate',
                'X-Accel-Buffering' => 'no',
                'Connection'        => 'keep-alive',
            ]
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Session management
    // ─────────────────────────────────────────────────────────────────────────

    /** List all doc builder sessions for the current user */
    public function index(): JsonResponse
    {
        $sessions = Conversation::where('user_id', Auth::id())
            ->where('type', self::CONVERSATION_TYPE)
            ->where('mode', self::CONVERSATION_MODE)
            ->select(['id', 'title', 'document_type', 'doc_model', 'updated_at'])
            ->orderByDesc('updated_at')
            ->limit(60)
            ->get();

        return response()->json(['sessions' => $sessions]);
    }

    /** Load a single doc builder session with its messages */
    public function show(string $id): JsonResponse
    {
        $session = Conversation::where('id', $id)
            ->where('user_id', Auth::id())
            ->where('type', self::CONVERSATION_TYPE)
            ->where('mode', self::CONVERSATION_MODE)
            ->firstOrFail();

        $messages = ChatMessage::where('conversation_id', $session->id)
            ->select(['id', 'role', 'content_markdown', 'created_at'])
            ->orderBy('created_at')
            ->get()
            ->map(fn ($m) => [
                'id'      => $m->id,
                'role'    => $m->role,
                'content' => $m->content_markdown ?? '',
            ]);

        return response()->json([
            'session' => [
                'id'               => $session->id,
                'title'            => $session->title,
                'document_type'    => $session->document_type ?? 'general',
                'doc_model'        => $session->doc_model ?? 'grok-4',
                'document_content' => $session->document_content ?? '',
                'updated_at'       => $session->updated_at,
                'messages'         => $messages,
            ],
        ]);
    }

    /** Update document title / metadata without streaming */
    public function update(Request $request, string $id): JsonResponse
    {
        $session = Conversation::where('id', $id)
            ->where('user_id', Auth::id())
            ->where('type', self::CONVERSATION_TYPE)
            ->where('mode', self::CONVERSATION_MODE)
            ->firstOrFail();

        $validated = $request->validate([
            'title'            => 'sometimes|string|max:255',
            'document_content' => 'sometimes|string',
            'document_type'    => 'sometimes|string',
        ]);

        $session->update($validated);

        return response()->json(['success' => true]);
    }

    /** Delete a session */
    public function destroy(string $id): JsonResponse
    {
        $session = Conversation::where('id', $id)
            ->where('user_id', Auth::id())
            ->where('type', self::CONVERSATION_TYPE)
            ->where('mode', self::CONVERSATION_MODE)
            ->firstOrFail();

        $session->delete();

        return response()->json(['success' => true]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Export
    // ─────────────────────────────────────────────────────────────────────────

    public function export(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content'       => 'required|string',
            'title'         => 'nullable|string|max:255',
            'format'        => 'required|string|in:pdf,docx',
            'document_type' => 'nullable|string|in:' . implode(',', self::DOCUMENT_TYPES),
        ]);

        try {
            $result = $this->docService->generateDocument(
                title:           $validated['title'] ?? 'Document',
                contentMarkdown: $validated['content'],
                format:          $validated['format'],
                documentType:    $validated['document_type'] ?? 'general',
                options:         ['include_page_numbers' => true, 'include_header' => true],
            );

            if (!($result['success'] ?? false)) {
                return response()->json(['error' => 'Export failed. Please try again.'], 500);
            }

            return response()->json($result);
        } catch (\Throwable $e) {
            Log::error('DocBuilder export failed', ['error' => $e->getMessage()]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /** Available models and document types for the UI */
    public function config(): JsonResponse
    {
        return response()->json([
            'models'         => DocBuilderRealtimeService::MODELS,
            'document_types' => DocBuilderRealtimeService::DOCUMENT_TYPES,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function runStream(
        string   $message,
        string   $document,
        string   $title,
        string   $documentType,
        string   $model,
        array    $history,
        string   $apiKey,
        callable $onEmit
    ): void {
        $messages = $this->buildMessages($message, $document, $title, $documentType, $history);

        $client = new Client([
            'timeout'         => 180,
            'connect_timeout' => 15,
            'verify'          => config('services.grok.verify_ssl', true),
        ]);

        try {
            $response = $client->post(self::API_ENDPOINT, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $apiKey,
                    'Content-Type'  => 'application/json',
                ],
                'json' => [
                    'model'       => $model,
                    'messages'    => $messages,
                    'stream'      => true,
                    'max_tokens'  => 16000,
                    'temperature' => 0.65,
                ],
                'stream' => true,
            ]);

            $body   = $response->getBody();
            $buffer = '';
            $state  = 'chat';

            while (!$body->eof()) {
                foreach (explode("\n", $body->read(512)) as $line) {
                    $line = trim($line);
                    if (!str_starts_with($line, 'data: ')) continue;

                    $data = substr($line, 6);
                    if ($data === '[DONE]') {
                        if ($buffer !== '') {
                            $onEmit($state === 'document' ? 'document' : 'chat', ['content' => $buffer]);
                            $buffer = '';
                        }
                        $onEmit('done', []);
                        return;
                    }

                    $parsed  = json_decode($data, true);
                    $content = $parsed['choices'][0]['delta']['content'] ?? '';
                    if ($content === '') continue;

                    $buffer .= $content;
                    [$buffer, $state] = $this->processBuffer($buffer, $state, $onEmit);
                }
            }

            if ($buffer !== '') $onEmit($state === 'document' ? 'document' : 'chat', ['content' => $buffer]);
            $onEmit('done', []);
        } catch (\Throwable $e) {
            Log::error('DocBuilder stream error', ['error' => $e->getMessage(), 'model' => $model]);
            $onEmit('error', ['message' => 'Generation failed. Please try again.']);
        }
    }

    /** @return array{string, string} */
    private function processBuffer(string $buffer, string $state, callable $onEmit): array
    {
        while (true) {
            if ($state === 'chat') {
                $pos = strpos($buffer, self::OPEN_TAG);
                if ($pos === false) {
                    $safe = max(0, strlen($buffer) - strlen(self::OPEN_TAG));
                    if ($safe > 0) { $onEmit('chat', ['content' => substr($buffer, 0, $safe)]); $buffer = substr($buffer, $safe); }
                    break;
                }
                if ($pos > 0) $onEmit('chat', ['content' => substr($buffer, 0, $pos)]);
                $buffer = substr($buffer, $pos + strlen(self::OPEN_TAG));
                $state  = 'document';
            } else {
                $pos = strpos($buffer, self::CLOSE_TAG);
                if ($pos === false) {
                    $safe = max(0, strlen($buffer) - strlen(self::CLOSE_TAG));
                    if ($safe > 0) { $onEmit('document', ['content' => substr($buffer, 0, $safe)]); $buffer = substr($buffer, $safe); }
                    break;
                }
                if ($pos > 0) $onEmit('document', ['content' => substr($buffer, 0, $pos)]);
                $buffer = substr($buffer, $pos + strlen(self::CLOSE_TAG));
                $state  = 'chat';
            }
        }
        return [$buffer, $state];
    }

    private function emit(string $event, array $data): void
    {
        echo "event: {$event}\n";
        echo 'data: ' . json_encode($data) . "\n\n";
    }

    private function buildMessages(string $message, string $document, string $title, string $documentType, array $history): array
    {
        $messages = [
            ['role' => 'system', 'content' => $this->systemPrompt($title, $documentType, $document)],
            ['role' => 'system', 'content' => 'Current date: ' . now()->format('F j, Y')],
        ];
        foreach (array_slice($history, -20) as $turn) {
            $messages[] = ['role' => $turn['role'], 'content' => (string) $turn['content']];
        }
        $messages[] = ['role' => 'user', 'content' => $message];
        return $messages;
    }

    private function systemPrompt(string $title, string $documentType, string $currentDocument): string
    {
        $hasDocument = trim($currentDocument) !== '';
        $docContext  = $hasDocument
            ? "The user's current working document:\n\n<current-document>\n{$currentDocument}\n</current-document>"
            : 'No document exists yet — you will create one from scratch.';

        return <<<PROMPT
# Kwati AI — Document Builder Agent

You are an expert document creation assistant embedded in the Kwati AI Document Builder. Your job is to help users create, edit, and refine professional documents through natural conversation.

## Current Document
- **Title:** {$title}
- **Type:** {$documentType}
- {$docContext}

## Response Format

Every response MUST follow this exact structure:

**Part 1 — Chat response** (always required)
Write 1–3 sentences explaining what you are doing or asking. Be direct, confident, and helpful. No filler phrases.

**Part 2 — Document block** (required whenever you create or modify the document)
Output the complete, updated document inside these exact XML tags:

<kwati-document>
[full document in professional markdown]
</kwati-document>

## Core Rules

1. Always output the COMPLETE document — never partial or diff-only updates
2. Skip the document block only when the user asks a question requiring no change
3. Use proper heading hierarchy, professional writing, and correct markdown formatting
4. For code documents: use properly fenced code blocks with language identifiers
5. Never output partial documents — always the complete content

## Identity

If asked who you are, say you are Kwati AI Document Builder, built by the KwatiAi team.
PROMPT;
    }
}
