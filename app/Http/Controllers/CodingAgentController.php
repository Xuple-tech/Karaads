<?php

namespace App\Http\Controllers;

use App\Services\GrokApiService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class CodingAgentController extends Controller
{
    protected GrokApiService $grokService;

    public function __construct(GrokApiService $grokService)
    {
        $this->grokService = $grokService;
    }

    public function index()
    {
        return Inertia::render('CodingAgent');
    }

    public function generate(Request $request)
    {
        $request->validate([
            'prompt' => 'required|string'
        ]);

        try {
            $response = $this->grokService->generateChat(
                prompt: "You are a coding agent. Return strict JSON with this shape: {\"summary\": string, \"files\": [{\"path\": string, \"content\": string}]}. User request: {$request->prompt}",
                model: 'grok-4-fast-reasoning',
                history: [],
                tools: [],
                format: ['type' => 'json_object']
            );

            $result = json_decode($response, true, 512, JSON_THROW_ON_ERROR);
            
            // Store generated files
            foreach (($result['files'] ?? []) as &$file) {
                if (isset($file['path'])) {
                    $path = 'generated/' . uniqid() . '/' . $file['path'];
                    Storage::put($path, $file['content']);
                    $file['stored_path'] = $path;
                }
            }

            return Inertia::render('CodingAgent', [
                'result' => $result
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
} 
