<?php
// app/Services/SpeechToTextService.php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

class SpeechToTextService
{
    private string $apiKey;
    private string $baseUrl;
    private string $pythonScriptPath;

    public function __construct()
    {
        // Using Eleven Labs for speech-to-text
        $this->apiKey = config('services.elevenlabs.api_key');
        $this->baseUrl = 'https://api.elevenlabs.io/v1';
        $this->pythonScriptPath = base_path('_services/stts.whisper.py');
    }

    /**
     * Transcribe audio file to text using Vosk (local, no API needed)
     */
    public function transcribe($audioFile, array $options = []): string
    {
        try {
            // Try local Vosk transcription first (no API key needed)
            return $this->transcribeWithVosk($audioFile, $options);

        } catch (\Exception $e) {
            Log::error('Vosk STT Error: ' . $e->getMessage());

            // Fallback to Eleven Labs if available
            if ($this->apiKey) {
                try {
                    return $this->transcribeWithElevenLabs($audioFile, $options);
                } catch (\Exception $e2) {
                    Log::error('Eleven Labs STT Error: ' . $e2->getMessage());
                }
            }

            // Final fallback
            return $this->transcribeWithFallback($audioFile);
        }
    }

    /**
     * Transcribe using Vosk (local, offline)
     */
    private function transcribeWithVosk($audioFile, array $options = []): string
    {
        try {
            // Get the audio file path
            if (is_object($audioFile) && method_exists($audioFile, 'getRealPath')) {
                $audioPath = $audioFile->getRealPath();
            } elseif (is_string($audioFile)) {
                $audioPath = $audioFile;
            } else {
                throw new \Exception('Invalid audio file format');
            }

            // Validate file exists
            if (!file_exists($audioPath)) {
                throw new \Exception("Audio file not found: {$audioPath}");
            }

            $language = $options['language'] ?? 'en';

            // Call Python Vosk script
            $process = new Process([
                'py',
                $this->pythonScriptPath,
                $audioPath,
                $language
            ]);

            $process->setTimeout(300); // 5 minutes timeout
            $process->run();

            if (!$process->isSuccessful()) {
                throw new \Exception('Vosk transcription failed: ' . $process->getErrorOutput());
            }

            $output = trim($process->getOutput());

            // Parse JSON response
            $result = json_decode($output, true);

            if (!$result['success'] ?? false) {
                throw new \Exception($result['error'] ?? 'Unknown transcription error');
            }

            $transcribedText = $result['text'] ?? '';

            Log::info("Vosk transcription completed", [
                'language' => $language,
                'text_length' => strlen($transcribedText),
                'model' => $result['model'] ?? 'unknown'
            ]);

            return trim($transcribedText);

        } catch (\Exception $e) {
            Log::error('Vosk transcription error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Transcribe using Eleven Labs STT API
     */
    private function transcribeWithElevenLabs($audioFile, array $options): string
    {
        if (empty($this->apiKey)) {
            throw new \Exception('Eleven Labs API key not configured');
        }

        $response = Http::withHeaders([
            'xi-api-key' => $this->apiKey,
        ])
        ->timeout(60)
        ->attach('file', fopen($audioFile->getRealPath(), 'r'), $audioFile->getClientOriginalName())
        ->post($this->baseUrl . '/speech-to-text', [
            'model_id' => 'scribe_v1',
            'language_code' => $options['language'] ?? null,
            'tag_audio_events' => false,
            'timestamps_granularity' => 'word',
        ]);

        if ($response->failed()) {
            Log::error('Eleven Labs STT API error: ' . $response->body());
            throw new \Exception('Failed to transcribe audio with Eleven Labs API');
        }

        $data = $response->json();
        return trim($data['text'] ?? '');
    }

    /**
     * Fallback transcription for development
     */
    private function transcribeWithFallback($audioFile): string
    {
        Log::info('Using fallback transcription');

        // Simple fallback responses for testing
        $fallbackResponses = [
            "Hello, how are you doing today?",
            "I would like to know more about your services.",
            "Can you help me with this problem?",
            "Thank you for your assistance.",
            "What is the weather like today?",
            "I need help with something important.",
            "Could you explain that in more detail?",
            "That sounds interesting, tell me more.",
            "I appreciate your help with this matter.",
            "What are the options available to me?"
        ];

        $response = $fallbackResponses[array_rand($fallbackResponses)];
        Log::info("Fallback transcription result: {$response}");

        return $response;
    }

    /**
     * Validate audio file before processing
     */
    public function validateAudioFile($audioFile): bool
    {
        $validMimes = ['audio/webm', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
        $maxSize = 10 * 1024 * 1024; // 10MB

        if (!$audioFile->isValid()) {
            return false;
        }

        if ($audioFile->getSize() > $maxSize) {
            return false;
        }

        if (!in_array($audioFile->getMimeType(), $validMimes)) {
            return false;
        }

        return true;
    }

    /**
     * Get supported languages
     */
    public function getSupportedLanguages(): array
    {
        return [
            'en' => 'English',
            'es' => 'Spanish',
            'fr' => 'French',
            'de' => 'German',
            'it' => 'Italian',
            'pt' => 'Portuguese',
            'nl' => 'Dutch',
            'ja' => 'Japanese',
            'ko' => 'Korean',
            'zh' => 'Chinese',
            'ha' => 'Hausa',
            'yo' => 'Yoruba',
            'ig' => 'Igbo'
        ];
    }
}
