<?php
// app/Services/OpenAITextToSpeechService.php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OpenAITextToSpeechService
{
    private string $apiKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key');
        $this->baseUrl = 'https://api.openai.com/v1';
    }

    /**
     * Synthesize text to speech using OpenAI TTS
     */
    public function synthesize(string $text, array $options = []): string
    {
        try {
            $voice = $options['voice'] ?? 'alloy';
            $speed = $options['speed'] ?? 1.0;
            $model = $options['model'] ?? 'gpt-4o-mini-tts';

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])
            ->timeout(60)->withoutVerifying()
            ->post($this->baseUrl . '/audio/speech', [
                'model' => $model,
                'input' => $this->prepareTextForSpeech($text),
                'voice' => $voice,
                'speed' => $speed,
                'response_format' => 'mp3',
            ]);

            if ($response->failed()) {
                Log::error('OpenAI TTS API error: ' . $response->body());
                throw new \Exception('Failed to synthesize speech with OpenAI TTS API');
            }

            $audioContent = $response->body();

            Log::info("OpenAI TTS generated audio", [
                'model' => $model,
                'voice' => $voice,
                'speed' => $speed,
                'text_length' => strlen($text),
                'audio_size' => strlen($audioContent)
            ]);

            return $audioContent;

        } catch (\Exception $e) {
            Log::error('OpenAI TTS synthesis error: ' . $e->getMessage());
            throw new \Exception('Failed to synthesize speech: ' . $e->getMessage());
        }
    }

    /**
     * Stream TTS response for real-time playback
     */
    public function synthesizeStream(string $text, array $options = []): \Illuminate\Http\Client\Response
    {
        try {
            $voice = $options['voice'] ?? 'alloy';
            $speed = $options['speed'] ?? 1.0;
            $model = $options['model'] ?? 'gpt-4o-mini-tts';

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])
            ->timeout(60)
            ->post($this->baseUrl . '/audio/speech', [
                'model' => $model,
                'input' => $this->prepareTextForSpeech($text),
                'voice' => $voice,
                'speed' => $speed,
                'response_format' => 'mp3',
            ]);

            if ($response->failed()) {
                Log::error('OpenAI TTS stream API error: ' . $response->body());
                throw new \Exception('Failed to stream speech with OpenAI TTS API');
            }

            return $response;

        } catch (\Exception $e) {
            Log::error('OpenAI TTS stream error: ' . $e->getMessage());
            throw new \Exception('Failed to stream speech: ' . $e->getMessage());
        }
    }

    /**
     * Prepare text for better speech synthesis
     */
    private function prepareTextForSpeech(string $text): string
    {
        // Remove any special characters that might cause issues
        $text = preg_replace('/[**`]/', '', $text);

        // Ensure proper spacing
        $text = preg_replace('/\s+/', ' ', $text);

        // Trim to reasonable length for TTS
        if (strlen($text) > 1000) {
            $text = substr($text, 0, 1000) . '...';
        }

        return trim($text);
    }

    /**
     * Get available voices
     */
    public function getAvailableVoices(): array
    {
        return [
            'alloy' => ['id' => 'alloy', 'name' => 'Alloy', 'gender' => 'neutral'],
            'echo' => ['id' => 'echo', 'name' => 'Echo', 'gender' => 'neutral'],
            'fable' => ['id' => 'fable', 'name' => 'Fable', 'gender' => 'neutral'],
            'onyx' => ['id' => 'onyx', 'name' => 'Onyx', 'gender' => 'neutral'],
            'nova' => ['id' => 'nova', 'name' => 'Nova', 'gender' => 'neutral'],
            'shimmer' => ['id' => 'shimmer', 'name' => 'Shimmer', 'gender' => 'neutral'],
            'ash' => ['id' => 'ash', 'name' => 'Ash', 'gender' => 'neutral'],
            'ballad' => ['id' => 'ballad', 'name' => 'Ballad', 'gender' => 'neutral'],
            'coral' => ['id' => 'coral', 'name' => 'Coral', 'gender' => 'neutral'],
            'sage' => ['id' => 'sage', 'name' => 'Sage', 'gender' => 'neutral'],
        ];
    }

    /**
     * Get available models
     */
    public function getAvailableModels(): array
    {
        return [
            'gpt-4o-mini-tts' => [
                'name' => 'GPT-4o Mini TTS',
                'description' => 'Latest model optimized for speed and quality'
            ],
            'tts-1' => [
                'name' => 'TTS-1',
                'description' => 'Standard quality, lower latency'
            ],
            'tts-1-hd' => [
                'name' => 'TTS-1 HD',
                'description' => 'Higher quality, slightly higher latency'
            ]
        ];
    }

    /**
     * Estimate audio duration based on text length
     */
    public function estimateDuration(string $text): int
    {
        $wordCount = str_word_count($text);
        $wordsPerMinute = 150; // Average speaking rate
        return max(1, (int) ($wordCount / $wordsPerMinute * 60));
    }
}
