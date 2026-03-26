<?php
// app/Services/PodcastGenerationService.php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Models\PodcastEpisode;
use App\Models\User;
use Illuminate\Support\Str;

class PodcastGenerationService
{
    private GrokApiService $grokService;
    private OpenAITextToSpeechService $ttsService;
    private OpenAISpeechToTextService $sttService;

    // Podcast genres/themes
    private const PODCAST_GENRES = [
        'news' => 'News & Current Affairs',
        'technology' => 'Technology & Innovation',
        'business' => 'Business & Entrepreneurship',
        'health' => 'Health & Wellness',
        'education' => 'Education & Learning',
        'entertainment' => 'Entertainment & Pop Culture',
        'science' => 'Science & Discovery',
        'history' => 'History & Documentary',
        'comedy' => 'Comedy & Humor',
        'interview' => 'Interviews & Conversations',
        'storytelling' => 'Storytelling & Narrative',
    ];

    // Podcast formats
    private const PODCAST_FORMATS = [
        'solo' => 'Solo Monologue',
        'conversation' => 'Conversation/Dialogue',
        'interview' => 'Interview Style',
        'panel' => 'Panel Discussion',
        'narrative' => 'Narrative Storytelling',
    ];

    public function __construct(
        GrokApiService $grokService,
        OpenAITextToSpeechService $ttsService,
        OpenAISpeechToTextService $sttService
    ) {
        $this->grokService = $grokService;
        $this->ttsService = $ttsService;
        $this->sttService = $sttService;
    }

    /**
     * Generate a podcast episode
     */
    public function generatePodcast(array $parameters, ?User $user = null): array
    {
        try {
            $topic = $parameters['topic'] ?? '';
            $genre = $parameters['genre'] ?? 'news';
            $format = $parameters['format'] ?? 'solo';
            $duration = min(max($parameters['duration'] ?? 5, 1), 30); // 1-30 minutes
            $voice = $parameters['voice'] ?? 'nova';
            $additionalInstructions = $parameters['instructions'] ?? '';

            if (empty($topic)) {
                throw new \Exception('Podcast topic is required');
            }

            Log::info('Starting podcast generation', [
                'topic' => $topic,
                'genre' => $genre,
                'format' => $format,
                'duration' => $duration,
                'user_id' => $user?->id
            ]);

            // Step 1: Generate podcast script
            $script = $this->generatePodcastScript($topic, $genre, $format, $duration, $additionalInstructions);

            // Step 2: Generate speech from script
            $audioContent = $this->generatePodcastAudio($script, $voice, $duration);

            // Step 3: Save podcast episode
            $episode = $this->savePodcastEpisode(
                $topic,
                $script,
                $audioContent,
                $parameters,
                $user
            );

            return [
                'success' => true,
                'episode' => $episode,
                'audio_url' => Storage::url($episode->audio_path),
                'script' => $script,
                'metadata' => [
                    'topic' => $topic,
                    'genre' => $genre,
                    'format' => $format,
                    'duration' => $duration,
                    'word_count' => str_word_count($script)
                ]
            ];

        } catch (\Exception $e) {
            Log::error('Podcast generation failed: ' . $e->getMessage());
            throw new \Exception('Failed to generate podcast: ' . $e->getMessage());
        }
    }

    /**
     * Generate podcast script using Grok
     */
    private function generatePodcastScript(
        string $topic,
        string $genre,
        string $format,
        int $duration,
        string $additionalInstructions = ''
    ): string {
        $wordCount = $this->calculateWordCountForDuration($duration);

        $systemPrompt = $this->getPodcastScriptSystemPrompt($genre, $format, $duration, $wordCount);

        $userPrompt = $this->getPodcastScriptUserPrompt($topic, $additionalInstructions);

        Log::info('Generating podcast script', [
            'topic' => $topic,
            'word_target' => $wordCount,
            'genre' => $genre,
            'format' => $format
        ]);

        try {
            $script = $this->grokService->generateChat(
                prompt: $userPrompt,
                model: 'grok-4',
                customSystemPrompt: $systemPrompt
            );

            // Clean up the script
            $script = $this->cleanPodcastScript($script);

            Log::info('Podcast script generated', [
                'word_count' => str_word_count($script),
                'char_count' => strlen($script)
            ]);

            return $script;

        } catch (\Exception $e) {
            Log::error('Failed to generate podcast script: ' . $e->getMessage());
            throw new \Exception('Failed to generate podcast script: ' . $e->getMessage());
        }
    }

