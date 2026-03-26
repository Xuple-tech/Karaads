<?php
// app/Services/VoiceConversationService.php

namespace App\Services;

use App\Models\Chat;
use App\Models\Conversation;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class VoiceConversationService
{
    private OpenAISpeechToTextService $sttService;
    private OpenAITextToSpeechService $ttsService;
    private GrokApiService $aiService;

    public function __construct(
        OpenAISpeechToTextService $sttService,
        OpenAITextToSpeechService $ttsService,
        GrokApiService $aiService
    ) {
        $this->sttService = $sttService;
        $this->ttsService = $ttsService;
        $this->aiService = $aiService;
    }

    /**
     * Enable voice mode on existing conversation
     */
    public function enableVoiceMode(
        string $conversationId,
        string $userId,
        string $language = 'en',
        array $voiceSettings = []
    ): array {
        $conversation = Conversation::where('id', $conversationId)
            ->where('user_id', $userId)
            ->firstOrFail();

        $defaultVoiceSettings = [
            'voice' => 'alloy',
            'speed' => 1.0,
            'model' => 'gpt-4o-mini-tts'
        ];

        // Update conversation with voice settings
        $conversation->update([
            'language' => $language,
            'voice_settings' => array_merge($defaultVoiceSettings, $voiceSettings),
            'mode' => 'voice',
        ]);

        return [
            'conversation_id' => $conversationId,
            'mode' => 'voice',
            'language' => $language,
            'voice_settings' => $conversation->voice_settings,
            'audio_format' => 'mp3',
            'sample_rate' => 24000
        ];
    }

    /**
     * Switch conversation mode (text/voice)
     */
    public function switchMode(string $conversationId, string $userId, string $newMode, array $settings = []): array
    {
        $conversation = Conversation::where('id', $conversationId)
            ->where('user_id', $userId)
            ->firstOrFail();

        if ($newMode === 'voice') {
            $conversation->update([
                'mode' => 'voice',
                'voice_settings' => $settings,
            ]);
        } else {
            $conversation->update(['mode' => 'text']);
        }

        return [
            'conversation_id' => $conversationId,
            'mode' => $newMode,
            'message' => "Switched to {$newMode} mode"
        ];
    }

    /**
     * Process user text and generate AI response
     */
    public function processUserText(string $conversationId, string $userId, string $text): array
    {
        $conversation = Conversation::where('id', $conversationId)
            ->where('user_id', $userId)
            ->firstOrFail();

        // 1. Save user message as Chat
        $userMessage = Chat::create([
            'conversation_id' => $conversationId,
            'role' => 'user',
            'content' => $text,
            'type' => 'text',
            'is_voice' => true,
        ]);

        // 2. Generate AI response using Grok API
        $aiResponse = $this->generateAIResponse($conversation, $text);

        return [
            'user_message' => [
                'id' => $userMessage->id,
                'content' => $text,
                'role' => 'user',
                'type' => 'text',
                'is_voice' => true,
                'created_at' => $userMessage->created_at->toIso8601String(),
            ],
            'ai_response' => $aiResponse
        ];
    }

    public function processUserAudio(string $conversationId, string $userId, $audioFile, int $duration): array
    {
        $conversation = Conversation::where('id', $conversationId)
            ->where('user_id', $userId)
            ->firstOrFail();

        try {
            // 1. Validate audio file with better error reporting
            $validation = $this->sttService->validateAudioFile($audioFile);

            if (!$validation['valid']) {
                Log::error('Audio file validation failed', [
                    'error' => $validation['error'],
                    'file_name' => $audioFile->getClientOriginalName(),
                    'file_size' => $audioFile->getSize(),
                    'mime_type' => $audioFile->getMimeType()
                ]);
                throw new \Exception($validation['error']);
            }

            Log::info('Audio file validation passed', $validation);

            // 2. Store user audio file
            $userAudioPath = $this->storeAudioFile($audioFile, 'user', $conversationId);

            // 3. Convert speech to text using OpenAI Whisper
            Log::info('Starting speech-to-text conversion');
            $transcription = $this->sttService->transcribe($audioFile, [
                'language' => $conversation->language ?? 'en',
            ]);

            if (empty(trim($transcription))) {
                throw new \Exception('No speech detected in the audio file');
            }

            Log::info('Speech-to-text conversion successful', [
                'transcription_length' => strlen($transcription),
                'transcription_preview' => substr($transcription, 0, 100)
            ]);

            // 4. Save user message as Chat with audio metadata
            $userMessage = Chat::create([
                'conversation_id' => $conversationId,
                'role' => 'user',
                'content' => $transcription,
                'type' => 'audio',
                'is_voice' => true,
                'audio_path' => $userAudioPath,
                'audio_duration' => $duration,
                'metadata' => [
                    'duration' => $duration,
                    'audio_path' => $userAudioPath,
                    'stt_model' => 'whisper-1',
                    'file_size' => $audioFile->getSize(),
                    'mime_type' => $audioFile->getMimeType()
                ]
            ]);

            // 5. Generate AI response
            Log::info('Generating AI response for transcription');
            $aiResponse = $this->generateAIResponse($conversation, $transcription);

            return [
                'user_message' => [
                    'id' => $userMessage->id,
                    'content' => $transcription,
                    'role' => 'user',
                    'type' => 'audio',
                    'is_voice' => true,
                    'audio_path' => $userAudioPath,
                    'audio_duration' => $duration,
                    'created_at' => $userMessage->created_at->toIso8601String(),
                ],
                'ai_response' => $aiResponse
            ];
        } catch (\Exception $e) {
            Log::error('Voice conversation audio processing failed', [
                'conversation_id' => $conversationId,
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'file_size' => $audioFile->getSize(),
                'mime_type' => $audioFile->getMimeType(),
                'duration' => $duration
            ]);
            throw $e;
        }
    }

    /**
     * Store uploaded audio file - IMPROVED VERSION
     */
    private function storeAudioFile($audioFile, string $type, string $conversationId): string
    {
        $extension = $this->getFileExtension($audioFile);
        $filename = "{$type}_" . uniqid() . '.' . $extension;
        $path = "conversations/{$conversationId}/audio/{$filename}";

        // Ensure directory exists
        Storage::disk('local')->makeDirectory("conversations/{$conversationId}/audio");

        // Store file
        Storage::disk('local')->put($path, file_get_contents($audioFile->getRealPath()));

        Log::info('Audio file stored', [
            'path' => $path,
            'size' => Storage::disk('local')->size($path),
            'type' => $type
        ]);

        return $path;
    }

    /**
     * Get file extension from mime type
     */
    private function getFileExtension($audioFile): string
    {
        $mimeToExtension = [
            'audio/webm' => 'webm',
            'audio/mpeg' => 'mp3',
            'audio/wav' => 'wav',
            'audio/ogg' => 'ogg',
            'audio/m4a' => 'm4a',
            'audio/mp4' => 'mp4',
            'video/webm' => 'webm'
        ];

        $mimeType = $audioFile->getMimeType();
        return $mimeToExtension[$mimeType] ?? 'webm';
    }

    /**
     * Generate AI response and convert to speech
     */
    private function generateAIResponse(Conversation $conversation, string $userMessage): array
    {
        // 1. Get AI text response using Grok API with voice system prompt
        $aiTextResponse = $this->aiService->generateVoiceMessage(
            prompt: $userMessage,
            history: $this->getConversationHistory($conversation->id),
            model: 'grok-4'
        );

        // 2. Convert text to speech using OpenAI TTS
        $audioContent = $this->ttsService->synthesize($aiTextResponse, [
            'voice' => $conversation->voice_settings['voice'] ?? 'alloy',
            'speed' => $conversation->voice_settings['speed'] ?? 1.0,
            'model' => $conversation->voice_settings['model'] ?? 'gpt-4o-mini-tts',
        ]);

        // 3. Store AI audio file
        $aiAudioPath = $this->storeAudioContent($audioContent, 'ai', $conversation->id);
        $audioDuration = $this->ttsService->estimateDuration($aiTextResponse);

        // 4. Save AI message as Chat with audio
        $aiMessage = Chat::create([
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => $aiTextResponse,
            'type' => 'audio',
            'is_voice' => true,
            'audio_path' => $aiAudioPath,
            'audio_duration' => $audioDuration,
            'metadata' => [
                'duration' => $audioDuration,
                'audio_path' => $aiAudioPath,
                'tts_model' => $conversation->voice_settings['model'] ?? 'gpt-4o-mini-tts',
                'tts_voice' => $conversation->voice_settings['voice'] ?? 'alloy'
            ]
        ]);

        return [
            'id' => $aiMessage->id,
            'content' => $aiTextResponse,
            'role' => 'assistant',
            'type' => 'audio',
            'is_voice' => true,
            'audio_path' => $aiAudioPath,
            'audio_url' => route('voice.audio.stream', $aiMessage->id),
            'audio_duration' => $audioDuration,
            'created_at' => $aiMessage->created_at->toIso8601String(),
        ];
    }

    /**
     * Get conversation history for context
     */
    private function getConversationHistory(string $conversationId): array
    {
        return Chat::where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($chat) {
                return [
                    'role' => $chat->role,
                    'content' => $chat->content
                ];
            })
            ->toArray();
    }



    /**
     * Store generated audio content
     */
    private function storeAudioContent(string $audioContent, string $type, string $conversationId): string
    {
        $filename = "{$type}_" . uniqid() . '.mp3';
        $path = "conversations/{$conversationId}/audio/{$filename}";

        Storage::disk('local')->put($path, $audioContent);

        return $path;
    }
}
