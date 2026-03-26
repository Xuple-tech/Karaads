<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class StudioController extends Controller
{
    public function index(Request $request)
    {
        return inertia('Studio/Index', [
            'title' => 'Studio - KwatiAI',
            'description' => 'Create and manage your AI projects in the KwatiAI Studio.',
        ]);
    }

    function podcastIndex() {
        try {
            // Fetch podcast metadata from API endpoint
            $response = Http::get(route('studio.podcast.metadata'));
            $metadata = $response->json('data', []);

            return inertia('Studio/Podcast/Index', [
                'title' => 'Podcast Master - KwatiAI',
                'description' => 'Create and manage your AI generated podcasts in the KwatiAI Studio.',
                'genres' => $metadata['genres'] ?? [],
                'formats' => $metadata['formats'] ?? [],
                'voices' => $metadata['voices'] ?? [],
                'models' => $metadata['models'] ?? [],
                'userPodcasts' => [], // Will be populated from user's podcast library
            ]);
        } catch (\Exception $e) {
            // Fallback to default data if API call fails
            return inertia('Studio/Podcast/Index', [
                'title' => 'Podcast Master - KwatiAI',
                'description' => 'Create and manage your AI generated podcasts in the KwatiAI Studio.',
                'genres' => [],
                'formats' => [],
                'voices' => [],
                'models' => [],
                'userPodcasts' => [],
            ]);
        }
    }
}