    /**
     * Generate podcast audio from script
     */
    private function generatePodcastAudio(string $script, string $voice, int $duration): string
    {
        try {
            Log::info('Generating podcast audio', [
                'voice' => $voice,
                'script_length' => strlen($script),
                'expected_duration' => $duration
            ]);

            // Split script into manageable chunks for TTS (OpenAI has limits)
            $chunks = $this->splitScriptForTTS($script);
            $audioSegments = [];

            foreach ($chunks as $index => $chunk) {
                Log::info('Processing TTS chunk', ['chunk_index' => $index, 'chunk_length' => strlen($chunk)]);

                $audioContent = $this->ttsService->synthesize($chunk, [
                    'voice' => $voice,
                    'speed' => 1.0,
                    'model' => 'tts-1-hd' // Higher quality for podcast
                ]);

                $audioSegments[] = $audioContent;

                // Small delay between requests to avoid rate limits
                if ($index < count($chunks) - 1) {
                    usleep(500000); // 0.5 second delay
                }
            }

            // Combine audio segments
            $combinedAudio = $this->combineAudioSegments($audioSegments);

            Log::info('Podcast audio generated', [
                'segments' => count($audioSegments),
                'total_size' => strlen($combinedAudio)
            ]);

            return $combinedAudio;

        } catch (\Exception $e) {
            Log::error('Failed to generate podcast audio: ' . $e->getMessage());
            throw new \Exception('Failed to generate podcast audio: ' . $e->getMessage());
        }
    }

    /**
     * Save podcast episode to database and storage
     */
    private function savePodcastEpisode(
        string $topic,
        string $script,
        string $audioContent,
        array $parameters,
        ?User $user
    ): PodcastEpisode {
        try {
            // Generate unique filename
            $filename = 'podcast-' . Str::slug($topic) . '-' . uniqid() . '.mp3';
            $directory = 'podcasts/' . ($user ? 'user-' . $user->id : 'public') . '/' . date('Y/m/d');

            // Ensure directory exists
            Storage::makeDirectory($directory, 0755, true);

            $filepath = $directory . '/' . $filename;

            // Save audio file
            Storage::put($filepath, $audioContent);

            // Create podcast episode record
            $episode = PodcastEpisode::create([
                'user_id' => $user?->id,
                'title' => $this->generateEpisodeTitle($topic),
                'topic' => $topic,
                'script' => $script,
                'audio_path' => $filepath,
                'audio_url' => Storage::url($filepath),
                'duration' => $parameters['duration'] ?? 5,
                'genre' => $parameters['genre'] ?? 'news',
                'format' => $parameters['format'] ?? 'solo',
                'voice' => $parameters['voice'] ?? 'nova',
                'status' => 'completed',
                'metadata' => [
                    'audio_size' => Storage::size($filepath),
                    'word_count' => str_word_count($script),
                    'generated_at' => now()->toISOString(),
                    'parameters' => $parameters
                ]
            ]);

            Log::info('Podcast episode saved', [
                'episode_id' => $episode->id,
                'file_size' => Storage::size($filepath),
                'user_id' => $user?->id
            ]);

            return $episode;

        } catch (\Exception $e) {
            Log::error('Failed to save podcast episode: ' . $e->getMessage());
            throw new \Exception('Failed to save podcast episode: ' . $e->getMessage());
        }
    }

    /**
     * Calculate target word count based on duration
     */
    private function calculateWordCountForDuration(int $minutes): int
    {
        // Average speaking rate: 130-150 words per minute
        $wordsPerMinute = 140;
        return $minutes * $wordsPerMinute;
    }

