<?php
// app/Http/Controllers/VoiceConversationController.php

namespace App\Http\Controllers;

use App\Services\VoiceConversationService;
use App\Services\OpenAITextToSpeechService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Conversation;
use App\Models\Chat;
use Illuminate\Support\Facades\Storage;

class VoiceConversationController extends Controller
{
    private VoiceConversationService $voiceService;
    private OpenAITextToSpeechService $ttsService;

    public function __construct(VoiceConversationService $voiceService, OpenAITextToSpeechService $ttsService)
    {
        $this->voiceService = $voiceService;
        $this->ttsService = $ttsService;
    }


    /**
     * Create new conversation or use existing one for voice chat
     */
    function index()
    {
        $conversation = Conversation::create([
            'user_id' => auth('web')->id(),
            'title' => 'Voice Chat',
            'mode' => 'voice',
        ]);

        return to_route('voice.conversation', $conversation->id);
    }

    /**
     * Show conversation page (supports both text and voice modes)
     */
    public function show($conversationId)
    {
        $conversation = Conversation::where('id', $conversationId)
            ->where('user_id', auth('web')->id())
            ->with(['chats' => function ($query) {
                $query->orderBy('created_at', 'asc');
            }])
            ->firstOrFail();

        return Inertia::render('VoiceConversation', [
            'conversation' => [
                'id' => $conversation->id,
                'title' => $conversation->title,
                'mode' => $conversation->mode ?? 'text',
                'language' => $conversation->language ?? 'en',
                'voice_settings' => $conversation->voice_settings ?? [],
            ],
            'messages' => $conversation->chats->map(fn ($chat) => [
                'id' => $chat->id,
                'content' => $chat->content,
                'role' => $chat->role,
                'type' => $chat->type ?? 'text',
                'is_voice' => $chat->is_voice ?? false,
                'audio_path' => $chat->audio_path,
                'audio_duration' => $chat->audio_duration,
                'created_at' => $chat->created_at->toIso8601String(),
            ])->values(),
            'availableVoices' => $this->getAvailableVoices()
        ]);
    }

    /**
     * Enable voice mode on a conversation
     */
    public function enableVoiceMode(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'language' => 'sometimes|string|in:en,es,fr,de,it,ja,ko,zh',
            'voice_settings' => 'sometimes|array'
        ]);

        try {
            $result = $this->voiceService->enableVoiceMode(
                $request->conversation_id,
                auth('web')->id(),
                $request->language ?? 'en',
                $request->voice_settings ?? []
            );

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to enable voice mode: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Switch conversation mode (text/voice)
     */
    public function switchMode(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'mode' => 'required|in:text,voice',
            'voice_settings' => 'sometimes|array'
        ]);

        try {
            $result = $this->voiceService->switchMode(
                $request->conversation_id,
                auth('web')->id(),
                $request->mode,
                $request->voice_settings ?? []
            );

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to switch mode: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process user text in voice mode (transcribed or typed)
     */
    public function processText(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'text' => 'required|string|max:1000',
        ]);

        try {
            $result = $this->voiceService->processUserText(
                $request->conversation_id,
                auth('web')->id(),
                $request->text
            );

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process text: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process user audio and convert to text
     */
    public function processAudio(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'audio' => 'required|file|mimes:webm,mp3,wav,ogg|max:10240',
            'duration' => 'required|integer|min:1|max:300'
        ]);

        try {
            $result = $this->voiceService->processUserAudio(
                $request->conversation_id,
                auth('web')->id(),
                $request->file('audio'),
                $request->duration
            );

            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process audio: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get conversation history (all messages in conversation)
     */
    public function history($conversationId)
    {
        try {
            $conversation = Conversation::where('id', $conversationId)
                ->where('user_id', auth('web')->id())
                ->with(['chats' => function ($query) {
                    $query->orderBy('created_at', 'asc');
                }])
                ->firstOrFail();

            $messages = $conversation->chats->map(fn ($chat) => [
                'id' => $chat->id,
                'content' => $chat->content,
                'role' => $chat->role,
                'type' => $chat->type ?? 'text',
                'is_voice' => $chat->is_voice ?? false,
                'audio_path' => $chat->audio_path,
                'audio_duration' => $chat->audio_duration,
                'created_at' => $chat->created_at->toIso8601String(),
            ])->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'conversation_id' => $conversationId,
                    'mode' => $conversation->mode,
                    'messages' => $messages
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch history: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Stream audio file for chat message
     */


    /**
     * Get available voices for TTS
     */

    private function getAvailableVoices()
    {
        return $this->ttsService->getAvailableVoices();
    }

    /**
     * Stream audio file for chat message
     */
    public function streamAudio($messageId)
    {
        try {
            $message = Chat::where('id', $messageId)
                ->with(['conversation'])
                ->firstOrFail();

            // Verify authorization
            if ($message->conversation->user_id !== auth('web')->id()) {
                abort(403);
            }

            // return response()->json($message);
            if (!($message->metadata['audio_path'] ?? false)) {
                return response()->json([
                    'error' => 'No audio available for this message'
                ], 404);
            }

            if (!Storage::disk('local')->exists($message->metadata['audio_path'])) {
                return response()->json([
                    'error' => 'Audio file not found'
                ], 404);
            }

            return response()->file(
                storage_path('app/public/' . $message->metadata['audio_path']),
                [
                    'Content-Type' => 'audio/mpeg',
                    'Content-Disposition' => 'inline; filename="message.mp3"'
                ]
            );
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to stream audio: ' . $e->getMessage()
            ], 500);
        }
    }
}
