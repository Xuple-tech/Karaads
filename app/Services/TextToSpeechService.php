<?php
// app/Services/TextToSpeechService.php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

class TextToSpeechService
{
    private string $apiKey;
    private string $baseUrl;
    private string $pythonScriptPath;

    public function __construct()
    {
        // Using Eleven Labs for text-to-speech
        $this->apiKey = config('services.elevenlabs.api_key');
        $this->baseUrl = 'https://api.elevenlabs.io/v1';
        $this->pythonScriptPath = base_path('_services/tts_stream.py');
    }

    /**
     * Synthesize text to speech using Python TTS
     */
    public function synthesize(string $text, array $options = []): string
    {
        try {
            // Try Python Edge TTS first (local, no API key needed)
            return $this->synthesizeWithPython($text, $options);

        } catch (\Exception $e) {
            Log::error('Python TTS Error: ' . $e->getMessage());

            // Fallback to Eleven Labs if available
            if ($this->apiKey) {
                try {
                    return $this->synthesizeWithElevenLabs($text, $options);
                } catch (\Exception $e2) {
                    Log::error('Eleven Labs TTS Error: ' . $e2->getMessage());
                }
            }

            // Final fallback
            return $this->synthesizeWithFallback($text);
        }
    }

    /**
     * Synthesize using Python Edge TTS (local, no API key needed)
     */
    private function synthesizeWithPython(string $text, array $options = []): string
    {
        try {
            $text = $this->prepareTextForSpeech($text);
            $voiceName = $options['voice'] ?? 'aria';
            $rate = $options['rate'] ?? '+0%';
            $pitch = $options['pitch'] ?? '+0Hz';

            // Call Python script
            $process = new Process([
                'py',
                $this->pythonScriptPath,
                $text,
                // $voiceName,
                // $rate,
                // $pitch
            ]);

            $process->setTimeout(60);
            $process->run();

            if (!$process->isSuccessful()) {
                throw new \Exception('Python TTS failed: ' . $process->getErrorOutput());
            }

            $output = trim($process->getOutput());

            // Parse JSON response
            $result = json_decode($output, true);

            if (!$result['success'] ?? false) {
                throw new \Exception($result['error'] ?? 'Unknown TTS error');
            }

            // Read the generated MP3 file
            $filename = $result['filename'];
            if (!file_exists($filename)) {
                throw new \Exception("Generated file not found: {$filename}");
            }

            $audioContent = file_get_contents($filename);

            // Clean up the file
            @unlink($filename);

            Log::info("TTS generated audio: {$filename}, size: " . strlen($audioContent) . " bytes");

            return $audioContent;

        } catch (\Exception $e) {
            Log::error('Python TTS error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Synthesize using Eleven Labs TTS
     */
    private function synthesizeWithElevenLabs(string $text, array $options): string
    {
        if (empty($this->apiKey)) {
            throw new \Exception('Eleven Labs API key not configured');
        }

        $voiceId = $this->mapVoiceToElevenLabs($options['voice'] ?? 'en-US-Neural2-F');

        $response = Http::withHeaders([
            'xi-api-key' => $this->apiKey,
            'Content-Type' => 'application/json',
        ])
        ->post($this->baseUrl . '/text-to-speech/' . $voiceId, [
            'text' => $this->prepareTextForSpeech($text),
            'model_id' => 'eleven_multilingual_v2',
            'voice_settings' => [
                'speed' => $options['speed'] ?? 1.0,
                'stability' => 0.5,
                'similarity_boost' => 0.5,
                'style' => 0.0,
                'use_speaker_boost' => true,
            ],
            'output_format' => 'mp3_44100_128',
        ]);

        if ($response->failed()) {
            Log::error('Eleven Labs TTS API error: ' . $response->body());
            throw new \Exception('Failed to synthesize speech with Eleven Labs TTS');
        }

        return $response->body();
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
     * Map voice to Eleven Labs voice IDs
     */
    private function mapVoiceToElevenLabs(string $voice): string
    {
        // Common Eleven Labs voice IDs (you may need to update these based on available voices)
        $mapping = [
            'en-US-Neural2-F' => 'EXAVITQu4vr4xnSDxMaL', // Bella (female)
            'en-US-Neural2-M' => 'ErXwobaYiN019PkySvjV', // Antoni (male)
            'en-GB-Neural2-F' => '21m00Tcm4TlvDq8ikWAM', // Rachel (female)
            'es-ES-Neural2-F' => 'pNInz6obpgDQGcFmaJgB', // Adam (male, Spanish)
            'es-ES-Neural2-M' => 'ErXwobaYiN019PkySvjV', // Antoni (male)
            'fr-FR-Neural2-F' => 'MF3mGyEYCl7XYWbV9V6O', // Elli (female)
            'fr-FR-Neural2-M' => 'AZnzlk1XvdvUeBnXmlld', // Dimitri (male)
        ];

        return $mapping[$voice] ?? 'EXAVITQu4vr4xnSDxMaL'; // Default to Bella
    }

    /**
     * Fallback TTS for development - returns short silent MP3
     */
    private function synthesizeWithFallback(string $text): string
    {
        Log::info('Using fallback TTS for text: ' . substr($text, 0, 100));

        // Return a very short silent MP3 (about 100ms of silence)
        return base64_decode('SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAABAAACcQCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8AAABQTEFNRTMuMTAwBKkAAAAAAAAAADUgJAOHQQAB9AAACHDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//tQxAAAAAAAAAAAAAAAAAAAAAAA');
    }

    /**
     * Get available voices from Eleven Labs
     */
    public function getAvailableVoices(): array
    {
        try {
            if (empty($this->apiKey)) {
                // Fallback to static voices if no API key
                return $this->getFallbackVoices();
            }

            $response = Http::withHeaders([
                'xi-api-key' => $this->apiKey,
            ])->get('https://api.elevenlabs.io/v2/voices');

            if ($response->successful()) {
                $data = $response->json();
                $voices = $data['voices'] ?? [];

                $organizedVoices = [];
                foreach ($voices as $voice) {
                    $language = $this->extractLanguageFromVoice($voice);
                    if (!isset($organizedVoices[$language])) {
                        $organizedVoices[$language] = [];
                    }
                    $organizedVoices[$language][] = [
                        'id' => $voice['voice_id'],
                        'name' => $voice['name'],
                        'gender' => $this->determineGender($voice),
                    ];
                }

                return $organizedVoices;
            }
        } catch (\Exception $e) {
            Log::error('Failed to fetch Eleven Labs voices: ' . $e->getMessage());
        }

        return $this->getFallbackVoices();
    }

    /**
     * Extract language from voice data
     */
    private function extractLanguageFromVoice(array $voice): string
    {
        // Try to extract from verified_languages or labels
        if (isset($voice['verified_languages']) && !empty($voice['verified_languages'])) {
            return $voice['verified_languages'][0]['language'] ?? 'en';
        }

        // Fallback to 'en' if no language info
        return 'en';
    }

    /**
     * Determine gender from voice data
     */
    private function determineGender(array $voice): string
    {
        $name = strtolower($voice['name'] ?? '');
        if (strpos($name, 'female') !== false || strpos($name, 'woman') !== false || strpos($name, 'girl') !== false) {
            return 'female';
        }
        if (strpos($name, 'male') !== false || strpos($name, 'man') !== false || strpos($name, 'boy') !== false) {
            return 'male';
        }

        // Default to female for most voices, but this is a guess
        return 'female';
    }

    /**
     * Fallback voices when API is not available
     */
    private function getFallbackVoices(): array
    {
        return [
            'en' => [
                ['id' => 'EXAVITQu4vr4xnSDxMaL', 'name' => 'Bella', 'gender' => 'female'],
                ['id' => 'ErXwobaYiN019PkySvjV', 'name' => 'Antoni', 'gender' => 'male'],
                ['id' => '21m00Tcm4TlvDq8ikWAM', 'name' => 'Rachel', 'gender' => 'female'],
            ],
            'es' => [
                ['id' => 'pNInz6obpgDQGcFmaJgB', 'name' => 'Adam', 'gender' => 'male'],
            ],
            'fr' => [
                ['id' => 'MF3mGyEYCl7XYWbV9V6O', 'name' => 'Elli', 'gender' => 'female'],
                ['id' => 'AZnzlk1XvdvUeBnXmlld', 'name' => 'Dimitri', 'gender' => 'male'],
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