    /**
     * Get system prompt for podcast script generation
     */
    private function getPodcastScriptSystemPrompt(
        string $genre,
        string $format,
        int $duration,
        int $wordCount
    ): string {
        $formatInstructions = $this->getFormatInstructions($format);
        $genreInstructions = $this->getGenreInstructions($genre);

        return "You are an expert podcast scriptwriter. Create a compelling podcast script with the following specifications:

GENRE: {$genre}
FORMAT: {$format}
DURATION: {$duration} minutes (approximately {$wordCount} words)

{$formatInstructions}

{$genreInstructions}

SCRIPT STRUCTURE:
1. Engaging opening/introduction (15-20 seconds)
2. Main content with clear points/subtopics
3. Smooth transitions between segments
4. Compelling conclusion/call-to-action

WRITING STYLE:
- Natural, conversational tone suitable for audio
- Clear and concise sentences
- Varied sentence structure for auditory appeal
- Appropriate pacing markers [brief pause], [emphasis], etc.
- Include brief speaker directions if multi-host format
- Avoid complex jargon unless explaining it
- Include natural pauses and emphasis cues

SPECIAL INSTRUCTIONS:
- Write ONLY the script content - no titles or metadata
- Do not include any markdown formatting
- Write in complete sentences ready for voiceover
- Include [PAUSE] markers for natural breaks (1-2 seconds)
- Include [EMPHASIS] markers for important points
- Time the script to be approximately {$duration} minutes when read aloud
- End with a clear closing statement";
    }

    /**
     * Get user prompt for podcast script
     */
    private function getPodcastScriptUserPrompt(string $topic, string $additionalInstructions = ''): string
    {
        $prompt = "Create a podcast script about: {$topic}";

        if (!empty($additionalInstructions)) {
            $prompt .= "\n\nAdditional instructions: {$additionalInstructions}";
        }

        $prompt .= "\n\nPlease provide the complete script ready for voice recording.";

        return $prompt;
    }

    /**
     * Get format-specific instructions
     */
    private function getFormatInstructions(string $format): string
    {
        $instructions = [
            'solo' => 'FORMAT: Solo host speaking directly to the audience. Use "I" and "you" for connection.',
            'conversation' => 'FORMAT: Two hosts having a natural conversation. Use dialogue format with Host A and Host B.',
            'interview' => 'FORMAT: Interview format with Host and Guest. Include both questions and answers.',
            'panel' => 'FORMAT: Panel discussion with 3-4 speakers. Identify each speaker clearly.',
            'narrative' => 'FORMAT: Storytelling format with narrative flow, scene descriptions, and character voices if needed.',
        ];

        return $instructions[$format] ?? $instructions['solo'];
    }

    /**
     * Get genre-specific instructions
     */
    private function getGenreInstructions(string $genre): string
    {
        $instructions = [
            'news' => 'GENRE: News podcast. Focus on factual information, current relevance, and balanced perspective.',
            'technology' => 'GENRE: Technology podcast. Explain technical concepts in accessible language, discuss implications.',
            'business' => 'GENRE: Business podcast. Focus on practical insights, case studies, and actionable advice.',
            'health' => 'GENRE: Health podcast. Provide accurate information, cite sources, maintain professional tone.',
            'education' => 'GENRE: Educational podcast. Structure information clearly, reinforce key points, engage listener.',
            'entertainment' => 'GENRE: Entertainment podcast. Focus on storytelling, humor, and engaging content.',
            'science' => 'GENRE: Science podcast. Explain complex concepts simply, share fascinating discoveries.',
            'history' => 'GENRE: Historical podcast. Provide context, tell compelling stories from the past.',
            'comedy' => 'GENRE: Comedy podcast. Include humor, witty observations, and entertaining commentary.',
            'interview' => 'GENRE: Interview podcast. Focus on guest\'s expertise, ask insightful questions.',
            'storytelling' => 'GENRE: Storytelling podcast. Create narrative arc, build suspense, develop characters.',
        ];

        return $instructions[$genre] ?? $instructions['news'];
    }

