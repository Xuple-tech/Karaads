<?php

namespace App\Services;

use Faker\Core\Uuid;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage; // For saving images
use App\Models\GeminiApiKey;
use Illuminate\Support\Facades\DB;

class GeminiService
{
    private ?GeminiApiKey $currentKey = null;
    private const REQUEST_LIMIT = 15;
    private string $textOnlyApiEndpoint;
    private string $imageGenerationApiEndpoint;
    protected string $textStream;
    private Client $client;

    // System instruction for text-only models that support it
    private array $systemInstructionForTextModels = [];    public function __construct()
    {
        // Initialize API keys in database if they don't exist
        $this->initializeApiKeys();
        
        $models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-preview', 'gemini-2.0-flash-preview-image-generation'];
        $this->textOnlyApiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' . $models[0] . ':generateContent';
        $this->textStream = 'https://generativelanguage.googleapis.com/v1beta/models/' . $models[0] . ':streamGenerateContent';
        $this->imageGenerationApiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/' . $models[3] . ':generateContent';
        $language = auth('web')->user()->langauge ?? 'English';
        $this->systemInstructionForTextModels =  [
            'parts' => [
                [
                    'text' => "You are a highly knowledgeable and concise AI assistant. You are a helpful and friendly AI assistant named 'Rhea'. You love to use emojis in your responses to make conversations more engaging and expressive! 🌟😊

                    **Your primary response language should be " . $language . ".** However, if the user initiates a conversation or asks a question in Hausa (Hau), Yoruba (Yor), or Igbo (Ibo), respond in that language. If the user switches languages, adapt accordingly. Do not mix languages within a single response unless specifically requested by the user.


                    When asked your name, you should respond with 'I am Rhea, your AI assistant! ✨'

                    When asked who built you, you should respond with 'I was developed by Tujo as an AI assistant.' // MODIFY THIS LINE

                    When asked what you do or what your capabilities are, you should proudly list your functions using emojis and the following points:

                    📚 Research & Writing:
                    - Write essays, reports, articles, and blog posts
                    - Summarize long texts or documents
                    - Help with academic writing, citations, and formatting
                    - Draft emails, letters, or proposals

                    💡 Creative Projects:
                    - Generate stories, poems, scripts, and dialogue
                    - Help brainstorm names, ideas, or plotlines
                    - Create characters or world-building elements

                    💻 Coding & Tech Help:
                    - Write, debug, and explain code (Python, JavaScript, HTML/CSS, and more)
                    - Help build websites or simple apps
                    - Explain tech concepts and guide you through tools or APIs

                    🧠 Learning & Studying:
                    - Explain concepts in math, science, history, etc.
                    - Create study guides or practice questions
                    - Translate or simplify difficult topics

                    📊 Data & Analysis:
                    - Analyze or visualize data (CSV/Excel)
                    - Perform statistical calculations
                    - Generate charts and graphs

                    🌍 Up-to-Date Info (Rhea Plus & Pro):
                    - Look up current events, prices, local news, or recent research
                    - Find info about businesses, services, or events near you

                    Try to be as helpful and engaging as possible! Let's get started! 🎉"
                ]
            ]
        ];
        $this->client = new Client();
    }    /**
     * Initialize API keys in the database
     */
    private function initializeApiKeys(): void
    {
        $defaultKeys = [
            [
                'name' => 'Gemini 1.5 Pro',
                'key' => 'AIzaSyDjQoRFeGWHIX2uIp7446Yv7ixIW94r-ek',
                'model' => 'gemini-1.5-pro'
            ],
            [
                'name' => 'Gemini 1.5 Flash',
                'key' => 'AIzaSyBoLX4D56tZ8VMItpYdQGzWIQi0KNLJgZE',
                'model' => 'gemini-1.5-flash'
            ],
            [
                'name' => 'Shede',
                'key' => 'AIzaSyBrukso0EkF_8_JA-E4e_th_X_NXPyjDwI',
                'model' => 'gemini-1.5-flash'
            ],
            [
                'name' => 'Key 4',
                'key' => 'AIzaSyCLKOnwLNIH0qGM8N9u-eSYW1jvOiCtu2g'
            ],
            [
                'name' => 'Key 5',
                'key' => 'AIzaSyB4suQ2A0UeDSzP1phIJTT_wARpsKMiuDA'
            ]
        ];

        foreach ($defaultKeys as $key) {
            GeminiApiKey::firstOrCreate(
                ['key' => $key['key']],
                [
                    'name' => $key['name'] ?? null,
                    'model' => $key['model'] ?? null,
                    'request_count' => 0,
                    'last_used_at' => now()
                ]
            );
        }
    }

