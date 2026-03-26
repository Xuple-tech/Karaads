<?php
// app/Http/Controllers/PodcastController.php

namespace App\Http\Controllers;

use App\Services\OpenAITextToSpeechService;
use App\Services\PodcastGenerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class PodcastController extends Controller
{
    private PodcastGenerationService $podcastService;

    public function __construct(PodcastGenerationService $podcastService)
    {
        $this->podcastService = $podcastService;
    }

    /**
     * Display the podcast library page
     */
    public function index()
    {
        $user = Auth::user();

        $podcasts = $this->podcastService->getUserEpisodes($user, 50)
            ->map(function ($episode) {
                return [
                    'id' => $episode->id,
                    'title' => $episode->title,
                    'topic' => $episode->topic,
                    'genre' => $episode->genre,
                    'duration' => $episode->duration,
                    'script' => $episode->script,
                    'created_at' => $episode->created_at->toISOString(),
                    'voice' => $episode->voice,
                    'audio_url' => route('podcast.stream', $episode->id),
                ];
            });

        return Inertia::render('Studio/Podcast/Library', [
            'podcasts' => $podcasts
        ]);
    }

    /**
     * Display the podcast generation page
     */
    public function create()
    {
        $user = Auth::user();
        $ttsService = app(OpenAITextToSpeechService::class);

        // Get user's recent podcasts for the sidebar
        $userPodcasts = $this->podcastService->getUserEpisodes($user, 10)
            ->map(function ($episode) {
                return [
                    'id' => $episode->id,
                    'title' => $episode->title,
                    'topic' => $episode->topic,
                    'genre' => $episode->genre,
                    'duration' => $episode->duration,
                    'script' => $episode->script,
                    'created_at' => $episode->created_at->toISOString(),
                    'voice' => $episode->voice,
                    'audio_url' => route('podcast.stream', $episode->id),
                ];
            });

        return Inertia::render('Studio/Podcast/Generate', [
            'formats' => $this->podcastService->getFormats(),
            'userPodcasts' => $userPodcasts,
        ]);
    }

    /**
     * Generate a new podcast episode
     */
    public function generate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'topic' => 'required|string|min:3|max:500',
            'genre' => 'sometimes|string|in:' . implode(',', array_keys($this->podcastService->getGenres())),
            'format' => 'sometimes|string|in:' . implode(',', array_keys($this->podcastService->getFormats())),
            'duration' => 'sometimes|integer|min:1|max:30',
            'voice' => 'sometimes|string',
            'instructions' => 'sometimes|string|max:1000',
            'includeIntro' => 'sometimes|boolean',
            'includeOutro' => 'sometimes|boolean',
            'addBackgroundMusic' => 'sometimes|boolean',
            'musicIntensity' => 'sometimes|string|in:low,medium,high',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();

            $result = $this->podcastService->generatePodcast(
                $request->all(),
                $user
            );

            // Format the response to match what the React component expects
            $formattedResult = [
                'audio_url' => route('podcast.stream', $result['episode']->id),
                'script' => $result['episode']->script,
                'episode' => [
                    'id' => $result['episode']->id,
                    'title' => $result['episode']->title,
                    'topic' => $result['episode']->topic,
                    'genre' => $result['episode']->genre,
                    'duration' => $result['episode']->duration,
                    'voice' => $result['episode']->voice,
                    'created_at' => $result['episode']->created_at->toISOString(),
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $formattedResult
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate podcast from existing text
     */
    public function generateFromText(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'text' => 'required|string|min:100|max:5000',
            'voice' => 'sometimes|string',
            'title' => 'sometimes|string|max:200',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();

            $result = $this->podcastService->generateFromText(
                $request->input('text'),
                $request->all(),
                $user
            );

            // Format the response to match what the React component expects
            $formattedResult = [
                'audio_url' => route('podcast.stream', $result['episode']->id),
                'script' => $result['episode']->script,
                'episode' => [
                    'id' => $result['episode']->id,
                    'title' => $result['episode']->title,
                    'topic' => $result['episode']->topic,
                    'genre' => $result['episode']->genre,
                    'duration' => $result['episode']->duration,
                    'voice' => $result['episode']->voice,
                    'created_at' => $result['episode']->created_at->toISOString(),
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $formattedResult
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's podcast episodes
     */
    public function list(Request $request)
    {
        $user = Auth::user();

        $episodes = $this->podcastService->getUserEpisodes(
            $user,
            $request->input('limit', 20)
        )->map(function ($episode) {
            return [
                'id' => $episode->id,
                'title' => $episode->title,
                'topic' => $episode->topic,
                'genre' => $episode->genre,
                'duration' => $episode->duration,
                'script' => $episode->script,
                'created_at' => $episode->created_at->toISOString(),
                'voice' => $episode->voice,
                'audio_url' => route('podcast.stream', $episode->id),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $episodes
        ]);
    }

    /**
     * Get podcast metadata (genres, formats, voices)
     */
    public function metadata()
    {
        $ttsService = app(OpenAITextToSpeechService::class);

        return response()->json([
            'success' => true,
            'data' => [
                'genres' => $this->podcastService->getGenres(),
                'formats' => $this->podcastService->getFormats(),
                'voices' => $ttsService->getAvailableVoices(),
                'models' => $ttsService->getAvailableModels(),
            ]
        ]);
    }

    /**
     * Delete podcast episode
     */
    public function delete($id)
    {
        $user = Auth::user();

        $success = $this->podcastService->deleteEpisode($id, $user);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Episode not found or unauthorized'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Podcast episode deleted successfully'
        ]);
    }

    /**
     * Get podcast episode by ID
     */
    public function show($id)
    {
        $user = Auth::user();

        $episode = \App\Models\PodcastEpisode::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$episode) {
            return response()->json([
                'success' => false,
                'message' => 'Episode not found'
            ], 404);
        }

        $formattedEpisode = [
            'id' => $episode->id,
            'title' => $episode->title,
            'topic' => $episode->topic,
            'genre' => $episode->genre,
            'duration' => $episode->duration,
            'script' => $episode->script,
            'created_at' => $episode->created_at->toISOString(),
            'voice' => $episode->voice,
            'audio_url' => route('podcast.stream', $episode->id),
        ];

        return response()->json([
            'success' => true,
            'data' => $formattedEpisode
        ]);
    }

    /**
     * Stream podcast audio
     */
    public function stream($id)
    {
        $user = Auth::user();

        $episode = \App\Models\PodcastEpisode::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$episode || !file_exists(storage_path('app/' . $episode->audio_path))) {
            abort(404);
        }

        $path = storage_path('app/' . $episode->audio_path);

        return response()->file($path, [
            'Content-Type' => 'audio/mpeg',
            'Content-Disposition' => 'inline; filename="' . basename($episode->audio_path) . '"'
        ]);
    }

    /**
     * Download podcast audio
     */
    public function download($id)
    {
        $user = Auth::user();

        $episode = \App\Models\PodcastEpisode::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$episode || !file_exists(storage_path('app/' . $episode->audio_path))) {
            abort(404);
        }

        $path = storage_path('app/' . $episode->audio_path);
        $filename = str_replace([' ', '/'], ['_', '-'], $episode->title) . '.mp3';

        return response()->download($path, $filename, [
            'Content-Type' => 'audio/mpeg'
        ]);
    }
}
