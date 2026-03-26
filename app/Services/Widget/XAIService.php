<?php

namespace App\Services\Widget;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\AIAgent;

class XAIService
{
    protected $apiKey;
    protected $baseUrl = 'https://api.x.ai/v1';

    public function __construct()
    {
        $this->apiKey = config('services.grok.api_key');

        if (!$this->apiKey) {
            Log::warning('xAI API key not configured');
        }
    }

    public function chatWithTools(AIAgent $agent, $messages, $tools = [], $conversationId = null)
    {
        try {
            if (!$this->apiKey) {
                return $this->getFallbackResponse($messages);
            }

            // Prepare the messages for xAI
            $formattedMessages = $this->formatMessagesForXAI($messages);

            // Prepare tools for xAI
            $formattedTools = $this->formatToolsForXAI($tools);

            $payload = [
                'model' => 'grok-4-fast-non-reasoning', // or 'grok-2' depending on your access
                'messages' => $formattedMessages,
                'temperature' => $agent->response_temperature ?? 0.7,
                'max_tokens' => $agent->max_context_length ?? 2000,
            ];

            // Add tools if available
            if (!empty($formattedTools)) {
                $payload['tools'] = $formattedTools;
                $payload['tool_choice'] = 'auto';
            }

            // Make the API call to xAI
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])->timeout(60) // Longer timeout for tool calls
              ->post("{$this->baseUrl}/chat/completions", $payload);

            if (!$response->successful()) {
                Log::error('xAI API error', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                    'agent_id' => $agent->id
                ]);

                return $this->getFallbackResponse($messages);
            }

            $data = $response->json();

            // Check if tool calls were requested
            if (isset($data['choices'][0]['message']['tool_calls'])) {
                return [
                    'type' => 'tool_calls',
                    'tool_calls' => $data['choices'][0]['message']['tool_calls'],
                    'raw_response' => $data
                ];
            }

            // Regular text response
            return [
                'type' => 'text',
                'content' => $data['choices'][0]['message']['content'] ?? '',
                'raw_response' => $data
            ];

        } catch (\Exception $e) {
            Log::error('xAI service error', [
                'error' => $e->getMessage(),
                'agent_id' => $agent->id,
                'conversation_id' => $conversationId
            ]);

            return $this->getFallbackResponse($messages);
        }
    }

    protected function formatMessagesForXAI($messages)
    {
        $formatted = [];

        foreach ($messages as $message) {
            $role = $this->mapRoleToXAI($message['role'] ?? 'user');

            $formattedMessage = [
                'role' => $role,
            ];

            // Handle different message types
            if ($role === 'tool') {
                // Tool response message
                $formattedMessage['content'] = $message['content'] ?? '';
                if (isset($message['tool_call_id'])) {
                    $formattedMessage['tool_call_id'] = $message['tool_call_id'];
                }
            } elseif (isset($message['tool_calls'])) {
                // Assistant message with tool calls
                $formattedMessage['content'] = $message['content'] ?? null;
                $formattedMessage['tool_calls'] = $message['tool_calls'];
            } else {
                // Regular message
                $formattedMessage['content'] = $message['content'] ?? '';

                // Handle attachments if present
                if (isset($message['attachments']) && !empty($message['attachments'])) {
                    // For xAI, we might need to format attachments differently
                    // For now, append to content
                    $formattedMessage['content'] .= "\n\n[Attachments: " .
                        json_encode($message['attachments']) . "]";
                }
            }

            $formatted[] = $formattedMessage;
        }

        return $formatted;
    }

    protected function mapRoleToXAI($role)
    {
        $mapping = [
            'user' => 'user',
            'assistant' => 'assistant',
            'system' => 'system',
            'tool' => 'tool'
        ];

        return $mapping[$role] ?? 'user';
    }

    protected function formatToolsForXAI($tools)
    {
        $formattedTools = [];

        foreach ($tools as $tool) {
            $formattedTool = [
                'type' => 'function',
                'function' => [
                    'name' => $tool['name'],
                    'description' => $tool['description'] ?? '',
                ]
            ];

            // Add parameters if they exist
            if (isset($tool['parameters']) && !empty($tool['parameters'])) {
                $formattedTool['function']['parameters'] = $tool['parameters'];
            }

            $formattedTools[] = $formattedTool;
        }

        return $formattedTools;
    }

    protected function getFallbackResponse($messages)
    {
        // Get the last user message
        $lastUserMessage = '';
        foreach (array_reverse($messages) as $message) {
            if (($message['role'] ?? '') === 'user') {
                $lastUserMessage = $message['content'] ?? '';
                break;
            }
        }

        // Simple fallback response
        $fallbackResponses = [
            "I understand you're asking about: \"{$lastUserMessage}\". Currently, I'm operating in fallback mode without full tool access.",
            "I'd like to help with that, but my advanced features are temporarily unavailable. You asked: \"{$lastUserMessage}\"",
            "Thanks for your message! I'm currently operating with limited capabilities. Regarding: \"{$lastUserMessage}\""
        ];

        return [
            'type' => 'text',
            'content' => $fallbackResponses[array_rand($fallbackResponses)],
            'raw_response' => ['fallback' => true]
        ];
    }

    public function getAvailableModels()
    {
        try {
            if (!$this->apiKey) {
                return [];
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])->get("{$this->baseUrl}/models");

            if ($response->successful()) {
                return $response->json()['data'] ?? [];
            }

            return [];
        } catch (\Exception $e) {
            Log::error('Failed to fetch xAI models', ['error' => $e->getMessage()]);
            return [];
        }
    }
}
