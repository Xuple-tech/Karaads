<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VoiceConversation;
use App\Models\VoiceMessage;
use App\Services\TextToSpeechService;
use App\Services\SpeechToTextService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class VoiceConversationController extends Controller
{
    protected $textToSpeechService;
    protected $speechToTextService;

    public function __construct(TextToSpeechService $textToSpeechService, SpeechToTextService $speechToTextService)
    {
        $this->textToSpeechService = $textToSpeechService;
        $this->speechToTextService = $speechToTextService;
    }

    public function createConversation(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255'
        ]);

        try {
            $conversation = VoiceConversation::create([
                'user_id' => Auth::id(),
                'title' => $request->input('title', 'Voice Chat ' . now()->format('Y-m-d H:i')),
                'status' => 'active'
            ]);

            return response()->json([
                'success' => true,
                'conversation' => $conversation,
                'message' => 'Voice conversation created successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating voice conversation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to create voice conversation'
            ], 500);
        }
    }

    public function listConversations()
    {
        try {
            $conversations = VoiceConversation::where('user_id', Auth::id())
                ->with(['messages' => function ($query) {
                    $query->select('id', 'voice_conversation_id', 'type', 'created_at')
                        ->orderBy('created_at', 'desc')
                        ->limit(1);
                }])
                ->orderBy('updated_at', 'desc')
                ->get()
                ->map(function ($conversation) {
                    return [
                        'id' => $conversation->id,
                        'title' => $conversation->title,
                        'created_at' => $conversation->created_at,
                        'updated_at' => $conversation->updated_at,
                        'last_message_type' => $conversation->messages->first()?->type,
                    ];
                });

            return response()->json([
                'success' => true,
                'conversations' => $conversations
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching voice conversations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch conversations'
            ], 500);
        }
    }

    public function showConversation($id)
    {
        try {
            $conversation = VoiceConversation::where('user_id', Auth::id())
                ->with(['messages' => function ($query) {
                    $query->orderBy('created_at', 'asc');
                }])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'conversation' => $conversation
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching voice conversation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Conversation not found'
            ], 404);
        }
    }

    public function deleteConversation($id)
    {
        try {
            $conversation = VoiceConversation::where('user_id', Auth::id())->findOrFail($id);

            // Delete associated audio files
            foreach ($conversation->messages as $message) {
                if ($message->audio_path) {
                    Storage::delete($message->audio_path);
                }
            }

            $conversation->messages()->delete();
            $conversation->delete();

            return response()->json([
                'success' => true,
                'message' => 'Voice conversation deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting voice conversation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete conversation'
            ], 500);
        }
    }

    public function sendVoiceMessage(Request $request)
    {
        $request->validate([
            'audio' => 'required|file|mimes:mp3,wav,m4a,ogg|max:10240', // 10MB max
            'conversation_id' => 'nullable|integer|exists:voice_conversations,id'
        ]);

        try {
            $conversationId = $request->conversation_id;

            // Get or create conversation
            if (!$conversationId) {
                $conversation = VoiceConversation::create([
                    'user_id' => Auth::id(),
                    'title' => 'Voice Chat ' . now()->format('Y-m-d H:i'),
                    'status' => 'active'
                ]);
                $conversationId = $conversation->id;
            } else {
                $conversation = VoiceConversation::where('user_id', Auth::id())->findOrFail($conversationId);
            }

            // Store audio file
            $audioPath = $request->file('audio')->store('voice-messages', 'public');

            // Create voice message
            $voiceMessage = VoiceMessage::create([
                'voice_conversation_id' => $conversationId,
                'speaker' => 'user',
                'audio_file_path' => $audioPath,
                'transcription' => null, // Will be processed
            ]);

            // Process speech to text asynchronously
            // For now, we'll do it synchronously
            try {
                $transcription = $this->speechToTextService->transcribe(Storage::disk('public')->path($audioPath));
                $voiceMessage->update([
                    'transcription' => $transcription,
                ]);

                // Generate AI response based on transcription
                // This would call your chat service
                $aiResponse = $this->generateVoiceResponse($transcription, $conversation);

                if ($aiResponse) {
                    // Generate speech from AI response
                    $responseAudioPath = $this->textToSpeechService->generateSpeech($aiResponse, 'public/voice-responses/');

                    VoiceMessage::create([
                        'voice_conversation_id' => $conversationId,
                        'speaker' => 'ai',
                        'audio_file_path' => $responseAudioPath,
                        'transcription' => $aiResponse,
                        'content' => $aiResponse,
                    ]);
                }

            } catch (\Exception $e) {
                Log::error('Speech processing error: ' . $e->getMessage());
            }

            $conversation->touch();

            return response()->json([
                'success' => true,
                'message_id' => $voiceMessage->id,
                'conversation_id' => $conversation->id,
                'transcription' => $voiceMessage->transcription
            ]);

        } catch (\Exception $e) {
            Log::error('Voice message error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to process voice message'
            ], 500);
        }
    }

    public function getAudio($id)
    {
        try {
            $message = VoiceMessage::whereHas('voiceConversation', function ($query) {
                $query->where('user_id', Auth::id());
            })->findOrFail($id);

            if (!$message->audio_file_path || !Storage::disk('public')->exists($message->audio_file_path)) {
                return response()->json([
                    'success' => false,
                    'error' => 'Audio file not found'
                ], 404);
            }

            $file = Storage::disk('public')->get($message->audio_file_path);
            $mimeType = Storage::disk('public')->mimeType($message->audio_file_path);

            return response($file, 200, [
                'Content-Type' => $mimeType,
                'Content-Disposition' => 'inline; filename="' . basename($message->audio_file_path) . '"'
            ]);

        } catch (\Exception $e) {
            Log::error('Audio retrieval error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to retrieve audio'
            ], 500);
        }
    }

    private function generateVoiceResponse($transcription, $conversation)
    {
        // Simple response for now - in a real app, this would call your AI service
        // You could integrate with your existing chat service here
        return "I heard you say: " . $transcription . ". How can I help you further?";
    }
}
