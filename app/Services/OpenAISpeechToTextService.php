<?php
// app/Services/OpenAISpeechToTextService.php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OpenAISpeechToTextService
{
    private string $apiKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key');
        $this->baseUrl = 'https://api.openai.com/v1';
    }



    /**
     * Transcribe with timestamps for more detailed output
     */
    public function transcribeWithTimestamps($audioFile, array $options = []): array
    {
        try {
            $language = $options['language'] ?? 'en';
            $prompt = $options['prompt'] ?? null;

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])
                ->timeout(60)->withoutVerifying()
                ->attach('file', fopen($audioFile->getRealPath(), 'r'), $audioFile->getClientOriginalName())
                ->post($this->baseUrl . '/audio/transcriptions', [
                    'model' => 'whisper-1',
                    'language' => $language,
                    'prompt' => $prompt,
                    'response_format' => 'verbose_json',
                    'timestamp_granularities' => ['word']
                ]);

            if ($response->failed()) {
                Log::error('OpenAI Whisper API error: ' . $response->body());
                throw new \Exception('Failed to transcribe audio with timestamps');
            }

            $result = $response->json();

            Log::info("OpenAI Whisper transcription with timestamps completed", [
                'language' => $language,
                'model' => 'whisper-1'
            ]);

            return $result;
        } catch (\Exception $e) {
            Log::error('OpenAI Whisper transcription with timestamps error: ' . $e->getMessage());
            throw new \Exception('Failed to transcribe audio with timestamps: ' . $e->getMessage());
        }
    }

    public function validateAudioFile($audioFile): array
    {
        $validMimes = [
            'audio/webm',
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
            'audio/m4a',
            'audio/mp4',
            'audio/x-m4a',
            'audio/x-wav',
            'video/webm' // Sometimes audio files come as video/webm
        ];

        $maxSize = 25 * 1024 * 1024; // 25MB - OpenAI limit

        if (!$audioFile->isValid()) {
            return [
                'valid' => false,
                'error' => 'Uploaded file is not valid'
            ];
        }

        if ($audioFile->getSize() > $maxSize) {
            return [
                'valid' => false,
                'error' => 'File size exceeds 25MB limit'
            ];
        }

        $mimeType = $audioFile->getMimeType();
        $clientMimeType = $audioFile->getClientMimeType();

        Log::info('Audio file validation', [
            'mime_type' => $mimeType,
            'client_mime_type' => $clientMimeType,
            'size' => $audioFile->getSize(),
            'extension' => $audioFile->getClientOriginalExtension()
        ]);

        // Check both server-detected and client-provided MIME types
        if (!in_array($mimeType, $validMimes) && !in_array($clientMimeType, $validMimes)) {
            return [
                'valid' => false,
                'error' => "Invalid audio format. Got: {$mimeType}, Allowed: " . implode(', ', $validMimes)
            ];
        }

        return [
            'valid' => true,
            'mime_type' => $mimeType,
            'size' => $audioFile->getSize()
        ];
    }

    /**
     * Transcribe audio file to text using OpenAI Whisper - IMPROVED VERSION
     */
    public function transcribe($audioFile, array $options = []): string
    {
        try {
            $language = $options['language'] ?? 'en';
            $prompt = $options['prompt'] ?? null;

            // Log file details for debugging
            Log::info('Transcribing audio file', [
                'original_name' => $audioFile->getClientOriginalName(),
                'mime_type' => $audioFile->getMimeType(),
                'size' => $audioFile->getSize(),
                'language' => $language
            ]);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])
                ->timeout(120)->withoutVerifying() // Increased timeout for larger files
                ->attach('file', fopen($audioFile->getRealPath(), 'r'), 'audio.' . $this->getFileExtension($audioFile))
                ->post($this->baseUrl . '/audio/transcriptions', [
                    'model' => 'whisper-1',
                    'language' => $language,
                    'prompt' => $prompt,
                    'response_format' => 'text',
                ]);

            if ($response->failed()) {
                $errorBody = $response->body();
                Log::error('OpenAI Whisper API error', [
                    'status' => $response->status(),
                    'response' => $errorBody,
                    'file_size' => $audioFile->getSize(),
                    'mime_type' => $audioFile->getMimeType()
                ]);

                throw new \Exception('OpenAI API error: ' . $errorBody);
            }

            $transcribedText = trim($response->body());

            Log::info("OpenAI Whisper transcription completed", [
                'language' => $language,
                'text_length' => strlen($transcribedText),
                'text_preview' => substr($transcribedText, 0, 100) . '...',
                'model' => 'whisper-1'
            ]);

            return $transcribedText;
        } catch (\Exception $e) {
            Log::error('OpenAI Whisper transcription error: ' . $e->getMessage());
            throw new \Exception('Failed to transcribe audio: ' . $e->getMessage());
        }
    }

    /**
     * Get appropriate file extension for OpenAI
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
            'ar' => 'Arabic',
            'hi' => 'Hindi',
            'tr' => 'Turkish',
            'pl' => 'Polish',
            'ru' => 'Russian',
            'ha' => 'Hausa',
            'yo' => 'Yoruba',
            'ig' => 'Igbo'
        ];
    }
}
