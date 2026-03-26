<?php
// app/Services/AIChatService.php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Chat;
use Illuminate\Support\Facades\Log;

class AIChatService
{
    private GrokApiService $ollamaService;

    public function __construct(GrokApiService $ollamaService)
    {
        $this->ollamaService = $ollamaService;
    }

    /**
     * Generate AI response for voice conversation
     */
    public function generateResponse(string $conversationId, string $userMessage): string
    {
        try {
            // Get conversation context
            $conversation = Conversation::with(['chats' => function($query) {
                $query->orderBy('created_at', 'asc')->limit(10);
            }])->find($conversationId);

            // Prepare conversation history
            $history = $this->prepareConversationHistory($conversation);

            // Generate AI response using OllamaCloudService
            $response = $this->ollamaService->generateVoiceMessage(
                prompt: $userMessage,
                model: 'grok-4-fast-non-reasoning', // Use your preferred model
                history: $history,
                tools: [], // No tools for voice conversations
                format: null
            );

            // Save to database
            $this->saveChatMessage($conversationId, $userMessage, $response);

            return $response;

        } catch (\Exception $e) {
            Log::error('AI Chat Error: ' . $e->getMessage());

            // Fallback responses optimized for voice
            $fallbackResponses = [
                "I understand what you're saying. Could you tell me more?",
                "That's interesting. Please continue.",
                "I'm listening. What would you like to discuss?",
                "Thank you for sharing that with me.",
                "I appreciate your input. How can I assist you further?",
                "I hear you. Let me think about how I can help.",
                "That's a good point. What else would you like to know?"
            ];

            return $fallbackResponses[array_rand($fallbackResponses)];
        }
    }

    /**
     * Prepare conversation history from database
     */
    private function prepareConversationHistory(Conversation $conversation): array
    {
        $history = [];

        foreach ($conversation->chats as $chat) {
            // Add user message
            if (!empty($chat->message)) {
                $history[] = [
                    'role' => 'user',
                    'content' => $chat->message
                ];
            }

            // Add AI response
            if (!empty($chat->response)) {
                $history[] = [
                    'role' => 'assistant',
                    'content' => $chat->response
                ];
            }
        }

        return $history;
    }

    /**
     * Save chat message to database
     */
    private function saveChatMessage(string $conversationId, string $userMessage, string $aiResponse): void
    {
        Chat::create([
            'id' => \Illuminate\Support\Str::uuid(),
            'conversation_id' => $conversationId,
            'message' => $userMessage,
            'response' => $aiResponse,
            'role' => 'user',
            'type' => 'text'
        ]);
    }

    /**
     * Generate a voice-optimized response (shorter, more conversational)
     */
    public function generateVoiceOptimizedResponse(string $conversationId, string $userMessage): string
    {
        try {
            $conversation = Conversation::with(['chats' => function($query) {
                $query->orderBy('created_at', 'asc')->limit(5); // Shorter history for voice
            }])->find($conversationId);

            $history = $this->prepareConversationHistory($conversation);

            // Add voice-specific instructions
            $voiceInstructions = "You are having a voice conversation. Keep your response concise, natural, and conversational. Respond in a way that sounds good when spoken aloud. Limit to 2-3 sentences maximum.";

            // Prepend voice instructions to the message
            $enhancedMessage = $voiceInstructions . "\n\nUser: " . $userMessage;

            $response = $this->ollamaService->generateChat(
                prompt: $enhancedMessage,
                model: 'grok-4-fast-non-reasoning',
                history: $history,
                tools: [],
                format: null
            );

            // Clean up response for voice
            $response = $this->cleanResponseForVoice($response);

            $this->saveChatMessage($conversationId, $userMessage, $response);

            return $response;

        } catch (\Exception $e) {
            Log::error('Voice Optimized AI Response Error: ' . $e->getMessage());
            return "I understand. Please continue speaking.";
        }
    }

    /**
     * Clean AI response for better voice output
     */
    private function cleanResponseForVoice(string $response): string
    {
        // Remove markdown formatting
        $response = preg_replace('/\*\*(.*?)\*\*/', '$1', $response); // **bold**
        $response = preg_replace('/\*(.*?)\*/', '$1', $response); // *italic*
        $response = preg_replace('/`(.*?)`/', '$1', $response); // `code`

        // Remove URLs
        $response = preg_replace('/https?:\/\/[^\s]+/', '', $response);

        // Trim and clean up
        $response = trim($response);
        $response = preg_replace('/\s+/', ' ', $response); // Multiple spaces to single

        // Ensure it ends with proper punctuation
        if (!preg_match('/[.!?]$/', $response)) {
            $response .= '.';
        }

        return $response;
    }
}