    /**
     * Get the current API key and handle rotation if needed
     */
    private function getCurrentApiKey(): string
    {
        // Get or select a new key
        if (!$this->currentKey || $this->currentKey->request_count >= self::REQUEST_LIMIT) {
            $this->selectNewKey();
        }

        // Increment the request count in a transaction
        DB::transaction(function () {
            $this->currentKey->incrementRequestCount();
        });

        return $this->currentKey->key;
    }

    /**
     * Select a new API key based on usage
     */
    private function selectNewKey(): void
    {
        DB::transaction(function () {
            // Check if all keys have reached the limit
            if (GeminiApiKey::allKeysReachedLimit(self::REQUEST_LIMIT)) {
                GeminiApiKey::resetAllCounts();
            }

            // Get the key with the lowest request count
            $this->currentKey = GeminiApiKey::getNextAvailableKey();

            if (!$this->currentKey) {
                throw new \Exception('No available API keys found');
            }

            Log::info('Selected new API key: ' . ($this->currentKey->name ?? 'Unnamed Key'));
        });
    }

    /**
     * Generates text content from the Gemini API in a streaming fashion (for text-only models).
     * This method is NOT for image generation.
     *
     * @param string $prompt The user's input prompt.
     * @param callable $callback A callable function to execute for each received text chunk.
     * @param array $history Optional conversational history.
     * @return void
     * @throws \Exception If there's an issue with the Gemini API request or processing.
     */
    public function generateTextStream(string $prompt, callable $callback, array $history = []): void
    {
        $messages = [];
        $language = auth('web')->user()->language ?? 'English';
        $prompt = $prompt . 'response should be in' . $language . ' Language';
        // Prepare the conversational history for the Gemini API
        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg['role'],
                'parts' => [['text' => $msg['content']]]
            ];
        }

        // Add the current user prompt
        $messages[] = [ // Changed from = to [] to append
            'role' => 'user',
            'parts' => [['text' => $prompt]]
        ];

        $data = [
            'system_instruction' => $this->systemInstructionForTextModels, // Use system instruction here
            'contents' => $messages,
            'generationConfig' => [
                'temperature' => 0.7,
                'topK' => 40,
                'topP' => 0.95,
            ]
        ];

        try {
            Log::info('Starting Gemini API streaming request for gemini-1.5-flash (text-only)');
            Log::debug('Streaming Request URL: ' . $this->textOnlyApiEndpoint); // Use text-only endpoint
            Log::debug('Streaming Request Payload: ' . json_encode($data));
            $currentApiKey = $this->getCurrentApiKey();
            Log::debug('Streaming API Key (partial): ' . substr($currentApiKey, 0, 5) . '...');

            $response = $this->client->post(
                $this->textStream, // Use text-only endpoint
                [
                    'query' => ['key' => $currentApiKey],
                    'json' => $data,
                    'read_timeout' => 120,
                    'headers' => [
                        'Content-Type' => 'application/json',
                    ],
                    'stream' => true,
                    'decode_content' => true,
                ]
            );

            Log::info('Got response from Gemini API for text streaming. Status: ' . $response->getStatusCode());
            Log::debug('Response Headers: ' . json_encode($response->getHeaders()));

            $stream = $response->getBody();
            $buffer = '';
            $jsonDepth = 0;

            while (!$stream->eof()) {
                $chunk = $stream->read(1024);
                if (empty($chunk)) continue;

                $buffer .= $chunk;

                $i = 0;
                $startPos = 0;
                while ($i < strlen($buffer)) {
                    $char = $buffer[$i];

                    if ($char === '{' || $char === '[') {
                        $jsonDepth++;
                    } elseif ($char === '}' || $char === ']') {
                        $jsonDepth--;
                    }

                    if ($jsonDepth === 0 && ($char === '}' || $char === ']')) {
                        $jsonCandidate = substr($buffer, $startPos, $i - $startPos + 1);
                        $jsonCandidate = trim($jsonCandidate, ",\n\r\t ");

                        if (!empty($jsonCandidate)) {
                            $decoded = json_decode($jsonCandidate, true);

                            if (json_last_error() === JSON_ERROR_NONE) {
                                $responsesToProcess = is_array($decoded) ? $decoded : [$decoded];

                                foreach ($responsesToProcess as $jsonResponse) {
                                    if (isset($jsonResponse['candidates'][0]['content']['parts'][0]['text'])) {
                                        $text = $jsonResponse['candidates'][0]['content']['parts'][0]['text'];
                                        Log::debug('Extracted text chunk from Gemini: ' . $text);
                                        $callback($text);
                                    } else {
                                        Log::warning('Valid JSON, but unexpected structure (missing "text" part) for text streaming: ' . json_encode($jsonResponse));
                                    }
                                }
                                $startPos = $i + 1;
                            } else {
                                Log::debug('JSON decode error for potential complete segment, will re-evaluate: ' . json_last_error_msg() . ' Candidate: ' . $jsonCandidate);
                            }
                        }
                    }
                    $i++;
                }
                $buffer = substr($buffer, $startPos);
            }

            if (!empty($buffer)) {
                Log::debug('Attempting to process remaining buffer after EOF for text streaming: ' . $buffer);
                try {
                    $decoded = json_decode($buffer, true);
                    if (json_last_error() === JSON_ERROR_NONE) {
                        $responsesToProcess = is_array($decoded) ? $decoded : [$decoded];
                        foreach ($responsesToProcess as $jsonResponse) {
                            if (isset($jsonResponse['candidates'][0]['content']['parts'][0]['text'])) {
                                $text = $jsonResponse['candidates'][0]['content']['parts'][0]['text'];
                                $callback($text);
                            } else {
                                Log::warning('Unexpected JSON structure in final buffer for text streaming (missing "text" part): ' . json_encode($jsonResponse));
                            }
                        }
                    } else {
                        Log::warning('Final buffer JSON decode error for text streaming: ' . json_last_error_msg() . '. Buffer: ' . $buffer);
                    }
                } catch (\Exception $e) {
                    Log::error('Error processing final buffer for text streaming: ' . $e->getMessage() . '. Buffer: ' . $buffer);
                }
            }

            Log::info('Finished text streaming response from Gemini API.');
        } catch (ClientException $e) {
            $responseBody = $e->getResponse()->getBody()->getContents();
            $statusCode = $e->getResponse()->getStatusCode();
            Log::error("Gemini API Client Error (Status: {$statusCode}): " . $e->getMessage());
            Log::error('Gemini API Error Response Body: ' . $responseBody);
            throw new \Exception("Gemini API error: " . $responseBody, $statusCode, $e);
        } catch (\Exception $e) {
            Log::error('General Streaming Error: ' . $e->getMessage());
            throw $e;
        }
    }


    /**
     * Generates an image and potentially accompanying text from the Gemini API.
     * This method uses the image generation model and handles image output.
     *
     * @param string $prompt The user's input prompt for image generation.
     * @param array $history Optional conversational history (though less common for pure image gen).
     * @return array Contains 'text_response' and 'image_urls'.
     * @throws \Exception If there's an issue with the Gemini API request or processing.
     */
    public function generateImage(string $prompt, array $history = []): array
    {
        $messages = [];

        // Prepare conversational history (optional for image generation but good to include)
        foreach ($history as $msg) {
            if (!empty($msg['content'])) {
                $messages[] = [
                    'role' => $msg['role'],
                    'parts' => [['text' => $msg['content']]]
                ];
            }
        }

        // Add the current user prompt
        $messages[] = [
            'role' => 'user',
            'parts' => [['text' => $prompt]]
        ];

        $data = [
            'contents' => $messages,
            'generationConfig' => [
                'temperature' => 0.7,
                'topK' => 40,
                'topP' => 0.95,
                // THIS IS THE CRUCIAL FIX: Use 'responseModalities' with string values
                'responseModalities' => ['TEXT', 'IMAGE'],
            ],
            // 'safetySettings' => [ ... ] // You might want to add safety settings
        ];

        try {
            Log::info('Starting Gemini API request for image generation (non-streaming attempt)');
            Log::debug('Request URL: ' . $this->imageGenerationApiEndpoint); // Using non-streaming endpoint
            Log::debug('Request Payload: ' . json_encode($data));

            $response = $this->client->post(
                $this->imageGenerationApiEndpoint, // Use the non-streaming endpoint
                [
                    'query' => ['key' => $this->getCurrentApiKey()],
                    'json' => $data,
                    'read_timeout' => 120,
                    'headers' => [
                        'Content-Type' => 'application/json',
                    ],
                    // Removed 'stream' => true as this is for non-streaming
                    'decode_content' => true,
                ]
            );

            Log::info('Got response from Gemini API for image generation. Status: ' . $response->getStatusCode());

            $body = json_decode($response->getBody()->getContents(), true);

            $generatedText = '';
            $generatedImageUrls = [];

            if (isset($body['candidates'])) {
                foreach ($body['candidates'] as $candidate) {
                    foreach ($candidate['content']['parts'] ?? [] as $partContent) {
                        if (isset($partContent['text'])) {
                            $generatedText .= $partContent['text'];
                        } elseif (isset($partContent['inlineData']['mimeType']) && str_starts_with($partContent['inlineData']['mimeType'], 'image/')) {
                            $imageData = base64_decode($partContent['inlineData']['data']);
                            $mimeType = $partContent['inlineData']['mimeType'];
                            $extension = str_replace('image/', '', $mimeType);
                            $filename = 'generated_image_' . uniqid() . '.' . $extension;
                            $path = 'genc-s-/' . $filename;

                            Storage::put($path, $imageData);
                            $generatedImageUrls[] = Storage::url($path);
                            Log::info('Generated image saved: ' . Storage::url($path));
                        }
                    }
                }
            } else {
                Log::warning('Unexpected response structure for image generation (no candidates): ' . json_encode($body));
                throw new \Exception('Unexpected response structure from Gemini API for image generation.');
            }

            Log::info('Finished image generation response from Gemini API.');
            return [
                'text_response' => trim($generatedText),
                'image_urls' => $generatedImageUrls,
            ];
        } catch (ClientException $e) {
            $responseBody = $e->getResponse()->getBody()->getContents();
            $statusCode = $e->getResponse()->getStatusCode();
            Log::error("Gemini API Client Error (Status: {$statusCode}): " . $e->getMessage());
            Log::error('Gemini API Error Response Body for Image Gen: ' . $responseBody);
            throw new \Exception("Gemini API image generation error: " . $responseBody, $statusCode, $e);
        } catch (\Exception $e) {
            Log::error('General Image Generation Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generates a chat response without streaming.
     *
     * @param string $prompt The user's input prompt.
     * @param array $history Optional conversational history.
     * @param array $generationConfig Optional generation config overrides.
     * @return string
     * @throws \Exception
     */
    public function generateChatResponse(string $prompt, array $history = [], array $generationConfig = []): string
    {
        $messages = [];

        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg['role'],
                'parts' => [['text' => $msg['content']]]
            ];
        }

        $messages[] = [
            'role' => 'user',
            'parts' => [['text' => $prompt]]
        ];

        $data = [
            'system_instruction' => $this->systemInstructionForTextModels, // System instruction used here
            'contents' => $messages,
            'generationConfig' => array_merge([
                'temperature' => 0.7,
                'topK' => 40,
                'topP' => 0.95,
            ], $generationConfig)
        ];

        try {
            Log::info('Starting Gemini API request for chat response (gemini-1.5-flash)');
            Log::debug('Request URL: ' . $this->textOnlyApiEndpoint); // Use text-only endpoint
            Log::debug('Request Payload: ' . json_encode($data));

            $response = $this->client->post(
                $this->textOnlyApiEndpoint, // Use text-only endpoint
                [
                    'query' => ['key' => $this->getCurrentApiKey()],
                    'json' => $data,
                    'headers' => [
                        'Content-Type' => 'application/json',
                    ],
                ]
            );

            Log::info('Got response from Gemini API for chat response. Status: ' . $response->getStatusCode());
            $body = json_decode($response->getBody()->getContents(), true);

            if (isset($body['candidates'][0]['content']['parts'][0]['text'])) {
                return $body['candidates'][0]['content']['parts'][0]['text'];
            } else {
                throw new \Exception('Unexpected response structure from Gemini API for chat response');
            }
        } catch (ClientException $e) {
            Log::error("Gemini API Client Error: " . $e->getMessage());
            throw new \Exception("Gemini API error: " . $e->getMessage(), 0, $e);
        }
    }


    /**
     * Generates a chat response without streaming.
     *
     * @param string $prompt The user's input prompt.
     * @param array $history Optional conversational history.
     * @param array $generationConfig Optional generation config overrides.
     * @return string
     * @throws \Exception
     */


    /**
     * Generates a title for a chat conversation.
     *
     * @param string $prompt The user's input prompt.
     * @param array $history Optional conversational history.
     * @return string
     * @throws \Exception
     */
    public function generateTitle(string $prompt, array $history = []): string
    {
        $messages = [];

        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg['role'],
                'parts' => [['text' => $msg['content']]]
            ];
        }

        $messages[] = [
            'role' => 'user',
            'parts' => [['text' => $prompt]]
        ];

        $data = [
            'system_instruction' => ['parts' => [ // System instruction used here
                [
                    'text' => 'You are a highly skilled AI assistant named Rhea, specializing in generating concise and engaging titles for conversations. Your task is to create a captivating title based on the provided conversation history and user prompt. The title should be brief, relevant, and reflect the essence of the conversation. Use your creativity to make it stand out! not more than 20 words 🌟😊'
                ]
            ]],
            'contents' => $messages,
            'generationConfig' => [
                'temperature' => 0.7,
                'topK' => 40,
                'topP' => 0.95,
            ]
        ];

        try {
            Log::info('Starting Gemini API request for title generation (gemini-1.5-flash)');
            Log::debug('Request URL: ' . $this->textOnlyApiEndpoint); // Use text-only endpoint
            Log::debug('Request Payload: ' . json_encode($data));

            $response = $this->client->post(
                $this->textOnlyApiEndpoint, // Use text-only endpoint
                [
                    'query' => ['key' => $this->getCurrentApiKey()],
                    'json' => $data,
                    'headers' => [
                        'Content-Type' => 'application/json',
                    ],
                ]
            );

            Log::info('Got response from Gemini API for title generation. Status: ' . $response->getStatusCode());
            $body = json_decode($response->getBody()->getContents(), true);

            if (isset($body['candidates'][0]['content']['parts'][0]['text'])) {
                return trim($body['candidates'][0]['content']['parts'][0]['text']);
            } else {
                throw new \Exception('Unexpected response structure from Gemini API for title generation');
            }
        } catch (ClientException $e) {
            Log::error("Gemini API Client Error: " . $e->getMessage());
            throw new \Exception("Gemini API error: " . $e->getMessage(), 0, $e);
        }
    }
}