    /**
     * Clean and format podcast script
     */
    private function cleanPodcastScript(string $script): string
    {
        // Remove any markdown formatting
        $script = preg_replace('/\*\*(.*?)\*\*/', '$1', $script);
        $script = preg_replace('/\*(.*?)\*/', '$1', $script);
        $script = preg_replace('/`(.*?)`/', '$1', $script);

        // Remove headers and metadata tags
        $script = preg_replace('/^#.*$/m', '', $script);
        $script = preg_replace('/^Title:.*$/im', '', $script);
        $script = preg_replace('/^Duration:.*$/im', '', $script);

        // Normalize whitespace
        $script = preg_replace('/\s+/', ' ', $script);
        $script = trim($script);

        // Ensure proper punctuation
        if (!preg_match('/[.!?]$/', $script)) {
            $script .= '.';
        }

        return $script;
    }

    /**
     * Split script into chunks for TTS processing
     */
    private function splitScriptForTTS(string $script, int $maxChunkLength = 2000): array
    {
        $chunks = [];
        $sentences = preg_split('/(?<=[.!?])\s+/', $script);

        $currentChunk = '';
        foreach ($sentences as $sentence) {
            if (strlen($currentChunk) + strlen($sentence) > $maxChunkLength && !empty($currentChunk)) {
                $chunks[] = trim($currentChunk);
                $currentChunk = $sentence;
            } else {
                $currentChunk .= ' ' . $sentence;
            }
        }

        if (!empty($currentChunk)) {
            $chunks[] = trim($currentChunk);
        }

        return $chunks;
    }

    /**
     * Combine multiple audio segments
     * Note: This is a simplified version. In production, you might want to use FFmpeg
     */
    private function combineAudioSegments(array $segments): string
    {
        // For MP3 files, we can simply concatenate them
        // In production, consider using FFmpeg for proper audio concatenation
        return implode('', $segments);
    }

    /**
     * Generate episode title
     */
    private function generateEpisodeTitle(string $topic): string
    {
        // Simple title generation - could be enhanced with AI
        $title = 'Podcast: ' . ucfirst($topic);

        if (strlen($title) > 100) {
            $title = substr($title, 0, 97) . '...';
        }

        return $title;
    }

    /**
     * Get available podcast genres
     */
    public function getGenres(): array
    {
        return self::PODCAST_GENRES;
    }

    /**
     * Get available podcast formats
     */
    public function getFormats(): array
    {
        return self::PODCAST_FORMATS;
    }

    /**
     * Get user's podcast episodes
     */
    public function getUserEpisodes(User $user, int $limit = 20)
    {
        $episodes = PodcastEpisode::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ;
            return $episodes;
    }

    /**
     * Delete podcast episode
     */
    public function deleteEpisode(int $episodeId, User $user): bool
    {
        $episode = PodcastEpisode::where('id', $episodeId)
            ->where('user_id', $user->id)
            ->first();

        if (!$episode) {
            return false;
        }

        // Delete audio file
        if (Storage::exists($episode->audio_path)) {
            Storage::delete($episode->audio_path);
        }

        // Delete database record
        $episode->delete();

        return true;
    }

    /**
     * Generate podcast from existing text/script
     */
    public function generateFromText(string $text, array $parameters = [], ?User $user = null): array
    {
        try {
            $voice = $parameters['voice'] ?? 'nova';

            // Clean and prepare text
            $script = $this->cleanPodcastScript($text);

            // Generate audio
            $audioContent = $this->generatePodcastAudio($script, $voice, 5); // Default 5 minutes

            // Save episode
            $topic = substr($text, 0, 50) . '...';
            $episode = $this->savePodcastEpisode(
                $topic,
                $script,
                $audioContent,
                array_merge($parameters, ['duration' => 5]),
                $user
            );

            return [
                'success' => true,
                'episode' => $episode,
                'audio_url' => Storage::url($episode->audio_path),
                'script' => $script
            ];

        } catch (\Exception $e) {
            Log::error('Failed to generate podcast from text: ' . $e->getMessage());
            throw new \Exception('Failed to generate podcast from text: ' . $e->getMessage());
        }
    }
}
